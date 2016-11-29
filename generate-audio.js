var redis = require("redis");
var fs = require("fs");
var path = require('path');
var getDuration = require('get-video-duration');
var ffmpeg = require('fluent-ffmpeg');

var redisCli = redis.createClient({'return_buffers': true});
var videoSubscriber = redis.createClient();
var buffer = [];
var DUMP_LINE = "#EXT-X-DISCONTINUITY\n#EXTINF:##TIME##,PROGRAM-ID=##ID##\n##FILE##\n";

videoSubscriber.subscribe("process-audio");

videoSubscriber.on("message", function(channel, data) {
	buffer.push(data);
});

var final_line = [];
final_line['640x480']="";
final_line['320x240']="";
final_line['160x120']="";


var process = function (key, data) {
  var channelName = data.split("/")[1];
  var fileName = data.split("/")[2];
  var newFileName = (fileName.replace("640x480", key+"audio")).replace("webm", "ts");
  var finalPath = "content/"+channelName+"/"+newFileName;
  var id = fileName.split("_")[0];
  var command = ffmpeg(data)
    .audioCodec('libfdk_aac')
    .videoCodec('libx264')
    //.size(key)
    .addOptions(['-vn','-preset fast'])
    .on('end', function() {
      getDuration(finalPath).then(function (duration) {
        var m3u8File = "content/"+channelName+"/out"+key+".m3u8";
        var url = "/getwebm/"+channelName+"/"+newFileName;
        fs.appendFile(m3u8File, final_line[key], function (err) {
          final_line[key] = ((DUMP_LINE.replace('##TIME##', duration)).replace("##ID##",id)).replace('##FILE##', url);
          loop();
        });

      });
  })
  .save(finalPath);
    
}


function loop(){
  if (buffer.length > 0){
    var key = buffer.shift().toString();
    redisCli.rpop(key, function(err, data) {
      if (data != null){
        process(key, data.toString());
      }
    });
  } else {
    setTimeout(loop, 1000);
  }  
}

loop();