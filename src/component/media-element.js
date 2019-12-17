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
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">

    <style>
    i {
      padding: 10px
    }
    </style>
    <p>${this.name}</p>
    list : ${this.notesListUrl}
    <div class="row">
    <form>
    <!--https://www.html5rocks.com/en/tutorials/getusermedia/intro/-->
    <!--            <div class="custom-file">
    <input type="file" class="custom-file-input" @change="${this.createTemp}" id="imageFile" accept="image/*;capture=camera" lang="${this.lang}">
    <label class="custom-file-label" for="imageFile"><i class="fas fa-camera-retro"></i> Image</label>
    </div>
    <div class="custom-file">
    <input type="file" class="custom-file-input" @change="${this.createTemp}" id="videoFile" accept="video/*;capture=camcorder" lang="${this.lang}">
    <label class="custom-file-label" for="videoFile"><i class="fas fa-video"></i> Video</label>
    </div>
    <div class="custom-file">
    <input type="file" class="custom-file-input" @change="${this.createTemp}" id="audioFile" accept="audio/*;capture=microphone" lang="${this.lang}">
    <label class="custom-file-label" for="audioFile"><i class="fas fa-microphone"></i> Audio</label>
    </div>
    -->
    <div class="custom-file">
    <input type="file" class="custom-file-input" @change="${this.createTemp}" id="audioFile" accept="image/*;video/*;audio/*" lang="${this.lang}">
    <label class="custom-file-label" for="audioFile"><i class="fas fa-camera-retro"></i><i class="fas fa-video"></i><i class="fas fa-microphone"></i></label>
    </div>
    </form>
    </div>


    Folder : <a href="${this.path}" target="_blank">${this.path}</a>

    <div class="col-auto">
    <label class="sr-only" for="filename">Filename</label>
    <div class="input-group mb-2">
    <input id="filename" class="form-control" type="text" value="${this.filename}" @change="${this.filenameChange}" placeholder="Filename">
    <div class="input-group-append">
    <div class="input-group-text">${this.extension}</div>
    </div>
    </div>
    </div>

    <!--
    <input id="filename" class="form-control" type="text" value="${this.filename}" @change="${this.filenameChange}" placeholder="Filename"> ${this.extension}
    -->



    <div class="col-auto"><canvas style="max-width: 100%; height: auto;" id="canvas"/></div>


    `;
  }


  createTemp(e) {
    console.log(e)
  

    console.log(e.target)
    //  console.log(e.target.getAttribute("capture"))

    this.file = e.target.files[0];
    console.log("storage",this.storage)
    this.path = this.storage+"public/Picpost/"
    console.log(this.file)


    this.filename = this.file.name.substring(0,this.file.name.lastIndexOf("."));
    this.shadowRoot.getElementById('filename').value = this.filename
    this.extension = this.file.name.substring(this.file.name.lastIndexOf("."));
    this.uri = this.path+this.filename+this.extension

    var canvas =   this.shadowRoot.getElementById('canvas')
    var ctx = canvas.getContext('2d');
    var cw = canvas.width;
    var ch = canvas.height;
    var maxW=cw;
    var maxH=ch;

    var image = new Image;
    image.onload = function() {
      var iw=image.width;
      var ih=image.height;
      var scale=Math.min((maxW/iw),(maxH/ih));
      var iwScaled=iw*scale;
      var ihScaled=ih*scale;
      canvas.width=iwScaled;
      canvas.height=ihScaled;
      ctx.drawImage(image,0,0,iwScaled,ihScaled);
      //  ctx.drawImage(image, 0,0);
      //  alert('the image is drawn');
    }
    image.src = URL.createObjectURL(this.file);

    /*
    canvas.width = this.file.width;
    canvas.height = this.file.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    // Other browsers will fall back to image/png
    img.src = canvas.toDataURL('image/webp');*/

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
