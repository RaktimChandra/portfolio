# Raktim Chandra — portfolio

Personal site of **Raktim Chandra**, AI, ML and full-stack engineer.

One site drawn twenty-one ways. Each "reality" (Glass Lab, Web 1.0, Topographic, Teletext, Thermal Camera, Op Art, Retro Desktop and more) is a WebGL fragment shader plus a set of design tokens that every component reads. Press `R` on any page to turn the dial; the choice lives in the URL (`?reality=teletext`) so it can be shared.

## What's inside

- **Next.js 16** (App Router, React 19), TypeScript, Tailwind CSS v4
- **next-intl**: English, Hindi and Bengali
- **WebGL2** reality shaders (`src/reality/`) and a **React Three Fiber** project constellation on `/work`
- **AI twin** (`/api/ask`): MiniSearch retrieval over the site's own content. It uses an LLM through Vercel AI Gateway when `AI_GATEWAY_API_KEY` is set; otherwise it answers extractively, always with sources
- **Job matcher** (`/match`): paste a job post, get skill coverage, honest gaps and a tailored printable résumé, all in the browser
- **Project scoper** (`/scope`), **30-second brief** (`/brief`), live **status** checks of every demo (`/status`)
- ⌘K command palette, a terminal (backtick key), a keepy-uppy game (Konami code), a penalty-shootout 404
- PWA: manifest, offline service worker, installable on phones
- SEO: per-page metadata, Open Graph image, JSON-LD, sitemap with hreflang, `robots.txt`, `llms.txt`

## Editing content

Everything lives in `src/content/`:

| File | What |
|---|---|
| `profile.ts` | Name, pitch, education, contact |
| `experience.ts` | Internships and the freelance practice |
| `projects.ts` | Every project. Metrics are only ones measured in the project itself |
| `record.ts` | Papers, recognition, certifications, services, skills, and **`links`** |

`links` in `record.ts` holds URLs still to be filled in (IEEE papers, the IGI chapter, coding-platform profiles, certificate verification). Empty strings render as plain text, never as dead links.

## Commands

```bash
npm install
npm run dev                                        # http://localhost:3000
npm run build && npm start
node scripts/assets.mjs http://localhost:3000      # regenerate public/resume.pdf and app icons
node scripts/shot.mjs http://localhost:3000/ out 1440,390   # screenshots
```

Optional environment variables: `AI_GATEWAY_API_KEY` (LLM answers for the twin), `NEXT_PUBLIC_SITE_URL` (canonical URL).
