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
	redisCli.srem("allchannels", this.channelName);
	var m3u8File = "content/"+this.id+"/out.m3u8";
	var final_line = "#EXT-X-ENDLIST";
	fs.appendFile(m3u8File, final_line, function (err) {});
}

module.exports = Channel;