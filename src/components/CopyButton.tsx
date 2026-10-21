"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="chip" onClick={() => navigator.clipboard?.writeText(text).then(() => (setDone(true), setTimeout(() => setDone(false), 1400)))} aria-label={`Copy ${text}`}>
      {done ? "Copied" : "Copy"}
    </button>
  );
}
