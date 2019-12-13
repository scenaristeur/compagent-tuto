import { LitElement, html } from 'lit-element';
import './component/my-element.js';



class AppElement extends LitElement{
  render(){
    return html`
      <my-element></my-element>
    `;
  }
}
customElements.define('app-element', AppElement);
