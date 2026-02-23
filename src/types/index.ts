export interface Word {
  id: number;
  chinese: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  message: string;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
  unknownCharacters: string[];
  attempts: number;
}
