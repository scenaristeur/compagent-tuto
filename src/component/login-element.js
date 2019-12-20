import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
//const auth = require('solid-auth-client')
import * as auth from 'solid-auth-client'
import { PodHelper } from '../tools/pod-helper.js';

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
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    ${this.webId == null ?
      html`
      <button type="button" class="btn btn-success" @click=${this.login}><i class="fas fa-sign-in-alt"></i> Login</button>
      `
      : html`
      <button type="button" class="btn btn-danger" @click=${this.logout}><i class="fas fa-sign-out-alt"></i> Logout</button>
      <!--<small> ${this.webId}</small>-->
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


    this.ph = new PodHelper("bip",12);
    console.log("PH VALUE",this.ph.count)

    auth.trackSession(session => {
      if (!session){
        console.log("notlogged")
        this.webId=null
        this.ph.setWebId(this.webId)
        this.agent.send('Messages',  {action:"info", info:"Not logged"});
        this.agent.sendMulti(['Webid','App', 'Post', 'Fab'], {action: "sessionChanged", webId: null});
        var n = new Notification('Goodbye', {
          body: 'See you soon.',
        //  icon: 'dvp.gif'
        });
      }
      else{
        app.webId = session.webId
        this.ph.setWebId(this.webId)
        this.agent.send('Messages',  {action:"info", info:"Login "+app.webId});
        this.agent.sendMulti(['Webid','App', 'Post', 'Fab'], {action: "sessionChanged", webId: app.webId});
        var n = new Notification('Bienvenue', {
          body: 'Logged with webId '+app.webId,
        //  icon: 'dvp.gif'
        });
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
