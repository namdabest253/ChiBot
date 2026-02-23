import Navbar from '@/components/Navbar';
import WordBankManager from '@/components/WordBankManager';
import { getAllWords } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function WordBankPage() {
  const words = getAllWords();

  return (
    <>
      <Navbar />
      <WordBankManager initialWords={words} />
    </>
  );
}
