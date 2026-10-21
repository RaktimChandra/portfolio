import type { Project } from "../projects";
import type { ProjectText } from "./types";
import { hi } from "./projects.hi";
import { hi2 } from "./projects.hi2";
import { bn } from "./projects.bn";
import { bn2 } from "./projects.bn2";

const TEXT: Record<string, Record<string, ProjectText>> = { hi: { ...hi, ...hi2 }, bn: { ...bn, ...bn2 } };

/** The project with its prose in the visitor's language. Titles, stack and numbers stay as they are. */
export function localize(p: Project, locale: string): Project {
  const t = TEXT[locale]?.[p.slug];
  if (!t) return p;
  return {
    ...p,
    tagline: t.tagline,
    summary: t.summary,
    problem: t.problem ?? p.problem,
    approach: t.approach ?? p.approach,
    context: t.context ?? p.context,
    team: t.team ?? p.team,
    metrics: p.metrics?.map((m, i) => ({ ...m, label: t.metrics?.[i] ?? m.label })),
  };
}

export const hasTranslation = (slug: string, locale: string) => !!TEXT[locale]?.[slug];
