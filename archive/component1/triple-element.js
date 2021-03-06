import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

class TripleElement extends LitElement {

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
    <p>${this.name}</p>
    <button @click="${this.sendMessage}">Send message</button>
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
    console.log(person)
  /*  if (person != null){
      console.log(person.storage)
      this.initNotePod()
    }*/
    //  console.log("jquery",$)
  }

  sendMessage(){
    this.count++
    this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
  }

}

customElements.define('triple-element', TripleElement);
