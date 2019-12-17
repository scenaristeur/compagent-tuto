import  eve from 'evejs';

function RequestAgent(id){
  // execute super constructor
  eve.Agent.call(this, id);
  this.extend('request');

//this.request = this.loadModule('request');
  // connect to all transports configured by the system
  this.connect(eve.system.transports.getAll());

}

// extend the eve.Agent prototype
RequestAgent.prototype = Object.create(eve.Agent.prototype);
RequestAgent.prototype.constructor = RequestAgent;

RequestAgent.prototype.sayHello = function(to) {
  this.send(to, 'Hello ' + to + '!');
};

RequestAgent.prototype.receive = function (from, message) {

  console.log(from + ' said: ' + message);



  // return value is send back as reply in case of a request

  return 'Hi ' + from + ', nice to meet you!';

};



export {RequestAgent};
