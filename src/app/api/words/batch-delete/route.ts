import { NextRequest, NextResponse } from 'next/server';
import { deleteWords, getAllWords } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
  }

  const numericIds = ids.map(Number).filter(id => !isNaN(id));
  const deleted = deleteWords(numericIds);
  const words = getAllWords();

  return NextResponse.json({ deleted, words });
}
