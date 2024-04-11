import stylesheet from './style.css' assert { type: 'css' };

Promise.all([
  import('./gun/gun.js'),
  import('./gun/sea.js')
]).then(() => {
  console.log('GunDB and SEA loaded successfully.');
  var gun = new Gun({
    peers: [
      'https://gun-relay.valiantlynx.com/gun',
      'http://localhost:8765/gun',
      'https://gun-relay1.valiantlynx.com/gun',
      'https://gun-relay2.valiantlynx.com/gun'
    ]
  });

  var currentUser;

  class ChatApp extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.adoptedStyleSheets = [stylesheet];
      this.shadowRoot.innerHTML = `
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
          <button class="delete-all-messages button" id="delete-button">Delete all messages</button>
        </div>
      `;

      this.gun = gun;
      this.user = this.gun.user();

      this.gun.on('auth', () => {
        const user = this.gun.user();
        if (user.is) {
          this.setCurrentUser(user.is.alias);
          this.shadowRoot.getElementById('login-form').style.display = 'none';
          this.shadowRoot.getElementById('chat-form').style.display = 'flex';
          this.shadowRoot.getElementById('chat-input').focus();
        }
      });

      this.shadowRoot.getElementById('register-button').addEventListener('click', (event) => this.registerUser(event));
      this.shadowRoot.getElementById('login-button').addEventListener('click', (event) => (event) => {
        event.preventDefault();
        const username = document.getElementById('username-input').value.trim();
        const password = document.getElementById('password-input').value.trim();
      
        if (username === '' || password === '') {
          alert('Please enter a username and password');
          return;
        }
      
        this.loginUser(username, password);
      });
      this.shadowRoot.getElementById('delete-button').addEventListener('click', () => this.deleteAllMessages());
      this.shadowRoot.getElementById('logout-button').addEventListener('click', () => this.logoutUser());
      this.shadowRoot.getElementById('send-button').addEventListener('click', (event) => this.sendMessage(event));
      this.shadowRoot.getElementById('chat-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          this.sendMessage(event);
        }
      });

      const cachedUser = localStorage.getItem('currentUser');
      const cachedPassword = localStorage.getItem('currentPassword');
      if (cachedUser && cachedPassword) {
        this.loginUser(cachedUser, cachedPassword);
      }
    }

    setCurrentUser(user) {
      currentUser = user;
    }

    registerUser(event) {
      event.preventDefault();
      const username = this.shadowRoot.getElementById('username-input').value.trim();
      const password = this.shadowRoot.getElementById('password-input').value.trim();

      if (username === '' || password === '') {
        alert('Please enter a username and password');
        return;
      }
      this.gun.get('users').get(username).put({ username, password }, (ack) => {
        if (ack.err) {
          alert(ack.err);
        } else {
          this.user.create(username, password, (ack) => {
            if (ack.err) {
              alert(ack.err);
              console.error('Failed to create user:', ack.err);
            } else {
              this.loginUser(username, password);
              console.log('User created successfully!');
            }
          });
        }
      });
    }


    loginUser(username, password) {
      this.user.auth(username, password, (ack) => {
        if (ack.err) {
          console.log("login username:", username, "login pass:", password)
          console.log('Login failed:', ack.err);
          alert('Something went wrong. Please try again. are you sure you have an account?');
        } else {
          console.log('User authenticated');
          this.gun.get('users').get(username).once((data, key) => {
            if (data && data.password === password) {
              this.setCurrentUser(username);
              this.shadowRoot.getElementById('login-form').style.display = 'none';
              this.shadowRoot.getElementById('chat-form').style.display = 'flex';
              this.shadowRoot.getElementById('chat-input').focus();
              localStorage.setItem('currentUser', username);
              localStorage.setItem('currentPassword', password);
              this.gun.get('messages').map().once((data, key) => {
             
                this.addMessage(data);
                this.shadowRoot.getElementById('chat').scrollTop = this.shadowRoot.getElementById('chat').scrollHeight;
              });
            } else {
              alert('Incorrect username or password');
            }
          });
        }
      });
    }

    deleteAllMessages() {
      // Assuming the data is stored under the path 'data'
      // and each relay is stored under the path 'relays/relay1', 'relays/relay2', etc.

      // Get all the relays
      this.gun.get('relays').map().on(function (relayData, relayId) {
        // Get the data from each relay
        this.gun.get('relays').get(relayId).get('data').once(function (data) {
          // Delete the data from the relay
          this.gun.get('relays').get(relayId).put({ data: null });
        });
      });

      // Alternatively, if you just want to delete the data from the current relay
      // you can use the following code:
      this.gun.get('data').put(null);




      if (confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
        this.gun.get('messages').map().once((data, key) => {
          this.gun.get('messages').get(key).put(null, ack => {

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

    logoutUser() {
      this.setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentPassword');
      this.user.leave();
      this.shadowRoot.getElementById('chat').innerHTML = '';
      this.shadowRoot.getElementById('chat-form').style.display = 'none';
      this.shadowRoot.getElementById('login-form').style.display = 'flex';
      this.shadowRoot.getElementById('username-input').value = '';
      this.shadowRoot.getElementById('password-input').value = '';
      this.shadowRoot.getElementById('username-input').focus();
    }


    sendMessage(event) {
      event.preventDefault();
      const message = this.shadowRoot.getElementById('chat-input').value.trim();
      const imageInput = this.shadowRoot.getElementById('image-input');
      const images = imageInput.files;

      if (message === '' && images.length === 0) {
        return;
      }
      const time = new Date().getTime();
      const id = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36);
      const data = { username: currentUser, message, time, id };

      if (images.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageString = reader.result.split(',')[1];
          data.image = imageString;
          this.gun.get('messages').set(data);
        };
        reader.readAsDataURL(images[0]);
      } else {
        this.gun.get('messages').set(data);
      }

      this.shadowRoot.getElementById('chat-input').value = '';
      imageInput.value = '';
    }


    deleteMessage(id, username) {
      //console.log("id", id)
      //console.log("username", username)

      if (username === currentUser || username === 'bot') {

        this.gun.get('messages').map().once((data, key) => {
          if (data && data.id === id) {
            //console.log("loop data", data)
            //console.log("loop key", key)
            this.gun.get('messages').get(key).put(null, ack => {
              if (ack.err) {
                console.log("Error deleting message", ack.err);
              } else {
                const confirmed = confirm('Are you sure you want to delete this message?');
                if (confirmed) {
                  const messageString = JSON.stringify({ action: 'delete', data: id });

                }
                console.log(ack);
                console.log("Message deleted successfully");
                this.removeMessage(id);
              }
              //console.log(ack);
            });

          } else {
            return;
            console.log("Message already deleted");
          }

          // Scroll to the searchTermtom of the chat
          this.shadowRoot.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
        });
      } else {
        alert('You can only delete your own messages');
      }
    }

    removeMessage(key) {
      try {
        console.log("key", key);
        const messageElement = this.shadowRoot.getElementById(key);
        if (messageElement) {
          console.log(" to be removed messageElem", messageElement)
          messageElement.remove();
        }
      } catch (error) {
        console.log("error removing message", error)
      }

    }

    addMessage(data) {
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
            deleteButton.addEventListener('click', () => this.deleteMessage(id, username));

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
          if (username !== 'searchTerm') this.processMessage(message); // Process the incoming message and respond if necessary

          this.shadowRoot.getElementById('chat').appendChild(messageElement);
          this.shadowRoot.getElementById('chat').scrollTop = this.shadowRoot.getElementById('chat').scrollHeight;
        }
      } catch (error) {
        return;
      }

    }

    processMessage(message) {
      if (message.includes('@help')) {
        console.log('help');
        this.addsearchTermMessage('I can help with that! Here are some commands you can try:`\n-` @weather [city]: Get the current weather for a city\n- @news: Get the latest news headlines\n- @wiki [search term]: Search Wikipedia for an article');
      } else if (message.includes('@weather')) {
        this.weather(message);
      } else if (message.includes(`@news`)) {
        this.newsapi(message);
      } else if (message.includes('@wiki')) {
        this.wikipedia(message);
      }
      else if (message.includes('@ai')) {
        this.ai(message);
      }
    }

    wikipedia(message) {
      const searchTerm = message.split('@wiki ')[1];
      console.log(searchTerm);
      fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}&utf8=&format=json&origin=*`)
        .then(response => response.json())
        .then(data => {
          const pages = data.query.search;
          //console.log(pages);
          const pageTitles = pages.map(page => page.title);
          //console.log(pageTitles);
          this.addsearchTermMessage(`Here are some Wikipedia articles that match your search:\n${pageTitles.join('\n')}`);
        })
        .catch(() => {
          this.addsearchTermMessage(`Sorry, I couldnt find any Wikipedia articles for ${searchTerm}.`);
        });
    }

    newsapi(message) {
      const emne = message.split('@news ')[1];
      console.log(emne);
      fetch(`https://newsapi.org/v2/top-headlines?country=no&apiKey=838674747d4742299653d7e6d252ae35&q=${emne}`)
        .then(response => response.json())
        .then(data => {

          const articles = data.articles;
          //console.log(articles);
          const headlines = articles.map(article => article.title);
          console.log(headlines);
          this.addsearchTermMessage(`Here are the latest news headlines:\n${headlines.join('\n')}`);
        })
        .catch(() => {
          this.addsearchTermMessage('Sorry, I couldnt get the latest news.');
        });
    }

    weather(message) {
      const city = message.split('@weather ')[1];
      console.log(city);
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ba5cd6df97458072af2feb17bcfdf75c`)
        .then(response => response.json())
        .then(data => {
          const { main, weather } = data;
          const temp = Math.round(main.temp - 273.15);
          console.log(temp);
          const description = weather[0].description;
          console.log(description);
          this.addsearchTermMessage(`The current weather in ${city} is ${temp}°C with ${description}.`);
        })
        .catch(() => {
          this.addsearchTermMessage(`Sorry, I couldnt get the weather for ${city}.`);
        });
    }

    async ai(message) {
      console.log('ai');
      const searchTerm = message.split('@ai ')[1];
      // addsearchTermMessage(`Hello! How can I assist you today?${searchTerm}`);
      // async function generateText(searchTerm) {
      //   const response = await fetch('http://localhost:5000/generate', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ input_text: searchTerm })
      //   });

      //   const data = await response.json();
      //   return data.generated_text;
      // }

      async function generateText(searchTerm) {
        let pyodide = await loadPyodide();
        var data = {
          'message': ['Hello', 'How are you?', 'Goodbye', 'Nice to meet you'],
          'label': ['greeting', 'question', 'farewell', 'introduction']
        }

        await pyodide.loadPackage("micropip");

        const micropip = pyodide.pyimport("micropip");
        await micropip.install("numpy")
        await micropip.install(" scikit-learn")
        await micropip.install("pandas")
        console.log("Installed packages");
        await pyodide.runPython(`
          import pandas as pd
    
          from sklearn.feature_extraction.text import CountVectorizer
          from sklearn.naive_bayes import MultinomialNB
    
          # Step 1: Collect chat data
          df = pd.DataFrame(${JSON.stringify(data)})
          print(df)
    
          # Step 2: Preprocess the data
          vectorizer = CountVectorizer(stop_words='english')
          X = vectorizer.fit_transform(df['message'])
          y = df['label']
    
          # Step 3: Build the chatsearchTerm model
          model = MultinomialNB()
    
          # Step 4: Train the model
          model.fit(X, y)
    
          # Step 5: Test and refine the chatsearchTerm
          message = "${searchTerm}"
          X_test = vectorizer.transform([message])
          prediction = model.predict(X_test)
    
          print(prediction)
          
    
        `);


        const prediction_string = pyodide.globals.get("prediction").toString();
        const prediction_array = prediction_string.split("'"); // ['[', 'greeting', ']']
        const prediction = prediction_array[1]; // greeting

        console.log("prediction_string", prediction_string);
        console.log("prediction_array", prediction_array);


        return prediction;

      }

      // Example usage
      const generatedText = await generateText(searchTerm);
      this.addsearchTermMessage(generatedText);
      console.log("generatedText", generatedText);

    }

    addsearchTermMessage(message) {
      const time = new Date().getTime();
      const id = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
      const data = { username: 'bot', message, time, id };
      this.gun.get('messages').set(data);
    }

  }
  customElements.define('chatter-gun', ChatApp);

}).catch(error => {
  console.error("Error loading GunDB/SEA or defining components:", error);
});
