var thething = document.querySelector("h6");

console.log(thething)

thething.addEventListener("click", clickyfunstuff);


function clickyfunstuff() {
	
	var paragraph = document.querySelector(".output p");

	paragraph.innerHTML = "hello <strong>tiffany</strong>, it works";

	var trigger = document.querySelector(".output p strong")
	console.log(trigger)

	trigger.addEventListener("click", addImage);

	console.log("it works!!!!");
}