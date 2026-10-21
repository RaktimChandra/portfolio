"use client";
import { useSyncExternalStore } from "react";

let now = 0;
const sub = (cb: () => void) => {
  now = Date.now();
  const id = setInterval(() => ((now = Date.now()), cb()), 30_000);
  return () => clearInterval(id);
};

/** Raktim's local time. */
export default function ChennaiClock() {
  const t = useSyncExternalStore(sub, () => now || Date.now(), () => 0);
  if (!t) return <p className="muted text-small">Chennai · IST</p>;
  const d = new Date(t);
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const h = Number(d.toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }));
  const awake = h >= 8 && h < 24;
  return (
    <p className="muted text-small tabular" title="Raktim's local time">
      {time} in Chennai · {awake ? "daytime here" : "night here"}
    </p>
  );
}
