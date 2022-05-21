const dynamicElements = [];
const _main_container = new ElementWrapper(document.getElementById("main"));
const _root_element = new ElementWrapper(document.querySelector(":root"));
const _customizer_element = new ElementWrapper(document.getElementById("customizer"));
const _customizer_tool = new CustomizerTool(_customizer_element.element,{
	fields:{
		"body-bg-color":{
			name:"Background Color",
			type:"color",kind:"input",
		},
		"color-danger":{
			name:"Color danger",
			type:"color",kind:"input"
		},
		"color-warn":{
			name:"Color warn",
			type:"color",kind:"input"
		},
		"color-success":{
			name:"Color success",
			type:"color",kind:"input"
		},
		"table-header-bg-color":{
			name:"Color table header",
			type:"color",kind:"input"
		}
	}
},_root_element.css_variables);


function setup(){
	const mainTable = new Table(_main_container.element);
	{
	mainTable.addClasses(["full"]);
	const deleteButton = document.createElement("button");
	deleteButton.classList.add(["btn-warn"]);
	deleteButton.innerHTML = "Delete";
	
	
	const checkBox = document.createElement("input");
	checkBox.type = "checkbox";
	checkBox.title = "disable";


	mainTable.addHeader(["mês","valor"],3)
	mainTable.addRow(["janeiro","10.0",deleteButton.cloneNode(true)],3);
	mainTable.addRow(["fevereiro","3.0",checkBox.cloneNode(true)],3);
	mainTable.addRow(["success","21.0",checkBox.cloneNode(true)],3,["success"]);
	mainTable.addRow(["março","21.0",checkBox.cloneNode(true)],3);
	mainTable.addRow(["danger","21.0",checkBox.cloneNode(true)],3,["danger"]);
	mainTable.addRow(["março","21.0",checkBox.cloneNode(true)],3);
	mainTable.addRow(["warn","21.0",checkBox.cloneNode(true)],3,["warn"]);
	mainTable.addRow(["março",checkBox.cloneNode(true),checkBox.cloneNode(true)],3);
	mainTable.addRow(["teste001","21.0",checkBox.cloneNode(true)],3);
	mainTable.addRow(["abril","30"],3);
	}

	mainTable.append(_main_container);
	dynamicElements.push(mainTable);

}

function update(){
	if(_customizer_tool){ _customizer_tool.update();}
	dynamicElements.forEach(element => element.update());
}