const _dynamic_elements = [];
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

async function get(url){
	return fetch(url).then(response => response.json() ).catch(err => console.log(err));
}

function setup(){
	const mainTable = new Table(_main_container.element);
	mainTable.addClasses(["full"]);
	
	get("https://economia.awesomeapi.com.br/json/daily/USD-BRL/10").then((data) => {
		let offset_data = new Date();
		data.forEach( value => {
			console.log(value);
			if("create_date" in value){  offset_data = new Date(value.create_date); }

			if("code" in value){
				mainTable.addHeader([`conversão ${value.name}`],1,["start-align","danger"]);
				mainTable.addHeader(["inicio","fim","% variação","data"],4);
			} else { const date =new Date( Number(offset_data) - Number(value.timestamp) ).toLocaleString();
				const p = new ElementWrapper(document.createElement("p"));p.element.innerText = `${value.pctChange}%`;
				p.element.style.color = value.pctChange>0?"var(--color-danger)":"var(--color-success)";
				mainTable.addRow([value.high,value.low, p.element ,date],4); }
		});
	});
	
	mainTable.append(_main_container);
	_dynamic_elements.push(mainTable);
}

function update(){
	if(_customizer_tool){ _customizer_tool.update();}
	_dynamic_elements.forEach(element => element.update());
}