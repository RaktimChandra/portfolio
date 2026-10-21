import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Raktim Chandra — AI, ML and full-stack engineer";

export default async function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#111111", color: "#f2f2f2", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
          <span>AI, ML and full-stack engineer</span>
          <span style={{ color: "#b08f74" }}>Chennai, India</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, color: "#b9b9b9", maxWidth: 900 }}>I build AI agents that ship, and the full stack around them.</div>
          <div style={{ fontSize: 230, fontWeight: 900, letterSpacing: -8, lineHeight: 0.9, marginTop: 24 }}>RAKTIM</div>
        </div>
        <div style={{ display: "flex", gap: 40, fontSize: 28, color: "#b9b9b9" }}>
          <span>7 IEEE papers</span><span>17+ clients</span><span>11 internships</span><span>40+ hackathons</span>
        </div>
      </div>
    ),
    size,
  );
}
