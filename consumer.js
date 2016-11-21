var RabbitMQClient = require('./RabbitMQClient');

var execute = function () {
	rabbit.startWorker();
}

var rabbit = new RabbitMQClient("amqp://localhost?heartbeat=60", execute);
