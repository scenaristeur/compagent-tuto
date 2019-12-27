import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

import  './fab-element.js';
import  './post-element.js';
import  './flow-element.js';
import './login-element.js'
import './webid-element.js'
import './user-notes-element.js'
import './suggestion-element.js'
//import './explorer-element.js'


class AppElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      count: {type: Number},
      flow: {type: String}

    };
  }

  constructor() {
    super();
    this.count = 0
    this.flow = "https://agora.solid.community/public/spoggy/activity.ttl"
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <style>
    .bd-placeholder-img {
      font-size: 1.125rem;
      text-anchor: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    @media (min-width: 768px) {
      .bd-placeholder-img-lg {
        font-size: 3.5rem;
      }
    }
    </style>
    <!-- Custom styles for this template -->
    <link href="css/offcanvas.css" rel="stylesheet">

    <webid-element name="Webid"></webid-element>


    <nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark">
    <a class="navbar-brand mr-auto mr-lg-0" href="#">Agora</a>
    <login-element class="nav-link" name="Login"></login-element>

    <button class="navbar-toggler p-0 border-0" type="button" data-toggle="offcanvas" @click="${this.toggleOffCanvas.bind(this)}">
    <span class="navbar-toggler-icon"></span>
    </button>

    <div class="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
    <ul class="navbar-nav mr-auto">
<!--    <li class="nav-item active">
    <a class="nav-link" href="#">Dashboard <span class="sr-only">(current)</span></a>
    </li>
    <li class="nav-item">
    <a class="nav-link" href="#">Notifications</a>
    </li>-->
    <li class="nav-item">
    <a class="nav-link" href="#">Profile (TODO)</a>
    </li>
    <!--<li class="nav-item">
    <a class="nav-link" href="#">Switch account</a>


    </li>
    <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="#" id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Settings</a>
    <div class="dropdown-menu" aria-labelledby="dropdown01">
    <a class="dropdown-item" href="#">Action</a>
    <a class="dropdown-item" href="#">Another action</a>
    <a class="dropdown-item" href="#">Something else here</a>
    </div>
    </li>-->
    </ul>
    <!--<form class="form-inline my-2 my-lg-0">
    <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>-->
    </div>
    </nav>



      <div class="nav-scroller bg-white shadow-sm">
      <!--
    second rang
  <nav class="nav nav-underline">
    <a class="nav-link active" href="#">Dashboard</a>
    <a class="nav-link" href="#">
    Friends
    <span class="badge badge-pill bg-light align-text-bottom">27</span>
    </a>
    <a class="nav-link" href="#">Explore</a>
    <a class="nav-link" href="#">Suggestions</a>
    <a class="nav-link" href="#">Link</a>
    <a class="nav-link" href="#">Link</a>
    <a class="nav-link" href="#">Link</a>
    <a class="nav-link" href="#">Link</a>
    <a class="nav-link" href="#">Link</a>
    </nav>-->
    </div>


    <main role="main" class="container">

  <post-element name="Post"></post-element>

    <div class="my-2 p-2 bg-back rounded shadow-sm">
    <flow-element name="Flow" flow="${this.flow}"></flow-element>
    </div>

    <div class="my-2 p-2 bg-back rounded shadow-sm">
    <user-notes-element name="UserNotes"></user-notes-element>
    </div>
<!--
    <div class="my-3 p-3 bg-back rounded shadow-sm">
    <explorer-element name="Explorer"></explorer-element>
    </div>-->


<suggestion-element name="Suggestion"></suggestion-element>



    </main>


    <fab-element name="Fab"></fab-element>

    <script src="js/jquery-3.4.1.slim.min.js" ></script>
    <!--<script>window.jQuery || document.write('<script src="/docs/4.4/assets/js/vendor/jquery.slim.min.js"></script>')</script>-->
    <script src="js/bootstrap.bundle.min.js" ></script>
    <script src="js/offcanvas.js"></script>


    <!--  <div class="container-md">
    <div class="row">
    <p>${this.name}</p>

    <webid-element name="Webid"></webid-element>
    <login-element name="Login"></login-element>
    </div>
    <div class="row">
    <div class="col-md">
    <post-element name="Post"></post-element>
    </div>
    <div class="col-lg-5">
    <flow-element name="Flow" flow="${this.flow}"></flow-element>
    </div>
    <div class="col-md-5">
    <user-notes-element name="UserNotes"></user-notes-element>
    </div>
    </div>
    <div class="row">


    </div>

    </div>-->


    `;
  }

  firstUpdated(){
    var app = this;
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          default:
          console.log("Unknown action ",message)
        }
      }
    };


    /*if('Notification' in window){
      Notification.requestPermission(function (status) {
        // Cela permet d'utiliser Notification.permission avec Chrome/Safari
        if (Notification.permission !== status) {
          Notification.permission = status;
        }
        console.log("NOTIF",status)
      })
    }*/

  }

  toggleOffCanvas(e){
    //  console.log(e) //
    //  console.log(this.shadowRoot.getElementById("navbarsExampleDefault").className)
    this.shadowRoot.getElementById("navbarsExampleDefault").classList.toggle("open");
  }

}

customElements.define('app-element', AppElement);
