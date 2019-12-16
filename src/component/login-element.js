import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
//const auth = require('solid-auth-client')
import * as auth from 'solid-auth-client'

class LoginElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      webId: {type: String}
    };
  }

  constructor() {
    super();
    this.webId = null
  }

  render(){
    return html`
    ${this.webId == null ?
      html`
      <button @click=${this.login}>Login</button>
      `
      : html`
      <button @click=${this.logout}>Logout</button>
      <small>WebId: ${this.webId}</small>
      `
    }
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

    auth.trackSession(session => {
      if (!session){
        console.log("notlogged")
        this.webId=null
        this.agent.send('Messages',  {action:"info", info:"Not logged"});
        this.agent.send('Webid', {action: "sessionChanged", webId: null});
      }
      else{
        app.webId = session.webId
        this.agent.send('Messages',  {action:"info", info:"Login "+app.webId});
        this.agent.send('Webid', {action: "sessionChanged", webId: app.webId});
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

}

customElements.define('login-element', LoginElement);
