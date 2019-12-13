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


    ${this.webId == null ?
      html`
      <button @click=${this.login}>Login</button>
      `
      : html`
      <p>WebId: ${this.webId}</p>
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
        this.webId=null
        this.agent.send('Messages',  {action:"info", info:"Not logged"});
      }
      else{
        app.webId = session.webId
        this.agent.send('Messages',  {action:"info", info:"Login "+app.webId});
      }
    })
  }

  login(event) {
    this.popupLogin();
  }

  logout(event) {
    auth.logout().then(() => alert('Goodbye!'));
    this.agent.send('Messages',  {action:"info", info:"Logout"});
  }

  async popupLogin() {
    let session = await auth.currentSession();
    let popupUri = './dist-popup/popup.html';
    if (!session)
    session = await auth.popupLogin({ popupUri });
  }

  doSomething(message){
    console.log(message)
  }

  sendMessage(){
    this.count++
    this.agent.send("Messages", {action:"info", info:"This webid is "+this.webId}  )
  }

}

customElements.define('login-element', LoginElement);
