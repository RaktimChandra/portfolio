"use client";
import { useState } from "react";

export default function CopyButton({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="chip" onClick={() => navigator.clipboard?.writeText(text).then(() => (setDone(true), setTimeout(() => setDone(false), 1400)))} aria-label={label ?? `Copy ${text}`}>
      {done ? "Copied" : (label ?? "Copy")}
    </button>
  );
}
