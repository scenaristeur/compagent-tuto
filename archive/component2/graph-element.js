import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

class AppElement extends LitElement {

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
    <p>${this.name}</p>
    <button @click="${this.sendMessage}">Send message</button>
    `;
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

  catchTriplet(triplet){
  //  console.log(triplet)
  var subject = triplet.value.subject;
  var predicate = triplet.value.predicate;
  var object = triplet.value.object;
  // console.log(message.length);
  //message=message.trim();
  //var tripletString = message.substring(2).trim().split(" ");
  // les noeuds existent-ils ?
  var sujetNode = this.network.body.data.nodes.get({
    filter: function(node){
      //    console.log(node);
      return (node.label == subject );
    }
  });
  var objetNode = this.network.body.data.nodes.get({
    filter: function(node){
      //    console.log(node);
      return (node.label == object);
    }
  });
  //  console.log(sujetNode);
  //  console.log(objetNode);
  // sinon, on les créé
  if (sujetNode.length == 0){
    var sub_n = {label: subject, color:{
      border : document.getElementById("bordercolorpicker").value ,
      background : document.getElementById("bodycolorpicker").value }
    };
    this.network.body.data.nodes.add(sub_n);
  }
  if (objetNode.length == 0){
    var obj_n = {label: object, color:{
      border : document.getElementById("bordercolorpicker").value ,
      background : document.getElementById("bodycolorpicker").value }
    };
    this.network.body.data.nodes.add(obj_n);
  }
  // maintenant ils doivent exister, pas très po=ropre comme méthode , à revoir
  sujetNode = this.network.body.data.nodes.get({
    filter: function(node){
      return (node.label == subject );
    }
  });
  objetNode = this.network.body.data.nodes.get({
    filter: function(node){
      //  console.log(node);
      return (node.label == object);
    }
  });
  this.network.body.data.edges.add({
    label: predicate,
    from : sujetNode[0].id,
    to : objetNode[0].id,
    color: {inherit:'both'}

  });
  //on récupère ce edge pour l'envoyer au serveur
  var edge = this.network.body.data.edges.get({
    filter: function(edge) {
      return (edge.from == sujetNode[0].id && edge.to == objetNode[0].id && edge.label == predicate);
    }
  });
  //  console.log("OK",autofit,autofocus)
  //this.network.fit();
  fitAndFocus(sujetNode[0].id);

}

}

customElements.define('app-element', AppElement);
