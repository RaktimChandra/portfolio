/**
 * Real endorsements only. Add an entry when someone sends one through /endorse (or by email)
 * and has ticked "you may publish this". Nothing renders until this list has entries.
 */
export type Endorsement = {
  quote: string;
  name: string;
  role: string; // e.g. "Engineering Manager"
  org: string; // e.g. "Bluestock Fintech", or "Freelance client, fintech startup" when the client stays anonymous
  relation: "manager" | "team lead" | "client" | "teammate" | "mentor" | "faculty";
  date: string; // YYYY-MM
  linkedin?: string; // a public profile, so readers can verify
  project?: string; // project slug it refers to
};

export const endorsements: Endorsement[] = [];
