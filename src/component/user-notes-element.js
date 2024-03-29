import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { PodHelper } from '../tools/pod-helper.js';
import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';
import  data  from "@solid/query-ldflex";

class UserNotesElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      person: {type: Object},
      notes: {type: Array},
      lang: {type: String},
      lastUpdate: {type: Number}
    };
  }

  constructor() {
    super();
    this.notes = [],
    this.person = null,
    this.lang=navigator.language
    this.lastUpdate = 0
  }

  render(){


    const noteList = (notes) => html`
    <h6 class="border-bottom border-gray pb-2 mb-0 text-primary">My Spogs (${notes.length})
    <small class="d-block text-right mt-3">
    <a href="${this.notesListUrl}" title="${this.notesListUrl}" target="_blank">All my spogs<a>
    <a href="https://scenaristeur.github.io/spoggy-simple/?source=${this.notesListUrl}"  title="${this.notesListUrl}" target="_blank"><i class="fas fa-dice-d20"></i><a>
    </small>
    </h6>

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
      ${n.inReplyTo != null ?
        html`<small>In replyTo <a href="${n.inReplyTo}" target="_blank">${n.inReplyToShort}</a></small>`
        :html``
      }

      <div>
      ${n.objects.map((o) => html`
        ${this.templateShow(o)}
        `)}
        </div>

        </div>
        <div class="col-md-1 icon-pan">
        <button class="btn btn-outline-primary btn-sm">
        <i title="copy" primary @click="${this.copy}" uri=${n.subject} class="fas fa-copy fa-sm"></i>
        </button>
        <button class="btn btn-outline-primary btn-sm">
        <a href="${n.subject}" target="_blank">  <i title="open" primary small  class="fas fa-eye fa-sm"></i></a>
        </button>
        <button class="btn btn-outline-primary btn-sm">
        <a href="https://scenaristeur.github.io/spoggy-simple/?source=${n.subject}"  title="${n.subject}" target="_blank">
        <i class="fas fa-dice-d20 fa-sm"></i><a>
        </button>
        </div>

        </div>

        </li>
        `)}
        </ul>

        `;


        return html`
        <link href="css/fontawesome/css/all.css" rel="stylesheet">
        <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
        <link href="css/offcanvas.css" rel="stylesheet">
        <style>
        .fa-sm {
          padding:0px;
        }
        </style>
        ${this.person == null ?
          html `You must login <br>to see your spogs`
          :html `
          ${noteList(this.notes)}


          `}
          `;
        }



        templateShow(o){
          switch(o.extension){
            case ".png":
            case ".jpg":
            case ".gif":
            return html`
            <a href="${o.uri}" target="_blank"><img class="thbn"  src="${o.uri}" width="100px", height="100px"></a>
            `
            break;
            default:
            return html`
            <a href="${o.uri}" target="_blank">${o.short}</a>
            `
          }
        }

        personChanged(person){
          this.person = person
          if (person != null){
            //  console.log(person)
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
          //  console.log("publicTypeIndexUrl",this.publicTypeIndexUrl)
          fetchDocument(app.publicTypeIndexUrl).then(
            publicTypeIndex => {
              app.publicTypeIndex = publicTypeIndex;
              app.notesListEntry = app.publicTypeIndex.findSubject(solid.forClass, schema.TextDigitalDocument);
              //  console.log("app.notesListEntry",app.notesListEntry)
              /*

              Changement pour activitystream au lieu de notes
              if (app.notesListEntry === null){
              console.log("null")
              app.notesListUrl = app.ph.initialiseNotesList(app.person, app.publicTypeIndex)
            }else{
            console.log(" pas null")
            app.notesListUrl = app.notesListEntry.getRef(solid.instance)

          }*/
          app.notesListUrl =  app.ph.getPod("storage")+"public/spoggy/activity.ttl"
          console.log("notesListUrl",app.notesListUrl)
          app.getNotes()
        },
        err => {console.log(err)}
      );

    }

    async getNotes(){
      var app = this;
      this.lastUpdate = Date.now()
      fetchDocument(app.notesListUrl).then(
        notesList => {
          app.notesList = notesList;
          if (app.socket == undefined){
            app.subscribe()
          }else{
            console.log("socket exist deja")
          }
          //  console.log("app.notesList",app.notesList)
          app.notesUri = notesList.findSubjects(rdf.type, schema.TextDigitalDocument)
          //    console.log("notesUri",app.notesUri)
          var notesUri = notesList.findSubjects()
          app.notesUri = Array.from(new Set(notesUri))
          app.notes = []
          app.notesUri.forEach(function (nuri){
            var subject = nuri.asNodeRef()
            //  console.log("subject",subject)
            //  console.log("doc",nuri.getDocument())
            var text = nuri.getString(schema.text) || ""
            var date = nuri.getDateTime(schema.dateCreated) || ""
            var title = nuri.getString(rdfs.label) || nuri.getString('https://www.w3.org/ns/activitystreams#name')  || ""
            var keywords = nuri.getString(schema.keywords) || ""
            //  console.log(text, date)
            var note = {}
            note.title = title
            note.text = text;
            note.date = date;
            note.subject = subject;
            note.inReplyTo = nuri.getRef("https://www.w3.org/ns/activitystreams#inReplyTo") || null
            note.inReplyToShort = note.inReplyTo != null ? note.inReplyTo.substring(note.inReplyTo.lastIndexOf("/")) : null;

            note.keywords = keywords
            var objects = nuri.getAllRefs("https://www.w3.org/ns/activitystreams#object")
            app.populateNote(note,objects)

            //  console.log(note)
            //text = nuri.getAllStrings()*/
            app.notes = [... app.notes, note]
          })
          app.notes.reverse()

        })

      }

      async populateNote(note, objects){
        note.objects = []
        objects.forEach(async function (o){

          var object = {}
          object.uri = o
          object.extension = o.substring(o.lastIndexOf("."));
          object.short = o.substring(o.lastIndexOf("/"));
          /*
          if (object.extension == ".ttl"){
          fetchDocument(o).then(
          notefile => {
          console.log(notefile.findSubject())
          object.text = notefile.findSubject().getString(schema.text) || ""

        })
      }*/

      //  console.log(object)
      note.objects = [... note.objects, object]

    })
    //  return await data[o].schema$text

  }
  subscribe(){
    var app = this
    //https://github.com/scenaristeur/spoggy-chat-solid/blob/master/index.html
    var websocket = this.notesList.getWebSocketRef();
    //  console.log("WEBSOCK",websocket)
    app.socket = {status:"creating"}
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
        Date.now() - app.lastUpdate > 2000 ?   app.getNotes(): "";
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
