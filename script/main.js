//base overload  functions
Array.prototype.end = function(){ return this[this.length-1]; }


//base request library
async function request( url, params = {}, method = 'GET' ){
    let options = { method };
    if ( 'GET' === method ) { url += '?' + ( new URLSearchParams( params ) ).toString(); }
    else { options.body = JSON.stringify( params ); }
    return fetch( url, options )
};

const requestRawFetch = ( url, params = {}, method = 'GET' ) => {
    let options = { method };
    if ( 'GET' === method ) { url += '?' + ( new URLSearchParams( params ) ).toString(); }
    else { options.body = JSON.stringify( params ); }
    return fetch( url, options ).then( response => response.text() );
};

function requestRaw( url,params={},method = 'GET',async = true){
    const requester = new XMLHttpRequest();    
    if ( 'GET' === method ) { url += '?' + ( new URLSearchParams( params ) ).toString(); }
    else { options.body = JSON.stringify( params ); }
    requester.open(method, url,async);
	if(async) {
		const output = new Promise((resolve, reject) => {
			requester.onreadystatechange = ({ target:req }) => {
				switch(req.readyState){
					//ignore all of this cases for now
					// 0: /*UNSET*/ //TODO: handle UNSET state
					// 1: /*OPENED*/
					// 2: /*HEADERS_RECEIVED*/
					// 3: /*LOADING*/
					case 4: //DONE
						if(req.status >=400 && req.status <= 599){
							reject();
							return;
						}break;
					default: return;
				}
				resolve(req);
			}
			
		})
		requester.send(params);
		return output;
	}
	requester.send(params);
	return requester;
};

const get = ( url, params ) => request( url, params, 'GET' );
const post = ( url, params ) => request( url, params, 'POST' );
const getRaw = ( url, params, async) => requestRaw( url, params, 'GET',async);
const postRaw = ( url, params, async) => requestRaw( url, params, 'POST',async);

/**
 * requires an external module
 * @param {string} module 
 */
function require(module) {
	let m_data = module.split(".");
	m_data = (m_data.end() ==="js"? m_data.slice(undefined,-1) : m_data).join(".");
	
	const { responseText: data } = requestRaw(`${m_data}.js`,{},"GET",false);
	return eval(`
		const exports = {}
		${data}
		exports;
	`)
}


window.onload = () => {
	const { setup , loop } = require("game");
	const context = setup();
	let deltaStart = 0;
	//let deltaStart = new Date();

	const runFrame = (timestamp) => {
		const fps =  timestamp - deltaStart;
		loop(context, fps/1000 );
		deltaStart = timestamp;
		requestAnimationFrame(runFrame);
	}
	requestAnimationFrame(runFrame)

	// setInterval(() => {
	// 	const now = new Date();
	// 	let fps = now - deltaStart
	// 	deltaStart = now
	// 	console.log(fps)
	// 	loop(context, fps/1000)
	// }, (1/60)*1000);
}