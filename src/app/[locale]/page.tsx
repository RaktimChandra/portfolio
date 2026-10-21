import { getX } from "@/i18n/x/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Hero from "@/components/Hero";
import WorkLedger from "@/components/WorkLedger";
import TwinBox from "@/components/TwinBox";
import ContactField from "@/components/ContactField";
import AgentPipelineLazy from "@/components/AgentPipelineLazy";
import GitHubPulse from "@/components/GitHubPulse";
import Endorsements from "@/components/Endorsements";
import ParticleSection from "@/components/ParticleSection";
import { profile } from "@/content/profile";
import { experience, freelance } from "@/content/experience";
import { featured } from "@/content/projects";
import { localize } from "@/content/i18n";
import { awards, services } from "@/content/record";
import { months, ym } from "@/lib/format";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const xl = await getX();
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
      <section className="facts wrap" aria-label={xl("At a glance")}>
        <dl className="facts__row">
          {facts.map((f, i) => (
            <div key={f.l} className="facts__cell" data-reveal style={{ ["--i" as string]: i }}>
              <dt className="text-small muted">{xl(f.l)}</dt>
              <dd className="facts__v display tabular">{xl(f.v)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ParticleSection />

      {/* Work */}
      <section className="section wrap" aria-labelledby="work-h">
        <header className="sec-head">
          <h2 id="work-h" className="sec-title display" data-reveal>{t("workTitle")}</h2>
          <p className="sec-note" data-reveal>{t("workNote")}</p>
        </header>
        <WorkLedger items={featured.map((p) => localize(p, locale))} />
        <p className="sec-foot"><Link href="/work" className="btn btn-quiet">{t("allWork")} →</Link></p>
      </section>

      {/* How the agents work: a 3D pipeline you can drive */}
      <section className="section wrap" aria-labelledby="pipe-h">
        <header className="sec-head">
          <h2 id="pipe-h" className="sec-title display" data-reveal>{xl("How my agents think.")}</h2>
          <p className="sec-note" data-reveal>{xl("Every agent I ship runs the same loop: perceive, retrieve, reason, act, and hand the result to a human to sign. Pick an input and watch it travel through a real system.")}</p>
        </header>
        <AgentPipelineLazy />
      </section>

      {/* AI twin, the headline you can type */}
      <section className="section wrap twin-sec" aria-labelledby="twin-h">
        <h2 id="twin-h" className="sec-title display" data-reveal>{t("twinTitle")}</h2>
        <p className="sec-note" data-reveal>{t("twinNote")}</p>
        <TwinBox variant="headline" />
      </section>

      <GitHubPulse />

      {/* Experience as a receipt slip */}
      <section className="section wrap receipt-sec" aria-labelledby="exp-h">
        <div className="receipt-sec__total" data-reveal>
          <h2 id="exp-h" className="sec-title display">{t("receiptTitle")}</h2>
          <p className="receipt-sec__big display tabular">{xl(experience.length)}</p>
          <p className="text-lead">{t("receiptTotal")}</p>
          <p className="muted">{t("receiptFreelance")}</p>
          <p style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}><Link href="/experience" className="link-u">{tn("experience")} →</Link><Link href="/journey" className="link-u accent">{xl("Fly through it in 3D →")}</Link></p>
        </div>
        <div className="receipt" data-reveal>
          <p className="receipt__head">{xl("RAKTIM CHANDRA · WORK RECEIPT")}<br />{xl("SRMIST · CHENNAI · IN")}</p>
          <ol className="receipt__lines">
            {experience.map((e) => (
              <li key={e.id}>
                <span className="receipt__what">{xl(e.org)}<br /><small>{xl(e.role)}</small></span>
                <span className="receipt__when">{ym(e.start, xl.locale)}<br /><small>{xl.f("{n} mo", { n: months(e.start, e.end) })}</small></span>
              </li>
            ))}
            <li>
              <span className="receipt__what">{xl("Freelance practice")}<br /><small>{xl(freelance.clients)}{" "}{xl("clients")}</small></span>
              <span className="receipt__when">2024<br /><small>{xl("ongoing")}</small></span>
            </li>
          </ol>
          <p className="receipt__sum"><span>{xl("TOTAL ROLE-MONTHS")}</span><span className="tabular">{xl(totalMonths)}</span></p>
          <p className="receipt__foot">{xl("All subjects cleared first attempt · CGPA")}{" "}{xl(profile.education.cgpa)}<br />{xl("Thank you for reading")}</p>
        </div>
      </section>

      {/* About */}
      <section className="section wrap about-sec" aria-labelledby="about-h">
        <aside className="about-sec__side" data-reveal>
          <h2 id="about-h" className="sec-title display">{t("aboutTitle")}</h2>
          <dl className="side-facts">
            <div><dt className="muted text-small">{xl("Based in")}</dt><dd>{xl(profile.location)}</dd></div>
            <div><dt className="muted text-small">{xl("From")}</dt><dd>{xl(profile.from)}</dd></div>
            <div><dt className="muted text-small">{xl("Studying")}</dt><dd>{xl("B.Tech CSE, SRMIST · 2027")}</dd></div>
            <div><dt className="muted text-small">{xl("Off the clock")}</dt><dd>{profile.outside.map((o) => xl(o)).join(" · ")}</dd></div>
          </dl>
        </aside>
        <div className="about-sec__body">
          <p className="about-sec__para" data-reveal>{xl(profile.pitch)}</p>
          <ul className="principles">
            {profile.principles.map((p, i) => (
              <li key={p.title} data-reveal style={{ ["--i" as string]: i }}>
                <h3 className="principles__t">{xl(p.title)}</h3>
                <p className="muted">{xl(p.body)}</p>
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
          <p className="sec-note" data-reveal>{xl(freelance.summary)}</p>
        </header>
        <ul className="poster">
          {services.map((s, i) => (
            <li key={s.name} className="poster__line" data-reveal style={{ ["--i" as string]: i }}>
              <span className="poster__n tabular muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="poster__name display">{xl(s.name)}</span>
              <span className="poster__desc">{xl(s.line)}<br /><span className="muted text-small">{xl(s.timeline)}</span></span>
            </li>
          ))}
        </ul>
        <p className="sec-foot">
          <Link href="/services" className="btn">{tn("services")} →</Link>{" "}
          <Link href="/scope" className="btn btn-quiet">{xl("Scope a project")}</Link>
        </p>
      </section>

      <Endorsements />

      {/* Recognition table */}
      <section className="section wrap" aria-labelledby="proof-h">
        <header className="sec-head">
          <h2 id="proof-h" className="sec-title display" data-reveal>{t("proofTitle")}</h2>
        </header>
        <table className="proof">
          <tbody>
            {awards.filter((a) => a.tier < 3).map((a) => (
              <tr key={a.title} data-reveal>
                <th scope="row">{xl(a.title)}</th>
                <td className="muted">{xl(a.detail)}</td>
                <td className="tabular muted">{xl(a.year)}</td>
              </tr>
            ))}
            <tr data-reveal>
              <th scope="row">{xl("7 IEEE conference papers")}</th>
              <td className="muted">{xl("Three in 2025, four in 2026. Plus an IGI Global chapter and UROP research.")}</td>
              <td className="tabular muted">2025–26</td>
            </tr>
          </tbody>
        </table>
        <p className="sec-foot"><Link href="/achievements" className="link-u">{xl("All recognition →")}</Link> · <Link href="/certifications" className="link-u">{xl("34 certifications →")}</Link></p>
      </section>

      {/* Contact */}
      <section className="section wrap contact-sec" aria-labelledby="contact-h">
        <h2 id="contact-h" className="contact-sec__title display" data-reveal>{t("contactTitle")}</h2>
        <p className="sec-note" data-reveal>{t("contactNote")}</p>
        <ContactField />
        <p className="contact-sec__alt">
          <a href={`mailto:${profile.email}`} className="link-u">{xl(profile.email)}</a>
          <span className="muted"> · {t("orCall")} </span>
          <a href={profile.phoneHref} className="link-u tabular">{xl(profile.phone)}</a>
          <span className="muted"> · </span>
          <a href={profile.linkedin} className="link-u" target="_blank" rel="noopener">{xl("LinkedIn")}</a>
        </p>
      </section>
    </>
  );
}
