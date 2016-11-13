var redis = require("redis");
var fs = require("fs");
path = require('path');

var videoPublisher = redis.createClient();
var videoSubscriber = redis.createClient({'return_buffers': true});

videoSubscriber.subscribe("channels");

videoSubscriber.on("message", function(channel, data) {
  if(channel == "channels"){
    videoSubscriber.subscribe(data);    
  }else{
    var milliseconds = new Date().getTime();
    var seconds = parseInt(milliseconds/10000);
    if (!fs.existsSync("content/"+channel)){
      fs.mkdirSync("content/"+channel);
    }
    var filename = "content/"+channel+"/"+seconds+"_640x480.webm";
    fs.writeFile(filename, data, "binary", function(err) {});
    videoPublisher.set(channel+"_640x480",seconds);
    videoPublisher.expire(channel+"_640x480", 190);
    videoPublisher.publish("process",filename);
  }
});