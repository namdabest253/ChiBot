import { NextRequest, NextResponse } from 'next/server';
import { getAllWords, addWord } from '@/lib/db';
import { extractChineseCharacters } from '@/lib/characters';

export async function GET() {
  const words = getAllWords();
  return NextResponse.json(words);
}

export async function POST(request: NextRequest) {
  const { chinese } = await request.json();

  if (!chinese || typeof chinese !== 'string') {
    return NextResponse.json({ error: 'Chinese text is required' }, { status: 400 });
  }

  const characters = extractChineseCharacters(chinese);
  const added: { id: number; chinese: string }[] = [];

  for (const char of characters) {
    const word = addWord(char);
    if (word) {
      added.push(word);
    }
  }

  const words = getAllWords();
  return NextResponse.json({ added, words });
}
