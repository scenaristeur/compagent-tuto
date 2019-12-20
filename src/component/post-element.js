import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import  './post-dialog-element.js'; //https://gist.github.com/ErikHellman/9e17f2ea6a78669294ef2af4bc3f5878

class PostElement extends LitElement {

  static get properties () {
    return {
      name: {type: String},
      dialogVisible: {type: Boolean}
    }
  }



  constructor () {
    super()
    this.dialogVisible = false
  }



  render () {
    console.log('Dialog visible:', this.dialogVisible)
    return html`
    <div>

    <button @click="${this.toggleDialog.bind(this)}">Toggle dialog</button>
    <post-dialog-element ?opened="${this.dialogVisible}"
    @dialog.accept="${this.closeDialog.bind(this)}"
    @dialog.cancel="${this.closeDialog.bind(this)}"></post-dialog-element>
    </div>
    <p>${this.name}</p>
    <button @click="${this.sendMessage}">Send message</button>
    `
  }

  toggleDialog (e) {
    this.dialogVisible = !this.dialogVisible
  //  console.log(this.dialogVisible)
  }

  closeDialog (e) {
  //  console.log(e)
    this.dialogVisible = false
  }



  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "toggleWrite":
          app.toggleWrite(message);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };


  }

  toggleWrite(message){
  //  console.log(message)
    this.toggleDialog(message)
  }

  sendMessage(){
    this.count++
    this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
  }

}

customElements.define('post-element', PostElement);
