class GunChat extends HTMLElement {
    constructor() {
        super(); // Always call super first in constructor

        // Attach a shadow DOM tree to the instance
        const shadow = this.attachShadow({ mode: 'open' });

        // Add the chat HTML structure
        const chatContainer = document.createElement('div');
        chatContainer.innerHTML = `
            <link rel="stylesheet" href="./css/chat.css">
            <div class="dark-mode" id="login-form">
                <h1>Gun Chat</h1>
                <form>
                    <input type="text" id="username-input" placeholder="Username" />
                    <input type="password" id="password-input" placeholder="Password" />
                    <input type="submit" id="login-button" value="Log In" />
                </form>
                <button class="dark-mode button" id="register-button">Register</button>
            </div>
            <div id="chat-form" style="display: none;">
                <h1>Gun Chat</h1>
                <div id="chat"></div>
                <form>
                    <input type="text" id="chat-input" placeholder="Type your message...">
                    <input type="file" id="image-input" multiple>
                    <input class="dark-mode button is-success" type="button" id="send-button" value="Send">
                </form>
                <button class="dark-mode button" id="logout-button">Log Out</button>
                <button class="dark-mode button" onclick="toggleDarkMode()">Toggle Dark Mode</button>
                <button onclick="deleteAllMessages()">Delete all messages</button>
            </div>
        `;

        // Append styles and chat container to shadow DOM
        shadow.appendChild(chatContainer);

        // Toggle dark mode function within component
        this.toggleDarkMode = function() {
            chatContainer.classList.toggle("dark-mode");
        };
    }
}

// Define the new element
customElements.define('gun-chat', GunChat);
