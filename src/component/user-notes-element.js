import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { PodHelper } from '../tools/pod-helper.js';
import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

class UserNotesElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      person: {type: Object},
      notes: {type: Array},
      lang: {type: String}
    };
  }

  constructor() {
    super();
    this.notes = [],
    this.person = null,
    this.lang=navigator.language
  }

  render(){


    const noteList = (notes) => html`
    <h6 class="border-bottom border-gray pb-2 mb-0 text-primary">My Notes(${notes.length})</h6>

    <ul class="list-group list-group-flush" style="height: 50vh; overflow: auto">
    ${notes.map((n) => html`
      <li class="list-group-item">

      <div class="row media text-muted pt-3"> <!--   border-bottom border-gray-->

      <div class="col">
      <div class="row">
      <div class="col-md-1">
      <i title="edit" disabled primary @click="${this.edit}" class="fas fa-pen"></i>
      </div>
      <div class="col media-body pb-3 mb-0 small lh-125">
      <strong class="d-block text-gray-dark white-space: pre-wrap">
      ${n.title}
      <small>${n.date.toLocaleString(this.lang)}</small> <!-- toLocaleTimeString(this.lang)-->
      </strong>
      <div style="white-space: pre-wrap">${n.text}</div>
      </p>

      </div>
      </div>
      <small>${n.keywords}</small>

      </div>
      <div class="col-md-1">
      <i title="copy" primary @click="${this.copy}" uri=${n.also} class="fas fa-copy"></i>
      <a href="${n.also}" target="_blank">  <i title="open" primary small  class="fas fa-eye"></i></a>
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
      .fa-dice-d20 {
        padding-left :10px;
        padding-right :10px;
      }
      </style>
      ${this.person == null ?
        html `You must login <br>to see your notes`
        :html `
        ${noteList(this.notes)}
        <small class="d-block text-right mt-3">
        <a href="${this.notesListUrl}" title="${this.notesListUrl}" target="_blank">All my notes<a>
        <a href="https://scenaristeur.github.io/spoggy-simple/?source=${this.notesListUrl}"  title="${this.notesListUrl}" target="_blank"><i class="fas fa-dice-d20"></i><a>
        </small>

        `}
        `;
      }


      personChanged(person){
        this.person = person
        if (person != null){
          console.log(person)
          this.initNotePod()
        }else{
          this.notes = []
        }
      }

      firstUpdated(){
        var app = this;
        this.ph = new PodHelper();
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

      initNotePod(){
        var app = this
        /* !!!! There are 2 publicTypeIndexUrl !!
        this.publicTypeIndexUrl = this.person.getRef(solid.publicTypeIndex)
        console.log("publicTypeIndexUrl",this.publicTypeIndexUrl)*/
        this.publicTypeIndexUrl = this.person.getRef(solid.publicTypeIndex)
        console.log("publicTypeIndexUrl",this.publicTypeIndexUrl)
        fetchDocument(app.publicTypeIndexUrl).then(
          publicTypeIndex => {
            app.publicTypeIndex = publicTypeIndex;
            app.notesListEntry = app.publicTypeIndex.findSubject(solid.forClass, schema.TextDigitalDocument);
            console.log("app.notesListEntry",app.notesListEntry)
            if (app.notesListEntry === null){
              console.log("null")
              app.notesListUrl = app.ph.initialiseNotesList(app.person, app.publicTypeIndex)
            }else{
              console.log(" pas null")
              app.notesListUrl = app.notesListEntry.getRef(solid.instance)

            }
            console.log("notesListUrl",app.notesListUrl)
            app.getNotes()
          },
          err => {console.log(err)}
        );
      }

      getNotes(){
        var app = this;
        console.log("getNotes at ",app.notesListUrl)
        fetchDocument(app.notesListUrl).then(
          notesList => {
            app.notesList = notesList;
            //  console.log("app.notesList",app.notesList)
            app.notesUri = notesList.findSubjects(rdf.type, schema.TextDigitalDocument)
            //    console.log("notesUri",app.notesUri)
            app.notes = []
            app.notesUri.forEach(function (nuri){
              var subject = nuri.asNodeRef()
              //  console.log("subject",subject)
              //  console.log("doc",nuri.getDocument())
              var text = nuri.getString(schema.text) || ""
              var date = nuri.getDateTime(schema.dateCreated) || ""
              var title = nuri.getString(rdfs.label) || ""
              var keywords = nuri.getString(schema.keywords) || ""
              //  console.log(text, date)
              var note = {}
              note.title = title
              note.text = text;
              note.date = date;
              note.subject = subject;
              note.keywords = keywords
              //  console.log(note)
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
            this.send('sub '+app.notesListUrl);
            app.agent.send('Messages', now+"[souscription] "+app.notesListUrl)
            //  console.log("OPENED SOCKET",app.socket)
          };
          app.socket.onmessage = function(msg) {
            if (msg.data && msg.data.slice(0, 3) === 'pub') {
              const d = new Date();
              var now = d.toLocaleTimeString(app.lang) + `.${d.getMilliseconds()}`
              app.getNotes()
            }
            //  else{console.log("message inconnu",msg)}
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

      customElements.define('user-notes-element', UserNotesElement);
