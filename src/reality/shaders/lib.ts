// Shared GLSL chunks for reality shaders (WebGL2 / GLSL ES 3.00).
// Every shader receives the same uniforms so the canvas can drive any of them.

export const HEADER = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 u_res;      // canvas size in pixels
uniform float u_time;    // seconds
uniform vec2 u_mouse;    // 0..1, origin bottom-left
uniform float u_scroll;  // 0..1 page progress
uniform vec3 u_bg;       // reality tokens, linear-ish 0..1
uniform vec3 u_ink;
uniform vec3 u_accent;
uniform float u_dark;    // 1 dark scheme, 0 light
out vec4 o;
`;

export const NOISE = /* glsl */ `
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031,.1030,.0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x), mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<5;i++){ v+=a*vnoise(p); p=m*p; a*=.5; } return v; }
`;

export const UV = /* glsl */ `
vec2 uvAspect(){ vec2 uv = gl_FragCoord.xy / u_res; uv.x *= u_res.x / u_res.y; return uv; }
float grain(vec2 c){ return hash12(c + fract(u_time) * 97.0) - 0.5; }
`;

export const VERTEX = /* glsl */ `#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export function frag(body: string, opts: { noise?: boolean } = {}) {
  return HEADER + (opts.noise !== false ? NOISE : "") + UV + body;
}
