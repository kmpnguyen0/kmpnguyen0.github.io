var planets = "Jupiter (69,911 km / 43,441 miles) – 1,120% the size of Earth, Saturn (58,232 km / 36,184 miles) – 945% the size of Earth, Uranus (25,362 km / 15,759 miles) – 400% the size of Earth, Neptune (24,622 km / 15,299 miles) – 388% the size of Earth, Earth (6,371 km / 3,959 miles), Venus (6,052 km / 3,761 miles) – 95% the size of Earth, Mars (3,390 km / 2,460 miles) – 53% the size of Earth, Mercury (2,440 km / 1,516 miles) – 38% the size of Earth "
console.log(planets)

nameArray.forEach(make_a_list);
function make_a_list(el, ix) {
	var listItem = document.createElement("li")

	listItem.textContent = el

	container.appendChild(listItem)
}

var names = document.querySelectorAll(".output ul li")
console.log(names)


names.forEach(changeBackground)

function changeBackground(el) {
	el.style.backgroundColor = "whit," + Math.random() + ")";
}




