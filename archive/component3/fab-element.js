import { LitElement, html } from 'lit-element';
import { HelloAgent } from '../agents/hello-agent.js';

class FabElement extends LitElement {

  static get properties() {
    return {
      name: {type: String}
    };
  }

  constructor() {
    super();
  }

  render(){
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <style>
    body { width: 100%; height: 100%; }
    .btn-group-fab {
      position: fixed;
      width: 50px;
      height: auto;
      right: 20px; bottom: 20px;
    }
    .btn-group-fab div {
      position: relative; width: 100%;
      height: auto;
    }
    .btn-group-fab .btn {
      position: absolute;
      bottom: 0;
      border-radius: 50%;
      display: block;
      margin-bottom: 4px;
      width: 40px; height: 40px;
      margin: 4px auto;
    }
    .btn-group-fab .btn-main {
      width: 50px; height: 50px;
      right: 50%; margin-right: -25px;
      z-index: 9;
    }
    .btn-group-fab .btn-sub {
      bottom: 0; z-index: 8;
      right: 50%;
      margin-right: -20px;
      -webkit-transition: all 2s;
      transition: all 0.5s;
    }
    .btn-group-fab.active .btn-sub:nth-child(2) {
      bottom: 60px;
    }
    .btn-group-fab.active .btn-sub:nth-child(3) {
      bottom: 110px;
    }
    .btn-group-fab.active .btn-sub:nth-child(4) {
      bottom: 160px;
    }
    .btn-group-fab .btn-sub:nth-child(5) {
      bottom: 210px;
    }
    </style>
    <div class="btn-group-fab" role="group" @click="${this.toggleFab}" aria-label="FAB Menu">
    <div>
    <button type="button" class="btn btn-main btn-primary has-tooltip" data-placement="left" title="Menu"> <i class="fa fa-bars"></i> </button>
    <button type="button" class="btn btn-sub btn-info has-tooltip" data-placement="left" title="Fullscreen"> <i class="fa fa-arrows-alt"></i> </button>
    <button type="button" class="btn btn-sub btn-danger has-tooltip" data-placement="left" title="Save"> <i class="far fa-save"></i> </button>
    <button type="button" class="btn btn-sub btn-warning has-tooltip" data-placement="left" title="Download"> <i class="fa fa-download"></i> </button>
    </div>
    </div>
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

  toggleFab(){
    this.shadowRoot.querySelector(".btn-group-fab").classList.toggle('active')
  }

}

customElements.define('fab-element', FabElement);
