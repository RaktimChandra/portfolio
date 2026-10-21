import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Raktim Chandra",
    short_name: "Raktim",
    description: "AI, ML and full-stack engineer. Projects, résumé, and an AI twin that answers questions.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#111111",
    theme_color: "#111111",
    categories: ["portfolio", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Work", url: "/work" },
      { name: "Résumé", url: "/resume" },
      { name: "Contact", url: "/contact" },
    ],
  };
}
