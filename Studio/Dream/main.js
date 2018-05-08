var song1 = '          Salagadoola mechicka boola   Bibbidi-bobbidi-boo!   Put them together and what have you got Bibbidi-bobbidi-boo!   Salagadoola mechicka boola Bibbidi-bobbidi-boo!   It\'ll do magic, believe it or not Bibbidi-bobbidi-boo!   Now, salagadoola means "Mechicka booleroo"   But the thing mabob that does the job   Is bibbidi-bobbidi-boo!   Salagadoola menchicka boola Bibbidi-bobbidi-boo   Put them together what have you got   Bibbidi-bobbidi, Bibbidi-bobbidi Bibbidi-bobbidi boo!'


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
    $('html, body').animate({scrollLeft: $("#" + (i - 1)).position().left + 100}, 100)
  }
  
  $('.letters').css('width', $(window).width() + (200 * i))

  if (i % 12 == 0 && (i != 0)) {
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

        Y = map(event.pageY, 0, $(window).height(), 0, 400 )
        //Y = event.pageY - 50
  });
  $("#" + (i)).css('font-family', font)
  if(++i < l){
    setTimeout(iterator, 100); //SPEED in milliseconds
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



