import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

class PostTabsElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number}
    };
  }

  constructor() {
    super();
    this.count = 0
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
    <div ><!--style="height:50vh"-->
    <div id="Note" class="tabcontent" style="display:block">
    Note
    <note-element name="Note"></note-element>
    </div>

    <div id="Media" class="tabcontent">
    <h3>Media</h3>
    <p>todo.</p>
    <media-element name="Media"></media-element>
    </div>

    <div id="Triple" class="tabcontent">
    <h3>Triple</h3>
    <p>todo.</p>
    <triple-element name="Triple"></triple-element>
    </div>

    <div id="Graph" class="tabcontent">
    <h3>Graph</h3>
    <p>todo.</p>
    <graph-element name="Graph"></graph-element>
    </div>




    <div class="tab">
    <button class="tablinks active" tabName='Note' @click="${this.openTab}"><i class="far fa-sticky-note"> Note</i></button>
    <button class="tablinks" tabName='Media' @click="${this.openTab}"><i class="fas fa-photo-video"> Media</i></button>
    <button class="tablinks" tabName='Triple' @click="${this.openTab}"><i class="fas fa-receipt"></i> Triple</button>
    <button class="tablinks" tabName='Graph' @click="${this.openTab}"><i class="fas fa-dice-d20"></i> Graph</button>


    </div>
    </div>
    <hr>
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

    `;
  }


  addNote(){
    var agora_pub = this.shadowRoot.getElementById('agora_pub').checked //this.shadowRoot.getElementById('agora_pub').shadowRoot.firstElementChild.checked

    var message = {
      action: "sendToPod",
      person: this.person,
      agora_pub: agora_pub,
      agoraNotesListUrl : this.agoraNotesListUrl}
      this.agent.sendMulti(["Note","Media","Graph","Triple"], message)
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
      this.agent = new HelloAgent(this.name);
      this.agent.receive = function(from, message) {
        if (message.hasOwnProperty("action")){
          switch(message.action) {
            case "doSomething":
            app.doSomething(message);
            break;
            default:
            console.log("Unknown action ",message)
          }
        }
      };
    }

    doSomething(message){
      console.log(message)
    }

    sendMessage(){
      this.count++
      this.agent.send("Messages", {action:"info", info:"Now counter is "+this.count}  )
    }

  }

  customElements.define('post-tabs-element', PostTabsElement);
