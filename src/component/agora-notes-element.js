import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import { fetchDocument } from 'tripledoc';
import { schema, rdfs, rdf } from 'rdf-namespaces';

class AgoraNotesElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      agoraNotesListUrl: {type: String},
      notes: {type: Array},
      lang: {type: String}
    };
  }

  constructor() {
    super();
    this.count = 0
    this.notes = []
    this.agoraNotesListUrl = "https://agora.solid.community/public/notes.ttl"
    this.lang=navigator.language
  }

  render(){
    const noteList = (notes) => html`

    <h3 class="m-0 font-weight-bold text-primary">Notes on Agora (${notes.length})</h3>
    <a href="${this.agoraNotesListUrl}" target="_blank">${this.agoraNotesListUrl}<a>

    <ul class="list-group list-group-flush" style="height: 50vh; overflow: auto">
    ${notes.map((n) => html`
      <li class="list-group-item">
      <div class="row">

      <div class="col">
      <div class="d-flex w-100 justify-content-between">
      <!--<h5 class="mb-1">Titre</h5>-->
      </div>
      <p class="mb-1">
      <div style="white-space: pre-wrap">${n.text}</div>
      </p>
      <!--<small>Donec id elit non mi porta.</small>-->
      <small>${n.date.toLocaleString(this.lang, { timeZone: 'UTC' })}</small>
      </div>

      <div class="col-sm-1">
      <i title="copy" primary @click="${this.copy}" uri=${n.subject} class="fas fa-copy"></i>
      <a href="${n.also}" target="_blank">  <i title="open" primary small  class="fas fa-eye"></i></a>
      <a  href="${n.creator}" ?hidden=${n.creator == null} target="_blank" ><i title="${n.creator}" primary small  class="fas fa-user"></i></a>
      </div>
      </div>
      </li>
      `)}
      </ul>


      `;

      return html`
      <link href="css/fontawesome/css/all.css" rel="stylesheet">
      <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
      <style>
      i {
        padding-top: 10px;
        padding-bottom: 10px
      }
      </style>
      ${noteList(this.notes)}
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
      this.getAgoraData()
    }

    getAgoraData(){
      var app = this
      fetchDocument(app.agoraNotesListUrl).then(
        notesList => {
          app.notesList = notesList;
          app.notesUri = notesList.findSubjects(rdf.type, schema.TextDigitalDocument)
          app.notes = []
          app.notesUri.forEach(function (nuri){
            var text = nuri.getString(schema.text)
            var date = nuri.getDateTime(schema.dateCreated)
            var creator = nuri.getRef(schema.creator)
            var also = nuri.getRef(rdfs.seeAlso)
            //  console.log(text, date)
            var note = {}
            note.text = text;
            note.date = date;
            note.creator = creator;
            note.also = also;
            //text = nuri.getAllStrings()*/
            app.notes = [... app.notes, note]
          })
          app.notes.reverse()
          if (app.socket == undefined){
            app.subscribe()
          }else{
            console.log("socket exist deja")
          }

        })
      }

      subscribe(){
        var app = this
        //https://github.com/scenaristeur/spoggy-chat-solid/blob/master/index.html
        var websocket = this.notesList.getWebSocketRef();
        //  console.log("WEBSOCK",websocket)
        app.socket = new WebSocket(websocket);
        //  console.log ("socket",app.socket)
        app.socket.onopen = function() {
          const d = new Date();
          var now = d.toLocaleTimeString(app.lang) + `.${d.getMilliseconds()}`
          this.send('sub '+app.agoraNotesListUrl);
          app.agent.send('Messages', now+"[souscription] "+app.agoraNotesListUrl)
          //  console.log("OPENED SOCKET",app.socket)
        };
        app.socket.onmessage = function(msg) {
          if (msg.data && msg.data.slice(0, 3) === 'pub') {
            const d = new Date();
            var now = d.toLocaleTimeString(app.lang) + `.${d.getMilliseconds()}`
            app.getAgoraData()
          }
          //else{console.log("message inconnu",msg)}
        };
      }

    }

    customElements.define('agora-notes-element', AgoraNotesElement);
