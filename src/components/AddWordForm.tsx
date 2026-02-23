'use client';

import { useState, KeyboardEvent } from 'react';

interface AddWordFormProps {
  onAdd: (chinese: string) => Promise<void>;
}

export default function AddWordForm({ onAdd }: AddWordFormProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    await onAdd(trimmed);
    setInput('');
    setLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 mb-3">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add new Chinese characters"
        disabled={loading}
        className="flex-1 bg-[#2c2c2c] text-gray-100 border border-[#444] rounded px-3 py-2 focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded font-medium transition-transform duration-200 hover:scale-[1.07] hover:-translate-y-1 disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
}
