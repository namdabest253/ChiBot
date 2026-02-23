import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/ai';
import { extractChineseCharacters } from '@/lib/characters';
import { addWord } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userInput = message.trim();
    if (!userInput) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Auto-add Chinese characters from user input to word bank
    const newChars = extractChineseCharacters(userInput);
    for (const char of newChars) {
      addWord(char);
    }

    const result = await generateChatResponse(userInput);

    // Stream the reply with metadata appended
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send reply characters
        for (const char of result.reply) {
          controller.enqueue(encoder.encode(char));
        }

        // Append metadata if there are unknown characters
        if (result.unknownCharacters.length > 0) {
          const meta = JSON.stringify({
            unknownCharacters: result.unknownCharacters,
            attempts: result.attempts,
          });
          controller.enqueue(encoder.encode(`__META__${meta}`));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Could not connect to LLM service. Is Ollama running?' },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
