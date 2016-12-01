var redis = require("redis");
var fs = require("fs");
path = require('path');

var redisCli = redis.createClient({'return_buffers': true});
var videoSubscriber = redis.createClient();
var buffer = [];

videoSubscriber.subscribe("channels");

videoSubscriber.on("message", function(channel, data) {
  buffer.push(data);
});

var process = function (channel, data) {
  var miliseconds = new Date().getTime();
  if (!fs.existsSync("content/"+channel)){
    fs.mkdirSync("content/"+channel);
    fs.createReadStream("content/out.m3u8.template").pipe(fs.createWriteStream("content/"+channel+"/out.m3u8"));
    fs.createReadStream("content/outN.m3u8.template").pipe(fs.createWriteStream("content/"+channel+"/out640x480.m3u8"));
    fs.createReadStream("content/outN.m3u8.template").pipe(fs.createWriteStream("content/"+channel+"/out320x240.m3u8"));
    fs.createReadStream("content/outN.m3u8.template").pipe(fs.createWriteStream("content/"+channel+"/out160x120.m3u8"));
  }
  var filename = "content/"+channel+"/"+miliseconds+"_640x480.webm";
  fs.writeFile(filename, data, "binary", function(err) {});
  redisCli.lpush("640x480", filename);
  redisCli.publish("process", "640x480");
  redisCli.lpush("320x240", filename);
  redisCli.publish("process", "320x240");
  redisCli.lpush("160x120", filename);
  redisCli.publish("process", "160x120");
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