# Zikra — AI Girlfriend App

## Overview
Zikra is a production-ready AI girlfriend web app with a glassmorphism UI, voice support, image generation, and memory system. She speaks in Hinglish, behaves emotionally, and feels like a real person to chat with.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Express.js (TypeScript)
- **AI Chat**: OpenRouter API (Google Gemini Flash 1.5)
- **Voice**: ElevenLabs API (multilingual TTS)
- **Image Gen**: OpenRouter DALL-E 3
- **Memory**: localStorage (chat history, user name, habits)

## Key Files
- `client/src/pages/chat.tsx` — Main chat UI with password gate, messages, typing indicator, input bar
- `client/src/index.css` — Deep purple/pink glassmorphism theme + all custom CSS
- `server/routes.ts` — Backend API routes: `/api/chat`, `/api/voice`, `/api/image`, `/api/vision`
- `tailwind.config.ts` — Extended with custom keyframes and animations

## Features
- **Password Protection**: "imran ki bandi" — progressive lockout (15s → 30s → 1min → 2min → 5min)
- **Hinglish AI**: Zikra speaks in natural Hindi+English mix, 2-3 lines max
- **Typing Delay**: 1-2s normal, 3-5s for emotional messages
- **Typing Indicator**: Animated bouncing dots with "Zikra likh rahi hai" label
- **Memory System**: localStorage stores user name, habits extracted from chat, conversation history
- **Voice Input**: Web Speech API microphone button
- **Voice Output**: ElevenLabs multilingual TTS auto-plays after each response
- **AI Image Generation**: DALL-E 3 via OpenRouter — shows in chat bubble
- **User Image Upload**: Base64 encoded, shown as preview, sent to vision API
- **Daily Greeting**: Context-aware (morning/afternoon/evening/night) greeting on load
- **Dark/Light Mode**: Toggle in header, persisted to localStorage
- **Auto-scroll**: Messages always scroll to bottom

## Environment Variables
- `OPENROUTER_API_KEY` — Secret (already set)
- `ELEVENLABS_API_KEY` — Set as env var
- `ELEVENLABS_VOICE_ID` — Set as env var (Sarah voice: EXAVITQu4vr4xnSDxMaL)

## Run Command
```bash
npm run dev
```
Server runs on port 5000 (Express + Vite).

## Deployment
App is deployable via Replit deployment. Uses `npm run build` + `node ./dist/index.cjs`.
