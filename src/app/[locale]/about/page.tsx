import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import GlobeLazy from "@/components/GlobeLazy";
import Avatar from "@/components/Avatar";
import { profile } from "@/content/profile";
import { Link } from "@/i18n/navigation";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("About", "Raktim Chandra: final-year CSE at SRM, Chennai, from West Bengal. Builds agentic AI and full-stack systems.", "/about", locale);
}

export default async function About({ params }: LP) {
  const xl = await getX();
  await boot(params);
  const e = profile.education;
  return (
    <div className="page wrap">
      <PageHead title={xl("About")} />
      <div className="about-sec">
        <aside className="about-sec__side">
          <Avatar size={220} />
          <dl className="side-facts">
            <div><dt className="muted text-small">{xl("Based in")}</dt><dd>{xl(profile.location)}</dd></div>
            <div><dt className="muted text-small">{xl("From")}</dt><dd>{xl(profile.from)}</dd></div>
            <div><dt className="muted text-small">{xl("Degree")}</dt><dd>{xl(e.degree)}</dd></div>
            <div><dt className="muted text-small">{xl("School")}</dt><dd>{xl(e.school)}, {xl(e.dept)}</dd></div>
            <div><dt className="muted text-small">{xl("Years")}</dt><dd className="tabular">{xl(e.years)}{" "}{xl("· CGPA")}{" "}{xl(e.cgpa)}</dd></div>
            <div><dt className="muted text-small">{xl("Off the clock")}</dt><dd>{profile.outside.map((o) => xl(o)).join(" · ")}</dd></div>
          </dl>
        </aside>
        <div className="about-sec__body">
          <p className="about-sec__para">{xl(profile.pitch)}</p>
          <div className="prose" style={{ marginTop: "2rem" }}>
            <p>{xl("I grew up in West Bengal and moved to Chennai for engineering at SRM.")}{" "}{xl(e.note)}</p>
            <p>{xl("Most of what I build sits where AI meets real constraints: no internet in a rural clinic, a hangar with no bandwidth, a fraud desk that must explain itself to a regulator. I like problems where the model is a part of the system, not the whole of it, and where the result has to be measured rather than demoed.")}</p>
            <p>{xl.f("Alongside college I've held {i} internships and program roles, run a freelance practice with {c} clients, published {p} IEEE papers and led team VORTEXXX through {h} hackathons.", { i: profile.numbers.internships, c: profile.numbers.clients, p: profile.numbers.papers, h: profile.numbers.hackathons })}</p>
            <p>{xl("Interests:")}{" "}{profile.roles.map((r) => xl(r)).join(", ")}.</p>
            <GlobeLazy />
            <h2>{xl("How I work")}</h2>
            <ul>{profile.principles.map((p) => <li key={p.title}><b>{xl(p.title)}.</b> {xl(p.body)}</li>)}</ul>
            <h2>{xl("Outside work")}</h2>
            <p>{xl("Football first: Messi and Argentina, always. Then the gym, swimming and basketball.")}</p>
            <p><Link href="/resume" className="btn">{xl("Résumé")}</Link> <Link href="/contact" className="btn btn-quiet">{xl("Contact")}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
