import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { PodHelper } from '../tools/pod-helper.js';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';
import { namedNode } from '@rdfjs/data-model';
import  data  from "@solid/query-ldflex";

class NoteDev extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      webId: {type: String},
      notesList: {type: String},
      message: {type: String}
    };
  }

  constructor() {
    super();
    this.webId = null
    this.notesList = null
    this.message = {}
    this.ph = new PodHelper();
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <div class="container">
    <div class="row">
    <div class="col">
    <input id="titleInput" class="form-control" type="text" value="${this.title}" placeholder="Title">
    </div>
    <div class="col">
    <!--  conf-->
    </div>
    </div>
    <div class="row>">
    <textarea class="form-control" id="noteArea" rows="5" style="width:100%" placeholder="Write a note on your Pod & share it on Agora"></textarea>
    </div>
    <div class="row">
    <button type="button" class="btn btn-primary" @click="${this.sendNote}" ?disabled = ${this.webId == null}>Send note</button>
    </div>
    <div class="row">
    <p>${this.message.status}</p>
    <p><b>${this.message.content}</b></p>
    </div>
    </div>
    `;
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "sessionChanged":
          app.sessionChanged(message.webId);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
    this.updateUser()
  }

  sessionChanged(webId){
    console.log(webId)
    this.webId = webId
  }

  async updateUser(){
    if (this.webId != null){
      console.log("update")
      //  this.publicTypeIndex = this.ph.getPod("publicTypeIndex")
      //  this.storage = this.ph.getPod("storage")
      //  this.notesList = this.ph.getPod("notesList")

    }else{
      //  this.publicTypeIndex = null
      this.storage = null
      //  this.notesList = null
    }

  }


  async sendNote(){
    //https://forum.solidproject.org/t/is-there-a-timeline-for-adding-write-functionality-to-the-ld-flex-library/1965/6
    var app = this


    this.updateUser()
    var content = this.shadowRoot.getElementById('noteArea').value.trim();
    var title = this.shadowRoot.getElementById('titleInput').value.trim();
    console.log(content)
    this.storage = await data.user.storage
    console.log(this.storage)
    //   var storage = this.storage
    var date = new Date(Date.now())
    var path = this.storage+"/public/test.ttl"
    console.log(data)
  var create = await  data[path].schema$about.add(namedNode('oak'))
  console.log("CR",create)
  var keyw = await data[path+'#oak'].schema$keywords.add('acorn');
  console.log("KEY", keyw)




  }


  sendNoteTripledoc(){
    var app = this
    this.updateUser()
    var content = this.shadowRoot.getElementById('noteArea').value.trim();
    var title = this.shadowRoot.getElementById('titleInput').value.trim();
    console.log(content)
    //  console.log(this.notesList)
    var notesList = this.notesList;
    const newNote = notesList.addSubject();
    var date = new Date(Date.now())
    // Indicate that the Subject is a schema:TextDigitalDocument:
    newNote.addRef(rdf.type, schema.TextDigitalDocument);
    // Set the Subject's `schema:text` to the actual note contents:
    newNote.addLiteral(schema.text, content);
    newNote.addLiteral(rdfs.label, title);
    // Store the date the note was created (i.e. now):
    newNote.addLiteral(schema.dateCreated, date)

    notesList.save([newNote]).then(
      success=>{
        console.log(success, newNote.asNodeRef())
        app.message = {status: "success ", content: newNote.asNodeRef()}
      },
      err=>{
        console.log(err)
        app.message = {status: "erreur "+newNote.asNodeRef(), content: err}
        alert(err)
      });

    }

  }

  customElements.define('note-dev', NoteDev);
