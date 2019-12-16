import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

class NotesPostElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      person: {type: Object}
    };
  }

  constructor() {
    super();
    this.person = null
  }

  render(){
    return html`
    <p>${this.name}</p>
    ${this.person == null ?
      html `You must login to post or you can post anonymously on agora`
      :html `
      Textarea & button
      `}



      `;
    }

    firstUpdated(){
      var app = this;
      this.agent = new HelloAgent(this.name);
      this.agent.receive = function(from, message) {
        if (message.hasOwnProperty("action")){
          switch(message.action) {
            case "personChanged":
            app.personChanged(message.person);
            break;
            default:
            console.log("Unknown action ",message)
          }
        }
      };
    }

    personChanged(person){
      this.person = person
      if (person != null){
        console.log(person.storage)
      }
    }

  }

  customElements.define('notes-post-element', NotesPostElement);
