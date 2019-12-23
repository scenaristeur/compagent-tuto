import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { fetchDocument } from 'tripledoc';
import { schema, rdfs, rdf } from 'rdf-namespaces';

class FlowElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      flow: {type: String},
      notes: {type: Array},
      lang: {type: String},
      notes: {type: Array},
    };
  }

  constructor() {
    super();
    this.flow = "floww"
    this.lang=navigator.language
    this.notes = []
  }

  render(){
    const noteList = (notes) => html`
    <h6 class="border-bottom border-gray pb-2 mb-0 text-primary">Notes on Agora (${notes.length})</h6>
    <!--<h3 class="m-0 font-weight-bold text-primary">Notes on Agora (${notes.length})</h3>-->

    <ul class="list-group list-group-flush" style="height: 45vh; overflow: auto">
    ${notes.map((n) => html`


      <li class="list-group-item">
      <div class="row media text-muted pt-3"> <!--   border-bottom border-gray-->

      <div class="col">
      <div class="row">
      <div class="col-md-1">
      <a  href="${n.creator}" ?hidden=${n.creator == null} target="_blank" ><i title="${n.creator}" primary small  class="bd-placeholder-img mr-2 rounded fas fa-user"></i></a>
      </div>
      <div class="col media-body pb-3 mb-0 small lh-125">
      <strong class="d-block text-gray-dark white-space: pre-wrap">
      ${n.title}
      <small>${n.date.toLocaleString(this.lang)}</small> <!-- toLocaleTimeString(this.lang)-->
      </strong>
      <div style="white-space: pre-wrap">${n.text}</div>
      </div>
      </div>
      <small>${n.keywords}</small>

      </div>
      <div class="col-md-1">
      <i title="copy" primary @click="${this.copy}" uri=${n.uri} class="fas fa-copy"></i>
      <a href="${n.uri}" target="_blank">  <i title="open" primary small  class="fas fa-eye"></i></a>
          <a href="${n.also}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
      <a href="https://scenaristeur.github.io/spoggy-simple/?source=${n.uri}"  title="${n.uri}" target="_blank">
      <i class="fas fa-dice-d20"></i><a>

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
      @media (min-width: 768px) {
        i {
          padding-top :10px;
          padding-bottom :10px;
        }
        .fa-dice-d20 {
          padding-left :10px;
          padding-right :10px;
        }
      }

      </style>
      ${noteList(this.notes)}
      <small class="d-block text-right mt-3">


      <a href="${this.flow}"  title="${this.flow}" target="_blank">All Agora's notes<a>
      <a href="https://scenaristeur.github.io/spoggy-simple/?source=${this.flow}"  title="${this.flow}" target="_blank"><i class="fas fa-dice-d20"></i><a>
      </small>
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
      fetchDocument(app.flow).then(
        notesList => {
          app.notesList = notesList;
          app.notesUri = notesList.findSubjects(rdf.type, schema.TextDigitalDocument)
          app.notes = []
          app.notesUri.forEach(function (nuri){
            var text = nuri.getString(schema.text) || ""
            var date = nuri.getDateTime(schema.dateCreated)|| ""
            var creator = nuri.getRef(schema.creator) || ""
            var also = nuri.getRef(rdfs.seeAlso) || nuri.getRef(schema.about) || nuri.getRef("https://www.w3.org/ns/activitystreams#attachement") ||""
            var title = nuri.getString(rdfs.label) || ""
            var keywords = nuri.getString(schema.keywords) || ""
            //  console.log(text, date)
            var note = {}
            note.text = text;
            note.date = date;
            note.creator = creator;
            note.also = also;
            note.title = title
            note.keywords = keywords
            note.uri = nuri.asNodeRef()
            //text = nuri.getAllStrings()*/
            //  console.log(note)
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
          this.send('sub '+app.flow);
          app.agent.send('Messages', now+"[souscription] "+app.flow)
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

      copy(e){
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = e.target.getAttribute("uri");
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
      }

    }

    customElements.define('flow-element', FlowElement);
