var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var redis = require("redis");
var fs = require("fs");
var path = require('path');
var Channel = require('./channel');
require('./hash');

var videoServer = new BinaryServer({server: server, path: '/video-server', port:4705});
var redisCli = redis.createClient();

var SERVER_PORT = 8080;

function getChannelNameFromUrl(url){
  return url.split('?')[1].split('=')[1];
}

//GET VIDEO FROM BROWSER AND PUBLISH TO REDIS
videoServer.on('connection', function(client){
  var channel;
  client.on('stream', function(stream, channelName) {
    channel = new Channel(channelName);
    stream.on("data",function(chunk){
      channel.stream(chunk);
    });
  });
  client.on('close', function (){
    channel.close();
  });
});

server.get('/getwebm/:channel/:file',function(req,res){
    var filePath = path.join('content/'+req.params.channel,req.params.file);
    var stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Access-Control-Allow-Headers':'range',
        'Content-Length': stat.size,
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res); 
});  

server.get('/getChannels',function(req,res){
    redisCli.smembers("allchannels", function(err, reply) {
      if (reply == null){
        res.status(404).send("");
      }else{
        res.status(200).send(reply);  
      }
    });
});

server.get('/recorder',function(req,res){
    res.sendFile(__dirname + '/views/recorder.html');
});

function searchM3U8File(channel,resolution, res){
  var filePath = path.join("content/"+channel,'out'+resolution+'.m3u8');
  var stat = fs.statSync(filePath);

  res.writeHead(200, {
      'Content-Type': 'application/x-mpegURL',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials':true
  });
  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}

server.get('/:channel/hls',function(req,res){
    var channel = req.params.channel;
    searchM3U8File(channel,'', res);
});

server.get('/:channel/hls/:resolution',function(req,res){
    var channel = req.params.channel.toString();
    var resolution = req.params.resolution.toString();
    searchM3U8File(channel,resolution, res);
});

server.get('/mock',function(req,res){
    res.sendFile(__dirname + '/views/mock.html');
});

server.get('/styles.css',function(req,res){
    res.sendFile(__dirname + '/static/css/styles.css');
});

server.get('/rediscope.png',function(req,res){
    res.sendFile(__dirname + '/static/img/rediscope.png');
});

server.get('/recorder.js',function(req,res){
    res.sendFile(__dirname + '/static/js/recorder.js');
});

server.get('/index.js',function(req,res){
    res.sendFile(__dirname + '/static/js/index.js');
});

server.get('/video.js',function(req,res){
    res.sendFile(__dirname + '/static/js/video.js');
});

server.get('/:channel/video.js',function(req,res){
    res.sendFile(__dirname + '/static/js/video.js');
});

server.get('/get-stream.js',function(req,res){
    res.sendFile(__dirname + '/static/js/get-stream.js');
});

server.get('/bitrate.js',function(req,res){
    res.sendFile(__dirname + '/static/js/bitrate.js');
});

server.get('/modernizr.min.js',function(req,res){
    res.sendFile(__dirname + '/static/js/modernizr.min.js');
});

server.get('/jquery.min.js',function(req,res){
    res.sendFile(__dirname + '/static/js/jquery.min.js');
});

server.get('/binary.min.js',function(req,res){
    res.sendFile(__dirname + '/static/js/binary.min.js');
});

server.get('/video',function(req,res){
    res.sendFile(__dirname + '/views/video.html');
});

server.get('/:channel/video',function(req,res){
    res.sendFile(__dirname + '/views/video.html');
});

server.get('/',function(req,res){
    res.sendFile(__dirname + '/views/index.html');
});

server.get('/create',function(req,res){
    res.sendFile(__dirname + '/views/create.html');
});

server.listen(SERVER_PORT);