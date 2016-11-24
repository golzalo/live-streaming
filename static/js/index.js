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
        var name = splittedChannels[i].split(":")[0];
        var id = splittedChannels[i].split(":")[1];
        $('#list-group').append('<li class="list-group-item"><a href="/'+id+'/video?channel='+name+'">'+splittedChannels[i]+'</a></li>');
      }  
    } else {
      $('#list-group').html("No channels aviable right now :(");
    }
    setTimeout(function () {getAviableChannels();}, 10000);
    
  }

}

getAviableChannels();