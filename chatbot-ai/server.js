const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY is not set. Chat endpoint will return an error until it is configured.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  try {
    const incomingHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const trimmedHistory = incomingHistory
      .filter((item) => item && typeof item.role === 'string' && typeof item.content === 'string')
      .slice(-20); // Keep the latest 20 turns for speed/cost balance

    const userMessage = req.body?.message;
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'A non-empty message string is required.' });
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are Nova, a friendly and concise AI assistant. Be helpful, polite, and clear. Use short paragraphs and practical examples when useful.'
      },
      ...trimmedHistory,
      { role: 'user', content: userMessage.trim() }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 450
    });

    const assistantMessage = completion.choices?.[0]?.message?.content?.trim();

    if (!assistantMessage) {
      return res.status(502).json({ error: 'The AI service returned an empty response.' });
    }

    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);

    // Avoid leaking internal stack traces to clients
    const status = error?.status || 500;
    if (status === 401) {
      return res.status(401).json({ error: 'Invalid API key. Please check your server configuration.' });
    }

    res.status(500).json({ error: 'Failed to get a response from the AI service. Please try again.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'chatbot-ai-website' });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
