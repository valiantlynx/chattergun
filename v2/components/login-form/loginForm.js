// Paste this into chat/src/components/login-form/loginForm.js
import loginStylesheet from './loginForm.css' assert { type: 'css' };
  
// Define the login-form component
  class LoginForm extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.adoptedStyleSheets = [loginStylesheet];
      this.shadowRoot.innerHTML = `
              <form id="login-form">
                  <input type="text" id="username-input" placeholder="Username" />
                  <input type="password" id="password-input" placeholder="Password" />
                  <input type="button" value="Register" id="register-button" />
                  <input type="submit" value="Log In" />
              </form>
          `;

      this.form = this.shadowRoot.querySelector('#login-form');
      this.usernameInput = this.shadowRoot.querySelector('#username-input');
      this.passwordInput = this.shadowRoot.querySelector('#password-input');
      this.registerButton = this.shadowRoot.querySelector('#register-button');

      this.form.addEventListener('submit', this.loginUser.bind(this));
      this.registerButton.addEventListener('click', this.registerUser.bind(this));

      // Initialize GunDB
      this.gun = new Gun({
        peers: [
          'https://gun-relay.valiantlynx.com/gun',
          'http://localhost:8765/gun',
          'https://gun-relay1.valiantlynx.com/gun',
          'https://gun-relay2.valiantlynx.com/gun'
        ]
      });
      this.user = this.gun.user();
    }

    connectedCallback() {
      const cachedUser = localStorage.getItem('currentUser');
      const cachedPassword = localStorage.getItem('currentPassword');
      if (cachedUser && cachedPassword) {
        this.usernameInput.value = cachedUser;
        this.passwordInput.value = cachedPassword;
        this.loginUser(new Event('restore'), false);
      }

    }

    registerUser(e) {
      e.preventDefault();
      const username = this.usernameInput.value.trim();
      const password = this.passwordInput.value.trim();
      if (!username || !password) {
        alert('Please enter a username and password');
        return;
      }
      this.user.create(username, password, (ack) => {
        if (ack.err) {
          alert('Registration failed: ' + ack.err);
        } else {
          alert('User registered successfully!');
          this.loginUser(new Event('login'), true); // Automatically log in the user after registration
        }
      });
    }

    loginUser(e, skipAuth = false) {
      e.preventDefault();
      const username = this.usernameInput.value.trim();
      const password = this.passwordInput.value.trim();
      if (!username || !password) {
        alert("Please enter a username and password");
        return;
      }
      if (!skipAuth) {
        this.user.auth(username, password, ack => {
          if (ack.err) {
            alert("Authentication failed: " + ack.err);
          } else {
            this.dispatchEvent(new CustomEvent('user-logged-in', { detail: { username }, bubbles: true, composed: true }));
            console.log("User authenticated");
            localStorage.setItem('currentUser', username);
            localStorage.setItem('currentPassword', password);
          }
        });
      }
    }

    logoutUser() {
      this.user.leave();
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentPassword');
      alert("You have been logged out.");
      // Optionally reset the form
      this.usernameInput.value = '';
      this.passwordInput.value = '';
      this.dispatchEvent(new CustomEvent('user-logged-out', { bubbles: true, composed: true }));
    }
  }
  customElements.define('login-form', LoginForm);

