import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import  data  from "@solid/query-ldflex";

class SuggestionElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      actors: {type: Array}
    };
  }

  constructor() {
    super();
    this.actors = []
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <div class="my-3 p-3 bg-white rounded shadow-sm">
    <h6 class="border-bottom border-gray pb-2 mb-0">Suggestions</h6>
    ${this.actors.map((a) => html`
      ${this.templateActor(a)}
      `)}
      <small class="d-block text-right mt-3">
      <a href="#">All suggestions</a>
      </small>
      </div>
      `;
    }

    firstUpdated(){
      var app = this;
      this.agent = new HelloAgent(this.name);
      this.agent.receive = function(from, message) {
        if (message.hasOwnProperty("action")){
          switch(message.action) {
            case "updateActors":
            app.updateActors(message);
            break;
            default:
            console.log("Unknown action ",message)
          }
        }
      };
    }

    async  updateActors(message){
    //  console.log(message)
      this.actors = []
      //  this.actors = message.actors
      for (let [key, value] of Object.entries(message.actors)) {
    //    console.log(`${key}: ${value}`);
        var actor = {webId : value.webId, activities: value.activities}
        actor.name = await   data[value.webId].vcard$fn
      //  console.log("NAME",name)
        this.actors = [... this.actors, actor]
      }

      this.actors.sort(function(a, b) { // sort by number of activities
        return b.activities - a.activities;
      });
    //  console.log(this.actors)

    }


    templateActor(a){

      return html`
      <div class="media text-muted pt-3">


      <span class="fa-stack" style="vertical-align: top;">
      <i class="far fa-square fa-stack-2x"></i>
      <strong class="fa-stack-1x">${a.activities}</strong>
      </span>


      <div class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
      <div class="d-flex justify-content-between align-items-center w-100">
      <strong class="text-gray-dark">${a.name}</strong>
      <a href="#">Follow</a>
      </div>
      <span class="d-block">${a.webId} </span>
      </div>
      </div>
      `
    }

  }

  customElements.define('suggestion-element', SuggestionElement);
