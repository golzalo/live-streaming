var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue4';
	var msg = process.argv.slice(2).join(' ') || "Hello World!";

	ch.assertQueue(q, {durable: false});
	ch.sendToQueue(q, new Buffer(msg), {persistent: false});
	console.log(" [x] Sent '%s'", msg);
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});