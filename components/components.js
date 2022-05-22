/**
 * @brief used to maintain a reference to some given object
 */
class VariableRef{
	_variable = undefined;
	_setterCallback = (variable, value) => variable = value;
	_getterCallback = (variable) => variable;

	constructor(variable, setterCallback, getterCallback){
		this._variable = variable;
		if(setterCallback){this._setterCallback = setterCallback;}
		if(getterCallback){this._getterCallback = getterCallback;}
	}

	set value(content){
		this._setterCallback(this._variable, content);
	}

	get value(){
		return this._getterCallback(this._variable);
	}
}

/**
 * @brief used to manipulate css variables in the context of a given element
 */
class CssVariables{

	_target = undefined;
	vars = {};

	constructor(target){
		this._target = target;
		return new Proxy(this, {
			get: (obj, key) => {
				if(!Object.keys(obj.vars).includes(key)){
					obj.vars[key] = new VariableRef(key,
						(name,value) => { obj.setVariable(name,value); },
						(name) => obj.getVariable(name));
				}
				return obj.vars[key];
			},
			set: (obj, key,value) => obj.setVariable(key,value)
		});
	}

	getVariable(name){
		const rs = getComputedStyle(this._target);
		return rs.getPropertyValue(`--${name}`);
	}

	setVariable(name, value){
		this._target.style.setProperty(`--${name}`,value);
	}

}

/**
 * @brief just a simpler and more direct way of creating a dom element
 * with self reference to it
 */
 class ElementWrapper{
	_element;
	/**
	 * @brief creates a new element wrapper based on an element, tag or clones from another element wrapper
	 * @param element tag, element or element wrapper
	 * @param deep if true and element is a element wrapper, will clone the element and all its children
	 */
	constructor(element,deep = true){
		if(!(element instanceof HTMLElement || element instanceof ElementWrapper  || typeof element === "string"))
		{  throw `Unable to create element wrapper for element`;}
		if(typeof element === "string"){ this._element = document.createElement(element); }
		else if (element instanceof HTMLElement){ this._element = element;}
		else if (element instanceof ElementWrapper){ this._element = element._element.cloneNode(deep); }
		this._element.element_wrapper = this;
		this._element.css_variables = new CssVariables(this._element);
	}
	//functions
	append(target){
		if(!(target instanceof HTMLElement || target instanceof ElementWrapper)){ throw "Unable to append element to target!"; }
		(target instanceof HTMLElement)? target.append(this._element) : target.element.append(this._element);
	}

	prepend(target){
		if(!(target instanceof HTMLElement || target instanceof ElementWrapper)){ throw "Unable to prepend element to target!"; }
		(target instanceof HTMLElement)? target.prepend(this._element) : target.element.prepend(this._element);
	}

	prepend(target){
		if(!(target instanceof HTMLElement || target instanceof ElementWrapper)){ throw "Unable to prepend element to target!"; }
		(target instanceof HTMLElement)? target.prepend(this._element) : target.element.prepend(this._element);
	}

	after(target){
		if(!(target instanceof HTMLElement || target instanceof ElementWrapper)){ throw "Unable to after element to target!"; }
		(target instanceof HTMLElement)? target.after(this._element) : target.element.after(this._element);
	}

	before(target){
		if(!(target instanceof HTMLElement || target instanceof ElementWrapper)){ throw "Unable to before element to target!"; }
		(target instanceof HTMLElement)? target.before(this._element) : target.element.before(this._element);
	}

	clone(deep = true){ 
		const newThis = new ElementWrapper(this._element.cloneNode(deep));
		const oldCopy = {}; Object.assign(oldCopy,{ ...this, ...newThis });
		return Object.assign(Object.create(ElementWrapper.prototype),oldCopy);
	}
	cloneTo(target, deep = true){ const clone = this.clone(deep); clone.attach(target); return clone; }

	//css related functions
	addClasses(classes){ (classes||[]).forEach(value => this._element.classList.add(value)); }
	removeClasses(classes){ (classes||[]).forEach(value => this._element.classList.remove(value)); }

	//getters
	get element(){ return this._element; }
	get css_variables(){ return this._element.css_variables; }

	update(){}//TODO: implement
}

class Input extends ElementWrapper{
	constructor(type){
		super("input");
		this._element.type = type;
		const ref = this;
		this._element.onchange = (event) => ref.onChange(event);
	}

	onChange(event){}
}

class CheckBox extends Input{
	constructor(title){
		super("checkbox"); this._element.title = title;
	}

	onChange(event){
		console.log(event);
	}
}

class Button extends ElementWrapper {
	on_click_events = [];
	constructor(title){
		super("button"); this._element.innerText = title;
		const ref = this;
		this._element.onclick = (event) => ref.onClick(event);
	}

	clone(deep){
		const newButton = Object.assign(Object.create(Button.prototype),super.clone(deep));
		const ref = this; newButton._element.onclick = (event) => ref.onClick(event);
		return newButton;
	}

	onClick(event){ this.on_click_events.forEach(callback => callback(event)); }
}

class Table extends ElementWrapper{
	headers = new Array(); rows = new Array();

	constructor() { super("table"); this._element.classList.add("table"); }

	addHeader(values,cols,classes){
		const newRow = document.createElement("tr");
		(classes||[]).forEach(value => newRow.classList.add(value));

		if(cols!==undefined){
			for(let i=0;i<cols;i++){
				const newCell = document.createElement("th");
				if(values[i] instanceof(HTMLElement)){
					newCell.appendChild(values[i])
				} else {
					newCell.innerHTML = values[i] || " - - - ";
				}
				newRow.appendChild(newCell);
			}
		} else {
			values.forEach(value => {
				const newCell = document.createElement("th");
				if(value instanceof(HTMLElement)){
					newCell.appendChild(value)
				} else {
					newCell.innerHTML = value || " - - - ";
				}
				newRow.appendChild(newCell);
			});	
		}

		this.rows.push(newRow);
		this._element.appendChild(newRow);
	}

	addRow(values,cols,classes){
		const newRow = document.createElement("tr");
		(classes||[]).forEach(value => newRow.classList.add(value));

		if(cols!==undefined){
			for(let i=0;i<cols;i++){
				const newCell = document.createElement("td");
				if(values[i] instanceof(HTMLElement)){
					newCell.appendChild(values[i])
				} else {
					newCell.innerHTML = values[i] || " - - - ";
				}
				newRow.appendChild(newCell);
			}
		} else {
			values.forEach(value => {
				const newCell = document.createElement("td");
				newCell.innerHTML = value;
				newRow.appendChild(newCell);
			});	
		}

		this.rows.push(newRow);
		this._element.appendChild(newRow);
	}

}
