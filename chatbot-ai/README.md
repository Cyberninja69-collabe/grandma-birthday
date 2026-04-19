# Nova Chat (AI Chatbot Website)

A beginner-friendly full-stack chatbot app with:
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **AI:** OpenAI Chat Completions API

## 1) Project structure

```txt
chatbot-ai/
├─ public/
│  ├─ index.html
│  ├─ style.css
│  └─ script.js
├─ .env.example
├─ package.json
├─ server.js
└─ README.md
```

## 2) Install dependencies

```bash
cd chatbot-ai
npm install
```

## 3) Configure API key securely

1. Copy the sample env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add your real key:
   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   PORT=3000
   ```

> Never commit `.env` to GitHub.

## 4) Run the server

### Production mode
```bash
npm start
```

### Dev watch mode
```bash
npm run dev
```

Open: `http://localhost:3000`

## 5) Features included

- ChatGPT-style message bubbles (user vs assistant)
- Auto-scroll to latest messages
- Loading/typing indicator while waiting
- Mobile-responsive modern dark UI
- Error handling on frontend + backend
- Friendly assistant personality via system prompt
- Conversation history handling
- Clear chat button
- Chat history saved in browser localStorage

## 6) API endpoint

`POST /api/chat`

Request body:
```json
{
  "message": "Hello!",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello!" }
  ]
}
```

Response body:
```json
{
  "reply": "Hi there! How can I help?"
}
```

## 7) Troubleshooting

- **401 Invalid API key:** check `.env` value for `OPENAI_API_KEY`
- **Empty/failed responses:** verify network, model name, and key permissions
- **Port conflict:** change `PORT` in `.env`
