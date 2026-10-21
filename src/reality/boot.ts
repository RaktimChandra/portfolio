import { REALITIES } from "./realities";

// Runs before first paint (inlined in <head>) so the chosen reality and theme
// never flash. Kept tiny and dependency-free.
const table = Object.fromEntries(REALITIES.map((r) => [r.id, [r.scheme, r.prefers, r.swatch[0]]]));

export const BOOT_SCRIPT = `(function(){try{
var T=${JSON.stringify(table)};var d=document.documentElement;
var q=new URLSearchParams(location.search).get('reality');
var r=q&&T[q]?q:(localStorage.getItem('rc.reality')||'glass'); if(!T[r]) r='glass';
var t=localStorage.getItem('rc.theme');
if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
var s=T[r]; var eff=s[0]==='both'?t:s[0];
d.dataset.reality=r; d.dataset.theme=eff; d.classList.add('js');
var m=document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', s[2]);
if(q) localStorage.setItem('rc.reality', r);
}catch(e){document.documentElement.classList.add('js');}})();`;
