import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { PodHelper } from '../tools/pod-helper.js';
import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

import './note-element.js'
import './media-element.js'/*
import './graph-element.js'
import './triple-element.js'*/


class NotesPostElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      person: {type: String},
      subelements: {type: String},
      requetes: {type: Object},
      responses: {type: Array},
      agoraNotesListUrl: { type: String},
      agoraPicsListUrl: {type: String},
    };
  }

  constructor() {
    super();
    this.count = 0
    this.person = null
    this.subelements = ["Note", "Media"]
    this.agoraNotesListUrl = "https://agora.solid.community/public/notes.ttl"
    this.agoraPicsListUrl = "https://agora.solid.community/public/Picpost/pics.ttl"
    this.requetes = {}
    this.responses = []
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

    ${this.person == null ?
      html `You must login to post`
      :html `
      <div ><!--style="height:50vh"-->
      <div class="tab row">
      <button class="tablinks active" tabName='Note' @click="${this.openTab}">Note</button>
      <button class="tablinks" tabName='Media' @click="${this.openTab}">Media</button>
      <button class="tablinks" tabName='Graph' @click="${this.openTab}">Graph</button>
      <button class="tablinks" tabName='Triple' @click="${this.openTab}">Triple</button>

      </div>

      <div id="Note" class="tabcontent row" style="display:block">
      <!--<h3>London</h3>-->

      <note-element name="Note"></note-element>
      </div>

      <div id="Media" class="tabcontent row">
      <div class="col">
      <media-element name="Media"></media-element>
      </div>
      </div>

      <div id="Graph" class="tabcontent row">
      <h3>Graph</h3>
      <p>todo.</p>
      <graph-element name="Graph"></graph-element>
      </div>

      <div id="Triple" class="tabcontent row">
      <h3>Triple</h3>
      <p>todo.</p>
      <triple-element name="Triple"></triple-element>
      </div>

      <br>
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
      this.ph = new PodHelper("bip",12);
      this.agent = new HelloAgent(this.name);
      this.fileClient = SolidFileClient;
      console.log("FC",this.fileClient)
      this.agent.receive = function(from, message) {
        if (message.hasOwnProperty("action")){
          switch(message.action) {
            case "personChanged":
            app.personChanged(message.person);
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
      var data
      this.responses.forEach(function(r){
        switch (r.from) {
          case "local:Note":

          break;
          break;
          case "local:Media":
          if(r.message.content != undefined){
            app.sendPicture(r.message)
          }
          break;
          default:
          console.log(r.message.type , "non traite")
        }
      })
      this.responses = []




    }


    sendPicture(message){
      var path = this.ph.getPod("storage")+"public/Picpost/"
      var file = message.content
      var contentType = file.contentType
      var newFilename = message.newFilename
      console.log(path)
      console.log(file)
      var uri = path+newFilename


      this.fileClient.updateFile(uri, file, contentType)
      .then(
        success =>{
          console.log(success)
        //  this.addPic()
        this.agent.send("Messages", {action: "info", status: "Save file OK", file: success})

        },
        err => {console.log(err)});

        /*this.sfh.updateFile(this.uri, this.file)
        .then(
        success =>{
        console.log(success)
        this.addPic()

      },
      err => {console.log(err)});*/

    }


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


                personChanged(person){
                  this.person = person
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

                sendMessage(){
                  this.count++
                  this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
                }

              }

              customElements.define('notes-post-element', NotesPostElement);
