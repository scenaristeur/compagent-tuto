import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

//import $ from "jquery";

class NotesPostElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      person: {type: Object},
      agoraNotesListUrl: {type: String},
    };
  }

  constructor() {
    super();
    this.person = null
    this.agoraNotesListUrl = "https://agora.solid.community/public/notes.ttl"
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <style>
    body {font-family: Arial;}

    /* Style the tab */
    .tab {
      overflow: hidden;
      border: 1px solid #ccc;
      background-color: #f1f1f1;
    }

    /* Style the buttons inside the tab */
    .tab button {
      background-color: inherit;
      float: left;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 14px 16px;
      transition: 0.3s;
      font-size: 17px;
    }

    /* Change background color of buttons on hover */
    .tab button:hover {
      background-color: #ddd;
    }

    /* Create an active/current tablink class */
    .tab button.active {
      background-color: #ccc;
    }

    /* Style the tab content */
    .tabcontent {
      display: none;
      padding: 6px 12px;
      border: 1px solid #ccc;
      border-top: none;
    }
    </style>

    <h3 class="m-0 font-weight-bold text-primary">${this.name}</h3>

    ${this.person == null ?
      html `You must login to post`
      :html `
      <div class="tab">
      <button class="tablinks active" tabName='Note' @click="${this.openTab}">Note</button>
      <button class="tablinks" tabName='Media' @click="${this.openTab}">Media</button>
      <button class="tablinks" tabName='Graph' @click="${this.openTab}">Graph</button>

      </div>

      <div id="Note" class="tabcontent" style="display:block">
      <!--<h3>London</h3>-->
      <div class="form-group">
      <label for="notearea">Write a note on your Pod & share it on Agora</label>
      <textarea class="form-control" id="notearea" rows="3"></textarea>
      </div>





      </div>

      <div id="Media" class="tabcontent">
      <h3>Media</h3>
      <p>todo.</p>
      </div>

      <div id="Graph" class="tabcontent">
      <h3>Graph</h3>
      <p>todo.</p>
      </div>

      <div class="row">
      <div class="col">
      <button type="button" class="btn btn-primary" primary @click=${this.addNote}>Add note </button>
      </div>
      <div class="col">
      <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="agora_pub" name="agora_pub" checked>
      <label class="form-check-label" for="agora_pub">
      Publish on Agora
      </label>
      </div>
      </div>
      </div>
      `}



      `;
    }


    addNote(){
      var app = this
      console.log("app.notesList",app.notesList)
      if (app.notesList == undefined){
        alert("app.notesList is undefined") //, i18next.t('must_log')
      }else{
        var textarea = this.shadowRoot.getElementById('notearea')/*.shadowRoot.querySelector(".form-control")*/
        var note = textarea.value.trim()
        textarea.value = ""
        //  console.log(note)
        const newNote = app.notesList.addSubject();
        var date = new Date(Date.now())
        // Indicate that the Subject is a schema:TextDigitalDocument:
        newNote.addRef(rdf.type, schema.TextDigitalDocument);
        // Set the Subject's `schema:text` to the actual note contents:
        newNote.addLiteral(schema.text, note);
        // Store the date the note was created (i.e. now):
        newNote.addLiteral(schema.dateCreated, date)

        //console.log(newNote.asNodeRef())

        app.notesList.save([newNote]).then(
          success=>{
            var checkAgora = this.shadowRoot.getElementById('agora_pub').checked //this.shadowRoot.getElementById('agora_pub').shadowRoot.firstElementChild.checked

            if(checkAgora == true){
              app.updateAgora(note, date, newNote.asNodeRef())
            }
            app.initNotePod()
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

          openTab(e) {
            var tabName = e.target.getAttribute('tabName')
            var i, tabcontent, tablinks;
            tabcontent = this.shadowRoot.querySelectorAll(".tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
              tabcontent[i].style.display = "none";
            }
            tablinks = this.shadowRoot.querySelectorAll(".tablinks");
            for (i = 0; i < tablinks.length; i++) {
              tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            this.shadowRoot.getElementById(tabName).style.display = "block";
            e.currentTarget.className += " active";
          }

          personChanged(person){
            this.person = person
            if (person != null){
              console.log(person.storage)
              this.initNotePod()
            }
            //  console.log("jquery",$)
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
            //    console.log("app.notesList",app.notesList)
                app.notesUri = notesList.findSubjects(rdf.type, schema.TextDigitalDocument)
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
                  //text = nuri.getAllStrings()*/
                  app.notes = [... app.notes, note]
                })
                app.notes.reverse()
              })
            }

          }

          customElements.define('notes-post-element', NotesPostElement);
