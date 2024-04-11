export function addMessage(messageData, id) {
    const chatContainer = document.getElementById('chat');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
      <span class="username">${messageData.username}</span>
      <span class="time">${new Date(messageData.timestamp).toLocaleTimeString()}</span>
      <p>${messageData.message}</p>
    `;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the latest message
  }
  