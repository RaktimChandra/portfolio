import { getX } from "@/i18n/x/server";
import { links } from "@/content/record";
import { profile } from "@/content/profile";

/** A booking link when one is set in record.ts (links.calendly), otherwise a pre-written email asking for a slot. */
export default async function BookCall({ context = "", quiet = false }: { context?: string; quiet?: boolean }) {
  const xl = await getX();
  const cls = quiet ? "btn btn-quiet" : "btn";
  if (links.calendly) return <a className={cls} href={links.calendly} target="_blank" rel="noopener">{xl("Book a 20-minute call")}</a>;
  const body = `Hi Raktim,\n\nI'd like a 20-minute call${context ? ` about ${context}` : ""}.\nTimes that work for me (with time zone):\n- \n- \n\nThanks,\n`;
  return <a className={cls} href={`mailto:${profile.email}?subject=${encodeURIComponent(`Call${context ? `: ${context}` : ""}`)}&body=${encodeURIComponent(body)}`}>{xl("Ask for a 20-minute call")}</a>;
}
