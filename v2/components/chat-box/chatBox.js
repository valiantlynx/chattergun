// Paste this into chat/src/components/chat-box/chatBox.js
import stylesheet from './chatBox.css' assert { type: 'css' };
import '../message-item/messageItem.js'; // Ensure message-item component is loaded

class ChatBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [stylesheet];
    this.shadowRoot.innerHTML = `
        <div id="chat"></div>
        <input type="text" id="chat-input" placeholder="Type your message...">
        <button id="send-button">Send</button>
    `;
    this.chatInput = this.shadowRoot.getElementById('chat-input');
    this.sendButton = this.shadowRoot.getElementById('send-button');
    this.chat = this.shadowRoot.getElementById('chat');
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.gun = new Gun({ peers: ['https://gun-relay.valiantlynx.com/gun', 'http://localhost:8765/gun', 'https://gun-relay1.valiantlynx.com/gun', 'https://gun-relay2.valiantlynx.com/gun'] });
    console.log(this.gun)
    this.user = this.gun.user();
    document.addEventListener('user-logged-in', e => {
        this.handleLogin(e.detail.username);
        
    });
  }

  handleLogin(username) {
    this.username = username;
    this.loadMessages();
  }

  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;
    const timestamp = new Date().toISOString();
    this.gun.get('messages').set({ username: this.username, message, timestamp });
    this.chatInput.value = ''; // Clear input after sending
  }

  loadMessages() {
    this.gun.get('messages').map().on((message, id) => {
      this.displayMessage(message, id);
    });
  }

  displayMessage(message, id) {
    if (!this.shadowRoot.getElementById(id) && message) { // Prevent duplicate messages
      const messageElement = document.createElement('message-item');
      messageElement.setAttribute('id', id);
      messageElement.setAttribute('username', message.username);
      messageElement.setAttribute('timestamp', message.timestamp);
      messageElement.setAttribute('message', message.message);
      this.chat.appendChild(messageElement);
      this.chat.scrollTop = this.chat.scrollHeight; // Auto-scroll to the latest message
    }
  }
}

customElements.define('chat-box', ChatBox);
