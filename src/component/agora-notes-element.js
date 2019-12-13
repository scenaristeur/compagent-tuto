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
    <h3>Notes on Agora (${notes.length})</h3>
    <button
    href="${this.agoraNotesListUrl}"
    target="_blank">
    ${this.agoraNotesListUrl}
    </button>

    <ul>
    ${notes.map((n) => html`
      <li>
      <div>${n.text}</div>
      <!--<small>Donec id elit non mi porta.</small>-->
      <small>${n.date.toLocaleString(this.lang, { timeZone: 'UTC' })}</small><br>
      <a  href="${n.creator}" ?hidden=${n.creator == null} target="_blank" title="${n.creator}">Creator</a>

      <a href="${n.also}" ?hidden=${n.also == null} title="${n.also}" target="_blank">See Also</a>
      </li>
      `)}
      </ul>
      `;

      return html`
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
        console.log("WEBSOCK",websocket)
        app.socket = new WebSocket(websocket);
        console.log ("socket",app.socket)
        app.socket.onopen = function() {
          const d = new Date();
          var now = d.toLocaleTimeString(app.lang) + `.${d.getMilliseconds()}`
          this.send('sub '+app.agoraNotesListUrl);
          app.agent.send('Messages', now+"[souscription] "+app.agoraNotesListUrl)
          console.log("OPENED SOCKET",app.socket)
        };
        app.socket.onmessage = function(msg) {
          if (msg.data && msg.data.slice(0, 3) === 'pub') {
            const d = new Date();
            var now = d.toLocaleTimeString(app.lang) + `.${d.getMilliseconds()}`
            app.getAgoraData()
          }
          else{console.log("message inconnu",msg)}
        };
      }

    }

    customElements.define('agora-notes-element', AgoraNotesElement);
