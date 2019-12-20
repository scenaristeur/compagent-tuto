import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import  './fab-element.js';
import  './post-element.js';
import  './flow-element.js';
import './login-element.js'
import './webid-element.js'
import './user-notes-element.js'


class AppElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      flow: {type: String}

    };
  }

  constructor() {
    super();
    this.count = 0
    this.flow = "https://agora.solid.community/public/notes.ttl"
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <div class="container-md">
    <div class="row">
    <p>${this.name}</p>

      <webid-element name="Webid"></webid-element>
    <login-element name="Login"></login-element>
    </div>
    <div class="row">
    <div class="col-md">
    <post-element name="Post"></post-element>
    </div>
    <div class="col-lg-5">
    <flow-element name="Flow" flow="${this.flow}"></flow-element>
    </div>
    <div class="col-md-5">
    <user-notes-element name="UserNotes"></user-notes-element>
    </div>
    </div>
    <div class="row">
    <fab-element name="Fab"></fab-element>

    </div>

    </div>


    `;
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          default:
          console.log("Unknown action ",message)
        }
      }
    };
  }




}

customElements.define('app-element', AppElement);
