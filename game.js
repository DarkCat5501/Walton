const { move, sequence, circle, looping } = require("./animations")

function loadImage(path){
	const img = document.createElement("img");
	img.src = path;
	img.style = "display:none";
	document.body.appendChild(img);
	return img;
}
class Rect {x;y;w;h;constructor(x,y,w,h){ Object.assign(this,{x,y,w,h}); }};
class Vec {
	x;y;constructor(x,y){ Object.assign(this,{x,y: y??x});}
	mul(f){
		return (f instanceof Vec) ?
			new Vec(this.x*f.x,this.y*f.y):
			new Vec(this.x*f,this.y*f);
	}
	add(f){ return new Vec(this.x+f.x,this.y+f.y); }
	sub(f){ return new Vec(this.x-f.x,this.y-f.y); }
	inc(f){ this.x+=f.x; this.y+=f.y; }
	dev(f){ this.x-=f.x; this.y-=f.y; }
};

class Context {
	/** @type {HTMLCanvasElement}*/
	canvas = null;
	/** @type {WebGL2RenderingContext}*/
	ctx = null;
	width = 0; height = 0;
	/** @type { Record<string,HTMLImageElement> }*/
	assets = {};
	/** @type { Record<string,(function*()=>Vec)[]> }*/
	animations = {};

	/** @type { Record<string,Vec> }*/
	enemies = {};

	constructor({ canvas, ctx, assets, animations,enemies }){
		Object.assign(this, { canvas, ctx, assets, animations, enemies });
		const thisRef = this;
		window.addEventListener("resize",()=>thisRef.resize())
		this.resize();
	}

	resize() {
		const { width, height } = document.body.getBoundingClientRect();
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
	}
}

function drawImage(ctx, rect, image){ 
	ctx.drawImage(image,rect.x,rect.y,rect.w,rect.h);
	ctx.strokeStyle = "#ff0000";
	ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);
}


function loadShader(ctx,type,src){
	console.log("loading shader", src);
	const shader = ctx.createShader(type);
	ctx.shaderSource(shader,src);
	ctx.compileShader(shader);
	const erros = ctx.getShaderInfoLog(shader);
	if(!!erros) throw new Error(`Error ao compilar shader: ${erros}`);
	return shader;
}

function setup(){
	/**@type {HTMLCanvasElement} */
	const canvas = document.getElementById("mainCanva")
	/**@type {WebGL2RenderingContext} */
	const ctx = canvas.getContext("webgl2")

	const resize = ()=>{
		const { width, height } = document.body.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
	}

	window.addEventListener("resize",resize)
	resize();

	console.assert(!!ctx, "canvas not initialized properly")

	//settup VAO

	// const VAO = ctx.createVertexArray();
	// const VBO = ctx.createBuffer();

	//load color frag

	
	const program = ctx.createProgram()
	const colorFrag = loadShader(ctx,ctx.FRAGMENT_SHADER,requestRaw("./color.frag",{},'GET',false).responseText )
	
	const vertex2d = loadShader(ctx,ctx.VERTEX_SHADER,requestRaw("./2d.vert",{},'GET',false).responseText )

	ctx.attachShader(program, colorFrag);
	ctx.attachShader(program, vertex2d);

	//ctx.deleteShader(colorFrag);//delete only fragment shader

	ctx.linkProgram(program);
	//console.log( ctx.getProgramInfoLog(program) )

	const posLoc = ctx.getAttribLocation(program,"pos");
	const resolution = ctx.getUniformLocation(program,"resolution");



	//VAO and VBO
	const VAO = ctx.createVertexArray()
	const VBO1 = ctx.createBuffer()
	const VBO2 = ctx.createBuffer()
	ctx.bindVertexArray(VAO);
	//posições
	ctx.bindBuffer(ctx.ARRAY_BUFFER, VBO1);

	const dataArray = new Float32Array([
		-1,-1,0,
		1,-1,0,
		1,1,0,
		-1,1,0,
	])
	//const sizeInBytes = dataArray.length * dataArray.BYTES_PER_ELEMENT;

	ctx.bufferData(ctx.ARRAY_BUFFER,dataArray,ctx.STATIC_DRAW);
	
	ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, VBO2);
	const indexArray = new Int32Array([0,1,2,0,2,3])
	ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER,indexArray,ctx.STATIC_DRAW);
	
	//ctx.enableVertexAttribArray(VAO);
	if(posLoc < 0){
		throw new Error("invalid attribute pos")
	}

	ctx.enableVertexAttribArray(posLoc);
	//gl.enableVertexAttribArray( copieShader.positionGl);
	ctx.vertexAttribPointer(posLoc,3,ctx.FLOAT, false, 0, 0);
	ctx.bindVertexArray(null);

	//ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
	//ctx.bindBuffer(ctx.ARRAY_BUFFER, null);


	return {
		ctx, program, VAO, resolution
	}



	// const program = ctx.createProgram();

	// const fshader = ctx.createShader(ctx.FRAGMENT_SHADER);
	// const vshader = ctx.createShader(ctx.VERTEX_SHADER);

	// ctx.shaderSource(fshader,`
	// void main(){
	// 	gl_FragColor = vec4(1.0);
	// }
	// `)

	// ctx.compileShader(fshader);

	// console.log(ctx.getShaderInfoLog(fshader));
	
	// ctx.shaderSource(vshader,`

	// `)




	// return new Context({
	// 	canvas,ctx,
	// 	assets: {
	// 		//player: loadImage("./player.png"),
	// 		//miranha: loadImage("./miranha.png")
	// 	},
	// 	animations: {
	// 		miranha: looping(
	// 			sequence(
	// 				move(new Vec(100,400), new Vec(600,400)),
	// 				move(new Vec(600,400), new Vec(100,400))
	// 			)
	// 		)
	// 	},
	// 	enemies: {
	// 		miranha:{
	// 			pos: new Vec(0)
	// 		}
	// 	}
	// });
}

/**
 * draws a text on a canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text 
 * @param {Vec} position 
 */
function drawText(ctx, text, position, { color,font,align} = { color: '#ff9900', font:"10px monospace", align:"left" }){
	if(font) ctx.font = font;
	if(color) ctx.fillStyle = color
	if(align) ctx.textAlign = align
	ctx.fillText(text,position.x,position.y);
}

/**
 * 
 * @param {Context} param0 
 * @param {number} fpsDelta 
 */
// function loop({ ctx, width , height, assets, enemies, animations }, fpsDelta){
function loop({ ctx, program, VAO,resolution }, fpsDelta){
	
	ctx.bindVertexArray(VAO);
	ctx.useProgram(program);
	ctx.uniform2f(resolution,ctx.canvas.width, ctx.canvas.height);

	ctx.viewport(0,0,ctx.canvas.width,ctx.canvas.height);
	
	ctx.drawElements(ctx.TRIANGLES,6,ctx.UNSIGNED_INT,0);

	ctx.bindVertexArray(null);
	ctx.useProgram(null);

	
	// drawText(ctx,"hello",10,10);

	// ctx.clearRect(0,0,width, height);

	// ctx.
	// ctx.ellipse(width/2,height/2,100,100,0,0,0);

	// {	
	// 	enemies.miranha.pos =  animations.miranha.next(fpsDelta*0.5).value ?? enemies.miranha.pos;
	// 	drawImage(ctx,{ ...enemies.miranha.pos ,w:200,h:200},assets.miranha);
	// }
	// {
	// 	drawImage(ctx,{x:200,y:10,w:200,h:200},assets.player);
	// }

	// drawText(ctx, "PLAYYYY!", new Vec(width/2,height/2), {font:"100px mono",align:"center",color:"white"})
}

exports.setup = setup;
exports.loop = loop;