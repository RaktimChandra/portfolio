import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import RealityGallery from "@/components/RealityGallery";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Realities", "Twenty-one visual realities for one site: each is a WebGL shader plus a set of design tokens.", "/lab", locale);
}
export default async function Lab({ params }: LP) {
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Realities")} lede={xl("One site, twenty-one ways of drawing it. Each reality is a fragment shader running behind the page and a set of design tokens that every component reads: colour, type, surfaces and buttons. Pick one and the whole site changes; the link in your address bar keeps it.")} />
      <div className="prose" style={{ marginBottom: "2.5rem" }}>
        <h2>{xl("How it stays fast")}</h2>
        <ul>
          <li>{xl("Shaders load after the first paint and render at half resolution, at most 45 frames a second, and pause when the tab is hidden.")}</li>
          <li>{xl("A veil rises behind text once you scroll, so reading is never fighting the background.")}</li>
          <li>{xl("With reduced motion on, each reality renders one still frame.")}</li>
        </ul>
      </div>
      <RealityGallery />
    </div>
  );
}
