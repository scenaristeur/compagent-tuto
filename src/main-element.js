import { LitElement, html } from 'lit-element';
import './component/app-element.js';
import './component/messages-element.js';
import './component/login-element.js';
import './component/agora-notes-element.js';

class MainElement extends LitElement{
  render(){
    return html`
    <app-element name="App"></app-element>
    <login-element name="Login"></login-element>
    <agora-notes-element name="AgoraNotes"></agora-notes-element>
    <messages-element name="Messages"></messages-element>
    `;
  }
}
customElements.define('main-element', MainElement);
