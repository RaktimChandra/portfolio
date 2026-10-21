#!/usr/bin/env python3
"""Copies exact line ranges from the public repos into src/content/walkthroughs.json.
usage: python3 scripts/walkthroughs.py /root/research/repos
Each step's lines are 1-based and inclusive, in the file at the commit recorded below."""
import json, subprocess, sys
root = sys.argv[1]
W = [
  dict(slug="bulwark", repo="bulwark", file="backend/app/agents/consensus.py", start=28, end=71,
       title="How five agents become one verdict",
       steps=[(33, 35, "A weighted average of every agent's risk score. Weights come from each agent's report, so a strong signal counts for more."),
              (37, 40, "The override: one confident, heavily weighted signal (a sanctions hit, a confirmed mule cycle) lifts the score on its own, however calm the others are."),
              (42, 44, "Confidence is how much the agents agree: one minus the mean distance from the consensus score."),
              (46, 52, "Thresholds from settings turn the score into block, review or approve."),
              (54, 64, "The explanation: agents ranked by score times weight, top three rationales kept. This is the trail an analyst reads.")]),
  dict(slug="marginalia", repo="marginalia", file="backend/app/agents/orchestrator.py", start=64, end=110,
       title="The debate loop",
       steps=[(67, 77, "Retrieve sources first, and broadcast every step so the UI can show the deliberation live."),
              (79, 81, "The Explorer proposes the first set of claims."),
              (83, 91, "Each round, the Skeptic attacks and the Verifier checks. Both messages are streamed."),
              (93, 100, "Stop early when the Skeptic raises nothing and no claim is contested: the agents have converged."),
              (102, 110, "Only then does the Synthesizer write the report.")]),
  dict(slug="business-entity-resolution", repo="business-entity-resolution", file="src/ber/pruner.py", start=33, end=68,
       title="Pruning candidates without losing matches",
       steps=[(36, 45, "Out-of-fold scores: each fold's pruner never saw the source entities it scores, so the matcher trains on honest candidates."),
              (46, 48, "A final pruner on all rows, used at inference."),
              (50, 58, "The threshold is the most aggressive one that still keeps (1 − tolerance) of the true pairs, capped by a maximum."),
              (59, 65, "Counts before and after, logged so every run states what pruning cost.")]),
  dict(slug="testharness", repo="TestHarness", file=".github/scripts/fault_matrix.py", start=16, end=48,
       title="Which suite caught which bug",
       steps=[(23, 25, "The run with no bug switched on is the baseline."),
              (30, 41, "A suite only gets credit if it was green on the baseline and red with the bug. A suite already failing proves nothing."),
              (43, 48, "Detection rate per suite, and the bugs that escaped every suite.")]),
  dict(slug="genesis", repo="genesis", file="lib/pipeline.ts", start=134, end=181,
       title="Verify, then debug, until clean",
       steps=[(136, 148, "The Verifier audits the generated files and returns issues as JSON."),
              (150, 153, "Only critical issues and warnings block. None left: the loop ends."),
              (155, 163, "The Debugger gets the files and the blocking issues, and returns patched files."),
              (171, 177, "Patches are merged over the agent-authored files, then the loop audits again.")]),
]
out = []
for w in W:
    path = f"{root}/{w['repo']}/{w['file']}"
    lines = open(path, encoding="utf-8").read().split("\n")
    sha = subprocess.check_output(["git", "-C", f"{root}/{w['repo']}", "log", "-1", "--format=%H", "--", w["file"]]).decode().strip()
    out.append({"slug": w["slug"], "repo": w["repo"], "file": w["file"], "sha": sha, "title": w["title"], "start": w["start"],
                "code": "\n".join(lines[w["start"] - 1:w["end"]]),
                "steps": [{"from": a, "to": b, "note": n} for a, b, n in w["steps"]]})
json.dump(out, open("src/content/walkthroughs.json", "w"), indent=1)
print(len(out), "walkthroughs")
