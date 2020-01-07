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

    <h6 class="border-bottom border-gray pb-2 mb-0 text-primary">Spogs on Agora (${notes.length})
    <select id="mySelect" @change=${this.sort}>
    <option id="date" value="date">Date</option>
    <option id="rating" value="rating">Rating</option>
    </select>
    <small class="d-block text-right mt-3">
    <a href="${this.flow}"  title="${this.flow}" target="_blank">All Agora's spogs<a>
    <a href="https://scenaristeur.github.io/spoggy-simple/?source=${this.flow}"  title="${this.flow}" target="_blank"><i class="fas fa-dice-d20"></i><a>
    </small>
    </h6>


    <div  style="height: 50vh; overflow: auto">
    <div class="card-columns" style="background:#c7f3fc">


    ${notes.map((n) => html`
      ${noteCard(n)}
      `
    )}

    </div>
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

        <div class="col">
        <button class="btn btn-outline-primary btn-sm" uri="${n.uri}" @click="${this.reply}">
        <i  class="fas fa-comment-dots fa-sm" title="Reply" uri="${n.uri}"></i>
        </button>
        <!--<a href="${n.uri}" target="_blank">  <i title="open" primary small  class="fas fa-eye"></i></a>-->
        <button class="btn btn-outline-primary btn-sm">
        <a href="${n.also}" target="_blank"><i class="fas fa-external-link-alt fa-sm"></i></a>
        </button>

        <button class="btn btn-outline-primary btn-sm">
        <a href="https://scenaristeur.github.io/spoggy-simple/?source=${n.also}"  title="${n.also}" target="_blank">
        <i title="see spoggy graph" class="fas fa-dice-d20 fa-sm"></i><a>
        </button>

        <button class="btn btn-outline-primary btn-sm">
        <i title="copy" primary @click="${this.copy}" uri=${n.uri} class="fas fa-copy  fa-sm"></i>
        </button>
        </div>

        <div class="col">
        <button class="btn btn-outline-primary btn-sm" value=1 uri="${n.uri}"  @click="${this.like}">
        <i value=1 uri="${n.uri}" class="far fa-thumbs-up fa-sm" @click="${this.like}"></i>
        </button>
        <button class="btn btn-outline-primary btn-sm">  ${n.rating} </button>
        <button class="btn btn-outline-primary btn-sm" value=-1 uri="${n.uri}"  @click="${this.like}">
        <i value=-1 uri="${n.uri}" class="far fa-thumbs-down fa-sm" @click="${this.like}"></i>
        </button>


        </div>
        </div>
        </div>
        `;

        return html `
        <link href="css/fontawesome/css/all.css" rel="stylesheet">
        <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
        <link href="css/offcanvas.css" rel="stylesheet">
        <style>
        .card-columns {
          @include media-breakpoint-only(lg) {
            column-count: 4;
          }
          @include media-breakpoint-only(xl) {
            column-count: 5;
          }
        }
        .fa-sm {
          padding:0px;
        }
        </style>

        ${noteList(this.notes)}
        `;
      }

      async like(e){
        console.log(e.target)
        var uri = e.target.getAttribute("uri")
        var value = e.target.getAttribute("value")
        var score = await data[uri]['http://purl.org/stuff/rev#rating'] || 0

        console.log(score)
        score == undefined  || isNaN(score) ? score = 0 : "";
        var new_score = parseInt(score)+parseInt(value)
        console.log(new_score)
        await data[uri]['http://purl.org/stuff/rev#rating'].set(new_score.toString())
      }


      sort(e){
        var element = e.target
        var val = element.options[element.selectedIndex].value
        console.log(val)
        switch(val) {
          case "date":

          this.notes.sort(function(a, b) { //tri par date
            return b.count - a.count;
          });

          this.requestUpdate()
          break;
          case "rating":

          this.notes.sort(function(a, b) {   //tri par popularite
            return b.rating - a.rating;
          });

          this.requestUpdate()
          break;
          default:
          console.log("Unknown select ",val)
        }


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

      templateImage(o){
        switch(o.extension){
          case ".png":
          case ".jpg":
          case ".gif":
          return html`
          <img class="card-img-top" src="${o.uri}" style="max-width:300px">
          <!--          <a href="${o.uri}" target="_blank"></a> -->
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
            var notes = []
            var actors = {}
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
                actors.hasOwnProperty(actor) ? actors[actor].activities++ :  actors[actor] =  {webId:actor, activities : 0};
              }
              note.rating = nuri.getString('http://purl.org/stuff/rev#rating') || 0
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

              notes = [... notes, note]

              notes.sort(function(a, b) { //tri par date
                return b.count - a.count;
              });

              /*  notes.sort(function(a, b) {   //tri par popularite
              return b.rating - a.rating;
            });*/

            /*  await notes.forEach(async function(n){
            var an = await   data[n.actor].vcard$fn
            n.actorname = `${an}`
            console.log(n.actorname)
          })*/

          app.notes = notes
          //  console.log(app.notes)

        })

        if (app.socket == undefined){
          app.subscribe()
        }else{
          console.log("socket exist deja")
        }
        console.log("actors",actors)
        if (actors != app.actors){
          app.actors = actors
          app.agent.send("Suggestion", {action: "updateActors", actors: app.actors})
        }
      })


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
