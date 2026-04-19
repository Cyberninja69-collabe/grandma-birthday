const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const messageTemplate = document.getElementById('messageTemplate');

const STORAGE_KEY = 'nova_chat_history_v1';
let history = loadHistory();

bootstrap();

function bootstrap() {
  if (history.length === 0) {
    addMessage(
      'assistant',
      "Hi! I'm Nova 👋 Ask me anything. I can help with coding, writing, study plans, and more."
    );
  } else {
    history.forEach((item) => addMessage(item.role, item.content));
  }

  messageInput.focus();
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  addMessage('user', message);
  history.push({ role: 'user', content: message });
  saveHistory();

  messageInput.value = '';
  resizeInput();

  setLoading(true);
  const typingNode = addTypingIndicator();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(0, -1) // exclude just-added user message to avoid duplication
      })
    });

    const data = await response.json();
    typingNode.remove();

    if (!response.ok) {
      throw new Error(data?.error || 'Unknown server error');
    }

    addMessage('assistant', data.reply);
    history.push({ role: 'assistant', content: data.reply });
    saveHistory();
  } catch (error) {
    typingNode.remove();
    const fallback = `Sorry, I ran into an issue: ${error.message}`;
    addMessage('system', fallback);
  } finally {
    setLoading(false);
  }
});

clearChatBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem(STORAGE_KEY);
  chatWindow.innerHTML = '';
  addMessage(
    'assistant',
    "Chat cleared. I'm ready when you are — ask me anything!"
  );
});

messageInput.addEventListener('input', resizeInput);


function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  messageInput.disabled = isLoading;
  sendBtn.textContent = isLoading ? 'Sending...' : 'Send';
}

function resizeInput() {
  messageInput.style.height = 'auto';
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 180)}px`;
}

function addMessage(role, content) {
  const fragment = messageTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.message-row');
  const bubble = fragment.querySelector('.bubble');

  row.classList.add(role);
  bubble.textContent = content;

  chatWindow.appendChild(fragment);
  scrollToBottom();
}

function addTypingIndicator() {
  const fragment = messageTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.message-row');
  const bubble = fragment.querySelector('.bubble');

  row.classList.add('assistant');
  bubble.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';

  chatWindow.appendChild(fragment);
  scrollToBottom();
  return chatWindow.lastElementChild;
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function saveHistory() {
  // Keep local storage compact by saving only the latest 60 messages.
  history = history.slice(-60);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.role === 'string' && typeof item.content === 'string')
      .slice(-60);
  } catch {
    return [];
  }
}
