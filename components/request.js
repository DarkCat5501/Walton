const request = ( url, params = {}, method = 'GET' ) => {
    let options = { method };
    if ( 'GET' === method ) { url += '?' + ( new URLSearchParams( params ) ).toString(); }
    else { options.body = JSON.stringify( params ); }
    return fetch( url, options ).then( response => response.json() );
};

const requestRawFetch = ( url, params = {}, method = 'GET' ) => {
    let options = { method };
    if ( 'GET' === method ) { url += '?' + ( new URLSearchParams( params ) ).toString(); }
    else { options.body = JSON.stringify( params ); }
    return fetch( url, options ).then( response => response.text() );
};

async function requestRaw( url,params={},method = 'GET',async = true ){
    const requester = new XMLHttpRequest();    
    if ( 'GET' === method ) { url += '?' + ( new URLSearchParams( params ) ).toString(); }
    else { options.body = JSON.stringify( params ); }
    requester.open(method, url,async);

    // const output = new Promise( (resolve,reject) => {
        
    //     requester.onreadystatechange = ()=>{
    //         if (requester.readyState=== 4 && requester.status === 200) {
    //             resolve(requester.response)
    //         } else {
    //             reject(requester.response);
    //         }
    //     };  
    //     resolve("20")
    // })

    requester.send(params);
    return requester;
};

const get = ( url, params ) => request( url, params, 'GET' );
const post = ( url, params ) => request( url, params, 'POST' );
const getRaw = ( url, params, async) => requestRaw( url, params, 'GET',async);
const postRaw = ( url, params, async) => requestRaw( url, params, 'POST',async);
