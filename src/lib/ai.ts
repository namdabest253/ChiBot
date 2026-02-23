import OpenAI from 'openai';
import { ChatResponse } from '@/types';
import { extractChineseCharacters } from './characters';
import { getKnownCharacters, getChatHistory, addChatMessage } from './db';

function getClient(): { client: OpenAI; model: string } {
  const provider = process.env.LLM_PROVIDER || 'ollama';

  if (provider === 'openai') {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    };
  }

  return {
    client: new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      apiKey: 'ollama',
    }),
    model: process.env.OLLAMA_MODEL || 'mistral',
  };
}

export async function generateChatResponse(userInput: string): Promise<ChatResponse> {
  const { client, model } = getClient();
  const knownChars = getKnownCharacters();
  const charList = [...knownChars].join('');

  const history = getChatHistory();
  const recentHistory = history.slice(-8);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a friendly Chinese language tutor chatbot. You have casual conversations and help users learn Chinese.

IMPORTANT: You must ONLY use these Chinese characters in your reply: ${charList || '(no characters available yet - reply in English briefly)'}
Do not use ANY Chinese characters outside this list. Keep your reply short and clear.`,
    },
  ];

  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.message,
    });
  }

  messages.push({ role: 'user', content: userInput });

  const bannedChars = new Set<string>();
  let finalReply = '';
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;

    const banNote = bannedChars.size > 0
      ? `\nDo NOT use these characters: ${[...bannedChars].join(', ')}`
      : '';

    const currentMessages = [...messages];
    if (banNote) {
      currentMessages[0] = {
        role: 'system',
        content: (messages[0] as { content: string }).content + banNote,
      };
    }

    const response = await client.chat.completions.create({
      model,
      messages: currentMessages,
      stream: false,
    });

    const aiReply = response.choices[0]?.message?.content || '';
    const usedChars = new Set(extractChineseCharacters(aiReply));
    const unknown = [...usedChars].filter(c => knownChars.size > 0 && !knownChars.has(c));

    if (unknown.length === 0) {
      finalReply = aiReply;
      break;
    }

    unknown.forEach(c => bannedChars.add(c));
    finalReply = aiReply;
  }

  const usedChars = new Set(extractChineseCharacters(finalReply));
  const unknownCharacters = [...usedChars].filter(c => knownChars.size > 0 && !knownChars.has(c));

  // Save messages exactly once
  addChatMessage('user', userInput);
  addChatMessage('bot', finalReply);

  return { reply: finalReply, unknownCharacters, attempts };
}
