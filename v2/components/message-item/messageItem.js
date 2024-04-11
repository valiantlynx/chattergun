import stylesheet from './messageItem.css' assert { type: 'css' };

class MessageItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.adoptedStyleSheets = [stylesheet];
      this.shadowRoot.innerHTML = `
        <div class="message">
          <span class="username"></span>
          <span class="timestamp"></span>
          <div class="content"></div>
        </div>
      `;
    }
    
  
    static get observedAttributes() { return ['username', 'message', 'timestamp']; }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'username') {
        this.shadowRoot.querySelector('.username').textContent = newValue;
      } else if (name === 'message') {
        this.shadowRoot.querySelector('.content').textContent = newValue;
      } else if (name === 'timestamp') {
        const date = new Date(newValue);
        this.shadowRoot.querySelector('.timestamp').textContent = date.toLocaleTimeString();
      }
    }
  }
  
  customElements.define('message-item', MessageItem);
  