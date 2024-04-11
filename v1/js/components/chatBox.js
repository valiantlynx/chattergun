import { gun } from '../utils/gunConfig.js';
import { addMessage } from '../utils/helpers.js';

export function initChatBox() {
  document.getElementById('send-button').addEventListener('click', sendMessage);
  // Listen for authentication to enable chat UI
  gun.on('auth', () => {
    document.getElementById('chat-form').style.display = 'flex';
    loadMessages();
  });
}

function sendMessage(event) {
  event.preventDefault();
  const messageInput = document.getElementById('chat-input');
  const message = messageInput.value.trim();
  if (message) {
    const username = localStorage.getItem('currentUser');
    const timestamp = new Date().toISOString();
    gun.get('messages').set({
      username,
      message,
      timestamp,
    });
    messageInput.value = ''; // Clear input after sending
  }
}

function loadMessages() {
  gun.get('messages').map().on((message, id) => {
    addMessage(message, id);
  });
}
