import { gun } from './gunConfig.js'
import { currentUser  } from './data.js'
import { processMessage  } from './tools.js'

export function deleteAllMessages() {
    // Assuming the data is stored under the path 'data'
    // and each relay is stored under the path 'relays/relay1', 'relays/relay2', etc.
  
    // Get all the relays
    gun.get('relays').map().on(function (relayData, relayId) {
      // Get the data from each relay
      gun.get('relays').get(relayId).get('data').once(function (data) {
        // Delete the data from the relay
        gun.get('relays').get(relayId).put({ data: null });
      });
    });
  
    // Alternatively, if you just want to delete the data from the current relay
    // you can use the following code:
    gun.get('data').put(null);
  
  
  
  
    if (confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
      gun.get('messages').map().once((data, key) => {
        gun.get('messages').get(key).put(null, ack => {
  
          if (ack.err) {
            console.error('Error deleting messages', ack.err);
            alert('Error deleting messages');
          } else {
            console.log(ack);
            console.log("Message deleted successfully");
            window.location.reload();
  
          }
          console.log(ack);
        });
      });
  
  
    }
  }


export function addMessage(data) {
    try {
      const { username, message, time, id, image } = data;
  
      if (username && (message || image) && time) {
        const messageElement = document.createElement('div');
        const contentElement = document.createElement('div');
        messageElement.classList.add('message');
        contentElement.classList.add('content-message');
        contentElement.setAttribute('id', id); // Add id attribute
        if (username === currentUser || username === 'bot') {
          contentElement.classList.add('own-message');
          const deleteButton = document.createElement('button');
          deleteButton.classList.add('delete-button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', () => deleteMessage(id, username));
  
          contentElement.appendChild(deleteButton);
        }
  
        const usernameElement = document.createElement('span');
        usernameElement.classList.add('username');
        usernameElement.textContent = username;
  
        const timeElement = document.createElement('span');
        timeElement.classList.add('time');
        timeElement.textContent = new Date(time).toLocaleTimeString();
  
        const textElement = document.createElement('span');
        textElement.classList.add('text');
        textElement.textContent = message;
  
        const imageElement = document.createElement('img');
        imageElement.classList.add('image');
        imageElement.src = image ? `data:image/png;base64,${image}` : "";
  
        const profileImageElement = document.createElement('img');
        profileImageElement.classList.add('profile-image');
        profileImageElement.src = `https://api.dicebear.com/8.x/lorelei/svg?seed=${username}`;
  
        messageElement.appendChild(profileImageElement);
        messageElement.appendChild(usernameElement);
        messageElement.appendChild(timeElement);
  
        messageElement.appendChild(contentElement);
        if (message) {
          contentElement.appendChild(textElement);
        }
        if (image) {
          contentElement.appendChild(imageElement);
        }
        // Add this line to the addMessage function
        if (username !== 'searchTerm') processMessage(message); // Process the incoming message and respond if necessary
  
        document.getElementById('chat').appendChild(messageElement);
        document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
      }
    } catch (error) {
      return;
    }
  
  }

export function removeMessage(key) {
  try {
    console.log("key", key);
    const messageElement = document.getElementById(key);
    if (messageElement) {
      console.log(" to be removed messageElem", messageElement)
      messageElement.remove();
    }
  } catch (error) {
    console.log("error removing message", error)
  }

}
  
export function deleteMessage(id, username) {
  //console.log("id", id)
  //console.log("username", username)

  if (username === currentUser || username === 'bot') {

    gun.get('messages').map().once((data, key) => {
      if (data && data.id === id) {
        //console.log("loop data", data)
        //console.log("loop key", key)
        gun.get('messages').get(key).put(null, ack => {
          if (ack.err) {
            console.log("Error deleting message", ack.err);
          } else {
            const confirmed = confirm('Are you sure you want to delete this message?');
            if (confirmed) {
              const messageString = JSON.stringify({ action: 'delete', data: id });

            }
            console.log(ack);
            console.log("Message deleted successfully");
            removeMessage(id);
          }
          //console.log(ack);
        });

      } else {
        return;
        console.log("Message already deleted");
      }

      // Scroll to the searchTermtom of the chat
      document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
    });
  } else {
    alert('You can only delete your own messages');
  }
}

export function sendMessage(event) {
  event.preventDefault();
  const message = document.getElementById('chat-input').value.trim();
  const imageInput = document.getElementById('image-input');
  const images = imageInput.files;

  if (message === '' && images.length === 0) {
    return;
  }

  // Add this line to the sendMessage function
  processMessage(message); // Process the user's message and respond if necessary


  const time = new Date().getTime();
  const id = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)

  const data = { username: currentUser, message, time, id };
  const messageString = JSON.stringify({ action: 'add', data });

  if (images.length > 0) {
    const reader = new FileReader();
    reader.onload = function () {
      const imageString = reader.result.split(',')[1];
      data.image = imageString;
      gun.get('messages').set(data);
    };
    reader.readAsDataURL(images[0]);
  } else {
    gun.get('messages').set(data);
  }

  document.getElementById('chat-input').value = '';
  imageInput.value = '';
}