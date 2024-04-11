Promise.all([
    // import('.../gun/gun.js'),
    // import('../gun/sea.js'),
    import('https://cdn.jsdelivr.net/npm/gun/gun.js'),
    import('https://cdn.jsdelivr.net/npm/gun/sea.js')
]).then(() => {
   // Import your custom elements after Gun and SEA have loaded
   import('./login-form/loginForm.js');
   import('./chat-box/chatBox.js');

    class ChatApp extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
                <login-form></login-form>
                <chat-box style="display:none;"></chat-box>
            `;

            // Listen for the login event to show chat-box
            this.shadowRoot.addEventListener('user-logged-in', () => {
                this.shadowRoot.querySelector('chat-box').style.display = 'block'; // Show chat-box upon login
                // You might also want to hide the login-form here
                this.shadowRoot.querySelector('login-form').style.display = 'none';
            });
        }
    }

    customElements.define('chat-app', ChatApp);
}).catch(error => console.error("Error loading components:", error));
