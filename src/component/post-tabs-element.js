import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import { PodHelper } from '../tools/pod-helper.js';
/*import { fetchDocument } from 'tripledoc';*/
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';
import { namedNode } from '@rdfjs/data-model';
import  data  from "@solid/query-ldflex";

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
      webId: {type: String},
      info: {type: String},
      folders: {type: Array}
    };
  }

  constructor() {
    super();
    this.fileClient = SolidFileClient;
    this.webId = null
    this.subelements = ["Note", "Media", "Triple"] //, "Media", "Triple"]
    this.requetes = {}
    this.responses = []
    this.info = ""
    this.folders = ["public/spoggy/",
    "public/spoggy/Note/",
    "public/spoggy/Image/",
    "public/spoggy/Video/",
    "public/spoggy/Audio/",
    "public/spoggy/Document/",
    "public/spoggy/Tag/"]

    //  this.agoraNotesListUrl = "https://agora.solid.community/public/notes.ttl"
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

    <div class="tab">
    <button class="tablinks active" tabName='Note' @click="${this.openTab}"><i class="far fa-sticky-note"></i></button>
    <button class="tablinks" tabName='Media' @click="${this.openTab}"><i class="fas fa-photo-video"></i></button>
    <button class="tablinks" tabName='Triple' @click="${this.openTab}"><i class="fas fa-receipt"></i></button>
    <!--<button class="tablinks" tabName='Graph' @click="${this.openTab}"><i class="fas fa-dice-d20"></i></button>-->
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

  toggleWrite(){
    console.log("toggleWrite")
    this.agent.send("Post", {action: "toggleWrite"})
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
          case "sessionChanged":
          app.sessionChanged(message.webId);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
    this.checkFolders()
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



  async preparePost(){
    var app = this
    app.webId = this.ph.getPod("webId")
    console.log(this.webId)
    console.log(this.responses)
    var date = new Date(Date.now())
    var id = date.getTime()
    var title = this.shadowRoot.getElementById('title').value.trim();
    var tags = this.shadowRoot.getElementById('tags').value.split(',');
    this.shadowRoot.getElementById('title').value = ""
    this.shadowRoot.getElementById('tags').value = ""
    this.storage = await data.user.storage




    var userActivity = this.storage+"public/spoggy/activity.ttl#"+id
    await  data[userActivity].rdfs$label.add(title)
    await  data[userActivity].schema$dateCreated.add(date.toISOString())
    await data[app.storage+"public/spoggy/tags.ttl"].rdfs$label.add("Tags")

    //  var path = this.storage+"public/Notes/"+id+".ttl"
    //  console.log(data)
    //  var tit = await  data[path].rdfs$label.add("title ONE")
    //  var cont = await data[path].schema$text.add("content ONE");


    this.responses.forEach(async function(r){
      switch (r.message.type) {
        case "Note":
        var content = r.message.content
        var userActivity = app.storage+"public/spoggy/activity.ttl#"+id

        console.log("Creation ", userActivity)
        var userNote = app.storage+"public/Notes/"+id+".ttl"
        await  data[userNote].rdfs$label.add(title)
        await data[userNote].schema$text.add(content);
        await data[userNote].rdf$type.add(namedNode('https://www.w3.org/ns/activitystreams#Note'))

        await data[userActivity].schema$dateCreated.add(date.toISOString())
        await data[userActivity].rdfs$label.add(title)
        await data[userActivity].as$name.add(title)
        //!!! as$Note ne fonctionne pas
        await  data[userActivity].as$attachment.add(namedNode(userNote))
        await data[userActivity].rdf$type.add(namedNode('https://www.w3.org/ns/activitystreams#Create'))
        await data[userActivity].as$generator.add(window.location.origin)
        console.log(userActivity+ " -- >created")

        var agora_pub = app.shadowRoot.getElementById('agora_pub').checked
        if (agora_pub == true){
          console.log("Creation ", userActivity)
          var agoraActivity = "https://agora.solid.community/public/spoggy/activity.ttl#"+id
          await data[agoraActivity].schema$dateCreated.add(date.toISOString())
          await data[agoraActivity].rdfs$label.add(title)
          await data[agoraActivity].as$name.add(title)
          //!!! as$Note ne fonctionne pas
          await  data[agoraActivity].as$object.add(namedNode(userNote))
          await  data[agoraActivity].as$target.add(namedNode(userActivity))
          await data[agoraActivity].rdf$type.add(namedNode('https://www.w3.org/ns/activitystreams#Add'))
          await data[agoraActivity].schema$creator.add(namedNode(app.webId))
          await data[agoraActivity].as$actor.add(namedNode(app.webId))
          console.log(agoraActivity+ " -- >created")
        }

        tags.forEach(async function(t){
          var taguri = app.storage+"public/spoggy/tags.ttl#"+t.trim();
          await  data[userActivity].as$tag.add(namedNode(taguri))
      //    console.log(taguri+ " -- >created")
        })


        break;
        case "Image":
        case "Video":
        case "Audio":
        case "Document":
        if(r.message.content != undefined){
          var file = r.message.content
          var contentType = file.contentType
          var newFilename = r.message.newFilename

        }
        break;
        default:
        console.log(r.message.type , "non traite")
      }
    })
    this.responses = []
    //  this.updatePod(data)

  }








  async checkFolders(){
    var app = this
    this.folders.forEach(async function(f){
      await app.checkFolder(f)
    })
    //console.log(app.info)
  }


  async checkFolder(f){
    var app = this
    this.storage = await data.user.storage

    var folder = this.storage+f
    //    console.log(folder)
    this.fileClient.readFolder(folder).then(
      success => {
        app.info+="\nOK :"+folder+" exist"
      },
      err => {
        //  console.log("error read",err)
        app.info+="\nWarning :"+folder+" does not exist"
        if (err.startsWith("404")){
          //  console.log("CREATE")
          app.info+="\nCreating :"+folder
          app.fileClient.createFolder(folder).then(
            success => {
              //  console.log("SUCCESS : create",success)
              app.info+="\nOK : "+folder+" created"
            },
            err => {
              //  console.log("ERROR create",err)
              app.info+="\nError : can not create "+folder+" "+err
            })
          }
        })
      }










      preparePost1(){
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



      updatePod1(data){
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



        updateAgoraNote1(data,date, subject){
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

            sendPicture1(uri, file, contentType){
              this.fileClient.updateFile(uri, file, contentType)
              .then(
                success =>{
                  console.log(success)
                  this.agent.send("Messages", {action: "info", status: "Save file OK", file: success})
                },
                err => {console.log(err)});
              }



            }

            customElements.define('post-tabs-element', PostTabsElement);
