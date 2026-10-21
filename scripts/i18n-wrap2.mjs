// Second codemod pass: wraps string literals that are the rendered branches of ?: / && / || inside
// JSX children or text attributes, e.g. {awake ? "daytime here" : "night here"}.
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "@babel/parser";
import traverseMod from "@babel/traverse";
import MagicString from "magic-string";

const traverse = traverseMod.default ?? traverseMod;
const ATTRS = new Set(["title", "lede", "placeholder", "aria-label", "alt", "label", "data-title"]);
const isProse = (s) => /[A-Za-z]{2,}/.test(s) && !/^[a-z0-9_-]+$/.test(s) && !/^(https?:|\/|#|mailto:)/.test(s);

function compName(p) {
  const n = p.node;
  if (n.id?.name) return n.id.name;
  const pp = p.parentPath;
  if (pp?.isVariableDeclarator() && pp.node.id.name) return pp.node.id.name;
  if (pp?.isExportDefaultDeclaration()) return "default";
  return null;
}

for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, "utf8");
  const client = /^["']use client["']/m.test(src.slice(0, 40));
  const ast = parse(src, { sourceType: "module", plugins: ["jsx", "typescript"] });
  const ms = new MagicString(src);
  const hosts = new Map();
  let edits = 0;
  const hostFor = (path) => {
    let p = path.getFunctionParent(), best = null;
    while (p) {
      const name = compName(p);
      if (name && (/^[A-Z]/.test(name) || name === "default")) best = p;
      p = p.parentPath?.getFunctionParent();
    }
    return best;
  };
  const rendered = (path) => {
    // Walk up through ?: and logical operators only, until a JSX container we care about.
    let p = path;
    while (p.parentPath && (p.parentPath.isConditionalExpression() || p.parentPath.isLogicalExpression())) {
      if (p.parentPath.isConditionalExpression() && p.key === "test") return false;
      if (p.parentPath.isLogicalExpression() && p.key === "left" && p.parentPath.node.operator === "&&") return false;
      p = p.parentPath;
    }
    if (p === path) return false; // a bare literal in a container is handled by pass 1 or is code
    const c = p.parentPath;
    if (!c?.isJSXExpressionContainer()) return false;
    if (c.parentPath.isJSXElement() || c.parentPath.isJSXFragment()) return true;
    return c.parentPath.isJSXAttribute() && ATTRS.has(c.parentPath.node.name.name);
  };
  const wrapNode = (path) => {
    if (!rendered(path)) return;
    if (path.parentPath.isCallExpression() && path.parentPath.node.callee.name === "xl") return;
    const h = hostFor(path);
    if (!h) return;
    hosts.set(h.node, h);
    ms.overwrite(path.node.start, path.node.end, `xl(${src.slice(path.node.start, path.node.end)})`);
    edits++;
  };
  traverse(ast, {
    MemberExpression(path) {
      if (process.env.MEMBERS) wrapNode(path);
    },
    StringLiteral(path) {
      if (!isProse(path.node.value) || !rendered(path)) return;
      const h = hostFor(path);
      if (!h) return;
      hosts.set(h.node, h);
      ms.overwrite(path.node.start, path.node.end, `xl(${JSON.stringify(path.node.value)})`);
      edits++;
    },
  });
  if (!edits) continue;
  for (const [node] of hosts) {
    const body = node.body;
    const text = src.slice(body.start, body.end);
    if (/const xl = /.test(text.split("\n").slice(0, 4).join("\n"))) continue;
    if (body.type !== "BlockStatement") {
      ms.prependLeft(body.start, `{ ${client ? "const xl = useX();" : "const xl = await getX();"} return (`);
      ms.appendRight(body.end, "); }");
    } else ms.appendLeft(body.start + 1, client ? "\n  const xl = useX();" : "\n  const xl = await getX();");
    if (!client && !node.async) ms.prependLeft(node.start, "async ");
  }
  let out = ms.toString();
  const imp = client ? 'import { useX } from "@/i18n/x/client";' : 'import { getX } from "@/i18n/x/server";';
  if (!out.includes(imp)) {
    const m = out.match(/^["']use client["'];?\n/);
    out = m ? out.slice(0, m[0].length) + imp + "\n" + out.slice(m[0].length) : imp + "\n" + out;
  }
  writeFileSync(file, out);
  console.log(`ok ${String(edits).padStart(3)} ${file}`);
}
