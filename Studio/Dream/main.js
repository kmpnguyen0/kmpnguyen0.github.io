
var song1 = '              [Piano Playing]   Sing along in 5 - 4 - 3 - 2 - 1 and Go      Cruella De Vil       Cruella De Vil       If she doesn\'t scare you     No evil thing will  To see her is to take a sudden chill         Cruella,  Cruella De Vil            The curls of her lips     The ice in her stare     All innocent children had better beware     She\'s like a spider waiting for the kill   Cruella,   Cruella De Vil              At first you think Cruella is the devil        But after time has worn a way the shock       You come to realize       You\'ve seen her kind of eyes          Watching you from underneath a rock!      This vampire bat   This inhuman beast   She ought to be locked up   And never released       The world was such a wholesome place until    Cruella, Cruella De Vil          Cruella De Vil       Cruella De Vil       If she doesn\'t scare you     No evil thing will     To see her  is  to take a sudden chilllllll    Cruella,  Cruella De Vil       '



var letterReplace = {};

// DYLAN PLEASE CHECK OUT THIS PART!!!!!
document.addEventListener("keydown", function(event) {
    var find = '';
    console.log(event.keyCode);
    if ( event.keyCode == 69 ) {
      // key code 69 is e
      letterReplace['e'] = '👁️';
    } else if ( event.keyCode == 65 ) {
      // key code 65 is a 
      letterReplace['a'] = '👠';
    }else if ( event.keyCode == 85 ) {
      // key code 85 is u 
      letterReplace['u'] = '🖤';
    }else if ( event.keyCode == 79 ) {
      // key code 79 is o 
      letterReplace['o'] = '🐩';
    } else if ( event.keyCode == 73 ) {
      // key code 73 is  
      letterReplace['i'] = '😈';
    } 
});

//   audio
function music() {
    var audio = document.getElementById("myAudio").autoplay;
    document.getElementById("demo").innerHTML = audio;
}


// var fonts =["Bourbon","Aleo Light Italic","Broadcast Matter","Aleo Light Italic","Broadcast Matter","Chamfort Family Bold","Eunomia Bold","Eunomia Light","Eunomia","F5.6","Fairview","Ferrum","Kelson Sans Bold","Kelson Sans Light","Kitchen Sink","Oi You","Penna","Rosario Nocera Light","Rosario Nocera","Rosario Nocera Bold","Bitter","FivoSans Bold","FivoSans Medium","Fivo Sans Thin"];
// for (var i = song1.length - 1; i >= 0; i--) {
//   song1[i]
//   /*creating a .letter element for each letter*/
//   var letter = $('<h1></h1>');
//   $(letter).text(song1[i]);
//   $('body').append(letter)
//   // console.log(song1[])
// }

var font = "Ferrum"


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
console.log(i);
/* do stuff here*/
  var letter = $('<h1></h1>');
  if (song1[i] == " ") {
    $(letter).html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  }else{
    $(letter).text( letterReplace[song1[i]] || song1[i] );
  }
  
  $(letter).css('top', Y)
  $(letter).addClass('letter letter-' + song1[i].toLowerCase());

  $(letter).attr('id', i)
  $('.letters').append(letter)

  //window.scrollBy(30,0)
  if(i > 10){
    $('html, body').animate({scrollLeft: $("#" + (i - 1)).position().left - 150},90)
  }

  if (i <= (song1.length - 480)) {
    $('.letters').css('width', $(window).width() + (200 * i))
  }

  // if (i % 20 == 0) {
  //   var line = $('<div></div>');
  //   $(line).addClass('bar');
  //   $('.letters').append(line) 
  //   $(line).css('top',0)
  //   $(line).css('margin-left', $(window).width())
  // }
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

        Y = map(event.pageY, 0, $(window).height(), 40, 400 )
        //Y = event.pageY - 50
  });
  $("#" + (i)).css('font-family', font)
  if(++i < l){
    setTimeout(iterator, 90); //SPEED in milliseconds
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

var myAudio = document.getElementById('myAudio');
myAudio.addEventListener("ended", function () {
    var nextsong = document.getElementById('nextsong');
    nextsong.style.display = 'block';
});




swal({ 
  title: "Cruella De Vil",
  text: "Try to play with the vowel letters. And have fun!",
  button: "Oke 💖",});
/* 
to print the body

try to window.print(document.body); 

look up both of those things
*/

