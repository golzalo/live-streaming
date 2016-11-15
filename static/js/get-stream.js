var process = function (uInt8Array) {
    var file = new Blob([uInt8Array], {type: 'video/webm'});
    parent.buffer.push(file);
    var event = new Event('new-chunk');
    parent.video.dispatchEvent(event);
}

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
      setTimeout(function () {GET(parent.channel, process)},delay);
    };
  } else {
    console.log("not going "+parent.buffer.length);
    setTimeout(function () {GET(parent.channel, process)},delay);
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

GET(parent.channel, process);