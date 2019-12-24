import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
//import { solid, schema, rdf, rdfs } from 'rdf-namespaces';
import { namedNode } from '@rdfjs/data-model';
import  data  from "@solid/query-ldflex";

class MediaDev extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      webId: {type: String},
      extension: {type: String},
      filename: {type: String},
      info: {type: String}
    };
  }

  constructor() {
    super();
    this.webId = null
    this.filename = ""
    this.info = ""
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">


    <div class="row">
    <form>
    <div class="custom-file">
    <input type="file"
    class="custom-file-input"
    @change="${this.createTemp}"
    id="mediaFile"
    accept="image/*;video/*;audio/*"
    lang="${this.lang}">
    <label class="custom-file-label"
    for="mediaFile">
    <i class="fas fa-camera-retro"></i>
    <i class="fas fa-video"></i>
    <i class="fas fa-microphone"></i>
    </label>
    </div>
    </form>
    </div>

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
      :html `
      `}

      <div class="col-auto"><canvas style="max-width: 100%; height: auto;" id="canvas"/></div>
      <button type="button" class="btn btn-primary" @click="${this.prepareMedia}" ?disabled = ${this.webId == null}>Send Media</button>
      <div class="row">
      <pre>${this.info}</pre>
      </div>

      `;
    }

    firstUpdated(){
      var app = this;
      this.fileClient = SolidFileClient;
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
    }

    sessionChanged(webId){
      console.log(webId)
      this.webId = webId
      this.checkFolder()
    }






    async prepareMedia(){
      //https://forum.solidproject.org/t/is-there-a-timeline-for-adding-write-functionality-to-the-ld-flex-library/1965/6

      // voir https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
      var app = this

      if (this.file == undefined){
        app.info += "\nPlease add a file "
      }else{
        var date = new Date(Date.now())
        var id = date.getTime()
        app.info = date.toLocaleString()+"\nCheck user infos "
        this.updateUser()
        app.info += "\nUser infos checked"



        this.storage = await data.user.storage
        var mymedia = this.storage+"public/media.ttl#"+id
        app.info += "\nCreation "+mymedia

        console.log(this.file)
        var filename = this.filename+this.extension
        console.log(filename)
        /*contentType
        filename*/
        var path = this.storage+"public/Media/"+filename
        console.log(path)
        app.sendMedia(path,this.file,this.file.contentType)


      }



    }



    sendMedia(uri, file, contentType){
      var app = this
      this.fileClient.updateFile(uri, file, contentType)
      .then(
        success =>{
          console.log(success)
          app.info += "\nSuccess "+uri
        },
        err => {
          console.log(err)
          app.info += "\nError "+uri
        });
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

      filenameChange(){
        var filename = this.shadowRoot.getElementById("filename").value
        if (filename.length == 0){
          alert("Filename must not be blank")
          this.shadowRoot.getElementById("filename").value = this.filename
        }else{
          this.filename = filename
        }
      }


      async checkFolder(){
        var app = this
        this.storage = await data.user.storage
        var folder = this.storage+"public/Media/"
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

        }

        customElements.define('media-dev', MediaDev);
