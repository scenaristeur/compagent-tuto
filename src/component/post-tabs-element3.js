import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import { PodHelper } from '../tools/pod-helper.js';
import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

import './note-element.js'
import './media-element.js'
import './graph-element.js'
import './triple-element.js'


class PostTabsElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      subelements: {type: String},
      requetes: {type: Object},
      responses: {type: Array},
      agoraNotesListUrl: { type: String},
    };
  }

  constructor() {
    super();
    this.subelements = ["Note", "Media", "Triple"] //, "Media", "Triple"]
    this.requetes = {}
    this.responses = []
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
      padding: 5px 8px;
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
    <div class="container">
    <div class="row">
    <label class="sr-only" for="title">Title</label>
    <div class="input-group mb-2">

    <input id="title" class="form-control" type="text" value="${this.title}" placeholder="Title">

    <div class="input-group-append">
    <div class="tab">
    <button class="tablinks active" tabName='Note' @click="${this.openTab}"><i class="far fa-sticky-note"></i></button>
    <button class="tablinks" tabName='Media' @click="${this.openTab}"><i class="fas fa-photo-video"></i></button>
    <button class="tablinks" tabName='Triple' @click="${this.openTab}"><i class="fas fa-receipt"></i></button>
    <!--<button class="tablinks" tabName='Graph' @click="${this.openTab}"><i class="fas fa-dice-d20"></i></button>-->


    </div>
    </div>

    </div>
    </div>





    <div ><!--style="height:50vh"-->
    <div id="Note" class="tabcontent" style="display:block;height: 40vh">
    <note-element name="Note"></note-element>
    </div>

    <div id="Media" class="tabcontent" style="height: 40vh">
    <media-element name="Media"></media-element>
    </div>

    <div id="Triple" class="tabcontent" style="height: 40vh">
    <triple-element name="Triple"></triple-element>
    </div>

    <div id="Graph" class="tabcontent" style="height: 40vh">
    <h3 class="text-primary">Graph</h3>
    <p class="text-primary">todo.</p>
    <graph-element name="Graph"></graph-element>
    </div>
    </div>

    <div class="row">
    <label class="sr-only" for="title">Tags</label>
    <div class="input-group mb-2">
    <div class="input-group-append">
    <div class="input-group-text">Tags</div>
    </div>
    <input id="tags" class="form-control" type="text" placeholder="tags, comma separated">
    </div>
    </div>

    <div class="buttons">
    <!--<button type="button" class="accept btn btn-primary" @click="${() => this.dispatchEvent(new CustomEvent('dialog.accept'))}">Ok</button>-->
    <div class="row">
    <div class="col-5">
    <button type="button" class="btn btn-primary" primary @click=${this.addNote}><i class="far fa-paper-plane"></i></button>
    <button type="button" class="cancel btn btn-primary" @click="${this.toggleWrite}"><i class="fas fa-window-close"></i> </button>
    </div>
    <div class="col">
    <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="agora_pub" name="agora_pub" checked>
    <label class="text-primary" for="agora_pub">
    Push to Agora
    </label>
    </div>
    </div>
    </div>
  </div>
    </div>
    `;
  }


  addNote(){
    var id = new Date().toISOString ()
    this.requetes[id] = this.subelements.length
    console.log(this.requetes)
    var mess = {action: "askContent", id : id}
    this.agent.sendMulti(this.subelements, mess)
    //  this.dispatchEvent(new CustomEvent('dialog.accept'))}
    this.toggleWrite()
  }

  openTab(e) {
    var node = e.target
    if (node.nodeName == "I"){
      // gestion des icones
      node = e.target.parentNode
    }
    var tabName = node.getAttribute('tabName')
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
    node.className += " active";
  }

  firstUpdated(){
    var app = this;
    this.ph = new PodHelper();
    this.fileClient = SolidFileClient;
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "reponseContent":
          app.reponseContent(from, message);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
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
    console.log(data)
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

          toggleWrite(){
            console.log("toggleWrite")
            this.agent.send("Post", {action: "toggleWrite"})
          }

        }

        customElements.define('post-tabs-element', PostTabsElement);
