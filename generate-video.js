var redis = require("redis");
var fs = require("fs");
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var exec = require('child_process').exec;

var videoPublisher = redis.createClient();
var videoSubscriber = redis.createClient(6379);

videoSubscriber.subscribe("process");

videoSubscriber.on("message", function(channel, data) {
	var cmd = "ffmpeg -i '"+data+"' -s 320x240 -crf 51 -preset ultrafast "+data.replace("640x480", "320x240");
	var channelName = data.split("/")[1]
	var seconds = data.substring(data.indexOf(channelName+"/")+(channelName.length+1), data.indexOf("_"));
	exec(cmd, function(error, stdout, stderr){
		videoPublisher.set(channelName+"_320x240",seconds);
    	videoPublisher.expire(channelName+"_320x240", 190);
    });
  	
});