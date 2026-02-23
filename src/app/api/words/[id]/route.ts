import { NextRequest, NextResponse } from 'next/server';
import { deleteWord } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wordId = parseInt(id, 10);

  if (isNaN(wordId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const deleted = deleteWord(wordId);
  if (!deleted) {
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
