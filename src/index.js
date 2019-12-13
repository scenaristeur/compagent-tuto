import { LitElement, html } from 'lit-element';
import './component/my-element.js';
import './component/messages-element.js';



class AppElement extends LitElement{
  render(){
    return html`
    <my-element name="My"></my-element>
    <messages-element name="Messages"></messages-element>
    `;
  }
}
customElements.define('app-element', AppElement);
