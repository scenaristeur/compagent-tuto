import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { PodHelper } from '../tools/pod-helper.js';
import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

import './note-element.js'
import './media-element.js'
import './triple-element.js'
/*
import './graph-element.js'
import './triple-element.js'*/


class NotesPostElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      webId: {type: String},
      subelements: {type: String},
      requetes: {type: Object},
      responses: {type: Array},
      agoraNotesListUrl: { type: String},
      footprints:  {type: Array}
      //  agoraPicsListUrl: {type: String},

    };
  }

  constructor() {
    super();
    this.count = 0
    this.webId = null
    this.subelements = ["Note", "Media", "Triple"]
    this.agoraNotesListUrl = "https://agora.solid.community/public/notes.ttl"
    //  this.agoraPicsListUrl = "https://agora.solid.community/public/Picpost/pics.ttl"
    this.requetes = {}
    this.responses = []
    this.footprints  = [
      {name:"Note", index: "public/note.ttl", path:"public/Note"},
      {name:"Media", index: "public/media.ttl", path:"public/Media"},
      {name:"Triple", index: "public/triple.ttl", path:"public/Triple"},
    //  {name:"Graph", index: "public/gr.ttl", path:"public/Media"}
    ]
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <style>
    /*  body {font-family: Arial;} */

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
      padding: 14px 14px;
      transition: 1s;
      font-size: 17px;
    }

    /* Change background color of buttons on hover */
    .tab button:hover {
      background-color: #ddd;
    }

    /* Create an active/current tablink class */
    .tab button.active {
      background-color: #007bff;
      color: #fff;
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


    ${this.webId == null ?
      html `You must login to post`
      :html `


      <div class="row">
      <label class="sr-only" for="title">Title</label>
      <div class="input-group mb-2">
      <div class="input-group-append">
      <div class="input-group-text">Title</div>
      </div>
      <input id="title" class="form-control" type="text" value="${this.title}" placeholder="Title">
      </div>
      </div>

      <div ><!--style="height:50vh"-->
      <div class="tab row">
      <button class="tablinks active" tabName='Note' @click="${this.openTab}">Note</button>
      <button class="tablinks" tabName='Media' @click="${this.openTab}">Media</button>
      <button class="tablinks " tabName='Triple' @click="${this.openTab}">Triple</button>
      <button class="tablinks" tabName='Graph' @click="${this.openTab}">Graph</button>


      </div>

      <div id="Note" class="tabcontent row" style="display:block" >
      <!--<h3>London</h3>-->

      <note-element name="Note"></note-element>
      </div>

      <div id="Media" class="tabcontent row">
      <div class="col">
      <media-element name="Media"></media-element>
      </div>
      </div>

      <div id="Triple" class="tabcontent row">
      <div class="col">
      <triple-element name="Triple"></triple-element>
      </div>
      </div>

      <div id="Graph" class="tabcontent row">
      <h3>Graph</h3>
      <p>todo.</p>
      <graph-element name="Graph"></graph-element>
      </div>



      <br>


      <div class="row">
      <label class="sr-only" for="title">Tags</label>
      <div class="input-group mb-2">
      <div class="input-group-append">
      <div class="input-group-text">Tags</div>
      </div>
      <input id="tags" class="form-control" type="text" placeholder="tags, comma separated">
      </div>
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
      </div>

      `}
      `;
    }


    addNote(){
      var id = new Date().toISOString ()
      this.requetes[id] = this.subelements.length
      console.log(this.requetes)
      var mess = {action: "askContent", id : id}
      this.agent.sendMulti(this.subelements, mess)
    }



    firstUpdated(){
      var app = this;
      this.ph = new PodHelper();
      this.agent = new HelloAgent(this.name);
      this.fileClient = SolidFileClient;
      this.agent.receive = function(from, message) {
        if (message.hasOwnProperty("action")){
          switch(message.action) {
            case "sessionChanged":
            app.sessionChanged(message.webId);
            break;
            case "reponseContent":
            app.reponseContent(from, message);
            break;
            default:
            console.log("Unknown action ",message)
          }
        }
      };
    }


    sessionChanged(webId){
      console.log(webId)
      this.webId = webId
      if (this.webId != null){
        this.ph.checkFootprints(this.webId, this.footprints)
      }
    }


    reponseContent(from, message){
      console.log(from, message)
      this.requetes[message.id]--
      // si toutes reponses
      this.responses.push({from:from, message: message})
      if (this.requetes[message.id] == 0){
        console.log("UPDATE")
        delete this.requetes[message.id]
        this.preparePost()
      }
    }



    preparePost(){
      var app = this
      console.log(this.responses)
      var data = {}
      this.responses.forEach(function(r){
        switch (r.from) {
          case "local:Note":
          var note = {}
          note.content = r.message.content
          note.type = r.message.type
          data.note = note
          break;
          case "local:Media":
          if(r.message.content != undefined){
            var path = app.ph.getPod("storage")+"public/Picpost/"
            var file = r.message.content
            var contentType = file.contentType
            var newFilename = r.message.newFilename
            console.log(path)
            console.log(file)
            var pic = {}
            pic.uri = path+newFilename
            pic.type = r.message.type
            pic.filename = newFilename
            app.sendPicture(pic.uri, file, contentType)
            data.pic = pic
          }
          break;

          case "local:Triple":
          console.log(r.message)
          data.triples = r.message.content
          break;
          default:
          console.log(r.message.type , "non traite")
        }
      })
      this.responses = []
      this.updatePod(data)
    }



    updatePod(data){
      var app = this

      data.title = this.shadowRoot.getElementById('title').value
      data.tags = this.shadowRoot.getElementById('tags').value
      this.shadowRoot.getElementById('title').value = ""
      this.shadowRoot.getElementById('tags').value =""
      console.log(data)
      var master = {}


      if ('pic' in data){
        console.log("creation d'une image")
        var notesList = this.ph.getPod("notesList")
        const newPic = notesList.addSubject();
        master = newPic
        var date = new Date(Date.now())
        // Indicate that the Subject is a schema:MediaObject:
        if(data.title.length > 0){
          newPic.addLiteral(rdfs.label, data.title)
        }else{
          newPic.addLiteral(rdfs.label, data.pic.filename)
        }
        if(data.tags.length > 0){
          newPic.addLiteral(schema.keywords, data.tags)
        }
        newPic.addRef(rdf.type, schema.TextDigitalDocument);
        // Set the Subject's `schema:text` to the actual pic contents:

        // Store the date the pic was created (i.e. now):
        newPic.addLiteral(schema.dateCreated, date)
        newPic.addRef(schema.about, data.pic.uri);
        if ('note' in data){
          newPic.addLiteral(schema.text, data.note.content);
        }
        console.log(newPic.asNodeRef())

        notesList.save([newPic]).then(
          success=>{
            var agora_pub = this.shadowRoot.getElementById('agora_pub').checked
            if(agora_pub == true){
              app.updateAgoraNote(data, date, newPic.asNodeRef())
            }
            //  app.initPicPod()
          },
          err=>{
            console.log(err)
            alert(err)
          });
        }else{
          /*  if (data.note.content.length == 0){
          alert ("you must fill a note or a media")
        }else
        {*/
        var notesList = this.ph.getPod("notesList")
        const newNote = notesList.addSubject();
        master = newNote
        var date = new Date(Date.now())
        if(data.title.length > 0){
          newNote.addLiteral(rdfs.label, data.title)
        }else if (data.pic != undefined){
          newNote.addLiteral(rdfs.label, data.pic.filename)
        }
        if(data.tags.length > 0){
          newNote.addLiteral(schema.keywords, data.tags)
        }
        // Indicate that the Subject is a schema:TextDigitalDocument:
        newNote.addRef(rdf.type, schema.TextDigitalDocument);
        // Set the Subject's `schema:text` to the actual note contents:
        newNote.addLiteral(schema.text, data.note.content);
        // Store the date the note was created (i.e. now):
        newNote.addLiteral(schema.dateCreated, date)

        //console.log(newNote.asNodeRef())

        notesList.save([newNote]).then(
          success=>{
            var agora_pub = this.shadowRoot.getElementById('agora_pub').checked //this.shadowRoot.getElementById('agora_pub').shadowRoot.firstElementChild.checked

            if(agora_pub == true){
              app.updateAgoraNote(data, date, newNote.asNodeRef())
            }
            //  app.initNotePod()
          },
          err=>{
            console.log(err)
            alert(err)
          });
        }
        //  }


        if ('triples' in data){
          console.log(data.triples)
          data.triples.forEach(function(t){
            console.log(t)
          })
          console.log(master)
        }




      }



      updateAgoraNote(data,date, subject){
        var app = this;
        console.log(data)
        fetchDocument(this.agoraNotesListUrl).then(
          agoraNotesList => {
            app.agoraNotesList = agoraNotesList;
            //  console.log("app.agoraNotesList",app.agoraNotesList)
            const newNote = app.agoraNotesList.addSubject();
            // Indicate that the Subject is a schema:TextDigitalDocument:
            if(data.title.length > 0){
              newNote.addLiteral(rdfs.label, data.title)
            }else if (data.pic != undefined){
              newNote.addLiteral(rdfs.label, data.pic.filename)
            }
            if(data.tags.length > 0){
              newNote.addLiteral(schema.keywords, data.tags)
            }
            newNote.addRef(rdf.type, schema.TextDigitalDocument);
            // Set the Subject's `schema:text` to the actual note contents:
            newNote.addLiteral(schema.text, data.note.content);
            // Store the date the note was created (i.e. now):
            newNote.addLiteral(schema.dateCreated, date)
            // add ref to user note
            newNote.addRef(rdfs.seeAlso, subject);
            newNote.addRef(schema.creator, this.ph.getPod("webId"));

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

          sendPicture(uri, file, contentType){
            this.fileClient.updateFile(uri, file, contentType)
            .then(
              success =>{
                console.log(success)
                this.agent.send("Messages", {action: "info", status: "Save file OK", file: success})
              },
              err => {console.log(err)});
            }

            /*
            updateAgoraPic1(notecontent,date, subject){
            var app = this;
            // send pic ref to notes instead of picpost

            console.log("app.agoraPicsListUrl",app.agoraPicsListUrl)
            fetchDocument(app.agoraPicsListUrl).then(
            agoraPicsList => {
            app.agoraPicsList = agoraPicsList;
            console.log("app.agoraPicsList",app.agoraPicsList)
            const newPic = app.agoraPicsList.addSubject();
            // Indicate that the Subject is a schema:MediaObject:
            newPic.addRef(rdf.type, schema.MediaObject);
            // Set the Subject's `schema:text` to the actual pic contents:
            newPic.addLiteral(schema.text, notecontent);
            // Store the date the pic was created (i.e. now):
            newPic.addLiteral(schema.dateCreated, date)
            // add ref to user pic
            newPic.addRef(rdfs.seeAlso, subject);
            newPic.addRef(schema.creator, this.ph.getPod("webId"));
            console.log(newPic.asNodeRef())

            app.agoraPicsList.save([newPic]).then(
            success=>{
            console.log("success agora", success)
            //  app.initpicPod()
          },
          err=>{
          console.log(err)
        });
      });
    }
    */


    /*
    mediaCreate(message){
    this.picsList = this.ph.getPod("picsList")
    const newPic = this.picsList.addSubject();
    var date = new Date(Date.now())
    // Indicate that the Subject is a schema:MediaObject:
    newPic.addRef(rdf.type, schema.MediaObject);
    // Set the Subject's `schema:text` to the actual pic responses:
    //  newPic.addLiteral(schema.text, pic);
    // Store the date the pic was created (i.e. now):
    newPic.addLiteral(schema.dateCreated, date)
    //  newPic.addRef(schema.about, app.uri);

    console.log(newPic.asNodeRef())



    this.picsList.save([newPic]).then(
    success=>{
    var agora_pub = this.shadowRoot.getElementById('agora_pub').checked
    if(agora_pub == true){
    this.updateAgoraPic(date, newPic.asNodeRef())
  }
  //  this.initPicPod()
},
err=>{
console.log(err)
alert(err)
});
}


updateAgoraPic(date, subject){
var app = this;
console.log("app.agoraPicsListUrl",app.agoraPicsListUrl)
fetchDocument(app.agoraPicsListUrl).then(
agoraPicsList => {
app.agoraPicsList = agoraPicsList;
console.log("app.agoraPicsList",app.agoraPicsList)
const newPic = app.agoraPicsList.addSubject();
// Indicate that the Subject is a schema:MediaObject:
newPic.addRef(rdf.type, schema.MediaObject);
// Set the Subject's `schema:text` to the actual pic responses:
//  newPic.addLiteral(schema.text, pic);
// Store the date the pic was created (i.e. now):
newPic.addLiteral(schema.dateCreated, date)
// add ref to user pic
newPic.addRef(rdfs.seeAlso, subject);
newPic.addRef(schema.creator, app.webId);
console.log(newPic.asNodeRef())

app.agoraPicsList.save([newPic]).then(
success=>{
console.log("success agora", success)
//  app.initpicPod()
},
err=>{
console.log(err)
});
});
}

noteCreate(message){
var note = message.content
this.notesList = this.ph.getPod("notesList")
console.log(this.notesList)
const newNote = this.notesList.addSubject();
var date = new Date(Date.now())
// Indicate that the Subject is a schema:TextDigitalDocument:
newNote.addRef(rdf.type, schema.TextDigitalDocument);
// Set the Subject's `schema:text` to the actual note responses:
newNote.addLiteral(schema.text, message.content);
// Store the date the note was created (i.e. now):
newNote.addLiteral(schema.dateCreated, date)

console.log(newNote.asNodeRef())



this.notesList.save([newNote]).then(
success=>{
var agora_pub = this.shadowRoot.getElementById('agora_pub').checked
console.log(agora_pub)
if(agora_pub == true){
this.updateAgora(note, date, newNote.asNodeRef())
}
//  this.initNotePod()
},
err=>{
console.log(err)
alert(err)
});

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
// Set the Subject's `schema:text` to the actual note responses:
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
*/


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

}

customElements.define('notes-post-element', NotesPostElement);
