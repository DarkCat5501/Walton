const _root_element = new ElementWrapper(document.querySelector(":root"));
globalObserver.observe(_root_element.element, {childList: true, subtree: true, attributes: true });
const _dynamic_elements = [];
const _main_container = new ElementWrapper(document.getElementById("main"));

function setup(){}

function update(){
	_dynamic_elements.forEach(element => element.update());
}
