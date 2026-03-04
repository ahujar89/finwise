'use client';

import { useState, useRef, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  "What's my biggest expense category?",
  "How is my savings rate?",
  "Where can I cut spending?",
  "Am I on track with my goals?",
];

export default function ChatPage() {
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const [history, setHistory, histInitialized] = useLocalStorage<ChatMessage[]>('finwise_chat_history', []);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, streamingContent]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [...history, userMsg].slice(-50);
    setHistory(updatedHistory);
    setInput('');
    setStreaming(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: history.slice(-10),
          transactions,
          goals,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to get response');
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      const modelMsg: ChatMessage = {
        id: generateId(),
        role: 'model',
        content: fullContent,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [...prev, modelMsg].slice(-50));
      setStreamingContent('');
    } catch {
      toast.error('Network error. Check your connection.');
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearHistory() {
    setHistory([]);
    toast.success('Chat history cleared');
  }

  const allMessages = [...history, ...(streamingContent ? [{
    id: 'streaming',
    role: 'model' as const,
    content: streamingContent,
    timestamp: new Date().toISOString(),
  }] : [])];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Chat</h1>
          <p className="text-muted-foreground text-sm mt-1">Chat with your personal finance advisor</p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="gap-2 text-muted-foreground">
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
        {allMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Bot className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Hi! I'm your FinWise AI advisor</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                I have access to your transactions and goals. Ask me anything about your finances!
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors text-gray-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {allMessages.map((msg, i) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-green-600' : 'bg-gray-100'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-600" />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-900'}`}>
              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {i === allMessages.length - 1 && streaming && (
                    <span className="inline-block w-1 h-4 bg-gray-400 ml-0.5 animate-pulse" />
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {streaming && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your finances... (Enter to send, Shift+Enter for new line)"
          className="resize-none bg-white"
          rows={2}
          disabled={streaming}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
          className="bg-green-600 hover:bg-green-700 text-white h-[60px] px-4 shrink-0"
        >
          {streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
