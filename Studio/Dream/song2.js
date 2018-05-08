var song1 = '                 (Intrument playing)         Sing along in 5 - 4 - 3 - 2 - 1 and Go         When you wish upon a star         Makes no difference who you are       Anything your heart desires will come to you                         If your heart is in your dream     No request is too extreme        When you wish upon a star            A s  t h e  d r e a m e r s  d o o o o o      F a t e  i s   k i n d       She brings to those who   l o v e    The sweet fulfillment of joy     t h e i r  s e c r e t  l o n g i n gggggggggg)       uuuuuuuuuuuuuuuuuuuu           Like a bolt out of the  b l u e e e      Fate steps in and sees you  t h r o u g h          When  you  wish     upon  a  star      Your   d r e a m s s s s s      c o m e e e e e e    t r u e e e e e e                             '


//   audio
function music() {
    var audio = document.getElementById("myAudio").autoplay;
    document.getElementById("demo").innerHTML = audio;
}


var fonts =["Bourbon","Aleo Light Italic","Broadcast Matter","Aleo Light Italic","Broadcast Matter","Chamfort Family Bold","Eunomia Bold","Eunomia Light","Eunomia","F5.6","Fairview","Ferrum","Kelson Sans Bold","Kelson Sans Light","Kitchen Sink","Oi You","Penna","Rosario Nocera Light","Rosario Nocera","Rosario Nocera Bold","Bitter","FivoSans Bold","FivoSans Medium","Fivo Sans Thin"];
// for (var i = song1.length - 1; i >= 0; i--) {
//   song1[i]
//   /*creating a .letter element for each letter*/
//   var letter = $('<h1></h1>');
//   $(letter).text(song1[i]);
//   $('body').append(letter)
//   // console.log(song1[])
// }

var font = "Bourbon"


$(window).on('click', function(){

/* change fonts */
var randomIndex = Math.floor((Math.random() * fonts.length - 1) + 0);
font = fonts[randomIndex];


})




function map (num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


var Y = 0
//runs every 150 miliseconds
var i = 0, l = song1.length;

(function iterator(){

/* do stuff here*/
  var letter = $('<h1></h1>');
  if (song1[i] == " ") {
    $(letter).html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  }else{
    $(letter).text(song1[i]);
  }
  
  $(letter).css('top', Y)
  $(letter).addClass('letter')

  $(letter).attr('id', i)
  $('.letters').append(letter)

  //window.scrollBy(30,0)
  if(i > 10){
    $('html, body').animate({scrollLeft: $("#" + (i - 1)).position().left - 300}, 100)
  }
  
  $('.letters').css('width', $(window).width() + (200 * i))

  if (i % 20 == 0) {
    var line = $('<div></div>');
    $(line).addClass('bar');
    $('.letters').append(line) 
    $(line).css('top',0)
    $(line).css('margin-left', $(window).width())
  }
/* if the mouse moves, show letter where mouse is*/
  var moved = false;
  $(document).mousemove(function(event) {
        // currentMousePos.x = event.pageX;
        // currentMousePos.y = event.pageY;
        // $('.letter').css('margin-left','-40%');
        // if (moved == false) {
        //   $("#" + (i - 1)).css('top', event.pageY)
        //   moved = true;
        // }

        Y = map(event.pageY, 0, $(window).height(), 100, 480 )
        //Y = event.pageY - 50
  });
  $("#" + (i)).css('font-family', font)
  if(++i < l){
    setTimeout(iterator, 130); //SPEED in milliseconds
  } else{

  }
})();


// var counter = 0;
// // function 
// $("body").on("click", function() {
//   counter += 1;
//   console.log(counter);
// });


// myAudio.addEventListener("ended", function(){
//      myAudio.currentTime = 0;
//      console.log("ended");
//      for (var i = 0; i < counter; i++) {
//       console.log(fonts[i]);
//     }
// });






