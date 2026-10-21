"use client";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

type R = { slug: string; title: string; url: string; ok: boolean; code: number; ms: number };

export default function StatusBoard() {
  const [data, setData] = useState<{ checkedAt: string; results: R[] } | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then(setData).catch(() => setErr(true));
  }, []);
  if (err) return <p className="muted">Couldn&apos;t run the checks right now.</p>;
  if (!data) return <p className="muted" aria-live="polite">Checking every live demo…</p>;
  const up = data.results.filter((r) => r.ok).length;
  return (
    <>
      <p className="text-lead" aria-live="polite"><b className="tabular">{up}/{data.results.length}</b> demos responding · checked {new Date(data.checkedAt).toLocaleTimeString()}</p>
      <table className="proof" style={{ marginTop: "1.5rem" }}>
        <tbody>
          {data.results.map((r) => (
            <tr key={r.slug}>
              <th scope="row"><Link href={`/work/${r.slug}`} className="link-u">{r.title}</Link></th>
              <td><span className="dot" style={{ background: r.ok ? "#3fcf8e" : "#e5534b", boxShadow: "none" }} />{r.ok ? `Up · HTTP ${r.code}` : r.code ? `HTTP ${r.code}` : "No response (free-tier hosts sleep when idle)"}</td>
              <td className="tabular muted">{r.ms} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
