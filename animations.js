
function lerp(a,b,t){ 
	return a.add( b.sub(a).mul(t) );
}

function bezier(a,b,c,t){
	const abp = learp(a,b,t)
	const bcp = learp(b,c,t)
	return learp(abp,bcp,t);
}

function animation(anim, ...params){
	return ()=>anim(...params)
}

function* compose(map,...fns){ 
	let args = [];
	while(true){
		args = yield map(fns.map( fn => fn.next(args) ));
	} 
		
}
 /**
  * @param {Vec} a 
  * @param {Vec} b 
  * @param {Vec} v 
  */
function move(a,b){
	return function*(){
		let delta = 0;
		for(let t=0;t<=1.0; t+=delta ) delta = (yield lerp(a,b,t))
		return b;
	}
}

function* circle(s0,s1,phi = 1.0, deltaStart = 0.0){
	let angle = deltaStart;//TODO: set starting angle
	const v = new Vec(phi*Math.cos(angle),phi*Math.sin(angle))
	let delta = 0.0;
	while(true){
		for(;angle<=s1;angle+=delta){
			v.x = phi*Math.cos(angle); v.y = phi*Math.sin(angle);
			delta = (yield v)??delta;
		}
		angle=s0;
	}
}


function sequence(...animations){
	return function*(){
		let args = undefined;
		for(let anim of animations){
			if(typeof anim==="function") anim = anim()
			while(true){
				const {value,done} = anim.next(args)
				args = (yield value)??args;
				if(done)break;
			}
		}
	}
}

function* looping(animation) {
	let fn = animation();
	let args;
	while(true){
		const {value,done} = fn.next(args);
		args = (yield value)??args;
		if(done) fn = animation();
	}
}



// class Animation {
// 	/**@type {Any} */
// 	fn;
// 	/**@type {Any[]} */
// 	params = [];

// 	_lastValue = undefined
// 	_generator = undefined;

// 	start(...args){
// 		this._generator = this.fn(...this.params);
// 	}

// 	frame(...args){
// 		const {value,done} = this._generator.next(...args);
// 		if(done) this.end();
// 		return value;
// 	}

// 	end(...args){
// 		delete this._generator;
// 		this._generator = undefined
// 	}
// }

//exports.Animation = Animation;

exports.move = move
exports.sequence = sequence
exports.circle = circle
exports.looping = looping