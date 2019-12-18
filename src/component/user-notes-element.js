import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

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
    this.person = null,
    this.notes = [],
    this.lang=navigator.language
  }

  render(){


    const noteList = (notes) => html`
    <h3 class="m-0 font-weight-bold text-primary">My Note List (${notes.length})</h3>

    <small><a href="${this.notesListUrl}" target="_blank">${this.notesListUrl}<a></small>

    <ul class="list-group list-group-flush" style="height: 50vh; overflow: auto">
    ${notes.map((n) => html`
      <li class="list-group-item">
      <div class="row">

      <div class="col">
      <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">${n.title}</h5>
      </div>
      <p class="mb-1">
      <div style="white-space: pre-wrap">${n.text}</div>
      </p>

      <div class="row">
      <div class="col">
      <small>${n.keywords}</small>
      </div>
      <div class="col-2">
      <small>${n.date.toLocaleTimeString(this.lang)}</small> <!-- toLocaleString(this.lang)-->
      </div>
      </div>


      </div>


      <div class="col-sm-1">
      <i title="copy" primary @click="${this.copy}" uri=${n.subject} class="fas fa-copy"></i>
      <a href="${n.subject}" target="_blank">  <i title="open" primary small  class="fas fa-eye"></i></a>
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
      ${this.person == null ?
        html `You must login to see your notes`
        :html `
        ${noteList(this.notes)}
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
          console.log(person)
          this.initNotePod()
        }else{
          this.notes = []
        }
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
            //  console.log("app.notesListEntry",app.notesListEntry)
            if (app.notesListEntry === null){
              app.notesListUrl = app.initialiseNotesList(app.person, app.publicTypeIndex)
            }else{
              app.notesListUrl = app.notesListEntry.getRef(solid.instance)
              //    console.log("notesListUrl",app.notesListUrl)
            }
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
              var text = nuri.getString(schema.text)
              var date = nuri.getDateTime(schema.dateCreated)
              var title = nuri.getString(rdfs.label)
              var keywords = nuri.getString(schema.keywords)
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


        initialiseNotesList(profile,typeIndex){
          var app = this;
          console.log("creation a revoir")
          const storage = profile.getRef(space.storage)
          //    console.log("storage",storage)
          app.agent.send('Storage',{action: "storageChanged", storage: storage})

          const notesListUrl = storage + 'public/notes.ttl';

          const notesList = Tripledoc.createDocument(notesListUrl);
          notesList.save();

          // Store a reference to that Document in the public Type Index for `schema:TextDigitalDocument`:
          const typeRegistration = typeIndex.addSubject();
          typeRegistration.addRef(rdf.type, solid.TypeRegistration)
          typeRegistration.addRef(solid.instance, notesList.asRef())
          typeRegistration.addRef(solid.forClass, schema.TextDigitalDocument)
          typeIndex.save([ typeRegistration ]);

          return notesListUrl
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
