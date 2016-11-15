  
function getAviableChannels(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "/getChannels", true);
  xhr.responseType = 'text';
  xhr.send();
  xhr.onload = function(e) {
    if (xhr.status == 200){
      var splittedChannels = JSON.parse(xhr.response);
      $('#list-group').html("");
      for (i = 0; i < splittedChannels.length; i++) {
        $('#list-group').append('<li class="list-group-item"><a href="/video?channel='+splittedChannels[i]+'">'+splittedChannels[i]+'</a></li>');
      }  
    } else {
      $('#list-group').html("No channels aviable right now :(");
    }
    setTimeout(function () {getAviableChannels();}, 10000);
    
  }

}

getAviableChannels();