import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

class NoteElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
          agoraNotesListUrl: {type: String},
    };
  }

  constructor() {
    super();
      this.agoraNotesListUrl = "https://agora.solid.community/public/notes.ttl"
  }

  render(){
    return html`
    <div class="form-group">
    <label for="notearea">Write a note on your Pod & share it on Agora</label>
    <textarea class="form-control" id="notearea" rows="5" style="width:100%"></textarea>
    </div>
    <!--
    <p>${this.name}</p>
    <button @click="${this.sendMessage}">Send message</button>-->
    `;
  }


  personChanged(message){
    console.log(message)
  //  console.log("Person",person)
    this.person = message.person
    if (this.person != null){
      console.log(this.person)
      this.initNotePod()
    }
    //  console.log("jquery",$)
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
      console.log(this.agent)
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        console.log(message)
        switch(message.action) {
          case "sendToPod":
          app.sendToPod(message);
          break;
          case "personChanged":
          app.personChanged(message);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
  }


  sendToPod(message){
    this.person = message.person
    this.agora_pub = message.agora_pub

    console.log("app.notesList",this.notesList)
    if (this.notesList == undefined){
  this.initNotePod()
      //alert("app.notesList is undefined") //, i18next.t('must_log')
    }else{
      this.addNote()
    }
      console.log("app.notesList",this.notesList)




  }

  addNote(){
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
          if(this.agora_pub == true){
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




        initNotePod(){
          var app = this
          /* !!!! There are 2 publicTypeIndexUrl !!
          this.publicTypeIndexUrl = this.person.getRef(solid.publicTypeIndex)
          console.log("publicTypeIndexUrl",this.publicTypeIndexUrl)*/
          this.publicTypeIndexUrl = this.person.getRef(solid.publicTypeIndex)
          console.log("INIT publicTypeIndexUrl",this.publicTypeIndexUrl)
          fetchDocument(this.publicTypeIndexUrl).then(
            publicTypeIndex => {
              app.publicTypeIndex = publicTypeIndex;
              app.notesListEntry = app.publicTypeIndex.findSubject(solid.forClass, schema.TextDigitalDocument);
              //  console.log("app.notesListEntry",app.notesListEntry)
              if (app.notesListEntry === null){
                app.notesListUrl = app.initialiseNotesList(app.person, app.publicTypeIndex)
              }else{
                app.notesListUrl = app.notesListEntry.getRef(solid.instance)
                //  console.log("notesListUrl",app.notesListUrl)
              }
              app.getNotes()

            },
            err => {console.log(err)}
          );
        }

        getNotes(){
          var app = this;
          //  console.log("getNotes at ",app.notesListUrl)
          fetchDocument(app.notesListUrl).then(
            notesList => {
              app.notesList = notesList;
               console.log("app.notesList",app.notesList)
                  this.addNote()

            /*  app.notesUri = notesList.findSubjects(rdf.type, schema.TextDigitalDocument)
              //  console.log("notesUri",app.notesUri)
              app.notes = []
              app.notesUri.forEach(function (nuri){
                var subject = nuri.asNodeRef()
                //  console.log("subject",subject)
                //  console.log("doc",nuri.getDocument())
                var text = nuri.getString(schema.text)
                var date = nuri.getDateTime(schema.dateCreated)
                //  console.log(text, date)
                var note = {}
                note.text = text;
                note.date = date;
                note.subject = subject;
                //text = nuri.getAllStrings()
                app.notes = [... app.notes, note]
              })
              app.notes.reverse()*/
            })
          }

        }

        customElements.define('note-element', NoteElement);
