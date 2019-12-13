// Import the LitElement base class and html helper function
import { LitElement, html } from 'lit-element';

import { HelloAgent } from '../agents/hello-agent.js';

// Extend the LitElement base class
class MyElement extends LitElement {

  /**
  * Implement `render` to define a template for your element.
  *
  * You must provide an implementation of `render` for any element
  * that uses LitElement as a base class.
  */
  render(){
    /**
    * `render` must return a lit-html `TemplateResult`.
    *
    * To create a `TemplateResult`, tag a JavaScript template literal
    * with the `html` helper function:
    */
    return html`
    <!-- template content -->
    <p>My Element</p>

    <button @click="${this.sendMessage}">Send message</button>
    `;
  }


  firstUpdated(){
    this.agent = new HelloAgent(this.name);
    console.log(this.agent)
    this.agent.receive = function(from, message) {
      if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "langChanged":
          app.lang = message.lang;
          app.requestUpdate();
          break;
          default:
          // code block
          console.log("Unknown action ",message)
        }
      }
    };


  }

  sendMessage(){
    console.log("send")
      this.agent.send("Messages", {action:"info", info:"message from my element"}  )
  }


}
// Register the new element with the browser.
customElements.define('my-element', MyElement);
