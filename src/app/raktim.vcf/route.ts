import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const v = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Chandra;Raktim;;;",
    `FN:${profile.name}`,
    `TITLE:${profile.role}`,
    "ORG:Independent",
    `EMAIL;TYPE=INTERNET,PREF:${profile.email}`,
    `TEL;TYPE=CELL:${profile.phone.replace(/\s/g, "")}`,
    "ADR;TYPE=WORK:;;;Chennai;Tamil Nadu;;India",
    `URL:${SITE_URL}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${profile.linkedin}`,
    `X-SOCIALPROFILE;TYPE=github:${profile.github}`,
    `NOTE:${profile.oneLiner}`,
    "END:VCARD",
  ].join("\r\n");
  return new Response(v, { headers: { "content-type": "text/vcard; charset=utf-8", "content-disposition": 'attachment; filename="Raktim-Chandra.vcf"' } });
}
