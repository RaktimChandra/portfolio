"use client";
import { useX } from "@/i18n/x/client";
export default function PrintButton({ label = "Print" }: { label?: string }) {
  const xl = useX();
  return <button type="button" className="btn btn-quiet" onClick={() => window.print()}>{xl(label)}</button>;
}
