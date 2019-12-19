import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { PodHelper } from '../tools/pod-helper.js';
import { fetchDocument } from 'tripledoc';
import { foaf, space } from 'rdf-namespaces';

class WebidElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
    };
  }

  constructor() {
    super();
    this.count = 0
  }

  render(){
    return html`

    `;
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    this.ph = new PodHelper();
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "sessionChanged":
          app.sessionChanged(message.webId)
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
  }

  getUserData(){
    var app = this;
    fetchDocument(app.webId).then(
      doc => {
        //    console.log("DOC",doc)
        //    console.log(doc.getStatements())
        app.doc = doc;
        app.person = doc.getSubject(app.webId);
        // DO WE BUILD THE PERSON IN WEBID element or let each element retrieve the data it needs ?
        app.person.username = app.person.getString(foaf.name)
        app.person.friends = app.person.getAllRefs(foaf.knows)

        app.person.storage = app.person.getRef(space.storage)

        app.person.webId = app.webId
        var message = {
          action: "personChanged",
          person: app.person
        }
        app.agent.sendMulti(["NotesPost", "UserNotes"], message)
        //  localStorage.setItem('person', JSON.stringify(app.person));
      },
      err => {
        console.log(err)
      }
    );
  }

  sessionChanged(webId){
    this.webId = webId

    if (this.webId != null){
      this.getUserData()
    }else{
      this.person = null
      var message = {
        action: "personChanged",
        person: this.person
      }
      this.ph.setWebId(this.webId)
      this.agent.sendMulti(["NotesPost", "UserNotes"], message)
      //  localStorage.setItem('person', JSON.stringify(this.person));
    }
  }

}

customElements.define('webid-element', WebidElement);
