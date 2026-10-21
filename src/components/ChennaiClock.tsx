"use client";
import { useEffect, useState } from "react";

/** Raktim's local time. */
export default function ChennaiClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <p className="muted text-small">Chennai · IST</p>;
  const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const h = Number(now.toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }));
  const awake = h >= 8 && h < 24;
  return (
    <p className="muted text-small tabular" title="Raktim's local time">
      {time} in Chennai · {awake ? "daytime here" : "night here"}
    </p>
  );
}
