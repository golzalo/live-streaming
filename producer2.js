var Rabbit = require('./rabbitMQPub');
var events = require('events');

var mockfunction = function () {
	a.publish("hola");
}

var a = new Rabbit('amqp://localhost','logs', mockfunction);

a.close();