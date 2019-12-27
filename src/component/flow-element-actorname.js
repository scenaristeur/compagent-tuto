import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';
import { fetchDocument } from 'tripledoc';
import { schema, rdfs, rdf, vcard, as } from 'rdf-namespaces';

import data from "@solid/query-ldflex";

class FlowElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      flow: {type: String},
      notes: {type: Array},
      lang: {type: String},
      notes: {type: Array},
      lastUpdate: {type: Number},
      actors: {type: Object},
      tags: {type: Array}
    };
  }

  constructor() {
    super();
    this.flow = "floww"
    this.lang=navigator.language
    this.notes = []
    this.lastUpdate = 0
    this.actors = {}
  }

  render(){
    const noteList = (notes) => html`
    <h6 class="border-bottom border-gray pb-2 mb-0 text-primary">Spogs on Agora (${notes.length})</h6>
    <ul class="list-group list-group-flush" style="height: 45vh; overflow: auto">
    ${notes.map((n) => html`
      <li class="list-group-item">
      <div class="row media text-muted pt-3"> <!--   border-bottom border-gray-->
      <div class="col">
      <div class="row">
      <div class="col-md-2">
      <a  href="${n.actor}" ?hidden=${n.actor == null} target="_blank" ><small>${n.actorname}</small><i title="${n.actor}" primary small  class="bd-placeholder-img mr-2 rounded fas fa-user"></i></a>
      </div>
      <div class="col media-body pb-3 mb-0 small lh-125">
      <strong class="d-block text-gray-dark white-space: pre-wrap">
      <a href="${n.uri}" target="_blank">${n.title}</a>
      </strong>
      <div style="white-space: pre-wrap">${n.text}</div>
      </div>
      </div>
      <small>${n.date}</small>
      <small>${n.keywords}</small>
      ${n.inReplyTo != null ?
        html`<small>In replyTo <a href="${n.inReplyTo}" target="_blank">${n.inReplyToShort}</a></small>`
        :html``
      }
      </div>

      <div>
      ${n.objects.map((o) => html`
        ${this.templateShow(o)}
        `)}
        </div>

        <div class="col-md-1 icon-pan">
        <a href="#" uri="${n.also}"><i uri="${n.also}" class="fas fa-comment-dots" @click="${this.reply}"></i></a>
        <!--<a href="${n.uri}" target="_blank">  <i title="open" primary small  class="fas fa-eye"></i></a>-->
        <a href="${n.also}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
        <a href="https://scenaristeur.github.io/spoggy-simple/?source=${n.also}"  title="${n.also}" target="_blank">
        <i class="fas fa-dice-d20"></i><a>
        <a href="#"><i title="copy" primary @click="${this.copy}" uri=${n.uri} class="fas fa-copy"></i></a>
        </div>
        </div>
        </li>
        `)}
        </ul>
        `;

        return html`
        <link href="css/fontawesome/css/all.css" rel="stylesheet">
        <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
        <link href="css/offcanvas.css" rel="stylesheet">

        ${noteList(this.notes)}
        <small class="d-block text-right mt-3">
        <a href="${this.flow}"  title="${this.flow}" target="_blank">All Agora's spogs<a>
        <a href="https://scenaristeur.github.io/spoggy-simple/?source=${this.flow}"  title="${this.flow}" target="_blank"><i class="fas fa-dice-d20"></i><a>
        </small>
        `;
      }

      reply(e){
        console.log(e.target.getAttribute('uri'))
        var object = e.target.getAttribute('uri')
        var mess = {action:"toggleWrite"}
        this.agent.send("Post", mess)
        var messRep = {action:"setReplyTo", replyTo: object }
        this.agent.send("PostTabs", messRep)
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
        this.getAgoraData()
      }

      templateShow(o){
        switch(o.extension){
          case ".png":
          case ".jpg":
          case ".gif":
          return html`
          <a href="${o.uri}" target="_blank"><img class="thbn" src="${o.uri}" width="100px", height="100px"></a>
          `
          break;
          default:
          return html`
          <a href="${o.uri}" target="_blank">${o.short}</a>
          `
        }
      }

      getAgoraData(){
        var app = this
        this.lastUpdate = Date.now()
        fetchDocument(app.flow).then(
          function(notesList ) {
            app.notesList = notesList;
            var notesUri = notesList.findSubjects()
            app.notesUri = Array.from(new Set(notesUri))
            app.notes = []
            app.notesUri.forEach(async function (nuri){
              var text = nuri.getString(schema.text) || ""
              var dateLit = nuri.getString(schema.dateCreated)|| ""
              var actor = nuri.getRef("https://www.w3.org/ns/activitystreams#actor") ||  ""
              var also = nuri.getRef(rdfs.seeAlso) || nuri.getRef(schema.about) || nuri.getRef("https://www.w3.org/ns/activitystreams#target") ||""
              var title = nuri.getString(rdfs.label) || ""
              var keywords = nuri.getString(schema.keywords) || ""
              var note = {}
              note.text = text;
              note.date = new Date(dateLit).toLocaleString(app.lang) //      <!-- toLocaleTimeString(this.lang)-->
              note.actor = actor;
              if (actor.length > 0){
                app.actors.hasOwnProperty(actor) ? app.actors[actor].activities++ :  app.actors[actor] =  {webId:actor, activities : 0};
              }
              note.actorname = await   data[actor].vcard$fn
              note.also = also;
              note.title = title
              note.keywords = keywords
              note.uri = nuri.asNodeRef()
              note.inReplyTo = nuri.getRef("https://www.w3.org/ns/activitystreams#inReplyTo") || null
              note.inReplyToShort = note.inReplyTo != null ? note.inReplyTo.substring(note.inReplyTo.lastIndexOf("/")) : null;
              var objects = nuri.getAllRefs("https://www.w3.org/ns/activitystreams#object")
              note.objects = []
              objects.forEach(async function (o){
                var object = {}
                object.uri = o
                object.extension = o.substring(o.lastIndexOf("."));
                object.short = o.substring(o.lastIndexOf("/"));
                note.objects = [... note.objects, object]
              })
              app.notes.reverse()
              app.notes = [... app.notes, note]
              app.notes.reverse()
            })

            app.agent.send("Suggestion", {action: "updateActors", actors: app.actors})
          })

          if (app.socket == undefined){
            app.subscribe()
          }else{
            console.log("socket exist deja")
          }
        }


        async getDetails1(){
          var app = this
          console.log(this.notes)
          this.notes.forEach(async function(n){

            n.creatorName = "todo"
            console.log(n)
            console.log(n.also)

            for await (const subject of  data[n.also].subjects){
              //  console.log(`  - ${subject}`);
              for await (const pred of subject.properties) {
                var p = await pred;
                var val = await subject[pred]
                //  console.log(p, `  - ${val}`)
                if (val != undefined){
                  n[pred] = val['<target>'].subject.id
                }
              }
            }

            console.log(n)

            /*var also = n.also.asNodeRef()
            var date = also.getDateTime(schema.dateCreated) || ""
            var title = also.getString(rdfs.label) || ""
            console.log(date, title)*/

            /*fetchDocument(n.also).then(
            detail => {
            console.log(detail)
            var act = detail.findSubject(n.also)
            var date = act.getDateTime(schema.dateCreated) || ""
            var title = act.getString(rdfs.label) || ""
            var att = act.getAllRefs('https://www.w3.org/ns/activitystreams#attachment')
            var obj = act.getAllRefs('https://www.w3.org/ns/activitystreams#object')
            console.log(date,title, att, obj)

            //    console.log(details.getStatements())
            //    console.log(details.getTriples())

          })*/

          /*for await (const subject of  data[nuri].subjects){
          console.log(`  - ${subject}`);
          for await (const pred of subject.properties) {
          var p = await pred;
          console.log(p)
        }
      }*/
    })
  }


  subscribe(){
    var app = this
    //https://github.com/scenaristeur/spoggy-chat-solid/blob/master/index.html
    var websocket = this.notesList.getWebSocketRef();
    //  console.log("WEBSOCK",websocket)
    app.socket = new WebSocket(websocket);
    //  console.log ("socket",app.socket)
    app.socket.onopen = function() {
      const d = new Date();
      var now = d.toLocaleTimeString(app.lang) + `.${d.getMilliseconds()}`
      this.send('sub '+app.flow);
      app.agent.send('Messages', now+"[souscription] "+app.flow)
      //  console.log("OPENED SOCKET",app.socket)
    };
    app.socket.onmessage = function(msg) {
      if (msg.data && msg.data.slice(0, 3) === 'pub') {
        Date.now() - app.lastUpdate > 1000 ?   app.getAgoraData() : "";
      }
      //else{console.log("message inconnu",msg)}
    };
  }

  copy(e){
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = e.target.getAttribute("uri");
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  }

}

customElements.define('flow-element', FlowElement);
