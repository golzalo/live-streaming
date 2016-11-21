var fs = require("fs");
var redis = require("redis");

var videoPublisher = redis.createClient({'return_buffers': true});
var redisCli = redis.createClient();


var Channel = function (channelName) {
  this.channelName = channelName;
  if (!fs.existsSync("content/"+this.channelName)){
    fs.mkdirSync("content/"+this.channelName);
  }
  videoPublisher.publish("channels",this.channelName);
  redisCli.sadd("allchannels", this.channelName);
};

Channel.prototype.stream = function (chunk) {
  videoPublisher.publish(this.channelName,chunk);
};

module.exports = Channel;