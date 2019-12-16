import { LitElement, html } from 'lit-element';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
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
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <app-element name="App"></app-element>
    <login-element name="Login"></login-element>
    <webid-element name="Webid"></webid-element>

    <div class="row">
    <div class="col">
    <notes-post-element name="NotesPost"></notes-post-element>
    </div>
    <div class="col">
    <user-notes-element name="UserNotes"></user-notes-element>
    </div>
    <div class="col">
    <agora-notes-element name="AgoraNotes"></agora-notes-element>
    </div>
    </div>

    <messages-element name="Messages"></messages-element>
    `;
  }
}
customElements.define('main-element', MainElement);
