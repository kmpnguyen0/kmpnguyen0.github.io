console.log('hi');

$(function() {
  // Your interactions go here
  $( ".question1" ).click(function() {
	  $( ".text" ).toggle();
	});
});



var sticks = document.getElementsByClassName('stick');

for (var i = 0; i < sticks.length; i++) {
	sticks[i].addEventListener('click', background);
}

function background() {
	var id_number = this.id.slice(0);

	this.classList = 'background';

	var random_num = Math.floor( Math.random() * sticks.length );
	// console.log(random_num);

	if (id_number === random_num) {
		while (id_number === random_num) {
			random_num = Math.floor( Math.random() * sticks.length );
		}
	}

	var other_stick_id = 's' + random_num;
	var other_stick = document.getElementById(other_stick_id); 

	other_stick.classList = 'background';
}