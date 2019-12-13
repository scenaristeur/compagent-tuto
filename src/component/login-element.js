import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
//const auth = require('solid-auth-client')
import * as auth from 'solid-auth-client'

class LoginElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      webId: {type: String}
    };
  }

  constructor() {
    super();
    this.count = 0
    this.webId = null
  }

  render(){
    return html`
    <p>${this.name}</p>
    <p>WebId: ${this.webId}</p>

    ${this.webId == null ?
        html`
        <button @click=${this.login}>Login</button>
        `
        : html`
        <button @click=${this.logout}>Logout</button>`
      }


    <button @click="${this.sendMessage}">Send message</button>
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



    auth.trackSession(session => {
      if (!session){
        console.log("notlogged")
        app.wedId=null
      }
      else{
        app.webId = session.webId
      }
    })
  }

  doSomething(message){
    console.log(message)
  }

  sendMessage(){
    this.count++
    this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
  }

}

customElements.define('login-element', LoginElement);
