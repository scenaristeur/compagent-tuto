import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';

import { PodHelper } from '../tools/pod-helper.js';

class MediaElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      notesList: {type: String}
    };
  }

  constructor() {
    super();
    this.count = 0
    this.notesList = ""
  }

  render(){
    return html`
    <p>${this.name}</p>
    list : ${this.notesListUrl}

    <button @click="${this.sendMessage}">Send message</button>
    `;
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
      this.ph = new PodHelper("bip",12);
      console.log("PH VALUE",this.ph.count)
    var auth  =   JSON.parse(localStorage.getItem('solid-auth-client'));
    this.webId = auth.session.webId
    console.log(this.webId)
    this.init()
  }

  init(){
    var app = this;
  fetchDocument(app.webId).then(
    doc => {
      app.doc = doc;
      app.person = doc.getSubject(app.webId);
      app.initNotePod()
    },
    err => {
      console.log(err)
    }
  );
  }


initNotePod(){
  var app = this
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
    //  app.getNotes()
    fetchDocument(app.notesListUrl).then(
      notesList => {
        app.notesList = notesList;
         console.log("app.notesList",app.notesList)
      })
    },
    err => {console.log(err)}
  );
}


  personChanged(person){
    this.person = person
    console.log(person)
  /*  if (person != null){
      console.log(person.storage)
      this.initNotePod()
    }*/
    //  console.log("jquery",$)
  }

  sendMessage(){
    this.count++
    this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
  }

}

customElements.define('media-element', MediaElement);
