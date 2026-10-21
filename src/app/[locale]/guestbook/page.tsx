import PageHead from "@/components/PageHead";
import GuestBook from "@/components/GuestBook";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Guest book", "Leave a note on Raktim Chandra's portfolio.", "/guestbook", locale);
}

export default async function GuestBookPage({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Guest book" lede="Passing through? Leave a line. Notes are from visitors, appear as written, and aren't verified." />
      <GuestBook />
    </div>
  );
}
