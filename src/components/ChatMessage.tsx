interface ChatMessageProps {
  role: 'user' | 'bot';
  message: string;
}

export default function ChatMessage({ role, message }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`mb-2.5 ${isUser ? 'text-right' : 'text-left'}`}>
      <span className="block font-bold text-sm mb-0.5">
        {isUser ? 'You' : 'ChiBot'}:
      </span>
      <span className={isUser ? 'text-blue-400' : 'text-white'}>
        {message}
      </span>
    </div>
  );
}
