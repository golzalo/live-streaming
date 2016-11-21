var fs = require("fs");
var redis = require("redis");
require("./hash");

var videoPublisher = redis.createClient({'return_buffers': true});
var redisCli = redis.createClient();


var Channel = function (channelName) {
  var seed = Math.floor(Math.random()*100000);
  this.channelName = channelName.toString()+"_"+seed;
  this.id = this.channelName.toString().hashCode();
  videoPublisher.publish("channels",this.id);
  redisCli.sadd("allchannels", this.channelName);
};

Channel.prototype.stream = function (chunk) {
  videoPublisher.publish(this.id,chunk);
};

Channel.prototype.close = function () {
	redisCli.srem("allchannels", this.channelName);
	videoPublisher.publish("unsubscribe",this.id);
}

module.exports = Channel;