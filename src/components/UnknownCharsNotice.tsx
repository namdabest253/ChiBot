'use client';

interface UnknownCharsNoticeProps {
  characters: string[];
  onDismiss: () => void;
  onAddToWordBank: (chars: string[]) => void;
}

export default function UnknownCharsNotice({ characters, onDismiss, onAddToWordBank }: UnknownCharsNoticeProps) {
  if (characters.length === 0) return null;

  return (
    <div className="bg-yellow-900/30 border border-yellow-600 rounded px-4 py-3 mb-3 flex items-center justify-between gap-3">
      <p className="text-yellow-200 text-sm">
        Bot used unknown characters: <strong>{characters.join(', ')}</strong>
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onAddToWordBank(characters)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
        >
          Add to Word Bank
        </button>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-200 text-sm px-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
