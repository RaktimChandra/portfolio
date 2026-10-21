import PageHead from "@/components/PageHead";
import { awards } from "@/content/record";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Recognition", "2× national hackathon winner, EY Techathon 6.0 and Guidewire DevTrails semifinalist, Amazon ML Challenge 2026, 40+ hackathons.", "/achievements", locale);
}

export default async function Achievements({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Recognition" lede="Hackathons, competitions, open source and service. Most of it as team lead of VORTEXXX." />
      <table className="proof">
        <tbody>
          {awards.map((a) => (
            <tr key={a.title} data-reveal>
              <th scope="row">{a.title}</th>
              <td className="muted">{a.detail}</td>
              <td className="tabular muted">{a.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
