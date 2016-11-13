var timeOfChunkVideo = 10000; // because I know the chunks are from 10 seconds video
var lastThreeCalls = [];
var definitions = ["320x240","640x480"];
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
	if (avgTime < delay && avgTime < timeOfChunkVideo){
		if (parent.buffer.length > 3){
			return false;
		} else {
			return true;
		}
	} else {
		return true;
	}
}

function addCallResponseTime(newTime){
	if (lastThreeCalls.length > 2){
		lastThreeCalls.shift();	
	}
	lastThreeCalls.push(newTime);
}