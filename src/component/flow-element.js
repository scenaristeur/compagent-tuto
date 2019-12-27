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
    <div class="card-columns">
    <div>
    <h6 class="border-bottom border-gray pb-2 mb-0 text-primary">Spogs on Agora (${notes.length})
    <small class="d-block text-right mt-3">
    <a href="${this.flow}"  title="${this.flow}" target="_blank">All Agora's spogs<a>
    <a href="https://scenaristeur.github.io/spoggy-simple/?source=${this.flow}"  title="${this.flow}" target="_blank"><i class="fas fa-dice-d20"></i><a>
    </small>
    </h6>
    </div>
    ${notes.map((n) => html`
      ${noteCard(n)}
      `
    )}
    </div>
    `;

    const noteCard = (n) => html `
    <div class="card">


    <div>
    ${n.objects.map((o) => html`
      ${this.templateImage(o)}
      `)}
      </div>
      <!--    <img class="card-img-top" src="..." alt="Card image cap">-->
      <div class="card-body">

      <p class="card-text">
    <!--  ${n.count}-->
      <a  href="${n.actor}" ?hidden=${n.actor == null} target="_blank" >
      <i title="${n.actor}" primary small  class="bd-placeholder-img mr-2 rounded fas fa-user"></i>
      <small><b>${n.actorname}</b></small>
      </a>
      <small class="text-muted">${n.date}<!--Last updated 3 mins ago--></small>
      </p>

      <h5 class="card-title">
      <a href="${n.uri}" target="_blank">${n.title}</a>
      </h5>

      <blockquote class="blockquote mb-0">
      <p>${n.text}</p>
      <footer class="blockquote-footer">
      <small>${n.keywords}</small>
      ${n.inReplyTo != null ?
        html`
        <small>In replyTo <a href="${n.inReplyTo}" target="_blank">${n.inReplyToShort}</a></small><br>`
        :html``
      }
      <small class="text-muted">
      <cite title="Source Title">
      ${n.objects.map((o) => html`
        ${this.templateDefaultObject(o)}
        `)}
        </cite>
        </small>
        </footer>
        </blockquote>

        <div class="row icon-pan">
        <a href="#" uri="${n.also}"><i uri="${n.also}" class="fas fa-comment-dots" @click="${this.reply}"></i></a>
        <!--<a href="${n.uri}" target="_blank">  <i title="open" primary small  class="fas fa-eye"></i></a>-->
        <a href="${n.also}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
        <a href="https://scenaristeur.github.io/spoggy-simple/?source=${n.also}"  title="${n.also}" target="_blank">
        <i class="fas fa-dice-d20"></i><a>
        <a href="#"><i title="copy" primary @click="${this.copy}" uri=${n.uri} class="fas fa-copy"></i></a>
        </div>
        </div>
        </div>
        `;

        return html `
        <style>
        .card-columns {
          @include media-breakpoint-only(lg) {
            column-count: 4;
          }
          @include media-breakpoint-only(xl) {
            column-count: 5;
          }
        }
        i {
          padding:20px 10px;
        }
        </style>
        <link href="css/fontawesome/css/all.css" rel="stylesheet">
        <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
        <link href="css/offcanvas.css" rel="stylesheet">
        ${noteList(this.notes)}
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
/*
      async actorname(a){
        var name =  await   data[a].vcard$fn
        console.log(name)
        return name
      }*/
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

      templateImage(o){
        switch(o.extension){
          case ".png":
          case ".jpg":
          case ".gif":
          return html`
          <a href="${o.uri}" target="_blank"><img class="card-img-top" src="${o.uri}"></a>
          `
          break;
          default:

        }
      }

      templateDefaultObject(o){
        if (o.extension !== ".png" && o.extension !== ".jpg" && o.extension !== ".gif"){
          return html`
          <a href="${o.uri}" target="_blank">${o.short}</a><br>
          `
        }
      }

      getAgoraData(){
        var app = this
        this.lastUpdate = Date.now()
        fetchDocument(app.flow).then(
          async function(notesList ) {
            app.notesList = notesList;
            var notesUri = notesList.findSubjects()
            app.notesUri = Array.from(new Set(notesUri))
            app.notes = []
            //  var count = 0
            app.notesUri.forEach(async function (nuri){
              var text = nuri.getString(schema.text) || ""
              var dateLit = nuri.getString(schema.dateCreated)|| ""
              var actor = nuri.getRef("https://www.w3.org/ns/activitystreams#actor") ||  ""
              var also = nuri.getRef(rdfs.seeAlso) || nuri.getRef(schema.about) || nuri.getRef("https://www.w3.org/ns/activitystreams#target") ||""
              var title = nuri.getString(rdfs.label) || ""
              var keywords = nuri.getString(schema.keywords) || ""
              var note = {}
              note.count =Math.floor(new Date(dateLit).getTime()/ 1000)
              //  count++;
              note.text = text;
              note.date = new Date(dateLit).toLocaleString(app.lang) //      <!-- toLocaleTimeString(this.lang)-->
              note.actor = actor;
              if (actor.length > 0){
                app.actors.hasOwnProperty(actor) ? app.actors[actor].activities++ :  app.actors[actor] =  {webId:actor, activities : 0};
              }

              note.also = also;
              note.title = title
              note.keywords = keywords
              note.uri = nuri.asNodeRef()
              note.inReplyTo = nuri.getRef("https://www.w3.org/ns/activitystreams#inReplyTo") || null
              note.inReplyToShort = note.inReplyTo != null ? note.inReplyTo.substring(note.inReplyTo.lastIndexOf("/")) : null;
              var objects = nuri.getAllRefs("https://www.w3.org/ns/activitystreams#object")
              note.objects = []
              objects.forEach(function (o){
                var object = {}
                object.uri = o
                object.extension = o.substring(o.lastIndexOf("."));
                object.short = o.substring(o.lastIndexOf("/"));
                note.objects = [... note.objects, object]
              })
              note.actorname = await   data[actor].vcard$fn

              app.notes = [... app.notes, note]


            })
            app.notes.sort(function(a, b) { // sort by number of activities
              return b.count - a.count;
            });

            /*  await app.notes.forEach(async function(n){
            n.actorname = await   data[n.actor].vcard$fn
            console.log(n.actorname)
          })*/

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
    console.log("update")
    if (msg.data && msg.data.slice(0, 3) === 'pub') {
      console.log("update")
      //  Date.now() - app.lastUpdate > 1000 ?   app.getAgoraData() : "";
      app.getAgoraData()
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
