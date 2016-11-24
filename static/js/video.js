var timeOfChunkVideo = 10000; // because I know the chunks are from 10 seconds video
var lastThreeCalls = [];
var definitions = ["160x120","320x240","640x480"];
var actualDefinition = 0;

function getResolution(){
    var avgTime = calculateAVGResponseTime();
    if (avgTime < delay && avgTime < timeOfChunkVideo){
        actualDefinition = actualDefinition+1>definitions.length-1?definitions.length-1:actualDefinition+1;
    } else if (avgTime > delay && avgTime > timeOfChunkVideo){
        actualDefinition = actualDefinition-1<0?0:actualDefinition-1;
    }
    return definitions[actualDefinition];
}

function calculateAVGResponseTime(){
    var totalTime = 0;
    lastThreeCalls.forEach(function(time) {
        totalTime += time;
    });
    return totalTime/lastThreeCalls.length;
}

function itsNecessary(){
    var avgTime = calculateAVGResponseTime();
    /*if (avgTime < delay && avgTime < timeOfChunkVideo){
        if (parent.buffer.length > 3){
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }*/
    return true;
}

function addCallResponseTime(newTime){
    if (lastThreeCalls.length > 2){
        lastThreeCalls.shift(); 
    }
    lastThreeCalls.push(newTime);
}

var video = document.querySelector('video');
var mediaSource = new MediaSource();
video.src = window.URL.createObjectURL(mediaSource);

function callback(e) {
  mediaSource.addSourceBuffer('video/webm; codecs="vp8,opus"');
}

video.onended = onVideoEnded;

function onVideoEnded(e) {
    video.play();
}

var process = function(uInt8Array) {
    var file = new Blob([uInt8Array], {type: 'video/webm'});
    var reader = new FileReader();
    reader.onload = function(e) {
        mediaSource.sourceBuffers[0].timestampOffset=isNaN(mediaSource.duration)?0:mediaSource.duration;
        mediaSource.sourceBuffers[0].appendBuffer(new Uint8Array(e.target.result));
        if (video.paused) {
            video.play();
        }

    };
    reader.readAsArrayBuffer(file);
};


mediaSource.addEventListener('sourceopen', callback, false);

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var channel = getUrlParameter("channel");

$("h1").html(channel);

var chunkId = 0;
var delay = 1000;
var min_delay = 9000;
var max_delay = 20000;

function GET(channelName, callback) {
  if (itsNecessary()){
    var start_time = new Date().getTime();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "/getwebm/"+channelName+"/"+chunkId+"_"+getResolution(), true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    xhr.onload = function(e) {
      if (xhr.status == 404) {
          if (xhr.reponse != "greater"){
            getLastId(channelName);
          }
      } else if (xhr.status != 200) {
        console.error("Unexpected status code " + xhr.status + " for getWebm");
        return false;
      } else {
        addCallResponseTime(new Date().getTime() - start_time);
        chunkId++;
        callback(new Uint8Array(xhr.response));
      }
      //setTimeout(function () {GET(channel, process)},delay);
    };
  } else {
    //setTimeout(function () {GET(channel, process)},delay);
  }
}

function getLastId(channelName){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getwebm/'+channelName+'/last-id/'+getResolution(), true);
    xhr.responseType = 'text';
    xhr.send();
    xhr.onload = function(e) {
      if (xhr.status != 200){
          console.error("Unexpected status code " + xhr.status + " for lastId");
          return false;
      }
      var rsp = xhr.response;
      if (parseInt(rsp) > parseInt(chunkId)){
           chunkId = rsp;
      }
    }
}

GET(channel, process);

