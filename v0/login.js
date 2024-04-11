import { gun } from './gunConfig.js'
import { setCurrentUser, currentUser  } from './data.js'
import { addMessage } from './helpers.js'

export function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
  
    if (username === '' || password === '') {
      alert('Please enter a username and password');
      return;
    }
    gun.get('users').get(username).put({ username, password }, (ack) => {
      if (ack.err) {
        alert(ack.err);
      } else {
        const user = gun.user();
        user.create(username, password, (ack) => {
          if (ack.err) {
            alert(ack.err);
            console.error('Failed to create user:', ack.err);
          } else {
            loginUser(username, password);
            console.log('User created successfully!');
          }
        });
      }
    });
  }
  
  export function loginUser(username, password) {
    const user = gun.user();
    user.auth(username, password, (ack) => {
      if (ack.err) {
        console.log("login username:", username, "login pass:", password)
        console.log('Login failed:', ack.err);
        alert('Something went wrong. Please try again. are you sure you have an account?');
      } else {
        console.log('User authenticated');
        gun.get('users').get(username).once((data, key) => {
          if (data && data.password === password) {
            setCurrentUser(username);
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('chat-form').style.display = 'flex';
            document.getElementById('chat-input').focus();
  
            // Cache the logged-in user
            localStorage.setItem('currentUser', currentUser);
            localStorage.setItem('currentPassword', password);
  
            // Load chat history
            gun.get('messages').map().once((data, key) => {
              addMessage(data);
              // Scroll to the searchTermtom of the chat
              document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
            });
          } else {
            alert('Incorrect username or password');
          }
        });
      }
  
    });
  }
  
 export function logoutUser() {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentPassword');
    gun.user().leave();
    document.getElementById('chat').innerHTML = '';
    document.getElementById('chat-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('username-input').value = '';
    document.getElementById('password-input').value = '';
    document.getElementById('username-input').focus();
  }