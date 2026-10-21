"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function TrackView({ event, props }: { event: string; props?: Record<string, unknown> }) {
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
