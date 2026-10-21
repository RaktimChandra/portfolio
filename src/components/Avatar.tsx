"use client";
import { useX } from "@/i18n/x/client";
import { useState } from "react";
import { profile } from "@/content/profile";

export default function Avatar({ size = 160 }: { size?: number }) {
  const xl = useX();
  const [ok, setOk] = useState(true);
  return ok ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={profile.avatar} alt={`Portrait of ${profile.name}`} width={size} height={size} onError={() => setOk(false)} decoding="async" loading="lazy" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 1px color-mix(in oklab, var(--ink) 15%, transparent), 0 30px 60px -30px rgb(0 0 0 / .5)", background: "var(--surface)" }} />
  ) : (
    <span role="img" aria-label={profile.name} style={{ width: size, height: size, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--surface)", fontWeight: 800, fontSize: size / 3 }}>{xl("RC")}</span>
  );
}
