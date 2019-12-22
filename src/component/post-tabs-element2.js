import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import data from "@solid/query-ldflex";


import './note-element.js'

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
    this.subelements = ["Note"] //, "Media", "Triple"]
    this.requetes = {}
    this.responses = []
    this.agoraNotesListUrl = "https://agora.solid.community/public/notes.ttl"

  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <note-element name="Note"></note-element>


    <div class="row">
    <div class="col">
    <button type="button" class="btn btn-primary" primary @click=${this.addNote}><i class="far fa-paper-plane"></i></button>
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

    `;
  }

  firstUpdated(){
    var app = this;
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


  /*  var ruben = data['https://role.solid.community/profile/card#me'];
    console.log(ruben)
    this.showProfile(ruben);*/
  }



  addNote(){
    var id = new Date().toISOString ()
    this.requetes[id] = this.subelements.length
    console.log(this.requetes)
    var mess = {action: "askContent", id : id}
    this.agent.sendMulti(this.subelements, mess)
    //  this.dispatchEvent(new CustomEvent('dialog.accept'))}

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
    console.log(this.responses)
    console.log("USER",await data.user.publicTypeIndex)
  }

  /*
    async showProfile(person) {
      var app = this
      console.log(person)
      const name = await person.vcard$fn;
      console.log(`\nNAME: ${name}`);

      console.log('\nTYPES');
      for await (const type of person.type)
      console.log(`  - ${type}`);

      console.log('\nFRIENDS');
      for await (const friend of person.friends){
        console.log(friend)
      try{  var f = data[friend];
        const n = await f.vcard$fn;
        console.log(`\nNAMEA: ${n}`);
      }catch(e){
        console.log(e)
      }
      //  app.showProfile(f)
      }


    }*/


}

customElements.define('post-tabs-element', PostTabsElement);
