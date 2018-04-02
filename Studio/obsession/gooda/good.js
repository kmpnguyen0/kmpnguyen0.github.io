function openMenu() {
	//grab the menu element
	var menu = document.getElementById('menu-list');

	//to open it -> add the open class
	if ( menu.classList.contains("open") ) {
		menu.classList.remove("open");
	} else {
		menu.classList.add("open");
	}
}
