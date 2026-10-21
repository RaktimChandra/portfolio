"use client";

import { useX } from "@/i18n/x/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCaps } from "@/lib/device";

const Room = dynamic(() => import("@/three/Room"), { ssr: false });

/** The 3D desk. Before WebGL loads (or with reduced motion) a plain list of the same doors. */
export default function HeroPortrait() {
  const xl = useX();
  const { rich } = useCaps();
  const [ready, setReady] = useState(false);
  const three = rich && ready;
  useEffect(() => {
    if (!rich) return;
    const go = () => setReady(true);
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(go, { timeout: 1500 });
    else setTimeout(go, 500);
  }, [rich]);
  return (
    <div className="hero__portrait">
      {three ? (
        <Room />
      ) : (
        <div className="room room--static" aria-hidden="true">
          <p className="room__poster">{xl("SHAME ON ME,")}<br />{xl("IF I DIE")}<br />{xl("AVERAGE.")}</p>
        </div>
      )}
    </div>
  );
}
