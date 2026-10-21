"use client";

import dynamic from "next/dynamic";
import { useUI } from "@/lib/store";

const RealityDial = dynamic(() => import("./RealityDial"), { ssr: false });
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });
const Terminal = dynamic(() => import("./Terminal"), { ssr: false });
const TwinPanel = dynamic(() => import("./TwinPanel"), { ssr: false });
const GameOverlay = dynamic(() => import("./GameOverlay"), { ssr: false });

export default function Overlays() {
  const overlay = useUI((s) => s.overlay);
  if (!overlay) return null;
  return (
    <>
      {overlay === "dial" && <RealityDial />}
      {overlay === "palette" && <CommandPalette />}
      {overlay === "terminal" && <Terminal />}
      {overlay === "twin" && <TwinPanel />}
      {overlay === "game" && <GameOverlay />}
    </>
  );
}
