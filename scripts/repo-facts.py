"""Recompute src/content/repoFacts.ts from local clones of the public repos.
usage: python3 scripts/repo-facts.py /path/to/dir-of-clones
Counts non-blank source lines, test functions, GitHub Actions workflows, commits, Docker presence."""
import os, re, json, subprocess, sys

EXT = {'.py':'Python','.ts':'TypeScript','.tsx':'TypeScript','.js':'JavaScript','.jsx':'JavaScript','.java':'Java','.cpp':'C++','.hpp':'C++','.cc':'C++','.h':'C/C++','.c':'C','.sol':'Solidity','.go':'Go','.php':'PHP','.css':'CSS','.html':'HTML','.sql':'SQL','.kt':'Kotlin','.feature':'Gherkin'}
SKIP = {'node_modules','.git','dist','build','.next','venv','.venv','__pycache__','vendor','target','coverage','artifacts','out','lib','assets','static','public','data','datasets','plugins'}
README_REPORTS_TESTS = {'TestHarness','hotel-reservation-vv','lumen','bulwark','neurosentry','aerosentinel','CIForge'}

def scan(repo):
    loc, tests = {}, 0
    for r, dirs, fs in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in SKIP and not d.startswith('.')]
        for f in fs:
            ext = os.path.splitext(f)[1].lower()
            if ext not in EXT or f.endswith('.min.js') or 'lock' in f: continue
            p = os.path.join(r, f)
            t = open(p, errors='ignore').read()
            if len(t) > 400000: continue
            loc[EXT[ext]] = loc.get(EXT[ext], 0) + sum(1 for l in t.splitlines() if l.strip())
            low = p.lower()
            if 'test' in os.path.basename(low) or '/tests/' in low or '/test/' in low or '__tests__' in low or ext == '.feature' or '.spec.' in low:
                pats = {'.py': r'^\s*(?:async\s+)?def\s+test_', '.java': r'@(?:Test|ParameterizedTest|RepeatedTest)\b', '.feature': r'^\s*Scenario', '.sol': r'function\s+test'}
                pat = pats.get(ext) or (r'\b(?:it|test)\s*\(\s*[\'"`]' if ext in ('.ts','.tsx','.js','.jsx') else None)
                if pat: tests += len(re.findall(pat, t, re.M))
    wfdir = os.path.join(repo, '.github', 'workflows')
    commits = int(subprocess.run(['git','-C',repo,'rev-list','--count','HEAD'], capture_output=True, text=True).stdout.strip() or 0)
    docker = any(os.path.exists(os.path.join(repo, x)) for x in ('Dockerfile','docker-compose.yml','compose.yaml'))
    return {'loc': sum(loc.values()), 'langs': [k for k, _ in sorted(loc.items(), key=lambda x: -x[1])[:3]],
            'tests': 0 if os.path.basename(repo) in README_REPORTS_TESTS else tests,
            'workflows': len(os.listdir(wfdir)) if os.path.isdir(wfdir) else 0, 'commits': commits, 'docker': docker}

if __name__ == '__main__':
    base = sys.argv[1]
    out = {n: scan(os.path.join(base, n)) for n in sorted(os.listdir(base)) if os.path.isdir(os.path.join(base, n))}
    out = {k: v for k, v in out.items() if v['loc']}
    print(json.dumps(out, indent=2))
