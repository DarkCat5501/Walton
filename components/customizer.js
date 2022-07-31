class CustomizerTool {
  //default variables
  _element;
  _css_handler;
  _drag = false;
  _open = true;
  _field;
  _options = {};

  constructor(element, options, css_handler) {
    this._element = element;
    //add drag event
    const ref = this;
    this._element.addEventListener("mousedown", (event) =>
      ref.onDragStart(event)
    );
    this._element.addEventListener("mouseup", (event) => ref.onDragEnd(event));
    this._element.addEventListener("mousemove", (event) =>
      ref.onMouseMove(event)
    );

    this._options = options || this._options;
    this._field = document.createElement("div");
    this._field.classList.add("customizer-options");

    //settup input variables
    Object.entries(this._options.fields).forEach(([key, value]) => {
      //create element
      const div = document.createElement("div");
      div.classList.add("customizer-option");
          //create label
          const variable = document.createElement(value.kind);
          const variable_id = `${this._options.name}-${key}`;
          variable.id = variable_id;
          variable.type = value.type;
          if (value.config) { value.config(variable); }
          div.appendChild(variable);
          if (value.name) {
            const label = document.createElement("label");
            label.setAttribute("for", variable_id);
            label.innerText = value.name;
            div.appendChild(label);
          }
      //setup onchange events
      variable._customizer_ref = this;
      variable._css_prop = css_handler[key];
      variable.value = variable._css_prop.value;
      variable.onchange = variable.oninput = this.onPropChange;
      this._field.appendChild(div);
    });

    this._element._customizer = this;
    this._element.appendChild(this._field);
    this._open = this._element.getAttribute("closed");
    this._css_handler = css_handler;
    this._element.toggle = () => ref.toggle();
    this.toggle();
  }

  toggle() {
    if (this._field) {
      const style = getComputedStyle(this._field);
      if (this._open) {
        this._element.setAttribute("closed", true);
        this._open = false;
      } else {
        this._element.setAttribute("closed", false);
        this._open = true;
      }
    }
  }

  onPropChange(event) {
    const target = event.target;
    if (event.target._customizer_ref) {
      target._css_prop.value = target.value;
    }
  }

  onDragStart(event) {
    this._drag = true;
  }

  onDragEnd(event) {
    this._drag = false;
  }

  onMouseMove(event) {
    if (this._drag && event.altKey) {
      const height = this._element.clientHeight;
      const width = this._element.clientWidth;
      this._element.style.top = event.pageY - height / 2 + "px";
      this._element.style.left = event.pageX - width / 2 + "px";
    }
  }

  update(){}
}
