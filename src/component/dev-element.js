import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import './note-dev.js'
import './login-element.js'


class DevElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number}
    };
  }

  constructor() {
    super();
    this.count = 0
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">

    <login-element name="login"></login-element>

    <note-dev name="NoteDev"></note-dev>
<!--
    <p>${this.name}</p>
    <button @click="${this.sendMessage}">Send message</button>-->
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

customElements.define('dev-element', DevElement);
