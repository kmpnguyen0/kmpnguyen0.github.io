var vid = document.getElementById("video-background");


var source = document.createElement('source'); 


var videos = ["video3.mp4","video2.mp4","video.mp4"];
var video = videos[ Math.floor(Math.random() * videos.length)]; 
//document.querySelector("#video-background > source").src = video

source.setAttribute('src',video); 
vid.appendChild(source)

vid.playbackRate = 0.5


