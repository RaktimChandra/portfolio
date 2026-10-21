import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Hero from "@/components/Hero";
import WorkLedger from "@/components/WorkLedger";
import TwinBox from "@/components/TwinBox";
import ContactField from "@/components/ContactField";
import { profile } from "@/content/profile";
import { experience, freelance } from "@/content/experience";
import { featured } from "@/content/projects";
import { awards, services } from "@/content/record";
import { months, ym } from "@/lib/format";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tf = await getTranslations("facts");
  const tn = await getTranslations("nav");

  const facts = [
    { v: profile.education.cgpa, l: tf("cgpa") },
    { v: profile.numbers.clients, l: tf("clients") },
    { v: profile.numbers.papers, l: tf("papers") },
    { v: profile.numbers.internships, l: tf("roles") },
    { v: profile.numbers.hackathons, l: tf("hackathons") },
  ];
  const totalMonths = experience.reduce((n, e) => n + months(e.start, e.end), 0);

  return (
    <>
      <Hero />

      {/* Facts row */}
      <section className="facts wrap" aria-label="At a glance">
        <dl className="facts__row">
          {facts.map((f, i) => (
            <div key={f.l} className="facts__cell" data-reveal style={{ ["--i" as string]: i }}>
              <dt className="text-small muted">{f.l}</dt>
              <dd className="facts__v display tabular">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Work */}
      <section className="section wrap" aria-labelledby="work-h">
        <header className="sec-head">
          <h2 id="work-h" className="sec-title display" data-reveal>{t("workTitle")}</h2>
          <p className="sec-note" data-reveal>{t("workNote")}</p>
        </header>
        <WorkLedger items={featured} />
        <p className="sec-foot"><Link href="/work" className="btn btn-quiet">{t("allWork")} →</Link></p>
      </section>

      {/* AI twin, the headline you can type */}
      <section className="section wrap twin-sec" aria-labelledby="twin-h">
        <h2 id="twin-h" className="sec-title display" data-reveal>{t("twinTitle")}</h2>
        <p className="sec-note" data-reveal>{t("twinNote")}</p>
        <TwinBox variant="headline" />
      </section>

      {/* Experience as a receipt slip */}
      <section className="section wrap receipt-sec" aria-labelledby="exp-h">
        <div className="receipt-sec__total" data-reveal>
          <h2 id="exp-h" className="sec-title display">{t("receiptTitle")}</h2>
          <p className="receipt-sec__big display tabular">{experience.length}</p>
          <p className="text-lead">{t("receiptTotal")}</p>
          <p className="muted">{t("receiptFreelance")}</p>
          <p><Link href="/experience" className="link-u">{tn("experience")} →</Link></p>
        </div>
        <div className="receipt" data-reveal>
          <p className="receipt__head">RAKTIM CHANDRA · WORK RECEIPT<br />SRMIST · CHENNAI · IN</p>
          <ol className="receipt__lines">
            {experience.map((e) => (
              <li key={e.id}>
                <span className="receipt__what">{e.org}<br /><small>{e.role}</small></span>
                <span className="receipt__when">{ym(e.start)}<br /><small>{months(e.start, e.end)} mo</small></span>
              </li>
            ))}
            <li>
              <span className="receipt__what">Freelance practice<br /><small>{freelance.clients} clients</small></span>
              <span className="receipt__when">2024<br /><small>ongoing</small></span>
            </li>
          </ol>
          <p className="receipt__sum"><span>TOTAL ROLE-MONTHS</span><span className="tabular">{totalMonths}</span></p>
          <p className="receipt__foot">All subjects cleared first attempt · CGPA {profile.education.cgpa}<br />Thank you for reading</p>
        </div>
      </section>

      {/* About */}
      <section className="section wrap about-sec" aria-labelledby="about-h">
        <aside className="about-sec__side" data-reveal>
          <h2 id="about-h" className="sec-title display">{t("aboutTitle")}</h2>
          <dl className="side-facts">
            <div><dt className="muted text-small">Based in</dt><dd>{profile.location}</dd></div>
            <div><dt className="muted text-small">From</dt><dd>{profile.from}</dd></div>
            <div><dt className="muted text-small">Studying</dt><dd>B.Tech CSE, SRMIST · 2027</dd></div>
            <div><dt className="muted text-small">Off the clock</dt><dd>{profile.outside.join(" · ")}</dd></div>
          </dl>
        </aside>
        <div className="about-sec__body">
          <p className="about-sec__para" data-reveal>{profile.pitch}</p>
          <ul className="principles">
            {profile.principles.map((p, i) => (
              <li key={p.title} data-reveal style={{ ["--i" as string]: i }}>
                <h3 className="principles__t">{p.title}</h3>
                <p className="muted">{p.body}</p>
              </li>
            ))}
          </ul>
          <p><Link href="/about" className="link-u">{tn("about")} →</Link></p>
        </div>
      </section>

      {/* Services poster lines */}
      <section className="section wrap" aria-labelledby="svc-h">
        <header className="sec-head">
          <h2 id="svc-h" className="sec-title display" data-reveal>{t("servicesTitle")}</h2>
          <p className="sec-note" data-reveal>{freelance.summary}</p>
        </header>
        <ul className="poster">
          {services.map((s, i) => (
            <li key={s.name} className="poster__line" data-reveal style={{ ["--i" as string]: i }}>
              <span className="poster__n tabular muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="poster__name display">{s.name}</span>
              <span className="poster__desc">{s.line}<br /><span className="muted text-small">{s.timeline}</span></span>
            </li>
          ))}
        </ul>
        <p className="sec-foot">
          <Link href="/services" className="btn">{tn("services")} →</Link>{" "}
          <Link href="/scope" className="btn btn-quiet">Scope a project</Link>
        </p>
      </section>

      {/* Recognition table */}
      <section className="section wrap" aria-labelledby="proof-h">
        <header className="sec-head">
          <h2 id="proof-h" className="sec-title display" data-reveal>{t("proofTitle")}</h2>
        </header>
        <table className="proof">
          <tbody>
            {awards.filter((a) => a.tier < 3).map((a) => (
              <tr key={a.title} data-reveal>
                <th scope="row">{a.title}</th>
                <td className="muted">{a.detail}</td>
                <td className="tabular muted">{a.year}</td>
              </tr>
            ))}
            <tr data-reveal>
              <th scope="row">7 IEEE conference papers</th>
              <td className="muted">Three in 2025, four in 2026. Plus an IGI Global chapter and UROP research.</td>
              <td className="tabular muted">2025–26</td>
            </tr>
          </tbody>
        </table>
        <p className="sec-foot"><Link href="/achievements" className="link-u">All recognition →</Link> · <Link href="/certifications" className="link-u">34 certifications →</Link></p>
      </section>

      {/* Contact */}
      <section className="section wrap contact-sec" aria-labelledby="contact-h">
        <h2 id="contact-h" className="contact-sec__title display" data-reveal>{t("contactTitle")}</h2>
        <p className="sec-note" data-reveal>{t("contactNote")}</p>
        <ContactField />
        <p className="contact-sec__alt">
          <a href={`mailto:${profile.email}`} className="link-u">{profile.email}</a>
          <span className="muted"> · {t("orCall")} </span>
          <a href={profile.phoneHref} className="link-u tabular">{profile.phone}</a>
          <span className="muted"> · </span>
          <a href={profile.linkedin} className="link-u" target="_blank" rel="noopener">LinkedIn</a>
        </p>
      </section>
    </>
  );
}
