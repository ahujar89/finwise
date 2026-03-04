'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { parseCSV } from '@/lib/csvParser';
import { Transaction } from '@/types';
import { getCategoryMeta } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (txs: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
}

export function CsvUploadModal({ open, onClose, onImport }: Props) {
  const [preview, setPreview] = useState<Omit<Transaction, 'id' | 'createdAt'>[]>([]);
  const [errors, setErrors] = useState(0);
  const [format, setFormat] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setPreview(result.transactions);
      setErrors(result.errors);
      setFormat(result.format);
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) handleFile(file);
    else toast.error('Please upload a CSV file');
  }, []);

  function handleImport() {
    if (preview.length === 0) return;
    onImport(preview);
    toast.success(`Imported ${preview.length} transactions`);
    setPreview([]);
    onClose();
  }

  function reset() {
    setPreview([]);
    setErrors(0);
    setFormat('');
  }

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); reset(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
        </DialogHeader>

        {preview.length === 0 ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragging ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400'}`}
          >
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Drag & drop your CSV here</p>
            <p className="text-xs text-gray-400 mt-1">Supports Chase, Bank of America, Wells Fargo, and generic CSV formats</p>
            <label className="mt-4 inline-block cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <span className="text-sm text-green-600 font-medium hover:underline">or browse files</span>
            </label>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="capitalize">{format} format</Badge>
              <Badge className="bg-green-100 text-green-700 border-0">{preview.length} transactions</Badge>
              {errors > 0 && <Badge variant="destructive">{errors} skipped</Badge>}
            </div>
            <div className="overflow-auto flex-1 border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Description</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Category</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">Amount</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((tx, i) => {
                    const meta = getCategoryMeta(tx.category);
                    return (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{tx.date}</td>
                        <td className="px-3 py-2 text-gray-800 max-w-[200px] truncate">{tx.description}</td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-1"><span>{meta.icon}</span><span>{meta.label}</span></span>
                        </td>
                        <td className={`px-3 py-2 text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-3 py-2 capitalize text-gray-500">{tx.type}</td>
                      </tr>
                    );
                  })}
                  {preview.length > 50 && (
                    <tr><td colSpan={5} className="px-3 py-2 text-center text-gray-400 text-xs">... and {preview.length - 50} more</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 self-start">Upload different file</button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Cancel</Button>
          {preview.length > 0 && (
            <Button onClick={handleImport} className="bg-green-600 hover:bg-green-700 text-white">
              Import {preview.length} Transactions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
