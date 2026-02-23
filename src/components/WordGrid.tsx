'use client';

import { Word } from '@/types';

interface WordGridProps {
  words: Word[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}

export default function WordGrid({ words, selectedIds, onToggle }: WordGridProps) {
  return (
    <div className="bg-[#1e1e1e] p-4 rounded-lg border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] max-h-[300px] overflow-y-auto mb-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
        {words.map(word => (
          <label key={word.id} className="flex items-center gap-2 cursor-pointer p-1">
            <input
              type="checkbox"
              checked={selectedIds.has(word.id)}
              onChange={() => onToggle(word.id)}
              className="accent-blue-500"
            />
            <span className="text-gray-100">{word.chinese}</span>
          </label>
        ))}
      </div>
      {words.length === 0 && (
        <p className="text-gray-500 text-center py-8">No words yet. Add some characters above!</p>
      )}
    </div>
  );
}
