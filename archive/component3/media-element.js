import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { PodHelper } from '../tools/pod-helper.js';

class MediaElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      extension: {type: String},
      filename: {type: String},
      footprint:  {type: Object}
    };
  }

  constructor() {
    super();
    this.count = 0
    this.filename = ""
    this.footprint  = {name:"Media", index: "public/media.ttl", path:"public/Media"}
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
    <!--  list : ${this.notesListUrl} -->
    <div class="row">
    <form>
    <div class="custom-file">
    <input type="file" class="custom-file-input" @change="${this.createTemp}" id="mediaFile" accept="image/*;video/*;audio/*" lang="${this.lang}">
    <label class="custom-file-label" for="mediaFile"><i class="fas fa-camera-retro"></i><i class="fas fa-video"></i><i class="fas fa-microphone"></i></label>
    </div>
    </form>
    </div>
    <!--

    Folder : <a href="${this.path}" target="_blank">${this.path}</a>
    -->
    ${this.filename.length > 0 ?
      html`
      <div class="row">
      <label class="sr-only" for="filename">Filename</label>
      <div class="input-group mb-2">
      <input id="filename" class="form-control" type="text" value="${this.filename}" @change="${this.filenameChange}" placeholder="Filename">
      <div class="input-group-append">
      <div class="input-group-text">${this.extension}</div>
      </div>
      </div>
      </div>


      `
      :html `Choose a file
      `}

      <div class="col-auto"><canvas style="max-width: 100%; height: auto;" id="canvas"/></div>
      <!--
      <input id="filename" class="form-control" type="text" value="${this.filename}" @change="${this.filenameChange}" placeholder="Filename"> ${this.extension}
      -->
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





      `;
    }

    /*
    tempTOPUTailleurs(){
    this.storage = this.ph.getPod("storage")
    console.log("storage",this.storage)
    this.path = this.storage+"public/Picpost/"
    this.uri = this.path+this.filename+this.extension
    console.log(this.uri)
  }*/

  createTemp(e) {
    this.file = e.target.files[0];
    this.filename = this.file.name.substring(0,this.file.name.lastIndexOf("."));
    this.extension = this.file.name.substring(this.file.name.lastIndexOf("."));

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
    this.ph = new PodHelper();
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "sessionChanged":
          app.sessionChanged(message.webId);
          break;
          case "askContent":
          app.askContent(from, message);
          break;
          default:
          console.log("Unknown action ",message)
        }
      }
    };
    this.ph.checkFootprint(this.footprint)
  }

  sessionChanged(webId){
    this.webId = webId
    if (webId != null){
      this.ph.checkFootprint(this.footprint)
    }
  }

    askContent(from, message){
      var app = this
      console.log(from,message)
      var rep = {
        action: "reponseContent",
        content: this.file,
        id: message.id,

        type: "MediaObject"}
        if (this.filename.length > 0){
          rep.newFilename = this.filename+this.extension
        }


        this.agent.send(from, rep)
        /*
        this.file = {}
        this.filename = ""


        var canvas = this.shadowRoot.getElementById("canvas")
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);*/

      }

      filenameChange(){
        var filename = this.shadowRoot.getElementById("filename").value
        if (filename.length == 0){
          alert("Filename must not be blank")
          this.shadowRoot.getElementById("filename").value = this.filename
        }else{
          this.filename = filename
        }
      }

    }

    customElements.define('media-element', MediaElement);
