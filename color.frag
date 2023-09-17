precision mediump float;

uniform vec2 resolution;

float circle(vec2 pos, float r){
	return length(pos) - r;
}

void main(){
	vec2 coord = gl_FragCoord.xy;

	vec2 uv =  (coord - (resolution.xy * 0.5 ))/max( resolution.x,resolution.y);

	float c0 =abs(circle(uv,0.3));
	float c1 = abs( circle(uv,0.2) );


	float d = smoothstep(0.01,0.0,min(c0,c1));

	

	vec3 color = mix(
		vec3(0.1,0.1,0.1),
		vec3(1.0,0.8,0.0),
		vec3(d));

	gl_FragColor = vec4(color, 1.0);
}