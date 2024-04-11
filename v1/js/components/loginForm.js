import { loginUser, registerUser } from '../utils/auth.js';

export function initLoginForm() {
  document.getElementById('login-button').addEventListener('click', (event) => {
    event.preventDefault();
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    loginUser(username, password);
  });

  document.getElementById('register-button').addEventListener('click', registerUser);
}
