import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import  './fab-element.js';
import  './post-element.js';
import  './flow-element.js';

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
    <div class="container fuild">
    <div class="row">
    <p>${this.name}</p>
    </div>
    <div class="row">
    <div class="col">
    <post-element name="Post"></post-element>
    </div>
    <div class="col-8">
    <flow-element name="Flow" flow="${this.flow}"></flow-element>
    </div>
    <div class="col">
    right
    </div>
    </div>
    <div class="row">
    <fab-element name="Fab"></fab-element>
    <button @click="${this.sendMessage}">Send message</button>
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
          case "doSomething":
          app.doSomething(message);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
  }


  doSomething(message){
    console.log(message)
  }

  sendMessage(){
    this.count++
    this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
  }

}

customElements.define('app-element', AppElement);
