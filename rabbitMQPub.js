var amqp = require('amqplib/callback_api');

var channel, connection, ex;

var RabbitMQPub = function (url, ex, callback) {
  this.ex = ex;
  amqp.connect(url, function(err, conn) {
    connection = conn;
    conn.createChannel(function(err, ch) {
      ch.assertExchange(ex, 'fanout', {durable: false});
      channel = ch;
      callback();
    });
  });
}

RabbitMQPub.prototype.publish = function (msg) {  
  channel.publish(ex, '', new Buffer(msg));
}

RabbitMQPub.prototype.close = function () {
  connection.close();
}

module.exports = RabbitMQPub;