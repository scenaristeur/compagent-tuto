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
      message: {type: Object}
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
    <div class="col">
    <button type="button" class="btn btn-primary" @click="${this.sendNote}" ?disabled = ${this.webId == null}>Send note</button>

    </div>
    <div class="col">
    <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="agora_pub" name="agora_pub" checked>
    <label class="text-primary" for="agora_pub">
    Publish on Agora
    </label>
    </div>
    </div>

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

    // voir https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
    var app = this


    this.updateUser()
    var content = this.shadowRoot.getElementById('noteArea').value.trim();
    var title = this.shadowRoot.getElementById('titleInput').value.trim();
    console.log(content)
    this.storage = await data.user.storage
    console.log(this.storage)
    //   var storage = this.storage
    var date = new Date(Date.now())
    var id = date.getTime()
    //  var date = new Date(id)
    console.log(id)

    var path = this.storage+"public/Notes/"+id+".ttl"
    console.log(data)
    var tit = await  data[path].rdfs$label.add(title)
    var cont = await data[path].schema$text.add(content);


    console.log(date)
    var mynote = this.storage+"public/notes.ttl#"+id
    // schema
    var index = await data[mynote].rdf$type.add(namedNode(schema.TextDigitalDocument))
    var d = await data[mynote].schema$dateCreated.add(date.toISOString())
    var titindex = await data[mynote].rdfs$label.add(title)
    var file = await data[mynote].schema$about.add(namedNode(path))
    // activitystreams
    await data[path].as$content.add(content);
    await data[mynote].as$name.add(title)
    //!!! as$Note ne fonctionne pas
    await data[mynote].rdf$type.add(namedNode('https://www.w3.org/ns/activitystreams#Note'))



    app.message.content = mynote+ "created\n"
    app.message.status = "ok"

    var agora_pub = this.shadowRoot.getElementById('agora_pub').checked
    if (agora_pub == true){
      var agoranote = "https://agora.solid.community/public/notes.ttl#"+id
      await data[agoranote].rdf$type.add(namedNode(schema.TextDigitalDocument))
      await data[agoranote].schema$dateCreated.add(date.toISOString())
      await data[agoranote].rdfs$label.add(title)
      await data[agoranote].schema$about.add(namedNode(mynote))
      await data[agoranote].schema$creator.add(namedNode(app.webId))
      // activitystreams
      //await data[agoranote].rdf$type.add(namedNode(as.Note))
      await data[agoranote].as$name.add(title)
      await data[agoranote].as$attachement.add(namedNode(mynote))

      app.message.content += agoranote+ "created\n"
      app.message.status = "ok"
    }


    this.shadowRoot.getElementById('noteArea').value = ""
    this.shadowRoot.getElementById('titleInput').value= ""

    console.log(this.message)
    /*  var create = await  data[path].schema$about.add(namedNode('oak'))
    console.log("CR",create)
    var keyw = await data[path+'#oak'].schema$keywords.add('acorn');
    console.log("KEY", keyw)*/




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
