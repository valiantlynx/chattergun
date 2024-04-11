import { deleteAllMessages, sendMessage } from './helpers.js'
import { gun } from './gunConfig.js'
import { loginUser, logoutUser, registerUser } from './login.js'
import { setCurrentUser } from './data.js'


gun.on('auth', () => {
  const user = gun.user();
  if (user.is) {
    setCurrentUser(user.is.aliasname);
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('chat-form').style.display = 'flex';
    document.getElementById('chat-input').focus();
  }
});
document.getElementById('register-button').addEventListener('click', registerUser);
document.getElementById('login-button').addEventListener('click', (event) => {
  event.preventDefault();
  const username = document.getElementById('username-input').value.trim();
  const password = document.getElementById('password-input').value.trim();

  if (username === '' || password === '') {
    alert('Please enter a username and password');
    return;
  }

  loginUser(username, password);
});
document.getElementById('delete-button').addEventListener('click', deleteAllMessages);
document.getElementById('logout-button').addEventListener('click', logoutUser);
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage(event);
  }
});


// Check for cached user
const cachedUser = localStorage.getItem('currentUser');
const cachedPassword = localStorage.getItem('currentPassword');
if (cachedUser && cachedPassword) {
  loginUser(cachedUser, cachedPassword);
}



