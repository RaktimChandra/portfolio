"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View, PerspectiveCamera } from "@react-three/drei";
import { Link } from "@/i18n/navigation";
import { featured, repoUrl } from "@/content/projects";
import { localize } from "@/content/i18n";
import { useLocale } from "next-intl";
import { cssColor } from "./util";
import { OrbitScene, SCENE_FOR } from "./TileScenes";

/** Featured projects as tiles, each with a small live 3D scene. One shared WebGL canvas. */
export default function ProjectTiles() {
  const xl = useX();
  const root = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const [hot, setHot] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const colors = useMemo(() => ({ accent: cssColor("--accent", "#b08f74"), ink: cssColor("--ink", "#f2f2f2") }), []);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="tiles3d">
      <div className="tiles3d__grid">
        {featured.map((b) => localize(b, locale)).map((p) => {
          const Scene = SCENE_FOR[p.slug] ?? OrbitScene;
          return (
            <Link key={p.slug} href={`/work/${p.slug}`} className="tile3d panel" data-title={p.title} onMouseEnter={() => setHot(p.slug)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(p.slug)} onBlur={() => setHot(null)}>
              <View className="tile3d__view">
                <PerspectiveCamera makeDefault position={[0, 0.4, 3.6]} fov={45} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[2, 3, 4]} intensity={2} />
                <Scene accent={colors.accent} ink={colors.ink} hot={hot === p.slug} />
              </View>
              <span className="tile3d__body">
                <b className="tile3d__title">{xl(p.title)}</b>
                <span className="tile3d__tag">{xl(p.tagline)}</span>
                {p.metrics?.[0] && <span className="tile3d__metric tabular">{xl(p.metrics[0].value)} <small>{xl(p.metrics[0].label)}</small></span>}
                <span className="tile3d__meta">{repoUrl(p) ? xl("Code public") : xl("Code private")}{p.demo ? xl(" · Live demo") : ""}</span>
              </span>
            </Link>
          );
        })}
      </div>
      <Canvas className="tiles3d__canvas" eventSource={root as React.RefObject<HTMLElement>} frameloop={live ? "always" : "never"} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <View.Port />
      </Canvas>
    </div>
  );
}
