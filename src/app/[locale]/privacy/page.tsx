import PageHead from "@/components/PageHead";
import OptOut from "@/components/OptOut";
import { profile } from "@/content/profile";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Privacy", "What this site collects, where it goes, and how to turn it off.", "/privacy", locale);
}

export default async function Privacy({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Privacy" lede="What this site collects, where it goes, and how to turn it off. Last updated 22 October 2026." />
      <div className="prose">
        <h2>Visit statistics</h2>
        <p>PostHog (EU servers) records page views and a few named actions: which project you open, which visual style you pick, résumé downloads, and clicks on email or phone. It does not record sessions or keystrokes, and it respects your browser&apos;s Do Not Track setting. Vercel Web Analytics and Speed Insights count visits and page speed without cookies.</p>
        <OptOut />
        <h2>The AI twin</h2>
        <p>Questions you type or speak are sent to this site&apos;s server to be answered, which may pass them to a language model through Vercel AI Gateway. The first 120 characters of each question are kept in the visit statistics so I can see what people ask. Don&apos;t type anything private.</p>
        <p>Voice input uses your browser&apos;s speech recognition; in Chrome, that audio goes to Google to be transcribed. Answers are read aloud by your own device&apos;s voice.</p>
        <h2>Guest book</h2>
        <p>If you sign it, your name, note and the optional place are stored in a database in Mumbai (Supabase) and shown publicly. A one-way hash of your IP address, changed daily, is stored to stop spam; it is never shown. Write to me to have a note removed.</p>
        <h2>Tailoring for your company</h2>
        <p>If you enter a company website, the server reads that site&apos;s public homepage once to match it against my work. The domain is counted in the visit statistics. Nothing else is stored.</p>
        <h2>On your device</h2>
        <p>Your chosen visual style, light or dark mode, visitor type and game best scores are kept in your browser&apos;s local storage. They never leave your device.</p>
        <h2>Booking a call and email</h2>
        <p>Booking opens Cal.com, which has its own privacy policy. Email goes to my Gmail.</p>
        <h2>Questions or removal</h2>
        <p>Email <a className="link-u" href={`mailto:${profile.email}?subject=Privacy`}>{profile.email}</a>.</p>
      </div>
    </div>
  );
}
