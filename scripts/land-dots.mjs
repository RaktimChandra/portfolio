// Writes public/land.json: [lat, lon] pairs on a 1.6° grid wherever there is land (Natural Earth 110m via world-atlas).
import { readFile, writeFile } from "node:fs/promises";
import { feature } from "topojson-client";
const topo = JSON.parse(await readFile("node_modules/world-atlas/land-110m.json", "utf8"));
const land = feature(topo, topo.objects.land);
const polys = land.features.flatMap((f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates));
const inRing = (x, y, ring) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const isLand = (lon, lat) => polys.some((p) => inRing(lon, lat, p[0]) && !p.slice(1).some((h) => inRing(lon, lat, h)));
const out = [];
for (let lat = -55; lat <= 82; lat += 1.6) {
  const step = 1.6 / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
  for (let lon = -180; lon < 180; lon += step) if (isLand(lon, lat)) out.push([+lat.toFixed(1), +lon.toFixed(1)]);
}
await writeFile("public/land.json", JSON.stringify(out));
console.log(out.length, "land dots");
