var redis = require("redis");
var fs = require("fs");
path = require('path');

var redisCli = redis.createClient({'return_buffers': true});
var videoSubscriber = redis.createClient();
var buffer = [];
var HEADER = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:9\n#EXT-X-MEDIA-SEQUENCE:0\n";

videoSubscriber.subscribe("channels");

videoSubscriber.on("message", function(channel, data) {
  buffer.push(data);
});

var process = function (channel, data) {
  var miliseconds = new Date().getTime();
  var m3u8File = "content/"+channel+"/out.m3u8";
  if (!fs.existsSync("content/"+channel)){
    fs.mkdirSync("content/"+channel);
    fs.appendFile(m3u8File, HEADER, function(err) {});
  }
  var filename = "content/"+channel+"/"+miliseconds+"_640x480.webm";
  fs.writeFile(filename, data, "binary", function(err) {});
  redisCli.lpush("320x240", filename);
  redisCli.publish("process", "320x240");
  //redisCli.lpush("160x120", filename);
  //redisCli.publish("process", "160x120");
}

function loop(){
  if (buffer.length > 0){
    var key = buffer.shift().toString();
    redisCli.rpop(key, function(err, data) {
      if (data != null){
        process(key, data);
      }
      loop();
    });
  } else {
    setTimeout(loop, 1000);
  }  
}

loop();