# ChiBot

A Chinese language learning chatbot that constrains its replies to only use characters from your word bank. Built with Next.js, React, and TypeScript.

## Features

- **Character-constrained chat**: The AI only uses Chinese characters from your word bank
- **Word bank management**: Add and delete characters with instant UI updates
- **Auto-collect characters**: Chinese characters from your messages are automatically added to the word bank
- **Unknown character detection**: Get notified when the bot uses characters outside your word bank, with a one-click "Add to Word Bank" option
- **Streaming responses**: Real-time streaming of chat responses
- **Configurable LLM**: Supports both Ollama (local) and OpenAI API

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.ai/) with the Mistral model installed:
  ```bash
  ollama pull mistral
  ```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file and configure:
   ```bash
   cp .env.example .env.local
   ```

3. Start Ollama (if using local LLM):
   ```bash
   ollama serve
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `ollama` | LLM provider: `ollama` or `openai` |
| `OLLAMA_BASE_URL` | `http://localhost:11434/v1` | Ollama API base URL |
| `OLLAMA_MODEL` | `mistral` | Ollama model name |
| `OPENAI_API_KEY` | - | OpenAI API key (when using OpenAI) |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model name |

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: React 18+ with Tailwind CSS
- **Database**: SQLite via better-sqlite3
- **LLM**: Ollama or OpenAI via the openai SDK
