//This file will be the web component
//It only needs to run, not be imported by main.js
import stylesheet from "../css/bigbang.css" assert { type: "css" }

const template = document.createElement('template');
template.innerHTML = `
<div>
  <h1>Big Bang Theory</h1>
  <slot name="title">Default text if no title slot used in HTML</slot>
  <slot name="list"></slot>
</div>
`;

class BigBang extends HTMLElement {
  constructor() {
    super();
    // so whatever we set here does nott affect the rest of the site, but theirs can affect us. like styling
    const shadowRoot = this.attachShadow({ mode: 'closed' });
    shadowRoot.adoptedStyleSheets = [stylesheet];
    // let div = document.createElement('div');
    // div.textContent = 'Big Bang Theory';
    // shadowRoot.append(div);
    let clone = template.content.cloneNode(true);
    shadowRoot.append(clone);
  }
}

customElements.define('big-bang', BigBang);
// <big-bang>
