export type Scheme = "dark" | "light" | "both";

export type Reality = {
  id: string;
  name: string;
  /** One line shown in the dial. */
  note: string;
  scheme: Scheme;
  /** Default scheme when the reality supports both. */
  prefers: "dark" | "light";
  /** Swatch used in the dial: [ground, ink, accent]. */
  swatch: [string, string, string];
};

export const REALITIES: Reality[] = [
  { id: "glass", name: "Glass Lab", note: "Bronze light through dark glass. The home reality.", scheme: "both", prefers: "dark", swatch: ["#111111", "#f2f2f2", "#b08f74"] },
  { id: "web1", name: "Web 1.0", note: "Times, blue links, a tiled background. Under construction.", scheme: "light", prefers: "light", swatch: ["#c0c0c0", "#000000", "#0000ee"] },
  { id: "topographic", name: "Topographic", note: "Contour lines of a living height map. Your cursor raises a hill.", scheme: "both", prefers: "light", swatch: ["#efe9dc", "#2b2a26", "#c4512c"] },
  { id: "psychedelic", name: "Psychedelic", note: "Domain-warped colour, 1967 poster type.", scheme: "dark", prefers: "dark", swatch: ["#1a0630", "#fff6d6", "#ff3d8b"] },
  { id: "watercolour", name: "Watercolour", note: "Pigment blooming into cold-press paper.", scheme: "light", prefers: "light", swatch: ["#f6f1e7", "#2e3440", "#3f6fb0"] },
  { id: "teletext", name: "Teletext", note: "Ceefax page 100. Eight colours, forty columns.", scheme: "dark", prefers: "dark", swatch: ["#000000", "#ffffff", "#ffff00"] },
  { id: "origami", name: "Origami", note: "A folded sheet, every facet lit by your cursor.", scheme: "both", prefers: "light", swatch: ["#ece6da", "#1f1d1a", "#d1453b"] },
  { id: "thermal", name: "Thermal Camera", note: "Heat signatures. The warmest thing on screen is you.", scheme: "dark", prefers: "dark", swatch: ["#0a0016", "#ffe9a8", "#ff7a00"] },
  { id: "memphis", name: "Memphis", note: "Squiggles, dots and triangles. Milan, 1981.", scheme: "light", prefers: "light", swatch: ["#fff7e8", "#151515", "#ffcc00"] },
  { id: "flowfield", name: "Flow Field", note: "Streamlines combed through curl noise.", scheme: "both", prefers: "dark", swatch: ["#0d1214", "#e8f0ee", "#4fd1b5"] },
  { id: "neumorphism", name: "Neumorphism", note: "Soft surfaces pressed out of one material.", scheme: "both", prefers: "light", swatch: ["#e3e7ee", "#2d3440", "#5868f0"] },
  { id: "wordart", name: "WordArt", note: "Rainbow type and a clip-art sunburst. 1995 in full.", scheme: "light", prefers: "light", swatch: ["#2a55f0", "#ffffff", "#ffe100"] },
  { id: "collage", name: "Collage", note: "Torn paper, halftone and tape.", scheme: "light", prefers: "light", swatch: ["#e9e3d6", "#121212", "#e2462f"] },
  { id: "datamosh", name: "Datamosh", note: "Broken motion vectors and smeared macroblocks.", scheme: "dark", prefers: "dark", swatch: ["#0c0c0c", "#f4f4f4", "#00ff9c"] },
  { id: "spirograph", name: "Spirograph", note: "A hypotrochoid turning slowly in ink.", scheme: "both", prefers: "light", swatch: ["#f4f1ea", "#1c1c1c", "#2d5bd2"] },
  { id: "aurora", name: "Aurora", note: "Green curtains over a polar night.", scheme: "dark", prefers: "dark", swatch: ["#020a14", "#e6fff4", "#2cf5a0"] },
  { id: "opart", name: "Op Art", note: "Black and white lines that bend around your cursor.", scheme: "both", prefers: "light", swatch: ["#ffffff", "#000000", "#000000"] },
  { id: "lightpainting", name: "Light Painting", note: "Long-exposure ribbons of light in a dark room.", scheme: "dark", prefers: "dark", swatch: ["#030305", "#fff3e6", "#ff8a2a"] },
  { id: "dither1bit", name: "1-Bit Dither", note: "Two colours and a Bayer matrix. That's all there is.", scheme: "both", prefers: "light", swatch: ["#e8e8d8", "#1a1a1a", "#1a1a1a"] },
  { id: "skeuomorphic", name: "Skeuomorphic", note: "Brushed metal, stitched leather, real buttons.", scheme: "light", prefers: "light", swatch: ["#c9cbcf", "#1d1f22", "#2f7bf6"] },
  { id: "retrodesktop", name: "Retro Desktop", note: "Teal desktop, grey windows, a Start button.", scheme: "light", prefers: "light", swatch: ["#008080", "#000000", "#000080"] },
];

export const DEFAULT_REALITY = "glass";

export function getReality(id: string | null | undefined): Reality {
  return REALITIES.find((r) => r.id === id) ?? REALITIES[0];
}
