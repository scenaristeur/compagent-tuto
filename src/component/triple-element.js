import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

class TripleElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      triples: {type: Array}
    };
  }

  constructor() {
    super();
    this.count = 0
    this.triples = ["one","two","three"]
  }

  render(){


    const triplesList = (triples) => html`
    <ul class="list-group list-group-flush" style="height: 50vh; overflow: auto">
    ${triples.map((t) => html`
      <li class="list-group-item">
      ${t}
      </li>
      `)}
      </ul>

      `;

      return html`
      <link href="css/fontawesome/css/all.css" rel="stylesheet">
      <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
      in developpement
      <div class="row">
      <div class="input-group mb-3">
      <input type="text"
      id="tripleInput"
      class="form-control"
      placeholder="ex: Paris type Town."
      aria-label="Write some Triples"
      aria-describedby="basic-addon2"
      @keydown=${this.keydown}>
      <div class="input-group-append">
      <button class="btn btn-outline-primary" @click="${this.add_triple}" type="button">Add</button>

      </div>
      <!--      <div class="input-group-text">?</div>-->
      </div>
      </div>

      <div class="row">
      ${triplesList(this.triples)}
      </div>
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

    add_triple(){
      var new_triple = this.shadowRoot.getElementById('tripleInput').value.trim()
      if (new_triple.length == 0){
        alert("you can't add an empty Triple")
        return
      }
      console.log(new_triple)
      this.triples.reverse()
      this.triples = [... this.triples, new_triple]
      this.triples.reverse()

      // voir traiteTriplet dans js/spoggy.js de spoggy-simple
    }

    keydown(e){
      console.log(e.which)
      if ( e.which === 13 ) {
        this.add_triple()
        e.preventDefault();
        return false;
      }
    }

    sendMessage(){
      this.count++
      this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
    }

  }

  customElements.define('triple-element', TripleElement);
