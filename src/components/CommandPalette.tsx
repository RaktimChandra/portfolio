"use client";

import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useRouter } from "@/i18n/navigation";
import { useUI } from "@/lib/store";
import { MORE, NAV } from "@/lib/site";
import { projects } from "@/content/projects";
import { REALITIES } from "@/reality/realities";
import { profile } from "@/content/profile";

export default function CommandPalette() {
  const t = useTranslations("nav");
  const tp = useTranslations("pages");
  const tc = useTranslations("chrome");
  const router = useRouter();
  const { close, open, setReality, toggleTheme, setSound, sound } = useUI();

  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <Modal label={tc("palette")} position="top" className="palette">
      <Command label={tc("palette")} loop>
        <Command.Input autoFocus placeholder="Type a page, project, technology or reality…" className="palette__input" />
        <Command.List className="palette__list">
          <Command.Empty className="palette__empty">
            Nothing matched.{" "}
            <button type="button" className="link-u" onClick={() => open("twin")}>Ask the twin instead</button>
          </Command.Empty>
          <Command.Group heading="Pages">
            <Command.Item onSelect={() => go("/")}>{t("home")}</Command.Item>
            {NAV.map((n) => <Command.Item key={n.href} onSelect={() => go(n.href)}>{t(n.key)}</Command.Item>)}
            {MORE.map((n) => <Command.Item key={n.href} onSelect={() => go(n.href)}>{tp(n.key)}</Command.Item>)}
          </Command.Group>
          <Command.Group heading="Actions">
            <Command.Item onSelect={() => open("twin")}>Ask the AI twin a question</Command.Item>
            <Command.Item onSelect={() => go("/match")}>Match me against a job description</Command.Item>
            <Command.Item onSelect={() => go("/scope")}>Scope a project with me</Command.Item>
            <Command.Item onSelect={() => { navigator.clipboard?.writeText(profile.email); window.dispatchEvent(new CustomEvent("toast", { detail: `Copied ${profile.email}` })); close(); }}>Copy email address</Command.Item>
            <Command.Item onSelect={() => { close(); window.open("/resume.pdf", "_blank"); }}>Download résumé (PDF)</Command.Item>
            <Command.Item onSelect={() => { toggleTheme(); close(); }}>Toggle light and dark</Command.Item>
            <Command.Item onSelect={() => { setSound(!sound); close(); }}>{sound ? "Turn sound off" : "Turn sound on"}</Command.Item>
            <Command.Item onSelect={() => open("terminal")}>Open the terminal</Command.Item>
            <Command.Item onSelect={() => open("game")}>Play keepy-uppy</Command.Item>
          </Command.Group>
          <Command.Group heading="Projects">
            {projects.map((p) => (
              <Command.Item key={p.slug} value={`${p.title} ${p.tagline} ${p.stack.join(" ")}`} onSelect={() => go(`/work/${p.slug}`)}>
                <span>{p.title}</span>
                <span className="palette__meta">{p.tagline}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Realities">
            {REALITIES.map((r) => (
              <Command.Item key={r.id} value={`reality ${r.name}`} onSelect={() => { setReality(r.id); close(); }}>
                <span className="swatch" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${r.swatch[0]} 0 50%, ${r.swatch[2]} 50%)` }} />
                <span>{r.name}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </Modal>
  );
}
