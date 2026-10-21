import PageHead from "@/components/PageHead";
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
  await boot(params);
  const e = profile.education;
  return (
    <div className="page wrap">
      <PageHead title="About" />
      <div className="about-sec">
        <aside className="about-sec__side">
          <Avatar size={220} />
          <dl className="side-facts">
            <div><dt className="muted text-small">Based in</dt><dd>{profile.location}</dd></div>
            <div><dt className="muted text-small">From</dt><dd>{profile.from}</dd></div>
            <div><dt className="muted text-small">Degree</dt><dd>{e.degree}</dd></div>
            <div><dt className="muted text-small">School</dt><dd>{e.school}, {e.dept}</dd></div>
            <div><dt className="muted text-small">Years</dt><dd className="tabular">{e.years} · CGPA {e.cgpa}</dd></div>
            <div><dt className="muted text-small">Off the clock</dt><dd>{profile.outside.join(" · ")}</dd></div>
          </dl>
        </aside>
        <div className="about-sec__body">
          <p className="about-sec__para">{profile.pitch}</p>
          <div className="prose" style={{ marginTop: "2rem" }}>
            <p>I grew up in West Bengal and moved to Chennai for engineering at SRM. {e.note}</p>
            <p>Most of what I build sits where AI meets real constraints: no internet in a rural clinic, a hangar with no bandwidth, a fraud desk that must explain itself to a regulator. I like problems where the model is a part of the system, not the whole of it, and where the result has to be measured rather than demoed.</p>
            <p>Alongside college I&apos;ve held {profile.numbers.internships} internships and program roles, run a freelance practice with {profile.numbers.clients} clients, published {profile.numbers.papers} IEEE papers and led team VORTEXXX through {profile.numbers.hackathons} hackathons.</p>
            <p>Interests: {profile.roles.join(", ")}.</p>
            <h2>How I work</h2>
            <ul>{profile.principles.map((p) => <li key={p.title}><b>{p.title}.</b> {p.body}</li>)}</ul>
            <h2>Outside work</h2>
            <p>Football first: Messi and Argentina, always. Then the gym, swimming and basketball.</p>
            <p><Link href="/resume" className="btn">Résumé</Link> <Link href="/contact" className="btn btn-quiet">Contact</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
