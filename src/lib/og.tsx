import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** One social card layout for every page that has its own title. */
export function ogCard({ kicker, title, sub, foot }: { kicker: string; title: string; sub?: string; foot?: string }) {
  const size = title.length > 26 ? 96 : title.length > 14 ? 130 : 170;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#111111", color: "#f2f2f2", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
          <span style={{ color: "#b08f74" }}>{kicker}</span>
          <span style={{ color: "#9a9a9a" }}>Raktim Chandra</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: size, fontWeight: 900, letterSpacing: -4, lineHeight: 0.95 }}>{title}</div>
          {sub && <div style={{ fontSize: 40, color: "#b9b9b9", marginTop: 24, maxWidth: 1000 }}>{sub}</div>}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9a9a9a" }}>{foot ?? "raktimchandra.vercel.app"}</div>
      </div>
    ),
    OG_SIZE,
  );
}
