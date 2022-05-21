const dynamicElements = [];
var mainContainer = undefined;
var rootElement = undefined;
var mainCssVariables = undefined;
var customizer = undefined;


function setup(){
	mainContainer = document.getElementById("main");
	rootElement = document.querySelector(":root");
	mainCssVariables = new CssVariables(rootElement);


	const mainTable = new Table(mainContainer,["full"]);
	
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
	mainTable.addRow(["março","21.0",checkBox.cloneNode(true)],3);
	mainTable.addRow(["abril","30"],3);


	dynamicElements.push(mainTable);


	customizer = new CustomizerTool(undefined,{
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
		}
	},mainCssVariables);
}

function update(){
	if(customizer){
		customizer.update();	
	}
	dynamicElements.forEach(element => element.update());
}