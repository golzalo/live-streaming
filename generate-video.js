var redis = require("redis");
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;

var redisCli = redis.createClient({'return_buffers': true});
var videoSubscriber = redis.createClient();
var buffer = [];

videoSubscriber.subscribe("process");

videoSubscriber.on("message", function(channel, data) {
	buffer.push(data);
});

var process = function (key, data) {
	var cmd = "ffmpeg -i '"+data+"' -codec:v libvpx -s "+key+" -crf 51 -preset ultrafast "+data.replace("640x480", key);
	var channelName = data.split("/")[1]
	var seconds = data.substring(data.indexOf(channelName+"/")+(channelName.length+1), data.indexOf("_"));
	exec(cmd, function(error, stdout, stderr){
		redisCli.set(channelName+"_"+key,seconds);
    	redisCli.expire(channelName+"_"+key, 190);
    });
}


function loop(){
  if (buffer.length > 0){
    var key = buffer.shift().toString();
    redisCli.rpop(key, function(err, data) {
      if (data != null){
        process(key, data.toString());
      }
      loop();
    });
  } else {
    setTimeout(loop, 1000);
  }  
}

loop();