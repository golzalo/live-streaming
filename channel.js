var fs = require("fs");
var redis = require("redis");
require("./hash");

var videoPublisher = redis.createClient();
var redisCli = redis.createClient({'return_buffers': true});


var Channel = function (channelName) {
	var seed = Math.floor(Math.random()*100000);
	this.channelName = channelName.toString()+"_"+seed;
	this.id = this.channelName.toString().hashCode();
	redisCli.sadd("allchannels", this.channelName+":"+this.id);
};

Channel.prototype.stream = function (chunk) {
	videoPublisher.publish("channels",this.id);
 	redisCli.lpush(this.id,chunk);
};

Channel.prototype.close = function () {
	redisCli.srem("allchannels", this.channelName+":"+this.id);
	fs.appendFile("content/"+this.id+"/out640x480.m3u8", "\n#EXT-X-ENDLIST", function (err) {});
	fs.appendFile("content/"+this.id+"/out320x240.m3u8", "\n#EXT-X-ENDLIST", function (err) {});
	fs.appendFile("content/"+this.id+"/out160x120.m3u8", "\n#EXT-X-ENDLIST", function (err) {});
}

module.exports = Channel;