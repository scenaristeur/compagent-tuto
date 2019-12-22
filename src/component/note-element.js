import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

class NoteElement extends LitElement {

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
    <div class="form-group">
<!--    <label class="text-primary" for="notearea"></label>-->
    <textarea class="form-control" id="notearea" rows="5" style="width:100%" placeholder="Write a note on your Pod & share it on Agora"></textarea>
    </div>
    `;
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "askContent":
          app.askContent(from, message);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
  }

  askContent(from, message){
    console.log(from,message)
    var textarea = this.shadowRoot.getElementById('notearea')/*.shadowRoot.querySelector(".form-control")*/
    var note = textarea.value.trim()
    textarea.value = ""
    console.log(note)
    this.agent.send(from, {
      action: "reponseContent",
      content: note,
      id: message.id,
      type: "TextDigitalDocument"
    })
  }

}

customElements.define('note-element', NoteElement);
