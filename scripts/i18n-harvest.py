#!/usr/bin/env python3
"""Lists every English string still missing a Hindi translation.
Run a server with I18N_COLLECT=<dir>/run first (next start), then:
  python3 scripts/i18n-harvest.py <dir> [port]
Writes <dir>/all.json (all strings seen) and <dir>/client.json (strings client components need),
and refreshes src/i18n/x/client-keys.json."""
import json, re, glob, sys, os, urllib.request, time
H = sys.argv[1]; port = sys.argv[2] if len(sys.argv) > 2 else "3100"
norm = lambda s: re.sub(r"\s+", " ", s).strip()
pages = re.findall(r'"(/[^"]*)"', open("src/app/sitemap.ts").read().split("PAGES = [")[1].split("];")[0]) + [""]
src = open("src/content/projects.ts").read()
drafts = set(re.findall(r'slug: "([^"]+)",\n    title: "[^"]+",\n    tagline: "Write-up in progress."', src))
slugs = [s for s in re.findall(r'slug: "([^"]+)"', src) if s not in drafts]
blog = re.findall(r'slug: "([^"]+)"', open("src/content/blog.ts").read())
pages += [f"/work/{s}" for s in slugs] + [f"/blog/{s}" for s in blog] + ["/for/stripe?site=stripe.com", "/proposal?k=web,ai&s=m&d=2026-12-01&i=x", "/nope404"]
for loc in ("hi",):
    for p in sorted(set(pages)):
        try: urllib.request.urlopen(f"http://localhost:{port}/{loc}{p}", timeout=180).read()
        except Exception: pass
time.sleep(3)
server, client = set(), set()
for f in glob.glob(H + "/run*.json") + glob.glob(H + "/miss*.json"):
    d = json.load(open(f)); server |= set(d["server"]); client |= set(d["client"])
lit = re.compile(r'xl(?:\.f)?\((\"(?:[^\"\\]|\\.)*\")')
for f in glob.glob("src/**/*.ts*", recursive=True):
    s = open(f).read()
    isc = s.lstrip().startswith(('"use client"', "'use client'"))
    for m in lit.finditer(s):
        v = norm(json.loads(m.group(1)))
        (client if isc else server).add(v)
# Prose in data that only client-side components render (3D labels, demos, scripted content).
DATA = ["src/components/demos/DebateSim.tsx", "src/components/demos/FaultToy.tsx", "src/three/Room.tsx", "src/three/Penalty3D.tsx",
        "src/components/ParticleSection.tsx", "src/content/geo.ts", "src/components/TwinBox.tsx", "src/three/AgentPipeline.tsx",
        "src/content/scope.ts", "src/content/interview.ts", "src/content/journey.ts", "src/components/CommandPalette.tsx",
        "src/components/demos/LiveDemo.tsx", "src/content/architecture.ts", "src/components/Matcher.tsx", "src/components/Scoper.tsx",
        "src/components/InterviewMode.tsx", "src/components/Journey.tsx", "src/content/walkthroughs.json", "src/components/Penalty.tsx",
        "src/components/RealityDial.tsx", "src/components/Brief.tsx", "src/components/EndorseForm.tsx", "src/three/SkillGalaxy.tsx",
        "src/three/Globe.tsx", "src/three/Arch3D.tsx", "src/three/ProjectTiles.tsx", "src/reality/realities.ts", "src/content/roles.ts"]
strl = re.compile(r'"((?:[^"\\]|\\.){3,})"')
for f in DATA:
    if not os.path.exists(f): continue
    for m in strl.finditer(open(f).read()):
        try: v = norm(json.loads('"' + m.group(1) + '"'))
        except Exception: continue
        if re.search(r"[A-Za-z]{3,}\s+[A-Za-z]{2,}", v) and not re.match(r"^(https?:|/|#|\.|@)", v) and not re.search(r"[{};=<>]|=>|\$\{", v):
            client.add(v)
ind = re.compile(r"[ऀ-ॿঀ-৿]")
ok = lambda v: re.search(r"[A-Za-z]{2,}", v) and not ind.search(v)
# Client lookups only record misses, so keep the keys already shipped (union, never shrink).
prev = set(json.load(open("src/i18n/x/client-keys.json"))) if os.path.exists("src/i18n/x/client-keys.json") else set()
allk = sorted(v for v in server | client if ok(v)); cl = sorted(v for v in client | prev if ok(v))
json.dump(allk, open(H + "/all.json", "w"), ensure_ascii=False, indent=0)
json.dump(cl, open(H + "/client.json", "w"), ensure_ascii=False, indent=0)
json.dump(cl, open("src/i18n/x/client-keys.json", "w"), ensure_ascii=False, indent=0)
print(len(allk), "strings,", len(cl), "client")
