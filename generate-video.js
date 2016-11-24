var redis = require("redis");
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;
var getDuration = require('get-video-duration');


var redisCli = redis.createClient({'return_buffers': true});
var videoSubscriber = redis.createClient();
var buffer = [];
var DUMP_LINE = "#EXT-X-DISCONTINUITY\n#EXTINF:##TIME##,\n##FILE##\n";

videoSubscriber.subscribe("process");

videoSubscriber.on("message", function(channel, data) {
	buffer.push(data);
});

var process = function (key, data) {
  var channelName = data.split("/")[1];
  var fileName = data.split("/")[2];
  var newFileName = (fileName.replace("640x480", key)).replace("webm", "ts");
  var finalPath = "content/"+channelName+"/"+newFileName;
  var cmd = "ffmpeg -i '"+data+"' -vcodec libx264 -s "+key+" -crf 51 -preset ultrafast "+finalPath;
	var miliseconds = data.substring(data.indexOf(channelName+"/")+(channelName.length+1), data.indexOf("_"));
  exec(cmd, function(error, stdout, stderr){
    getDuration(finalPath).then(function (duration) {
      var m3u8File = "content/"+channelName+"/out.m3u8";
      var url = "/getwebm/"+channelName+"/"+newFileName;
      var final_line = (DUMP_LINE.replace('##TIME##', duration)).replace('##FILE##', url);
      fs.appendFile(m3u8File, final_line, function (err) {});
    });
  })
    
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