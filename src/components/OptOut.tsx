"use client";

import { useState, useSyncExternalStore } from "react";
import { isOptedOut, setOptOut } from "@/lib/analytics";

const noop = () => () => {};

/** Turns visitor analytics off (or back on) for this browser. */
export default function OptOut() {
  const initial = useSyncExternalStore(noop, isOptedOut, () => false);
  const [off, setOff] = useState<boolean | null>(null);
  const out = off ?? initial;
  return (
    <p className="demo__row">
      <button type="button" className="btn" onClick={() => (setOptOut(!out), setOff(!out))}>{out ? "Turn analytics back on" : "Turn off analytics for this browser"}</button>
      <span className="text-small muted" role="status">{out ? "Analytics are off here. Reload any page for it to apply everywhere." : "Analytics are on."}</span>
    </p>
  );
}
