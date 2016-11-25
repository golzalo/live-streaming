var redis = require("redis");
var fs = require("fs");
var path = require('path');
var getDuration = require('get-video-duration');
var ffmpeg = require('fluent-ffmpeg');

var redisCli = redis.createClient({'return_buffers': true});
var videoSubscriber = redis.createClient();
var buffer = [];
var DUMP_LINE = "#EXT-X-DISCONTINUITY\n#EXTINF:##TIME##,\n##FILE##\n";

videoSubscriber.subscribe("process");

videoSubscriber.on("message", function(channel, data) {
	buffer.push(data);
});

var final_line = "";

var process = function (key, data) {
  var channelName = data.split("/")[1];
  var fileName = data.split("/")[2];
  var newFileName = (fileName.replace("640x480", key)).replace("webm", "ts");
  var finalPath = "content/"+channelName+"/"+newFileName;
  var command = ffmpeg(data)
    .audioCodec('libfdk_aac')
    .videoCodec('libx264')
    .size(key)
    .output(finalPath)
    .addOptions(['-preset fast'])
    .on('end', function() {
      getDuration(finalPath).then(function (duration) {
        var m3u8File = "content/"+channelName+"/out"+key+".m3u8";
        var url = "/getwebm/"+channelName+"/"+newFileName;
        setTimeout(function () {fs.appendFile(m3u8File, final_line, function (err) {})}, 500);
        var final_line = (DUMP_LINE.replace('##TIME##', duration)).replace('##FILE##', url);
      });
  })
  .run();
    
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