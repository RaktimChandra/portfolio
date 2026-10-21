"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SITE_URL } from "@/lib/site";
import { track } from "@/lib/analytics";

const CardViewer = dynamic(() => import("@/three/CardViewer"), { ssr: false });

/** My business card in 3D. On a phone, one tap puts it on the table in front of you (Scene Viewer on Android, Quick Look on iPhone). */
export default function ARCard() {
  const [os, setOs] = useState<"ios" | "android" | "other">("other");
  const [gl, setGl] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setOs(/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "ios" : /Android/.test(ua) ? "android" : "other");
    try { setGl(!!document.createElement("canvas").getContext("webgl2")); } catch {}
  }, []);
  const glb = `${SITE_URL}/card.glb`;
  const android = `intent://arvr.google.com/scene-viewer/1.2?file=${encodeURIComponent(glb)}&mode=ar_preferred&title=${encodeURIComponent("Raktim Chandra")}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(SITE_URL + "/contact")};end;`;
  return (
    <section className="arcard panel" data-title="AR card">
      <div className="arcard__view">{gl ? <CardViewer /> : <p className="muted">3D needs WebGL.</p>}</div>
      <div className="arcard__body">
        <h2 className="card__title">Put my card on your desk</h2>
        <p className="muted">An 85 × 50 mm card, true to size. The front has my contact and a QR code; turn it over for the motto.</p>
        {os === "ios" && (
          // rel="ar" with an <img> child is what Safari needs to open Quick Look.
          <a rel="ar" href="/card.usdz" className="btn" onClick={() => track("ar_card_opened", { os })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" width={1} height={1} style={{ display: "none" }} />
            View in your room
          </a>
        )}
        {os === "android" && <a href={android} className="btn" onClick={() => track("ar_card_opened", { os })}>View in your room</a>}
        {os === "other" && <p className="text-small muted">Open this page on a phone to place the card in your room. <a href="/card.glb" download>Download the 3D file</a></p>}
      </div>
    </section>
  );
}
