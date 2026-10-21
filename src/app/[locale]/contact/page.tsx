import { getX } from "@/i18n/x/server";
import { Link } from "@/i18n/navigation";
import BookCall from "@/components/BookCall";
import PageHead from "@/components/PageHead";
import ContactField from "@/components/ContactField";
import CopyButton from "@/components/CopyButton";
import { profile } from "@/content/profile";
import { links } from "@/content/record";
import { boot, localeParams, meta, type LP } from "@/lib/page";
import QRCode from "qrcode";
import ARCard from "@/components/ARCard";
import { SITE_URL } from "@/lib/site";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Contact", "Email, phone, LinkedIn and GitHub for Raktim Chandra.", "/contact", locale);
}

export default async function Contact({ params }: LP) {
  const xl = await getX();
  await boot(params);
  const qr = await QRCode.toString(`${SITE_URL}/raktim.vcf`, { type: "svg", margin: 0, color: { dark: "#111111", light: "#ffffff" } });
  const rows = [
    { k: "Email", v: profile.email, href: `mailto:${profile.email}`, copy: true },
    { k: "College email", v: "rc8823@srmist.edu.in", href: "mailto:rc8823@srmist.edu.in", copy: true },
    { k: "Phone", v: profile.phone, href: profile.phoneHref, copy: true },
    { k: "LinkedIn", v: "raktim-chandra", href: profile.linkedin },
    { k: "GitHub", v: profile.githubUser, href: profile.github },
  ];
  return (
    <div className="page wrap">
      <PageHead title={xl("Contact")} lede={xl("Email is the quickest way to reach me. I am in Chennai, on IST (UTC+5:30).")} />
      <table className="proof" style={{ marginBottom: "3rem" }}>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k}>
              <th scope="row">{xl(r.k)}</th>
              <td><a className="link-u" href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener">{xl(r.v)}</a></td>
              <td>{r.copy ? <CopyButton text={r.v} /> : null}</td>
            </tr>
          ))}
          {Object.entries(links.platforms).filter(([, v]) => v).map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{xl(k)}</th>
              <td>{v ? <a className="link-u" href={v} target="_blank" rel="noopener">{v.replace(/^https?:\/\//, "")}</a> : <span className="muted">{xl("Profile link coming soon")}</span>}</td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
      <section className="card panel contact-card" data-title={xl("Save my contact")} style={{ marginBottom: "3rem" }}>
        <div className="contact-card__qr" dangerouslySetInnerHTML={{ __html: qr }} aria-label={xl("QR code that saves Raktim's contact card")} role="img" />
        <div style={{ display: "grid", gap: "0.75rem", alignContent: "center" }}>
          <h2 className="card__title">{xl("Save me to your phone")}</h2>
          <p className="muted">{xl("Scan with a phone camera, or download the contact card. Handy at a career fair.")}</p>
          <p><a className="btn" href="/raktim.vcf" download>{xl("Download contact card")}</a></p>
        </div>
      </section>
      <ARCard />
      <p style={{ marginBottom: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}><BookCall /> <Link className="btn btn-quiet" href="/for">{xl("See my work for your company")}</Link></p>
      <h2 className="sec-title display">{xl("Or just write.")}</h2>
      <ContactField />
    </div>
  );
}
