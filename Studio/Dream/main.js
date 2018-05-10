//   audio
function music() {
    var audio = document.getElementById("myAudio").autoplay;
    document.getElementById("demo").innerHTML = audio;
}

var song1 = '  (Really?    I guess you don\'t have much experience with heat)    Sing along in 5 - 4 - 3 - 2 - 1 and Go    Bees\'ll buzz, kids\'ll blow dandelion fuzz   And I\'ll be doing whatever snow does   In summer   A drink in my hand, my snow up against the burning sand   Prob\'ly getting gorgeously tanned   In summer   I\'ll finally see a summer breeze blow away a winter storm   And find out what happens to solid water when it gets warm   And I can\'t wait to see what my buddies all think of me   Just imagine how much cooler I\'ll be   In summer          Da da, da doo, ah, bah, bah, bah, bah, bah, boo   The hot and the cold are both so intense   Put \'em together, it just makes sense   Ratdadat, dadadadoo   Winter\'s a good time to stay in and cuddle   But put me in summer and I\'ll be a happy snowman   When life gets rough I like to hold onto my dreams   Of relaxing in the summer sun, just letting off steam   Oh, the sky will be blue, and you guys\'ll be there too   When I finally do what frozen things do   In summer   In summer!'


var fonts =["Bourbon","Aleo Light Italic","Broadcast Matter","Aleo Light Italic","Broadcast Matter","Chamfort Family Bold","Eunomia Bold","Eunomia Light","Eunomia","F5.6","Fairview","Ferrum","Kelson Sans Bold","Kelson Sans Light","Kitchen Sink","Oi You","Penna","Rosario Nocera Light","Rosario Nocera","Rosario Nocera Bold","Bitter","FivoSans Bold","FivoSans Medium","Fivo Sans Thin"];


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
    $('html, body').animate({scrollLeft: $("#" + (i - 1)).position().left + 200}, 100)
  }
  
    $('.letters').css('width', $(window).width() + (200 * i))


  // if (i % 16 == 0 && (i != 0)) {
  //   var line = $('<div></div>');
  //   $(line).addClass('bar');
  //   $('.letters').append(line) 
  //   $(line).css('top',0)
  //   $(line).css('margin-left', $(window).width())
  // }
/* if the mouse moves, show letter where mouse is*/
  var moved = false;
  $(document).mousemove(function(event) {
        Y = map(event.pageY, 0, $(window).height(), 100, 480 )
  });
  $("#" + (i)).css('font-family', font)
  if(++i < l){
    setTimeout(iterator, 80); //SPEED in milliseconds
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
