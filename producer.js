var readline = require('readline');
var RabbitMQClient = require('./RabbitMQClient');

var execute = function () {
	rabbit.startPublisher();
	setInterval(function() {
		if (queueMsgs.length > 0){
			rabbit.publish("", "jobs", new Buffer(queueMsgs.shift()));	
		}
	}, 1000);

}

var rabbit = new RabbitMQClient("amqp://localhost?heartbeat=60", execute);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var queueMsgs = [];

rl.on('line', function(line){
    queueMsgs.push(line);
})