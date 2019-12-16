import { LitElement, html } from 'lit-element';
import './component/app-element.js';
import './component/messages-element.js';
import './component/login-element.js';
import './component/webid-element.js';
import './component/agora-notes-element.js';
import './component/user-notes-element.js';
import './component/notes-post-element.js';

class MainElement extends LitElement{
  render(){
    return html`
    <app-element name="App"></app-element>
    <login-element name="Login"></login-element>
    <webid-element name="Webid"></webid-element>


    <table width="100%">
    <tr>
    <td>
    <notes-post-element name="NotesPost"></notes-post-element>
    </td>
    <td>

    <user-notes-element name="UserNotes"></user-notes-element>
    </td>
    <td>
    <agora-notes-element name="AgoraNotes"></agora-notes-element>
    </td>
    <td>
    </tr>
    </table>
    <messages-element name="Messages"></messages-element>
    `;
  }
}
customElements.define('main-element', MainElement);
