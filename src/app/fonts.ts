import localFont from "next/font/local";

export const archivo = localFont({
  src: [
    { path: "../fonts/archivo-latin-wdth-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/archivo-latin-ext-wdth-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["Arial Narrow", "system-ui", "sans-serif"],
});
export const fraunces = localFont({ src: "../fonts/fraunces-latin-wght-normal.woff2", weight: "100 900", variable: "--font-fraunces", display: "swap", preload: false });
export const jetbrains = localFont({ src: "../fonts/jetbrains-mono-latin-wght-normal.woff2", weight: "100 800", variable: "--font-jetbrains", display: "swap", preload: false });
export const silkscreen = localFont({ src: "../fonts/silkscreen-latin-400-normal.woff2", weight: "400", variable: "--font-silkscreen", display: "swap", preload: false });
export const vt323 = localFont({ src: "../fonts/vt323-latin-400-normal.woff2", weight: "400", variable: "--font-vt323", display: "swap", preload: false });
export const rubikmono = localFont({ src: "../fonts/rubik-mono-one-latin-400-normal.woff2", weight: "400", variable: "--font-rubikmono", display: "swap", preload: false });
export const caveat = localFont({ src: "../fonts/caveat-latin-400-normal.woff2", weight: "400", variable: "--font-caveat", display: "swap", preload: false });
export const devanagari = localFont({ src: "../fonts/noto-sans-devanagari-devanagari-wght-normal.woff2", weight: "100 900", variable: "--font-devanagari", display: "swap", preload: false });
export const bengali = localFont({ src: "../fonts/noto-sans-bengali-bengali-wght-normal.woff2", weight: "100 900", variable: "--font-bengali", display: "swap", preload: false });

export const fontVars = [archivo, fraunces, jetbrains, silkscreen, vt323, rubikmono, caveat, devanagari, bengali].map((f) => f.variable).join(" ");
