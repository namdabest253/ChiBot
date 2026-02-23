import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onClear: () => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, onClear, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here..."
        disabled={disabled}
        className="flex-1 bg-[#2c2c2c] text-gray-100 border border-[#444] rounded px-3 py-2 focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded font-medium transition-transform duration-200 hover:scale-[1.07] hover:-translate-y-1 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
      >
        Send
      </button>
      <button
        onClick={onClear}
        className="bg-gray-600 hover:bg-gray-500 text-gray-100 px-5 py-2 rounded font-medium transition-transform duration-200 hover:scale-[1.07] hover:-translate-y-1"
      >
        Clear
      </button>
    </div>
  );
}
