'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import UnknownCharsNotice from './UnknownCharsNotice';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatInterfaceProps {
  initialMessages: ChatMessageType[];
}

interface DisplayMessage {
  role: 'user' | 'bot';
  message: string;
}

export default function ChatInterface({ initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>(
    initialMessages.map(m => ({ role: m.role, message: m.message }))
  );
  const [loading, setLoading] = useState(false);
  const [unknownChars, setUnknownChars] = useState<string[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (message: string) => {
    setLoading(true);
    setUnknownChars([]);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', message }]);

    // Add empty bot message placeholder
    setMessages(prev => [...prev, { role: 'bot', message: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'bot',
            message: error.error || 'Error: Failed to get response',
          };
          return updated;
        });
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Check for metadata marker
        const metaIndex = fullText.indexOf('__META__');
        const displayText = metaIndex >= 0 ? fullText.slice(0, metaIndex) : fullText;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'bot', message: displayText };
          return updated;
        });
      }

      // Parse metadata if present
      const metaIndex = fullText.indexOf('__META__');
      if (metaIndex >= 0) {
        try {
          const meta = JSON.parse(fullText.slice(metaIndex + 8));
          if (meta.unknownCharacters?.length > 0) {
            setUnknownChars(meta.unknownCharacters);
          }
        } catch {
          // Ignore metadata parse errors
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'bot',
          message: 'Error: Could not connect to the server.',
        };
        return updated;
      });
    }

    setLoading(false);
  };

  const clearChat = async () => {
    await fetch('/api/chat-history', { method: 'DELETE' });
    setMessages([]);
    setUnknownChars([]);
  };

  const addUnknownToWordBank = async (chars: string[]) => {
    await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chinese: chars.join('') }),
    });
    setUnknownChars([]);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <UnknownCharsNotice
        characters={unknownChars}
        onDismiss={() => setUnknownChars([])}
        onAddToWordBank={addUnknownToWordBank}
      />

      <div
        ref={chatBoxRef}
        className="h-[400px] overflow-y-auto bg-[#1e1e1e] p-4 rounded-lg border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] mb-3"
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} message={msg.message} />
        ))}
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-32">Start a conversation...</p>
        )}
      </div>

      <ChatInput onSend={sendMessage} onClear={clearChat} disabled={loading} />
    </div>
  );
}
