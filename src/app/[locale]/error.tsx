"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/analytics";

/** Shown when a page throws. The header and footer stay; this replaces only the page body. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error, "page"), [error]);
  return (
    <div className="page wrap">
      <header className="page-head">
        <p className="crumbs tabular">Error{error.digest ? ` · ${error.digest}` : ""}</p>
        <h1 className="page-title display">Something broke.</h1>
        <p className="page-lede">This part of the page failed to load. It has been reported. Try again, or go back to the home page.</p>
      </header>
      <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={reset}>Try again</button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="btn btn-quiet" href="/">Home</a>
      </p>
    </div>
  );
}
