import { getX } from "@/i18n/x/server";
import { Link } from "@/i18n/navigation";
import { endorsements } from "@/content/endorsements";

/** Renders only when real endorsements exist. */
export default async function Endorsements({ limit = 6 }: { limit?: number }) {
  const xl = await getX();
  if (!endorsements.length) return null;
  return (
    <section className="section wrap" aria-labelledby="endorse-h">
      <header className="sec-head">
        <h2 id="endorse-h" className="sec-title display">{xl("In their words.")}</h2>
        <p className="sec-note">{xl("From managers, team leads, clients and teammates, published with their permission.")}</p>
      </header>
      <ul className="quotes">
        {endorsements.slice(0, limit).map((e, i) => (
          <li key={i} className="quote panel" data-title={e.org}>
            <blockquote>“{xl(e.quote)}”</blockquote>
            <p className="quote__by">
              <b>{e.linkedin ? <a className="link-u" href={e.linkedin} target="_blank" rel="noopener">{xl(e.name)}</a> : xl(e.name)}</b>
              <span className="muted"> · {xl(e.role)}, {xl(e.org)}</span>
            </p>
            {e.project && <p className="text-small"><Link className="link-u" href={`/work/${e.project}`}>{xl("About this project →")}</Link></p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
