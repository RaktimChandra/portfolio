"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/*
 * A full-screen shader wipe between pages. Each reality gets its own pattern:
 * pixel blocks for the screen-era styles, ink bleed for paint, contour lines for maps,
 * a fold for origami, scanlines for broadcast, a spiral for the geometric ones, noise dissolve otherwise.
 */

const MODE: Record<string, number> = {
  glass: 0, aurora: 0, psychedelic: 0, flowfield: 0, neumorphism: 0, skeuomorphic: 0,
  web1: 1, teletext: 1, dither1bit: 1, retrodesktop: 1,
  watercolour: 2, collage: 2, lightpainting: 2,
  topographic: 3, thermal: 3,
  origami: 4, memphis: 4, wordart: 4,
  datamosh: 5,
  spirograph: 6, opart: 6,
};

const FRAG = `#version 300 es
precision highp float;
uniform vec2 r; uniform float p; uniform int m; uniform vec3 a; uniform vec3 b; uniform float s;
out vec4 o;
float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 q){float v=0.,w=.5;for(int i=0;i<5;i++){v+=w*n(q);q*=2.03;w*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r; vec2 c=(gl_FragCoord.xy-.5*r)/r.y;
  float t=0.; vec3 col=b; float edge=0.;
  if(m==1){ vec2 g=floor(gl_FragCoord.xy/24.); t=h(g+s)*.85+(1.-uv.y)*.15; }
  else if(m==2){ t=fbm(c*3.+s)*.75+length(c)*.35; edge=1.; }
  else if(m==3){ float f=fbm(c*2.2+s); t=f; float l=abs(fract(f*14.)-.5); col=mix(b,a,smoothstep(.06,.0,l)*.6); }
  else if(m==4){ t=(uv.x+uv.y)*.5; t+= step(.5,fract((uv.x-uv.y)*3.))*.04; }
  else if(m==5){ float row=floor(gl_FragCoord.y/14.); t=h(vec2(row,s))*.7+uv.x*.3; }
  else if(m==6){ float an=atan(c.y,c.x)/6.2832+.5; t=fract(an+length(c)*1.2)*.6+length(c)*.4; }
  else { t=fbm(c*2.+s)*.8+(1.-uv.y)*.2; edge=1.; }
  float k=p*1.18-.1;
  float cov=smoothstep(t-.04,t+.04,k);
  float rim=edge*smoothstep(.09,.0,abs(k-t))*(1.-cov*.5);
  o=vec4(mix(col,a,rim),max(cov,rim));
}`;

const VERT = `#version 300 es
in vec2 v; void main(){gl_Position=vec4(v,0,1);}`;

function rgb(name: string, fb: [number, number, number]): [number, number, number] {
  const el = document.createElement("i");
  el.style.color = `var(${name})`;
  el.style.display = "none";
  document.body.appendChild(el);
  const m = getComputedStyle(el).color.match(/[\d.]+/g);
  el.remove();
  return m && m.length >= 3 ? [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255] : fb;
}

export default function PageTransition() {
  const ref = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const api = useRef<{ run: (from: number, to: number, ms: number) => Promise<void> } | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current!;
    const gl = cv.getContext("webgl2", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    const sh = (type: number, src: string) => {
      const x = gl.createShader(type)!;
      gl.shaderSource(x, src);
      gl.compileShader(x);
      return x;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "v");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const [ur, up, um, ua, ub, us] = ["r", "p", "m", "a", "b", "s"].map(U);
    let seed = 0;

    const draw = (p: number) => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
      if (cv.width !== w || cv.height !== h) ((cv.width = w), (cv.height = h));
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(ur, w, h);
      gl.uniform1f(up, p);
      gl.uniform1f(us, seed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const prime = () => {
      const reality = document.documentElement.dataset.reality || "glass";
      gl.uniform1i(um, MODE[reality] ?? 0);
      gl.uniform3f(ua, ...rgb("--accent", [0.7, 0.56, 0.45]));
      gl.uniform3f(ub, ...rgb("--bg", [0.08, 0.08, 0.08]));
    };
    // Test hook: draw one still frame of the wipe.
    (window as unknown as { __wipeAt?: (p: number) => void }).__wipeAt = (p) => (prime(), (cv.style.display = p ? "block" : "none"), draw(p));

    api.current = {
      run: (from, to, ms) =>
        new Promise((res) => {
          prime();
          if (from === 0) seed = Math.random() * 100;
          cv.style.display = "block";
          const t0 = performance.now();
          const step = (now: number) => {
            const k = Math.min(1, (now - t0) / ms);
            const e = from === 0 ? k * k * (3 - 2 * k) * 0.35 + k * 0.65 : 1 - Math.pow(1 - k, 2);
            draw(from + (to - from) * e);
            if (k < 1) requestAnimationFrame(step);
            else {
              if (to === 0) cv.style.display = "none";
              res();
            }
          };
          requestAnimationFrame(step);
        }),
    };

    const locales = routing.locales as readonly string[];
    const strip = (p: string) => {
      const seg = p.split("/")[1];
      return locales.includes(seg) ? p.slice(seg.length + 1) || "/" : p;
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /\.\w+$/.test(url.pathname) || url.pathname.startsWith("/api")) return;
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      pending.current = true;
      const seg = url.pathname.split("/")[1];
      const target = strip(url.pathname) + url.search + url.hash;
      api.current!.run(0, 1, 560).then(() => {
        router.push(target, locales.includes(seg) ? { locale: seg as (typeof routing.locales)[number] } : undefined);
        // Safety: never leave the page covered.
        setTimeout(() => {
          if (pending.current) ((pending.current = false), api.current?.run(1, 0, 380));
        }, 2500);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    requestAnimationFrame(() => api.current?.run(1, 0, 520));
  }, [pathname]);

  return <canvas ref={ref} className="page-wipe" aria-hidden="true" />;
}
