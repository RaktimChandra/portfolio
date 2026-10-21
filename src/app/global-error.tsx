"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/analytics";

/** Last-resort error screen when the root layout itself fails. Plain HTML, no site chrome. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error, "root"), [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100svh", display: "grid", placeItems: "center", background: "#111", color: "#f2f2f2", fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 48, margin: "0 0 12px" }}>Something broke.</h1>
          <p style={{ color: "#b9b9b9" }}>The site failed to load. It has been reported.</p>
          <p style={{ display: "flex", gap: 12 }}>
            <button onClick={reset} style={{ padding: "10px 18px", borderRadius: 999, border: 0, background: "#b08f74", color: "#111", font: "inherit", cursor: "pointer" }}>Try again</button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ color: "#f2f2f2", alignSelf: "center" }}>Home</a>
          </p>
        </div>
      </body>
    </html>
  );
}
