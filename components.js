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


class ActionBar{
	_element = undefined;
	_action_elements = [];
	constructor(classes){
		const element = document.createElement("div");
		(classes||[]).forEach(value => element.classList.add(value));
	}

	get element(){
		return this._element;
	}
}

class Table{

	_element = undefined;
	_parent = undefined;
	header = undefined;
	rows = new Array();

	constructor(parent,classes){
		const element = document.createElement("table");		
		element.classList.add("table")
		classes.forEach(value => element.classList.add(value))
		this._parent = parent;
		this._element = element;
		parent.appendChild(this._element);
	}

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

	getRow(index){

	}

	update(){}
}


class CustomizerTool{
	_main;
	_drag = false;
	_colorSelect;
	_open = true;
	_csshandle = undefined;
	_fieldDiv = undefined;
	_options = {
		name:"customizer0",
		fields:{
			"body-bg-color":{
				name:"Background Color",
				type:"color",kind:"input",
				config: (element) => {}
			}
		}
	}

	constructor(element, options, csshandle){
		const mainDiv = document.getElementById("customizer");
		//add drag event
		const ref = this;
		mainDiv.addEventListener("mousedown",event => {
			ref.onDragStart(event);
		});
		mainDiv.addEventListener("mouseup",event => {
			ref.onDragEnd(event);
		});
		document.addEventListener("mousemove",event => {
			ref.onMouseMove(event);
		});
		this._main = mainDiv;

		this._options = options || this._options;

		this._fieldDiv = document.createElement("div");
		this._fieldDiv.classList.add("customizer-options");

		//settup inputs
		Object.entries(this._options.fields).forEach(([key,value]) => {
			//create element
			const div = document.createElement("div");
			div.classList.add("customizer-option");

			const element = document.createElement(value.kind);
			element.id = `${this._options.name}-${key}`;
			element.type = value.type;
			if(value.config){value.config(element);}
			div.appendChild(element);

			//create label
			if(value.name){
				const label = document.createElement("label");
				label.setAttribute("for",`${this._options.name}-${key}`);
				label.innerText = value.name;
				div.appendChild(label);
			}

			//setup onchange events
			element.customizer_ref = this;
			element.css_prop = csshandle[key];
			element.value = element.css_prop.value;
			element.onchange = this.onPropChange;
			this._fieldDiv.appendChild(div)
		});

		this._main.customizer = this;
		this._main.appendChild(this._fieldDiv);
		this._open = this._main.getAttribute("closed");
		this._csshandle = csshandle;
		//this.toggle();
	}

	toggle(){
		if(this._fieldDiv){
			const style = getComputedStyle(this._fieldDiv);			
			if(this._open){
				this._main.setAttribute("closed",true);
				this._open = false;
			} else {
				this._main.setAttribute("closed",false);
				this._open = true;
			}
		}
	}

	onPropChange(event){
		const target = event.target;
		if(event.target.customizer_ref){
			target.css_prop.value = target.value;
			//target.value = target.css_prop;
		}
	}

	onDragStart(event) {	
		this._drag = true;
	}

	onDragEnd(event) {
		this._drag = false;
	}

	onMouseMove(event){
		if(this._drag&&event.altKey){
			const height = this._main.clientHeight;
			const width = this._main.clientWidth;
			this._main.style.top = event.pageY-(height/2)+"px";
			this._main.style.left = event.pageX-(width/2)+"px";
		}
	}

	update(){}
};


class ActionComponent{
	_element = undefined;
	constructor(element){
		this._element = element;
		const ref = this;
		this._element.onclick = (event) =>{ ref.onClick(event,ref); }
	}

}


class ElementWrapper{
	_element = undefined;
	constructor(element_name){
		this._element = document.createElement(element_name);
		
		this._element.element_wrapper = this;
		this._props = props;
		this._props.forEach(prop => {
			this._element.style[prop] = this._element[prop];
		});
	}
}
