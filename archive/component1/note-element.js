import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import { PodHelper } from '../tools/pod-helper.js';

import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

class NoteElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
    };
  }

  constructor() {
    super();
  }

  render(){
    return html`
    <div class="form-group">
    <label for="notearea">Write a note on your Pod & share it on Agora</label>
    <textarea class="form-control" id="notearea" rows="5" style="width:100%"></textarea>
    </div>
    `;
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    console.log(this.agent)
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
              switch(message.action) {
          case "sendToPod":
          app.sendToPod(message);
          break;
              default:
          console.log("Unknown action ",message)
        }
      }
    };

    this.ph = new PodHelper("bip",12);
    console.log("PH VALUE",this.ph.count)
  }

  sendToPod(message){
    console.log(message)
    this.agoraNotesListUrl = message.agoraNotesListUrl
    this.notesList = this.ph.getPod("notesList")
    console.log(this.notesList)
    var app = this
    var textarea = this.shadowRoot.getElementById('notearea')/*.shadowRoot.querySelector(".form-control")*/
    var note = textarea.value.trim()
    textarea.value = ""

    console.log(note)
    if (note.length > 0){
      const newNote = app.notesList.addSubject();
      var date = new Date(Date.now())
      // Indicate that the Subject is a schema:TextDigitalDocument:
      newNote.addRef(rdf.type, schema.TextDigitalDocument);
      // Set the Subject's `schema:text` to the actual note contents:
      newNote.addLiteral(schema.text, note);
      // Store the date the note was created (i.e. now):
      newNote.addLiteral(schema.dateCreated, date)

      console.log(newNote.asNodeRef())

      app.notesList.save([newNote]).then(
        success=>{
          if(message.agora_pub == true){
            app.updateAgora(note, date, newNote.asNodeRef())
          }
          //  app.initNotePod()
        },
        err=>{
          console.log(err)
          alert(err)
        });

      }
    }

    updateAgora(note,date, subject){
      var app = this;
      //  console.log("app.agoraNotesListUrl",app.agoraNotesListUrl)
      fetchDocument(app.agoraNotesListUrl).then(
        agoraNotesList => {
          app.agoraNotesList = agoraNotesList;
          //  console.log("app.agoraNotesList",app.agoraNotesList)
          const newNote = app.agoraNotesList.addSubject();
          // Indicate that the Subject is a schema:TextDigitalDocument:
          newNote.addRef(rdf.type, schema.TextDigitalDocument);
          // Set the Subject's `schema:text` to the actual note contents:
          newNote.addLiteral(schema.text, note);
          // Store the date the note was created (i.e. now):
          newNote.addLiteral(schema.dateCreated, date)
          // add ref to user note
          newNote.addRef(rdfs.seeAlso, subject);
          newNote.addRef(schema.creator, app.webId);

          app.agoraNotesList.save([newNote]).then(
            success=>{
              console.log("success agora", success)
              //  app.initNotePod()
            },
            err=>{
              console.log(err)
            });
          });
        }
}

customElements.define('note-element', NoteElement);
