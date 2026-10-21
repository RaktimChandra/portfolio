import { frag } from "./lib";

// One fragment shader per reality. Each is a full-screen field drawn behind the
// page. Keep them cheap: the canvas renders at reduced resolution.

export const SHADERS: Record<string, string> = {
  // Default. Slow bronze light pooling through a dark lab glass field.
  glass: frag(`
void main(){
  vec2 uv = uvAspect();
  float t = u_time * 0.04;
  vec2 m = u_mouse * vec2(u_res.x/u_res.y, 1.0);
  float f = fbm(uv * 1.6 + vec2(t, -t*0.7) + fbm(uv*2.0 - t)*0.8);
  float pool = smoothstep(0.85, 0.0, distance(uv, m)) * 0.35;
  float band = smoothstep(0.35, 0.95, f);
  vec3 col = u_bg;
  col = mix(col, u_accent, band * 0.22 + pool * 0.25);
  col = mix(col, u_ink, pow(band, 4.0) * 0.06);
  col += grain(gl_FragCoord.xy) * 0.035;
  o = vec4(col, 1.0);
}`),

  // Web 1.0: a hand-tiled background, like a GeoCities page.
  web1: frag(`
void main(){
  vec2 p = gl_FragCoord.xy;
  vec2 tile = floor(p / 64.0);
  vec2 q = mod(p, 64.0) / 64.0;
  float n = vnoise(p * 0.15) * 0.5 + vnoise(p * 0.03) * 0.5;
  float star = step(0.985, hash12(floor(p/3.0))) * (0.6 + 0.4*sin(u_time*3.0 + hash12(floor(p/3.0))*40.0));
  vec3 col = u_bg + (n - 0.5) * 0.08;
  float edge = step(q.x, 0.015) + step(q.y, 0.015);
  col -= edge * 0.03;
  col = mix(col, vec3(1.0), star * 0.5 * u_dark);
  o = vec4(col, 1.0);
}`),

  // Topographic: contour lines of an evolving height field; the cursor raises a hill.
  topographic: frag(`
void main(){
  vec2 uv = uvAspect();
  vec2 m = u_mouse * vec2(u_res.x/u_res.y, 1.0);
  float h = fbm(uv * 2.2 + u_time * 0.015) + 0.35 * exp(-8.0 * dot(uv - m, uv - m));
  float lines = 26.0;
  float v = fract(h * lines);
  float w = fwidth(h * lines) * 1.2;
  float line = 1.0 - smoothstep(0.0, w, min(v, 1.0 - v));
  float major = 1.0 - smoothstep(0.0, w*1.6, min(fract(h*lines/5.0), 1.0-fract(h*lines/5.0)) * 5.0);
  vec3 col = mix(u_bg, u_ink, line * 0.22 + major * 0.25);
  col = mix(col, u_accent, major * 0.35);
  o = vec4(col, 1.0);
}`),

  // Psychedelic: domain-warped colour plasma cycling through the spectrum.
  psychedelic: frag(`
vec3 pal(float t){ return 0.5 + 0.5*cos(6.2831*(t + vec3(0.0, 0.33, 0.67))); }
void main(){
  vec2 uv = uvAspect() * 2.0;
  float t = u_time * 0.25;
  vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(uv + 3.0*q + vec2(1.7, 9.2) + t*0.6), fbm(uv + 3.0*q + vec2(8.3, 2.8)));
  float f = fbm(uv + 3.5 * r);
  vec3 col = pal(f * 1.6 + t * 0.4 + length(q));
  col = mix(col, col * col, 0.35);
  o = vec4(col, 1.0);
}`),

  // Watercolour: pigment blooms soaking into cold-press paper.
  watercolour: frag(`
void main(){
  vec2 uv = uvAspect();
  float t = u_time * 0.02;
  float paper = fbm(gl_FragCoord.xy * 0.35) * 0.06 + vnoise(gl_FragCoord.xy * 0.9) * 0.03;
  vec3 col = u_bg - paper;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = vec2(0.3 + 0.55*fi*0.5, 0.35 + 0.25*sin(fi*2.1)) * vec2(u_res.x/u_res.y, 1.0);
    c += 0.08 * vec2(sin(t*3.0 + fi), cos(t*2.0 + fi*1.7));
    float d = length(uv - c) + (fbm(uv * 3.5 + fi * 7.0 + t) - 0.5) * 0.35;
    float wash = smoothstep(0.42, 0.18, d);
    float rim = smoothstep(0.03, 0.0, abs(d - 0.36)) * 0.6;
    vec3 pig = i == 0 ? u_accent : (i == 1 ? mix(u_accent, vec3(0.2,0.4,0.7), 0.7) : mix(u_ink, vec3(0.75,0.45,0.5), 0.6));
    col = mix(col, col * pig * 1.1, (wash * 0.45 + rim * 0.35));
  }
  o = vec4(col, 1.0);
}`),

  // Teletext: Ceefax mosaic blocks in the 8-colour palette, on a CRT.
  teletext: frag(`
vec3 ttx(float k){
  k = floor(k * 7.999);
  if (k < 1.0) return vec3(0.0); if (k < 2.0) return vec3(1,0,0); if (k < 3.0) return vec3(0,1,0);
  if (k < 4.0) return vec3(1,1,0); if (k < 5.0) return vec3(0,0,1); if (k < 6.0) return vec3(1,0,1);
  if (k < 7.0) return vec3(0,1,1); return vec3(1);
}
void main(){
  vec2 cell = vec2(40.0, 25.0);
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 c = floor(uv * cell);
  vec2 sub = floor(fract(uv * cell) * vec2(2.0, 3.0));
  float row = c.y;
  float on = step(0.72, hash12(c * 3.1 + sub + floor(u_time * 0.5)));
  float colk = hash12(vec2(row, floor(u_time * 0.2)));
  vec3 col = ttx(colk) * on * 0.55;
  float band = step(cell.y - 2.0, c.y);
  col = mix(col, vec3(0.0, 0.0, 1.0) * 0.8, band);
  float scan = 0.85 + 0.15 * sin(gl_FragCoord.y * 3.14159);
  col *= scan;
  o = vec4(col, 1.0);
}`),

  // Origami: a folded paper plane of triangles lit from the cursor.
  origami: frag(`
void main(){
  vec2 uv = uvAspect() * 4.0;
  vec2 g = vec2(uv.x + uv.y * 0.5, uv.y * 0.866);
  vec2 i = floor(g); vec2 f = fract(g);
  float tri = step(f.x, f.y);
  vec2 id = i * 2.0 + tri;
  float h = hash12(id);
  float a = h * 6.2831 + u_time * 0.15;
  vec3 n = normalize(vec3(cos(a) * 0.6, sin(a) * 0.6, 1.0));
  vec2 m = u_mouse * vec2(u_res.x/u_res.y, 1.0) * 4.0;
  vec3 l = normalize(vec3(m - uv, 2.5));
  float d = clamp(dot(n, l), 0.0, 1.0);
  vec3 col = mix(u_bg * 0.82, u_bg * 1.08, d);
  col = mix(col, u_accent, step(0.93, h) * 0.5 * d);
  o = vec4(col, 1.0);
}`),

  // Thermal camera: heat palette over drifting warm bodies; the cursor is hot.
  thermal: frag(`
vec3 heat(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 c0=vec3(0.02,0.0,0.08), c1=vec3(0.2,0.0,0.55), c2=vec3(0.85,0.05,0.35), c3=vec3(1.0,0.55,0.0), c4=vec3(1.0,0.95,0.6);
  if (t < 0.25) return mix(c0,c1,t/0.25); if (t < 0.5) return mix(c1,c2,(t-0.25)/0.25);
  if (t < 0.75) return mix(c2,c3,(t-0.5)/0.25); return mix(c3,c4,(t-0.75)/0.25);
}
void main(){
  vec2 uv = uvAspect();
  float t = u_time * 0.1;
  float h = fbm(uv * 1.5 + vec2(t, t * 0.6)) * 0.7;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 c = vec2(0.5 + 0.45*sin(t*1.3 + fi*1.9), 0.5 + 0.35*cos(t + fi*2.7)) * vec2(u_res.x/u_res.y, 1.0);
    h += 0.18 * exp(-14.0 * dot(uv - c, uv - c));
  }
  vec2 m = u_mouse * vec2(u_res.x/u_res.y, 1.0);
  h += 0.45 * exp(-30.0 * dot(uv - m, uv - m));
  vec3 col = heat(h);
  col += grain(gl_FragCoord.xy) * 0.06;
  o = vec4(col, 1.0);
}`),

  // Memphis: confetti of squiggles, dots and triangles, Milan 1981.
  memphis: frag(`
float sdTri(vec2 p, float r){ const float k = 1.7320508; p.x = abs(p.x) - r; p.y = p.y + r/k;
  if (p.x + k*p.y > 0.0) p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0; p.x -= clamp(p.x, -2.0*r, 0.0); return -length(p)*sign(p.y); }
void main(){
  vec2 p = gl_FragCoord.xy / 120.0;
  vec2 cell = floor(p); vec2 f = fract(p) - 0.5;
  float h = hash12(cell); float h2 = hash12(cell + 17.0);
  float ang = h2 * 6.2831 + u_time * 0.2 * (h - 0.5);
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 q = rot * (f + (hash22(cell) - 0.5) * 0.3);
  float shape = 1.0;
  vec3 c = u_accent;
  if (h < 0.25) { shape = abs(q.y - 0.08 * sin(q.x * 25.0)) - 0.025; shape = max(shape, abs(q.x) - 0.32); c = u_ink; }
  else if (h < 0.45) { shape = length(q) - 0.09; c = vec3(0.98, 0.35, 0.45); }
  else if (h < 0.6) { shape = sdTri(q, 0.12); c = vec3(0.15, 0.75, 0.75); }
  else if (h < 0.7) { vec2 g = fract(q * 9.0) - 0.5; shape = max(length(g) - 0.18, length(q) - 0.25); c = u_ink; }
  float a = 1.0 - smoothstep(0.0, 0.01, shape);
  vec3 col = mix(u_bg, c, a * 0.85);
  o = vec4(col, 1.0);
}`),

  // Flow field: streamlines combed through curl noise.
  flowfield: frag(`
void main(){
  vec2 uv = uvAspect();
  float t = u_time * 0.03;
  float acc = 0.0;
  vec2 p = uv;
  for (int i = 0; i < 18; i++) {
    float a = fbm(p * 1.4 + t) * 6.2831 * 1.5;
    p += vec2(cos(a), sin(a)) * 0.006;
    acc += hash12(floor(p * 260.0));
  }
  acc /= 18.0;
  float s = smoothstep(0.52, 0.62, acc);
  vec3 col = mix(u_bg, u_ink, s * 0.35);
  float hue = fbm(uv * 1.2 - t);
  col = mix(col, u_accent, s * smoothstep(0.45, 0.75, hue) * 0.6);
  o = vec4(col, 1.0);
}`),

  // Neumorphism: soft extruded discs lifting out of the ground under a moving light.
  neumorphism: frag(`
void main(){
  vec2 uv = uvAspect();
  vec2 p = uv * 3.0;
  vec2 cell = floor(p); vec2 f = fract(p) - 0.5;
  float r = 0.28 + 0.06 * hash12(cell);
  float d = length(f) - r;
  vec2 light = normalize(vec2(-0.6, 0.8) + (u_mouse - 0.5) * 0.8);
  float rim = smoothstep(0.08, 0.0, abs(d));
  float side = dot(normalize(f + 1e-4), light);
  float inner = smoothstep(0.0, -0.06, d);
  vec3 col = u_bg;
  col += rim * side * 0.06 * (1.0 - inner);
  col -= rim * (-side) * 0.05 * (1.0 - inner);
  o = vec4(col, 1.0);
}`),

  // WordArt: a clip-art sunburst behind everything, 1995.
  wordart: frag(`
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float a = atan(uv.y, uv.x) + u_time * 0.05;
  float rays = step(0.5, fract(a * 16.0 / 6.2831));
  vec3 sky = mix(vec3(0.1, 0.3, 0.95), vec3(0.95, 0.4, 0.8), gl_FragCoord.y / u_res.y);
  vec3 col = mix(sky, sky * 1.25, rays * 0.35);
  col = mix(col, vec3(1.0, 0.9, 0.2), smoothstep(0.16, 0.12, length(uv)));
  o = vec4(col, 1.0);
}`),

  // Collage: torn paper scraps and halftone dots.
  collage: frag(`
void main(){
  vec2 p = gl_FragCoord.xy;
  vec3 col = u_bg - fbm(p * 0.2) * 0.05;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    vec2 c = vec2(hash12(vec2(fi, 3.0)), hash12(vec2(fi, 9.0))) * u_res;
    float ang = (hash12(vec2(fi, 5.0)) - 0.5) * 0.6;
    mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    vec2 q = R * (p - c);
    vec2 size = vec2(120.0 + 160.0 * hash12(vec2(fi, 1.0)), 80.0 + 120.0 * hash12(vec2(fi, 2.0)));
    float torn = (vnoise(q * 0.08) - 0.5) * 14.0;
    vec2 d = abs(q) - size;
    float box = max(d.x, d.y) + torn;
    vec3 paper = fi < 2.0 ? u_accent : (fi < 4.0 ? vec3(0.92, 0.88, 0.8) : vec3(0.85, 0.82, 0.86));
    if (box < 0.0) {
      vec2 g = fract(q / 9.0) - 0.5;
      float dot_ = step(length(g), 0.22) * step(5.0, fi);
      col = paper - dot_ * 0.25;
    }
    col -= smoothstep(6.0, 0.0, box) * step(0.0, box) * 0.08;
  }
  o = vec4(col, 1.0);
}`),

  // Datamosh: smeared macroblocks and broken motion vectors.
  datamosh: frag(`
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = floor(u_time * 8.0);
  vec2 block = floor(uv * vec2(24.0, 14.0));
  float glitch = step(0.8, hash12(block + t));
  vec2 shift = (hash22(block + t) - 0.5) * 0.12 * glitch;
  vec2 q = uv + shift;
  float bars = floor(q.x * 7.0);
  vec3 base = 0.5 + 0.5 * cos(6.2831 * (bars / 7.0 + vec3(0.0, 0.33, 0.67)));
  base = mix(u_bg, base, 0.55);
  float smear = vnoise(vec2(q.y * 40.0, t)) * glitch;
  vec3 col = mix(base, base.gbr, smear);
  col = mix(col, u_accent, step(0.97, hash12(block * 1.7 + t)) * 0.8);
  float rgb = 0.004 * glitch;
  col.r = mix(col.r, col.r * 1.2, step(0.5, fract(q.y * 200.0 + rgb * 1000.0)));
  o = vec4(col, 1.0);
}`),

  // Spirograph: hypotrochoid curves turning slowly, drawn in ink.
  spirograph: frag(`
float curve(vec2 p, float R, float r, float d, float rot){
  float best = 1e9;
  for (int i = 0; i < 180; i++) {
    float th = float(i) / 180.0 * 6.2831 * 7.0;
    vec2 c = vec2((R - r) * cos(th) + d * cos((R - r) / r * th), (R - r) * sin(th) - d * sin((R - r) / r * th));
    c = mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * c;
    best = min(best, length(p - c));
  }
  return best;
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float d1 = curve(p, 0.42, 0.15, 0.22, u_time * 0.05);
  float l = smoothstep(0.006, 0.0, d1);
  vec3 col = mix(u_bg, u_accent, l * 0.75);
  o = vec4(col, 1.0);
}`),

  // Aurora: green and violet curtains moving over a night sky.
  aurora: frag(`
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec3 col = mix(vec3(0.0, 0.02, 0.06), vec3(0.01, 0.06, 0.12), uv.y);
  float stars = step(0.997, hash12(floor(gl_FragCoord.xy / 2.0))) * (0.5 + 0.5 * sin(u_time + hash12(floor(gl_FragCoord.xy)) * 50.0));
  col += stars * 0.8;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float x = uv.x * (2.0 + fi) + u_time * (0.03 + fi * 0.01);
    float y = 0.55 + 0.12 * fi + 0.1 * (fbm(vec2(x, fi)) - 0.5) * 2.0;
    float curtain = smoothstep(0.0, 0.25, uv.y - y + 0.25) * smoothstep(0.35, 0.0, uv.y - y);
    float streak = 0.6 + 0.4 * vnoise(vec2(x * 30.0, u_time * 0.4));
    vec3 c = mix(vec3(0.1, 1.0, 0.55), vec3(0.6, 0.3, 1.0), fi / 2.0);
    col += c * curtain * streak * 0.35;
  }
  o = vec4(col, 1.0);
}`),

  // Op art: a black and white field that bends around the cursor.
  opart: frag(`
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  vec2 d = p - m;
  float bulge = 0.25 / (0.15 + dot(d, d));
  vec2 q = p + d * bulge * 0.08;
  float s = sin(q.x * 70.0 + sin(q.y * 6.0 + u_time * 0.4) * 2.0);
  float v = smoothstep(-0.15, 0.15, s);
  vec3 col = mix(u_bg, u_ink, v);
  o = vec4(col, 1.0);
}`),

  // Light painting: long-exposure ribbons tracing lissajous paths.
  lightpainting: frag(`
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 col = vec3(0.01, 0.01, 0.02);
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    vec3 c = k == 0 ? vec3(1.0, 0.45, 0.1) : (k == 1 ? vec3(0.1, 0.6, 1.0) : u_accent);
    float glow = 0.0;
    for (int i = 0; i < 60; i++) {
      float s = u_time * 0.25 - float(i) * 0.035 + fk * 2.1;
      vec2 c2 = vec2(0.7 * sin(s * (2.0 + fk)), 0.38 * sin(s * (3.0 + fk * 0.5) + fk));
      float d = length(p - c2);
      glow += 0.0009 / (d * d + 0.0004) * (1.0 - float(i) / 60.0);
    }
    col += c * glow * 0.02;
  }
  col = 1.0 - exp(-col * 1.4);
  o = vec4(col, 1.0);
}`),

  // 1-bit dither: a lit sphere and horizon rendered with an ordered Bayer matrix.
  dither1bit: frag(`
float bayer(vec2 p){
  ivec2 i = ivec2(mod(p, 4.0));
  int idx = i.x + i.y * 4;
  int m[16] = int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);
  return float(m[idx]) / 16.0;
}
void main(){
  vec2 px = floor(gl_FragCoord.xy / 2.0);
  vec2 uv = (px * 2.0 - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * 2.0;
  vec2 c = vec2(0.45, 0.08);
  float r = 0.28;
  float d = length(uv - c);
  float shade = 0.12 + 0.25 * smoothstep(-0.6, 0.6, uv.y);
  if (d < r) {
    vec3 n = normalize(vec3(uv - c, sqrt(max(r*r - d*d, 0.0))));
    vec3 l = normalize(vec3(m.x - 0.3, m.y + 0.6, 0.8));
    shade = clamp(dot(n, l), 0.0, 1.0) * 0.95 + 0.03;
  }
  shade += (fbm(uv * 3.0 + u_time * 0.05) - 0.5) * 0.08;
  float bit = step(bayer(px), shade);
  o = vec4(mix(u_bg, u_ink, bit), 1.0);
}`),

  // Skeuomorphic: brushed aluminium under a soft studio light.
  skeuomorphic: frag(`
void main(){
  vec2 p = gl_FragCoord.xy;
  float brush = vnoise(vec2(p.x * 0.01, p.y * 1.4)) * 0.6 + vnoise(vec2(p.x * 0.004, p.y * 3.0)) * 0.4;
  vec2 uv = gl_FragCoord.xy / u_res;
  float light = 1.0 - 0.35 * distance(uv, vec2(u_mouse.x, 1.05));
  vec3 col = u_bg * (0.86 + brush * 0.16) * light;
  col += pow(max(light, 0.0), 8.0) * 0.08;
  o = vec4(col, 1.0);
}`),

  // Retro desktop: the teal of a 1995 desktop, with a faint dither.
  retrodesktop: frag(`
void main(){
  vec2 p = floor(gl_FragCoord.xy);
  float chk = mod(p.x + p.y, 2.0);
  vec3 col = u_bg + chk * 0.012;
  o = vec4(col, 1.0);
}`),
};
