"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { useRouter } from "@/i18n/navigation";
import { useUI } from "@/lib/store";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { REALITIES } from "@/reality/realities";

type Line = { kind: "in" | "out" | "err"; text: string };

const HELP = `commands
  whoami              who this is
  ls                  list projects
  cat <project>       read a project
  exp                 experience
  open <page>         go to a page (work, resume, contact…)
  reality [name]      list or switch realities
  theme               toggle light and dark
  ask <question>      ask the AI twin
  email               show contact
  clear | exit`;

export default function Terminal() {
  const router = useRouter();
  const { close, setReality, toggleTheme } = useUI();
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: `raktim.sh — type 'help'. Escape or 'exit' to leave.` }]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [lines]);

  const print = (text: string, kind: Line["kind"] = "out") => setLines((l) => [...l, { kind, text }]);

  const run = async (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { kind: "in", text: cmd }]);
    if (!cmd) return;
    setHist((h) => [cmd, ...h].slice(0, 40));
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");
    switch (name.toLowerCase()) {
      case "help":
        return print(HELP);
      case "whoami":
        return print(`${profile.name}\n${profile.role} · ${profile.location}\n${profile.oneLiner}`);
      case "ls":
        return print(projects.map((p) => `${p.slug.padEnd(30)} ${p.tagline}`).join("\n"));
      case "cat": {
        const p = projects.find((x) => x.slug === arg || x.title.toLowerCase() === arg.toLowerCase());
        if (!p) return print(`cat: ${arg || "?"}: no such project. Try 'ls'.`, "err");
        return print(`${p.title} (${p.year})\n${p.summary}\n${(p.metrics ?? []).map((m) => `  ${m.label}: ${m.value}`).join("\n")}\nstack: ${p.stack.join(", ")}`);
      }
      case "exp":
        return print(experience.map((e) => `${e.start}  ${e.role} — ${e.org}`).join("\n"));
      case "open": {
        const page = arg.replace(/^\//, "");
        close();
        return router.push(`/${page === "home" ? "" : page}`);
      }
      case "reality": {
        if (!arg) return print(REALITIES.map((r) => `${r.id.padEnd(14)} ${r.name}`).join("\n"));
        const r = REALITIES.find((x) => x.id === arg.toLowerCase() || x.name.toLowerCase() === arg.toLowerCase());
        if (!r) return print(`reality: unknown '${arg}'`, "err");
        setReality(r.id);
        return print(`switched to ${r.name}`);
      }
      case "theme":
        toggleTheme();
        return print("toggled");
      case "email":
      case "contact":
        return print(`${profile.email}\n${profile.phone}\n${profile.linkedin}`);
      case "ask": {
        if (!arg) return print("ask: what would you like to know?", "err");
        print("…");
        try {
          const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: arg }) });
          const j = await r.json();
          setLines((l) => [...l.slice(0, -1), { kind: r.ok ? "out" : "err", text: j.answer ?? j.error }]);
        } catch {
          setLines((l) => [...l.slice(0, -1), { kind: "err", text: "network error" }]);
        }
        return;
      }
      case "clear":
        return setLines([]);
      case "exit":
        return close();
      case "sudo":
        return print("nice try.", "err");
      default:
        return print(`${name}: command not found. Type 'help'.`, "err");
    }
  };

  return (
    <Modal label="Terminal" className="term">
      <div className="term__screen" onClick={() => document.getElementById("term-input")?.focus()}>
        {lines.map((l, i) => (
          <pre key={i} className={`term__line term__line--${l.kind}`}>{l.kind === "in" ? `$ ${l.text}` : l.text}</pre>
        ))}
        <form
          className="term__form"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
            setHi(-1);
          }}
        >
          <label htmlFor="term-input">$</label>
          <input
            id="term-input"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const n = Math.min(hist.length - 1, hi + 1);
                if (hist[n] !== undefined) (setHi(n), setValue(hist[n]));
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const n = Math.max(-1, hi - 1);
                setHi(n);
                setValue(n === -1 ? "" : hist[n]);
              }
              if (e.key === "`") (e.preventDefault(), close());
            }}
          />
        </form>
        <div ref={end} />
      </div>
    </Modal>
  );
}
