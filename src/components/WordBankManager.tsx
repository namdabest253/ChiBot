'use client';

import { useState } from 'react';
import { Word } from '@/types';
import AddWordForm from './AddWordForm';
import WordGrid from './WordGrid';

interface WordBankManagerProps {
  initialWords: Word[];
}

export default function WordBankManager({ initialWords }: WordBankManagerProps) {
  const [words, setWords] = useState<Word[]>(initialWords);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleAdd = async (chinese: string) => {
    const res = await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chinese }),
    });
    const data = await res.json();
    if (data.words) {
      setWords(data.words);
    }
  };

  const handleToggle = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const res = await fetch('/api/words/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selectedIds] }),
    });
    const data = await res.json();
    if (data.words) {
      setWords(data.words);
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h2 className="text-center text-2xl font-bold mb-4">Word Bank</h2>

      <AddWordForm onAdd={handleAdd} />

      <WordGrid words={words} selectedIds={selectedIds} onToggle={handleToggle} />

      <button
        onClick={handleDeleteSelected}
        disabled={selectedIds.size === 0}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-medium transition-transform duration-200 hover:scale-[1.07] hover:-translate-y-1 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
      >
        Delete Selected
      </button>
    </div>
  );
}
