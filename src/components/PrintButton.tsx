"use client";
export default function PrintButton({ label = "Print" }: { label?: string }) {
  return <button type="button" className="btn btn-quiet" onClick={() => window.print()}>{label}</button>;
}
