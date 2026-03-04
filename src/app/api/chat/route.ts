import { GoogleGenAI } from '@google/genai';
import { buildSystemPrompt } from '@/lib/financialContext';
import { Transaction, Goal, ChatMessage } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { message, history, transactions, goals } = (await request.json()) as {
      message: string;
      history: ChatMessage[];
      transactions: Transaction[];
      goals: Goal[];
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = buildSystemPrompt(transactions, goals);

    // Build chat history for Gemini (last 10 turns)
    const chatHistory = history.slice(-10).map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: message }] },
      ],
    });

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
