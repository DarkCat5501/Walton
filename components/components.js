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

class ColorPicker extends ElementWrapper{
	_sprectrum_map; _hue_map;_static_hue = true;
	_currentColor = '';_currentHueColor = '';_h = 0; _s = 1; _l = .5;
	constructor(element,static_hue = true){
		super(element || "div");
		this._static_hue = static_hue;
		this.addClasses(["color-picker"]);
		this._sprectrum_map = new ElementWrapper("div");
		this._hue_map = new ElementWrapper("div");
		this._sprectrum_map.addClasses(["spectrum-map"]);
		this._hue_map.addClasses(["hue-map"]);
		this._sprectrum_map._canvas = new ElementWrapper("canvas");
		this._sprectrum_map._canvas_ctx = this._sprectrum_map._canvas.element.getContext("2d");
		this._sprectrum_map._canvas_rect = this._sprectrum_map._canvas.element.getBoundingClientRect();
		this._sprectrum_map._cursor = new ElementWrapper("button");
		this._hue_map._cursor = new ElementWrapper("button");
		this._sprectrum_map._cursor.addClasses(["color-cursor"]);
		this._hue_map._cursor.addClasses(["color-cursor"]);
		this._hue_map._canvas = new ElementWrapper("canvas");
		this._hue_map._canvas_ctx = this._hue_map._canvas.element.getContext("2d");
		this._hue_map._canvas_rect = this._hue_map._canvas.element.getBoundingClientRect();
		this._hue_map._canvas.append(this._hue_map);
		if(static_hue) { this._hue_map.addClasses(["static-hue"]); }
		this._sprectrum_map._canvas.append(this._sprectrum_map);
		this._sprectrum_map._cursor.append(this._sprectrum_map);
		this._hue_map._cursor.append(this._hue_map);
		this._sprectrum_map.append(this);
		this._hue_map.append(this);
		const ref = this;
		this._element.toggle = () => ref.toggle();
		this._sprectrum_map.element.addEventListener('mousedown',(event) => { ref._startSpectrum(event); });
		this._hue_map.element.addEventListener('mousedown',(event) => { ref._startHue(event); });
		this.updateSpectrum(); this.updateHue();
		if(!static_hue) this.updateHue();
	}
	_refreshElementRects() {
		this._hue_map._canvas_rect = this._hue_map._canvas.element.getBoundingClientRect();
		this._sprectrum_map._canvas_rect = this._sprectrum_map._canvas.element.getBoundingClientRect();
	}
	_startSpectrum(event){ 
		//getSpectrumColor(event);
		const ref = this; this._sprectrum_map._cursor.addClasses(['dragging']);
		this._getSpectrum(event);
		this.__mouse_move_event_spectrum = (event) => ref._getSpectrum(event);
		window.addEventListener('mousemove',this.__mouse_move_event_spectrum);
		window.addEventListener('mouseup',(event) => ref._endSpectrum(event));
	}
	_getSpectrum(event){
		event.preventDefault();
		this._refreshElementRects();
		let _x = event.pageX - this._sprectrum_map._canvas_rect.left;
		let _y = event.pageY - this._sprectrum_map._canvas_rect.top;
		if(_x > this._sprectrum_map._canvas_rect.width) { _x = this._sprectrum_map._canvas_rect.width; }
		else if(_x < 0) {_x = 0;}
		if(_y > this._sprectrum_map._canvas_rect.height) { _y = this._sprectrum_map._canvas_rect.height; }
		else if(_y < 0) {_y = 0;}
		const xR = _x/this._sprectrum_map._canvas_rect.width;
		const yR = _y/this._sprectrum_map._canvas_rect.height;
		const hsvValue = 1 - yR;
		this._l = (hsvValue / 2) * (2 - xR);
		this._s = (hsvValue * xR) / (1 - Math.abs(2 * this._l -1));
		this._currentColor = tinycolor('hsl ' + this._h + ' ' + this._s + ' ' + this._l).toHexString();
		this._updateSpectrumCursor(_x,_y);
	}
	_endSpectrum(event){
		this._sprectrum_map._cursor.removeClasses(['dragging']);
  		window.removeEventListener('mousemove',this.__mouse_move_event_spectrum);
	}
	_startHue(event){ 
		//getHueColor(event);
		const ref = this; this._hue_map._cursor.addClasses(['dragging']);
		this._getHue(event);
		this.__mouse_move_event_hue = (event) => ref._getHue(event);
		window.addEventListener('mousemove',this.__mouse_move_event_hue);
		window.addEventListener('mouseup',(event) => ref._endHue(event));
	}
	_getHue(event){
		event.preventDefault();
		this._refreshElementRects();
		var _y = event.pageY - this._hue_map._canvas_rect.top;
		if (_y > this._hue_map._canvas_rect.height){ _y = this._hue_map._canvas_rect.height; }
		else if (_y < 0) { _y = 0};
		const percent = _y / this._hue_map._canvas_rect.height;
		this._h = 360 - (360 * percent);
		this._currentColor = tinycolor('hsl ' + this._h + ' ' + this._s + ' ' + this._l).toHexString();
		this._currentHueColor = tinycolor('hsl ' + this._h + ' 1 .5').toHexString();
		this.updateSpectrum();
		this._updateHueCursor(_y);
	}
	_endHue(event){
		this._hue_map._cursor.removeClasses(['dragging']);
  		window.removeEventListener('mousemove',this.__mouse_move_event_hue);
	}
	_updateHueCursor(y) { 
		this._hue_map._cursor.element.style.top = y + "px";
		this._hue_map._cursor.element.style["background-color"] = this._currentHueColor;
	}
	_updateSpectrumCursor(x, y) {
		this._sprectrum_map._cursor.element.style.left = x + 'px';
		this._sprectrum_map._cursor.element.style.top = y + 'px';
		this._sprectrum_map._cursor.element.style["background-color"] = this._currentColor;
	};

	updateSpectrum() {
		const canvas = this._sprectrum_map._canvas.element;
		const ctx = this._sprectrum_map._canvas_ctx;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if(!this._currentHueColor) this._currentHueColor = '#ff0000';
		ctx.fillStyle = this._currentHueColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
		var whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
		whiteGradient.addColorStop(0, "#fff"); whiteGradient.addColorStop(1, "transparent");
		ctx.fillStyle = whiteGradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
		var blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		blackGradient.addColorStop(0, "transparent"); blackGradient.addColorStop(1, "#000");
		ctx.fillStyle = blackGradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
		if(!this._currentColor) this._currentColor = '#ffffff';
		this._sprectrum_map._cursor.element.style["background-color"] = this._currentColor;
	};
	updateHue() {
		if(!this._static_hue){
			const canvas = this._sprectrum_map._canvas.element;
			const ctx = this._sprectrum_map._canvas_ctx;
			var hueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			hueGradient.addColorStop(0.00, "hsl(0, 100%, 50%)");
			hueGradient.addColorStop(0.17, "hsl(298.8, 100%, 50%)");
			hueGradient.addColorStop(0.33, "hsl(241.2, 100%, 50%)");
			hueGradient.addColorStop(0.50, "hsl(180, 100%, 50%)");
			hueGradient.addColorStop(0.67, "hsl(118.8, 100%, 50%)");
			hueGradient.addColorStop(0.83, "hsl(61.2, 100%, 50%)");
			hueGradient.addColorStop(1.00, "hsl(360, 100%, 50%)");
			ctx.fillStyle = hueGradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		if(!this._currentHueColor) this._currentHueColor = '#ff0000';
		this._hue_map._cursor.element.style["background-color"] = this._currentHueColor;
	};

	_colorToHue(color) {
		this._refreshElementRects();
		const c = tinycolor(color);
		this._currentHueColor = tinycolor('hsl ' + c.toHsl().h + ' 1 .5').toHslString();
		const _y = (360 - color.toHsl().h) / 360 * this._hue_map._canvas_rect.height;
		this._updateHueCursor(_y);
	};
	_colorToPos(color) {
		const c = tinycolor(color); const hsl = c.toHsl();const hsv = color.toHsv();
		this._h = hsl.h; 
		const _x = hsv.s * this._sprectrum_map._canvas_rect.width;
		const _y = (1 - hsv.v) * this._sprectrum_map._canvas_rect.height;
		const hueY = (360 - hsl.h) / 360 * this._hue_map._canvas_rect.height;
		this._updateSpectrumCursor(_x, _y);
		this._updateHueCursor(hueY);
		this.update();
	};

	setColor(color){ this._colorToPos(color); this._colorToHue(color); }
	update(){ this.updateHue(); this.updateSpectrum(); }
	toggle(){
		if(!this._element.style.display){ this._element.style.display="none";}
		else { this._element.style.display="";}
	}
}

class Input extends ElementWrapper{
	constructor(type, placeholder="input"){
		super("input"); this._element.type = type;
		this._element.placeholder=placeholder;
		const ref = this; 
		this._element.onchange = (event) => ref.onChange(event);
		this._element.oninput = (event) => ref.onInput(event);
	}

	onInput(event){}
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
