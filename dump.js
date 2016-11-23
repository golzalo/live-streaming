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
  var milliseconds = new Date().getTime();
  var seconds = parseInt(milliseconds/10000);
  if (!fs.existsSync("content/"+channel)){
    fs.mkdirSync("content/"+channel);
  }
  var filename = "content/"+channel+"/"+seconds+"_640x480.webm";
  fs.writeFile(filename, data, "binary", function(err) {});
  redisCli.append(channel+"_list", ","+seconds);

  redisCli.set(channel+"_640x480",seconds);
  redisCli.expire(channel+"_640x480", 200);
  redisCli.lpush("320x240",filename);
  redisCli.publish("process","320x240");
  redisCli.lpush("160x120",filename);
  redisCli.publish("process","160x120");
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