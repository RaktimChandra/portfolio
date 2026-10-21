"use client";
import { useX } from "@/i18n/x/client";
import { useState } from "react";

export default function CopyButton({ text, label }: { text: string; label?: string }) {
  const xl = useX();
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="chip" onClick={() => navigator.clipboard?.writeText(text).then(() => (setDone(true), setTimeout(() => setDone(false), 1400)))} aria-label={label ?? `Copy ${text}`}>
      {done ? xl("Copied") : (label ?? xl("Copy"))}
    </button>
  );
}
