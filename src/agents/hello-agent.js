import  eve from 'evejs/dist/eve.custom.js';

function HelloAgent(id){
  // execute super constructor
eve.Agent.call(this, id);

// connect to all transports configured by the system
this.connect(eve.system.transports.getAll());

}

// extend the eve.Agent prototype
HelloAgent.prototype = Object.create(eve.Agent.prototype);
HelloAgent.prototype.constructor = HelloAgent;

HelloAgent.prototype.sayHello = function(to) {
  this.send(to, 'Hello ' + to + '!');
};

HelloAgent.prototype.receive = function(from, message) {
  //slog(this.id+" received from :"+from + ' this message: ' + JSON.stringify(message));
  console.log(this.id+" received from :"+from + ' this message: ' + JSON.stringify(message));

  if (JSON.stringify(message).indexOf('Hello') === 0) {
    // reply to the greeting
    this.send(from, 'Hi ' + from + ', nice to meet you!');
  }
};

export {HelloAgent};
