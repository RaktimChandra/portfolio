# Raktim Chandra — Portfolio: Plan

Status: v1 plan, 2026-10-21. Owner: Raktim Chandra. Builder: Claude.

## 1. The idea

Raktim works across ten engineering domains: agentic AI, GenAI, ML, data, MLOps, full-stack, QA, cloud, blockchain and research. A portfolio for someone that broad usually turns into a list. Here, the range becomes the interface:

> On this site, **Raktim's range** becomes **a dial that re-renders the entire site through twenty visual realities**.

The **Reality Dial** is the signature. One control re-skins every page (type, colour, surfaces, motion, and a live WebGL background) into one of 20 styles:

Glass Lab (home reality) · Web 1.0 · Topographic · Psychedelic · Watercolour · Teletext · Origami · Thermal Camera · Memphis · Flow Field · Neumorphism · WordArt · Collage · Datamosh · Spirograph · Aurora · Op Art · Light Painting · 1-Bit Dither · Skeuomorphic · Retro Desktop

Each reality is a complete design: CSS tokens, fonts, surface treatment and a GPU shader. It is not a colour filter. The URL remembers the choice (`?reality=teletext`), so a link can open the site in any style.

**The live things** (one per audience):
- Recruiters: paste a job description and see the fit and the evidence, then print a résumé tailored to it.
- Everyone: ask the AI twin, which answers only from Raktim's real data and cites the project behind each claim.
- Clients: describe a project and get the closest past work, an approach and a timeline band, then start a conversation.

## 2. Audiences and routing

| Visitor | Wants in 10 seconds | Path |
|---|---|---|
| Recruiter / hiring manager | Role fit, proof, résumé | JD matcher → 30-second brief → résumé |
| Client (individual, startup, enterprise) | Can he build mine, how, how long | Services → scoper → contact |
| Founder / investor / funder | Ambition, shipped products, leadership | Flagships → hackathons → contact |
| Researcher / professor / gov programme | Publications, rigour | Research → papers → press kit |

A persona chip on the home page ("I'm hiring", "I need something built", "I'm investing", "I'm researching") reorders home sections and changes calls to action. The choice persists in localStorage.

## 3. Pages

`/` Home · `/work` all projects (filterable 3D constellation + list) · `/work/[slug]` case study · `/experience` · `/services` (hire me) · `/research` · `/achievements` · `/certifications` · `/about` · `/resume` (+ role variants and a tailored print view) · `/contact` · `/open-source` · `/uses` · `/now` · `/lab` (shader/reality gallery and experiments) · `/status` (live demo health) · `/brief` (30-second recruiter mode) · `/press` (press kit) · custom 404 with a penalty-kick mini-game.

Locales: `en` (default), `hi` (Hindi) and `bn` (Bengali). All UI is translated; project and long-form text are translated for titles, taglines and summaries, while deep case-study bodies stay in English in v1.

## 4. Feature list (all user-selected)

- **3D:** a project constellation where each of ~45 projects is a body, clustered by domain and linked by shared tech. Hover to preview, click to open. Built with React Three Fiber, lazy-loaded after first paint.
- **Reality engine:** 20 realities; each has a fragment shader (raw WebGL2, about 2 KB each, loaded only when chosen) and a CSS token set.
- **Light/dark** for every reality that has a natural pair; inherently fixed realities (Teletext, Web 1.0) declare it.
- **Motion:** Lenis smooth scroll, GSAP ScrollTrigger for pinned case-study storytelling, Motion for component springs, View Transitions between pages, magnetic buttons, a custom cursor that respects touch and reduced motion.
- **AI twin** (`/api/ask`): MiniSearch retrieval over a knowledge base generated from the content files. With an AI Gateway key it streams an LLM answer grounded in retrieved chunks with citations; without one it gives an extractive answer from the same chunks. It never answers outside the data.
- **JD matcher:** a skill taxonomy with synonyms extracts requirements, scores coverage against projects, experience and certifications, explains each match, and opens `/resume?for=<role>&focus=<skills>` as a print-ready tailored résumé.
- **Client scoper:** project type, budget band and deadline map to similar projects, an approach, a timeline band, and a prefilled email.
- **Command palette** (⌘K / Ctrl+K) and **terminal mode** (backtick key): `ls work`, `open genesis`, `reality teletext`, `ask "…"`, `hire --role=ai-ml`.
- **Sound** (off by default): synthesized WebAudio clicks, no audio files.
- **Easter eggs:** the Konami code opens a keepy-uppy football game; the 404 page has a penalty-kick game.
- **Trust:** verify links for every certificate (placeholders until provided), DOIs for papers, GitHub links, and a confidential-client section.
- **Status page:** live health checks of deployed demos.
- **PWA:** installable on Android, iOS and desktop, with an offline shell and app shortcuts (Ask, Work, Résumé). Store packaging (TWA/Capacitor) is a later step.
- **Analytics:** Vercel Analytics and Speed Insights; PostHog when connected.

## 5. Content rules

- One content source: `content/*.ts`. Every page, the AI twin's knowledge base, the JD matcher, the résumé and the terminal read from it.
- **Metrics carry `verified`.** Numbers found in repos or past work are `verified: true` and display. Numbers not yet measured are `verified: false`: the data keeps a draft target value, but the site shows a qualitative line instead until Raktim measures it and flips the flag. The site never publishes an unmeasured number as fact.
- Links not yet provided are `null`; the UI shows "Repo private", "Demo coming" or hides the button. One file (`content/links.ts`) holds every link to fill in later.
- Client names stay confidential ("17+ clients · names withheld under contract").
- No invented testimonials. That section stays hidden until real quotes exist.

## 6. Stack

Next.js 16 (App Router, React 19, TypeScript) · Tailwind CSS v4 · next-intl · React Three Fiber, drei and three · raw WebGL2 for reality shaders · GSAP and ScrollTrigger · Lenis · Motion · cmdk · MiniSearch · AI SDK with Vercel AI Gateway (optional) · Fontsource variable fonts (self-hosted, no font CDN) · Vercel (hosting, analytics) · Playwright with Chromium (testing and résumé PDF rendering).

## 7. Performance budget

- First load JS on home ≤ 180 KB gzip, excluding the lazy 3D chunk.
- LCP ≤ 1.8 s on 4G mid-range; CLS ≈ 0; INP ≤ 150 ms.
- The 3D constellation loads after `requestIdleCallback` and only when visible. DPR is capped at 1.5 (1 on low-end devices); it pauses when off-screen or the tab is hidden.
- The reality shader is a single fullscreen quad running at reduced resolution (0.5×) with frames throttled when idle.
- `prefers-reduced-motion`: no smooth scroll, no parallax, shaders frozen to one frame, content fully visible.
- Lighthouse target ≥ 95 in all four categories on `/`.

## 8. Quality gates

1. `tsc --noEmit`, ESLint and `next build` clean.
2. Playwright at 1440, 768 and 390: every route loads, no console errors, every reality renders, the language switch works, palette and terminal open, the AI twin answers, the JD matcher scores a sample JD.
3. Taste inspector (`design-taste-frontend` inspect) for type, frame and contrast. Glass and 3D are deliberate overrides requested by the owner.
4. Accessibility: keyboard path through every page, visible focus, alt text, contrast AA in every reality's body text.
5. Lighthouse on the production URL.

## 9. Delivery

GitHub `RaktimChandra/portfolio` → Vercel project with Git integration, so every push deploys. Production URL first on `*.vercel.app`; a custom domain (e.g. `raktimchandra.dev`) can be attached later.

## 10. Owner to-do (later)

- Fill `content/links.ts`: repo and demo links, certificate verify URLs, paper DOIs, coding-platform usernames, Cal.com link.
- Measure and flip `verified` metrics.
- Optional: add `AI_GATEWAY_API_KEY` in Vercel for LLM answers; connect PostHog.
