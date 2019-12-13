import { LitElement, html } from 'lit-element';
import './component/app-element.js';
import './component/messages-element.js';



class MainElement extends LitElement{
  render(){
    return html`
    <app-element name="App"></app-element>
    <messages-element name="Messages"></messages-element>
    `;
  }
}
customElements.define('main-element', MainElement);
