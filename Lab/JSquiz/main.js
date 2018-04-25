// question 1
'Nguyen Phan My Khe';
95;
'95';
true;
var firstname = ['K','H','E'];
['chocolate',3,true];
txt1 = "Khe";
txt2 = "Nguyen";
txt3 = txt1 + txt2;
number = 99+1;

// question 2
var firstItem = myArray[0];
var lastItem = [myArray.length - 1]];
console.log(firstItem);
console.log(lastItem);

// question 3
var sentence = "supercalifragilisticexpialidocious";
console.log(sentence.length);

// question 4
var lastnamequestion4 = "NGUYEN";
var firstnamequestion4 = "KHE";
console.log(firstnamequestion4.length==lastnamequestion4.length); 

// question 5
var student = 15;

if ( student == 15 ) {
  console.log("all the students are in class");
} else {
  console.log("not everyone is here");
}

// question 6
for ( var i = 0; i < firstname.length; i++ ) {
  console.log( firstname[i]);
}

// question 7
var date = new Date;
var hour = date.getHours();
var minute = date.getMinutes();

if ( 19<= hour && hour <=21 ) {
  console.log("true");
} 
else if ( 21 <= hour && hour <= 22) {
	console.log(minute <= 40);
}
else {
  console.log("false");
}

// question 9
var food = ['milktea','steak','cold noodle'];
var animal = ['rabbit','panda','dog'];
var place = ['canada','vietnam','japan'];
var pokemon = ['zenigame','umbreon','mimikyu']

// question 10
// var foods = [['milktea','steak','cold noodle'],['rabbit','panda','dog'],['canada','vietnam','japan'],['zenigame','umbreon','mimikyu']]

var question10 = [food, animal, place, pokemon];

//question11
for ( var i = 0; i < question10.length; i++ ) {
  console.log(question10[i]);
}

//question11
var categories = ["foods", "animals", "palces", "pokemons"];
for ( var i = 0; i < question10.length; i++ ) {
  console.log(categories[i] + " are: ");
  for (var j = 0; j < question10[i].length; j++) {
  	console.log(question10[i][j]);
  }
}

