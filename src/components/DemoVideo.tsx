"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useRef, useState } from "react";

function youTubeId(u: string) {
  const m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m?.[1];
}

/** A 30-second demo. Local mp4s autoplay muted when in view; YouTube loads only on click. */
export default function DemoVideo({ src, title, poster }: { src: string; title: string; poster?: string }) {
  const xl = useX();
  const ref = useRef<HTMLVideoElement>(null);
  const [yt, setYt] = useState(false);
  const id = youTubeId(src);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  if (id) {
    return (
      <div className="demo-video panel" data-title={xl("Demo")}>
        {yt ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={xl.f("{title} demo", { title })} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <button type="button" className="demo-video__play" onClick={() => setYt(true)} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)` }} aria-label={xl.f("Play the {title} demo", { title })}>
            <span>{xl("▶ Play the 30-second demo")}</span>
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="demo-video panel" data-title={xl("Demo")}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline controls preload="metadata" aria-label={xl.f("{title} demo recording", { title })} />
    </div>
  );
}
