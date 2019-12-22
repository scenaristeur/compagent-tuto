import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import data from "@solid/query-ldflex";

class NoteDev extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      webId: {type: String},
      publicTypeIndex: {type: String},
      storage: {type: String},
    };
  }

  constructor() {
    super();
    this.webId = null
    this.publicTypeIndex = null
    this.storage = null
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <p>${this.name}</p>
    <p>${this.publicTypeIndex}</p>
    <p>${this.storage}</p>
    <textarea class="form-control" id="notearea" rows="5" style="width:100%" placeholder="Write a note on your Pod & share it on Agora"></textarea>

    <button @click="${this.sendMessage}" ?disabled = ${this.webId == null}>Send note</button>
    `;
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "sessionChanged":
          app.sessionChanged(message.webId);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
  }

  sessionChanged(webId){
    console.log(webId)
    this.webId = webId
    this.updateUser()
  }

  async updateUser(){
    if (this.webId != null){
      this.publicTypeIndex = await data.user.publicTypeIndex
      this.storage = await data.user.storage


      for await (const subject of  data[this.publicTypeIndex].subjects){
        console.log(`  - ${subject}`);
        for await (const pred of subject.properties) {
  var p = await pred;
  console.log(p)
}

      }



    }else{
      this.publicTypeIndex = null
      this.storage = null
    }

  }

  sendMessage(){
    var content = this.shadowRoot.getElementById('notearea').value.trim();
    console.log(content)
  }

}

customElements.define('note-dev', NoteDev);
