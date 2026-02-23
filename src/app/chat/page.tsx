import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { getChatHistory } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const messages = getChatHistory();

  return (
    <>
      <Navbar />
      <ChatInterface initialMessages={messages} />
    </>
  );
}
