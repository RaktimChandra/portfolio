// One-off codemod: wraps visible English in JSX with x("...") so it can be translated.
// - JSX text nodes and a few text attributes (title, lede, placeholder, aria-label, alt, label, data-title)
// - {expr} children that are identifiers or member expressions (content data) -> {x(expr)}
// - Inserts `const x = useX()` (client) or `const x = await getX()` (server) in the enclosing component.
// usage: node scripts/i18n-wrap.mjs file...   (prints a report; edits in place)
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "@babel/parser";
import traverseMod from "@babel/traverse";
import MagicString from "magic-string";

const traverse = traverseMod.default ?? traverseMod;
const ATTRS = new Set(["title", "lede", "placeholder", "aria-label", "alt", "label", "data-title"]);
const SKIP_TAGS = new Set(["code", "pre", "kbd", "script", "style", "title"]);
const isProse = (s) => /[A-Za-z]{2,}/.test(s) && !/^[\s\W\d]*$/.test(s);
const q = (s) => JSON.stringify(s.replace(/\s+/g, " ").trim());

function compName(fnPath) {
  // Name of a function that looks like a React component.
  const n = fnPath.node;
  if (n.id?.name) return n.id.name;
  const p = fnPath.parentPath;
  if (p?.isVariableDeclarator() && p.node.id.name) return p.node.id.name;
  if (p?.isExportDefaultDeclaration()) return "default";
  return null;
}

for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, "utf8");
  const client = /^["']use client["']/m.test(src.slice(0, 40));
  let ast;
  try {
    ast = parse(src, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (e) {
    console.log("PARSE FAIL", file, e.message);
    continue;
  }
  const ms = new MagicString(src);
  const hosts = new Map(); // component fn node -> path
  const orphans = [];
  let edits = 0;

  const hostFor = (path) => {
    let p = path.getFunctionParent();
    let best = null;
    while (p) {
      const name = compName(p);
      if (name && (/^[A-Z]/.test(name) || name === "default")) best = p;
      p = p.parentPath?.getFunctionParent();
    }
    return best;
  };
  const inSkippedTag = (path) => {
    let p = path.parentPath;
    while (p) {
      if (p.isJSXElement()) {
        const n = p.node.openingElement.name;
        if (n.type === "JSXIdentifier" && SKIP_TAGS.has(n.name)) return true;
      }
      p = p.parentPath;
    }
    return false;
  };
  const mark = (path) => {
    const h = hostFor(path);
    if (!h) return orphans.push(path.node.loc?.start.line), false;
    hosts.set(h.node, h);
    return true;
  };

  traverse(ast, {
    JSXText(path) {
      const raw = path.node.value;
      if (!isProse(raw) || inSkippedTag(path)) return;
      if (!mark(path)) return;
      const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
      const core = raw.slice(lead.length, raw.length - trail.length);
      // keep single spaces around so adjacent nodes still read correctly
      const l = lead.includes("\n") ? lead : lead ? "{\" \"}" : "";
      const r = trail.includes("\n") ? trail : trail ? "{\" \"}" : "";
      ms.overwrite(path.node.start, path.node.end, `${l}{xl(${q(core)})}${r}`);
      edits++;
    },
    JSXAttribute(path) {
      const name = path.node.name.name;
      const v = path.node.value;
      if (!ATTRS.has(name) || !v || v.type !== "StringLiteral" || !isProse(v.value)) return;
      if (!mark(path)) return;
      ms.overwrite(v.start, v.end, `{xl(${q(v.value)})}`);
      edits++;
    },
    JSXExpressionContainer(path) {
      if (!path.parentPath.isJSXElement() && !path.parentPath.isJSXFragment()) return; // children only
      const e = path.node.expression;
      if (e.type !== "MemberExpression" && e.type !== "Identifier") return;
      if (e.type === "Identifier" && ["children", "xl", "t"].includes(e.name)) return;
      if (inSkippedTag(path)) return;
      if (!mark(path)) return;
      ms.overwrite(e.start, e.end, `xl(${src.slice(e.start, e.end)})`);
      edits++;
    },
  });

  if (!edits) {
    console.log("--", file);
    continue;
  }
  for (const [node] of hosts) {
    const body = node.body;
    if (body.type !== "BlockStatement") {
      // concise arrow: (..) => (<jsx/>)  ->  (..) => { const x = ...; return (<jsx/>); }
      const decl = client ? "const xl = useX();" : "const xl = await getX();";
      ms.prependLeft(body.start, `{ ${decl} return (`);
      ms.appendRight(body.end, `); }`);
    } else {
      ms.appendLeft(body.start + 1, client ? "\n  const xl = useX();" : "\n  const xl = await getX();");
    }
    if (!client && !node.async) ms.prependLeft(node.start, "async ");
  }
  const imp = client ? 'import { useX } from "@/i18n/x/client";\n' : 'import { getX } from "@/i18n/x/server";\n';
  const firstImport = ast.program.body.find((n) => n.type === "ImportDeclaration");
  if (firstImport) ms.prependLeft(firstImport.start, imp);
  else ms.prepend(imp);
  writeFileSync(file, ms.toString());
  console.log(`ok ${edits.toString().padStart(3)} ${file}${orphans.length ? `  ORPHANS at lines ${orphans.join(",")}` : ""}`);
}
