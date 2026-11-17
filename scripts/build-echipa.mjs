// Generează pagina internă a echipei (docs/echipa.html) din fișierele repo-ului.
// Rulare: node scripts/build-echipa.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => { try { return fs.readFileSync(path.join(ROOT, p), "utf8"); } catch { return ""; } };
const git = (cmd) => { try { return execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// --- Markdown minimal -> HTML ---
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="path" title="$2">$1</span>');
  return s;
}
function md(src) {
  const lines = src.replace(/\r/g, "").split("\n");
  let out = [], i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`); continue; }
    if (/^#{1,4} /.test(l)) { const n = l.match(/^#+/)[0].length; out.push(`<h${n + 2}>${inline(l.replace(/^#+ /, ""))}</h${n + 2}>`); i++; continue; }
    if (/^\|/.test(l)) {
      const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const body = rows.filter((r, k) => k !== 1 || !/^\|[\s:|-]+\|$/.test(r));
      const [h, ...b] = body;
      out.push(`<div class="tablewrap"><table><thead><tr>${cells(h).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${b.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    if (/^\s*[-*] /.test(l)) { const it = []; while (i < lines.length && /^\s*[-*] /.test(lines[i])) it.push(lines[i++].replace(/^\s*[-*] /, "")); out.push(`<ul>${it.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`); continue; }
    if (/^\d+\. /.test(l)) { const it = []; while (i < lines.length && /^(\d+\. |\s{2,}\S)/.test(lines[i])) { if (/^\d+\. /.test(lines[i])) it.push(lines[i].replace(/^\d+\. /, "")); else it[it.length - 1] += " " + lines[i].trim(); i++; } out.push(`<ol>${it.map((x) => `<li>${inline(x)}</li>`).join("")}</ol>`); continue; }
    if (/^> /.test(l)) { const b = []; while (i < lines.length && /^> ?/.test(lines[i])) b.push(lines[i++].replace(/^> ?/, "")); out.push(`<blockquote>${inline(b.join(" "))}</blockquote>`); continue; }
    if (!l.trim()) { i++; continue; }
    const p = []; while (i < lines.length && lines[i].trim() && !/^(#|\||\s*[-*] |\d+\. |> |```)/.test(lines[i])) p.push(lines[i++]);
    out.push(`<p>${inline(p.join(" "))}</p>`);
  }
  return out.join("\n");
}
const sections = (src) => { const o = {}; src.split(/^## /m).slice(1).forEach((s) => { const [h, ...r] = s.split("\n"); o[h.trim()] = r.join("\n").trim(); }); return o; };
const field = (src, name) => (src.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`)) || [, ""])[1].trim();
const tableRows = (src) => src.split("\n").filter((l) => /^\|/.test(l)).slice(2).map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));

// --- Agenți ---
const COLORS = { pink: "#d4508a", blue: "#3b6fd6", purple: "#8a5cd0", cyan: "#1d9bb0", green: "#2f9a62", orange: "#d9772b", yellow: "#b8901c", teal: "#1f8a83" };
const agents = fs.readdirSync(path.join(ROOT, "team")).filter((n) => fs.existsSync(path.join(ROOT, "team", n, "profil.md"))).map((slug) => {
  const prof = rd(`team/${slug}/profil.md`);
  const title = (prof.match(/^# (.+)$/m) || [, slug])[1];
  const [name, role] = title.split(" — ");
  const def = rd(`.claude/agents/${slug}.md`);
  const color = (def.match(/^color:\s*(\w+)/m) || [, "teal"])[1];
  const sc = rd(`team/${slug}/scorecard.md`);
  const scRows = tableRows(sc.split("## Review-uri")[0]).filter((r) => /^\d{4}-/.test(r[0]));
  const memDir = `.claude/agent-memory/${slug}`;
  const memFiles = fs.existsSync(path.join(ROOT, memDir)) ? fs.readdirSync(path.join(ROOT, memDir)).filter((f) => f.endsWith(".md")) : [];
  const last = git(`log -1 --format=%cs -- team/${slug} ${memDir} .claude/agents/${slug}.md`);
  const dirty = git(`status --porcelain -- team/${slug} ${memDir} .claude/agents/${slug}.md`);
  const docsOf = (dir) => {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return [];
    const out = [];
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const full = path.join(d, e.name);
      if (e.isDirectory()) return walk(full);
      if (!/\.(md|html)$/.test(e.name)) return;
      const rel = path.relative(ROOT, full);
      const txt = rd(rel);
      const t = (txt.match(/^# (.+)$/m) || txt.match(/<title>([^<]+)<\/title>/) || [, e.name])[1];
      out.push({ rel, title: t.trim(), date: git(`log -1 --format=%cs -- "${rel}"`) || "nou" });
    });
    walk(abs);
    return out.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  };
  const docs = [...docsOf(`team/${slug}/documente`), ...docsOf(`team/${slug}/rapoarte`)];
  return {
    docs, slug, name: name.trim(), role: (role || "").trim(), color: COLORS[color] || COLORS.teal,
    category: field(prof, "Categorie") || "Altele", reportsTo: field(prof, "Raportează către"), status: field(prof, "Status"),
    sec: sections(prof), scRows, memory: rd(`${memDir}/MEMORY.md`), memFiles, last: last || "—", dirty: !!dirty,
  };
});
const ORDER = ["tudor", "elena", "maria", "victor", "radu", "ioana", "mike", "sofia"];
const rank = (s) => (ORDER.indexOf(s) < 0 ? 99 : ORDER.indexOf(s));
agents.sort((a, b) => rank(a.slug) - rank(b.slug));
const GROUP_ORDER = ["Strategie", "Produs", "Comunicare"];

// --- Noutăți ---
const reports = fs.readdirSync(path.join(ROOT, "team/tudor/rapoarte")).filter((f) => f.endsWith(".md")).sort().reverse().map((f) => {
  const s = rd(`team/tudor/rapoarte/${f}`);
  return { file: f, date: (f.match(/\d{4}-\d{2}-\d{2}/) || [""])[0], title: (s.match(/^# (.+)$/m) || [, f])[1], result: field(s, "Rezultat") };
});
const GH = "https://github.com/alexandrumolea/AgentsTeam/blob/main/";
const decisionsAll = tableRows(rd("docs/decizii.md")).filter((r) => /^D-\d+/.test(r[0]));
const isPending = (st) => /de luat|de confirmat|de discutat/i.test(st);
const pending = decisionsAll.filter((r) => isPending(r[5])).sort((a, b) => (/de luat/.test(b[5]) - /de luat/.test(a[5])) || a[0].localeCompare(b[0]));
const decisions = decisionsAll.filter((r) => !isPending(r[5])).reverse();
const aor = tableRows(rd("docs/aor.md"));
const tasks = tableRows(rd("docs/taskuri.md")).filter((r) => /^T-\d+/.test(r[0]));
const openTasks = tasks.filter((r) => !/gata|anulat/i.test(r[7]));
const taskCls = (st) => (/blocat|la alex/i.test(st) ? "warn" : /gata/i.test(st) ? "ok" : "info");
const ideas = tableRows(rd("docs/idei.md")).filter((r) => /^I-\d+/.test(r[0]));
const activeIdeas = ideas.filter((r) => !/respins|live/i.test(r[4])).length;
const plain = (t) => t.replace(/\*\*/g, "");
const proposals = tableRows((rd("ECHIPA.md").split("### Propuneri deschise")[1] || "").split("\n## ")[0]);
const commits = git("log -8 --format=%cs%x09%s").split("\n").filter(Boolean).map((l) => l.split("\t"));
const head = git("log -1 --format=%cs");
const now = new Date().toISOString().slice(0, 10);
const pendingDecisions = pending.length;

// --- Panou de control: ce așteaptă după Alex, ce e în lucru, ce așteaptă alt input, ce s-a terminat ---
// Citește doar statusurile care există în docs/taskuri.md, docs/decizii.md și docs/intrebari-pentru-alex.md.
// Un status necunoscut nu dispare: apare la „Așteaptă alt input” cu eticheta lui și un avertisment la build.
const linesOf = (file) => rd(file).replace(/\r/g, "").split("\n");
const rowsAt = (file) => linesOf(file).map((l, i) => ({ l, n: i + 1 })).filter((x) => /^\|/.test(x.l)).map((x) => ({ n: x.n, c: x.l.replace(/^\||\|$/g, "").split("|").map((s) => s.trim()) }));
const srcLink = (file, n) => `${GH}${file}?plain=1#L${n}`;
const blameDates = (file) => { // data ultimei schimbări a fiecărui rând (≈ când s-a schimbat statusul)
  const out = {}; let line = 0;
  git(`blame --line-porcelain -- "${file}"`).split("\n").forEach((l) => {
    const h = l.match(/^[0-9a-f]{40} \d+ (\d+)/); if (h) line = +h[1];
    const t = l.match(/^committer-time (\d+)/); if (t) out[line] = new Date(+t[1] * 1000).toISOString().slice(0, 10);
  });
  return out;
};
const short = (s, max = 150) => {
  let t = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*|~~|`/g, "").trim();
  const m = t.match(/^(.{20,}?[.?!])(\s|$)/); if (m && m[1].length <= max) t = m[1];
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, "") + "…" : t;
};
const warnings = [];

const decRows = rowsAt("docs/decizii.md").filter((x) => /^D-\d+/.test(x.c[0]));
decRows.forEach(({ c }) => { if (!isPending(c[5]) && !/activ|aprobat|respins|înlocuit|amânat|anulat|închis/i.test(c[5])) warnings.push(`${c[0]}: status necunoscut „${c[5]}”`); });
const pendingDec = decRows.filter(({ c }) => isPending(c[5])).sort((a, b) => b.c[0].localeCompare(a.c[0])); // cele mai noi întâi

const qFile = "docs/intrebari-pentru-alex.md";
const qSince = git(`log --diff-filter=A --format=%cs -- ${qFile}`).split("\n").pop() || "";
const qAll = []; let qSec = {};
linesOf(qFile).forEach((l, i) => {
  if (/^## /.test(l)) { qSec = { date: (l.match(/\d{4}-\d{2}-\d{2}/) || [qSince])[0], who: (l.match(/pentru (\p{Lu}\p{Ll}+)/u) || [, "Tudor"])[1], urgent: /URGENT/.test(l) }; return; }
  const m = l.match(/^(\d+)\. (.*)$/); if (!m) return;
  const body = m[2];
  const state = /^~~/.test(body) ? "răspunsă" : /^\W*\(?Amânat/i.test(body) ? "amânată" : /răspuns \d{4}-/i.test(body) ? "parțial" : "deschisă";
  qAll.push({ nr: m[1], body: body.replace(/^\*\*\(Amânat[^)]*\)\*\*\s*/i, ""), n: i + 1, ...qSec, state });
});
const qOpen = qAll.filter((q) => q.state === "deschisă" || q.state === "parțial").sort((a, b) => (b.urgent - a.urgent) || b.date.localeCompare(a.date) || a.nr - b.nr);
const qParked = qAll.filter((q) => q.state === "amânată");

const tFile = "docs/taskuri.md";
const tBlame = blameDates(tFile);
const tRows = rowsAt(tFile).filter((x) => /^T-\d+/.test(x.c[0])).map((x) => ({ ...x, changed: tBlame[x.n] || x.c[1] }));
const cp = { alexTasks: [], linked: {}, working: [], blocked: [], nou: [], deFacut: [], other: [], done: [] };
tRows.forEach((t) => {
  const st = t.c[7] || "";
  if (/^gata/i.test(st)) return cp.done.push(t);
  if (/^anulat/i.test(st)) return;
  if (/^în lucru/i.test(st)) return cp.working.push(t);
  if (/^la alex/i.test(st)) { // legat de o decizie deschisă: apare pe rândul deciziei, nu de două ori
    const d = (st.match(/D-\d+/) || [])[0];
    if (d && pendingDec.some((x) => x.c[0] === d)) return (cp.linked[d] ||= []).push(t.c[0]);
    return cp.alexTasks.push(t);
  }
  if (/^blocat/i.test(st)) return (/alex/i.test(st) ? cp.alexTasks : cp.blocked).push(t);
  if (/^nou/i.test(st)) return cp.nou.push(t);
  if (/^de făcut/i.test(st)) return cp.deFacut.push(t);
  warnings.push(`${t.c[0]}: status necunoscut „${st}”`); cp.other.push(t);
});
cp.done.sort((a, b) => b.changed.localeCompare(a.changed) || b.c[0].localeCompare(a.c[0]));

// Ce se lucrează chiar acum, din fișierele necomise (doar dosare și agenți, nu nume de fișiere)
const dirtyGroups = {};
git("status --porcelain").split("\n").filter(Boolean).forEach((l) => {
  const p = l.replace(/^\s*\S{1,2}\s+/, "").split(" -> ").pop().replace(/^"|"$/g, ""); // git() taie spațiul de la începutul primului rând
  if (p === "docs/echipa.html") return;
  const ag = p.match(/^team\/([^/]+)\//) || p.match(/^\.claude\/agent-memory\/([^/]+)\//);
  const a = ag && agents.find((x) => x.slug === ag[1]);
  const key = a ? a.name : p.includes("/") ? p.split("/")[0] + "/" : p;
  dirtyGroups[key] = (dirtyGroups[key] || 0) + 1;
});
const dirtyList = Object.entries(dirtyGroups).sort((a, b) => b[1] - a[1]);
const alexCount = pendingDec.length + qOpen.length + cp.alexTasks.length;
const otherCount = cp.blocked.length + cp.nou.length + cp.deFacut.length + cp.other.length;
warnings.forEach((w) => console.warn("Panou de control: " + w));

// --- HTML ---
const chip = (txt, cls = "") => `<span class="chip ${cls}">${inline(txt)}</span>`;
const statusCls = (s) => (/probă/i.test(s) ? "warn" : /propus/i.test(s) ? "info" : "ok");
const node = (a, extra = "") => `<a class="node ${extra}" href="#${a.slug}" data-slug="${a.slug}" style="--c:${a.color}">
  <span class="dot"></span><span class="nm">${esc(a.name)}</span><span class="rl">${esc(a.role)}</span>
  <span class="meta">${a.dirty ? "modificat local" : "activ " + esc(a.last)}</span></a>`;

const groups = {};
agents.forEach((a) => { if (!["Coordonare", "Calitate"].includes(a.category)) (groups[a.category] ||= []).push(a); });
const coord = agents.filter((a) => a.category === "Coordonare");
const qual = agents.filter((a) => a.category === "Calitate");

const orgChart = `
<div class="org">
  <div class="org-top">
    <div class="node alex"><span class="nm">Alex</span><span class="rl">Decide. Aprobă tot ce iese public.</span></div>
  </div>
  <div class="org-mid">
    <div class="mid-main">${coord.map((a) => node(a, "lead")).join("")}</div>
    <div class="mid-side">${qual.map((a) => node(a, "side")).join("")}<span class="side-note">raportează direct lui Alex și auditează sistemul</span></div>
  </div>
  <div class="org-groups">
    ${Object.entries(groups).sort((x, y) => (GROUP_ORDER.indexOf(x[0]) + 99) % 99 - (GROUP_ORDER.indexOf(y[0]) + 99) % 99).map(([g, list]) => `<div class="grp"><div class="grp-h">${esc(g)}</div>${list.map((a) => node(a)).join("")}</div>`).join("")}
  </div>
</div>`;

const card = (title, body, cls = "") => body ? `<section class="card ${cls}"><h3>${esc(title)}</h3>${body}</section>` : "";
const agentPanel = (a) => `
<article class="agent" id="panel-${a.slug}" data-slug="${a.slug}" style="--c:${a.color}" ${a.slug === agents[0].slug ? "" : "hidden"}>
  <header class="agent-h">
    <span class="avatar">${esc(a.name[0])}</span>
    <div class="agent-t"><h2>${esc(a.name)}</h2><p>${esc(a.role)}</p></div>
    <div class="chips">${chip(a.category, "cat")}${chip(a.status, statusCls(a.status))}${chip("Raportează: " + a.reportsTo)}</div>
  </header>
  <ul class="comp" aria-label="Ce are ${esc(a.name)}">${[
    ["Categorie", !!a.category], ["Scop", !!a.sec["Scop"]], ["Jobs to be done", !!a.sec["Jobs to be done"]], ["Context", !!a.sec["Context"]],
    ["Responsabilități", !!a.sec["Responsabilități"]], ["Soft skills", !!a.sec["Soft skills"]], ["Claude skills", !!a.sec["Claude skills și unelte"]],
    ["KPI", !!a.sec["Cum măsurăm dacă e util (KPI)"]], ["Ce NU face", !!a.sec["Ce NU face"]], ["Memorie", !!a.memory],
    ["Scorecard", a.scRows.length > 0], ["Documente", a.docs.length > 0], ["Arii (DRI)", aor.some((r) => r[1].includes(a.name))],
    ["Instrucțiuni agent", a.slug === "tudor" ? true : !!rd(`.claude/agents/${a.slug}.md`)], ["Istoric rol", !!a.sec["Istoric rol"]],
  ].map(([n, ok]) => `<li class="${ok ? "on" : "off"}">${ok ? "✓" : "–"} ${esc(n)}</li>`).join("")}</ul>
  <div class="grid">
    ${card("Scop", md(a.sec["Scop"] || ""), "wide")}
    ${card("Jobs to be done", md((a.sec["Jobs to be done"] || "").split("\n").filter((l) => /^- /.test(l)).join("\n")), "wide jtbd")}
    ${card("Responsabilități", md(a.sec["Responsabilități"] || ""))}
    ${card("Context", md(a.sec["Context"] || ""))}
    ${card("Soft skills", md(a.sec["Soft skills"] || ""))}
    ${card("Claude skills și unelte", md(a.sec["Claude skills și unelte"] || ""))}
    ${card("Cum măsurăm (KPI)", md(a.sec["Cum măsurăm dacă e util (KPI)"] || ""))}
    ${card("Ce NU face", md(a.sec["Ce NU face"] || ""))}
    ${card("Ultimele sarcini (scorecard)", a.scRows.length ? `<ul class="log">${a.scRows.slice(-5).reverse().map((r) => `<li><time>${esc(r[0])}</time><div><strong>${inline(r[1])}</strong><span>${inline(r[2])}${r[3] && r[3] !== "–" ? ` · utilitate ${esc(r[3])}/5` : ""}</span>${r[5] && r[5] !== "–" ? `<em>${inline(r[5])}</em>` : ""}</div></li>`).join("")}</ul>` : "<p>Nicio sarcină încă.</p>", "wide")}
    ${card("Memorie", `<div class="mem">${md(a.memory.replace(/^# .+\n/, ""))}</div>${a.memFiles.length > 1 ? `<p class="small">Alte fișiere de memorie: ${a.memFiles.filter((f) => f !== "MEMORY.md").map((f) => `<code>${esc(f)}</code>`).join(", ")}</p>` : ""}`, "wide")}
    ${card("Taskurile lui " + a.name, (() => { const mine = tasks.filter((r) => r[3].includes(a.name) && !/anulat/i.test(r[7])); return mine.length ? `<ul class="log">${mine.map((r) => `<li><time>${esc(r[0])}</time><div><strong>${inline(r[4])}</strong><span>de la ${esc(r[2])} · nivel ${esc(r[6])}</span>${chip(r[7], taskCls(r[7]))}</div></li>`).join("")}</ul>` : "<p>Niciun task.</p>"; })(), "wide")}
    ${card("Arii de responsabilitate (DRI)", (() => { const mine = aor.filter((r) => r[1].includes(a.name)); const backup = aor.filter((r) => r[2].includes(a.name)); return mine.length || backup.length ? `<ul class="log">${mine.map((r) => `<li><time>DRI</time><div><strong>${inline(r[0])}</strong><span>${inline(r[4])} · ${inline(r[5])}</span></div></li>`).join("")}${backup.map((r) => `<li><time>backup</time><div><span>${inline(r[0])}</span></div></li>`).join("")}</ul>` : "<p>Nicio arie încă.</p>"; })())}
    ${card("Idei pe care le deține", (() => { const mine = ideas.filter((r) => r[3].includes(a.name)); return mine.length ? `<ul class="log">${mine.map((r) => `<li><time>${esc(r[0])}</time><div><strong>${inline(plain(r[1]).split(".")[0])}</strong>${chip(r[4], /parcat|respins/.test(r[4]) ? "warn" : /live|aprobat/.test(r[4]) ? "ok" : "info")}</div></li>`).join("")}</ul>` : "<p>Nicio idee încă.</p>"; })())}
    ${card("Documentele lui " + a.name, a.docs.length ? `<ul class="log docs">${a.docs.map((d) => `<li><time>${esc(d.date)}</time><div><strong>${inline(d.title)}</strong><code>${esc(d.rel)}</code></div></li>`).join("")}</ul>` : "<p>Niciun document încă.</p>", "wide")}
    ${card("Fișiere", `<ul class="files"><li><code>team/${a.slug}/profil.md</code></li><li><code>team/${a.slug}/scorecard.md</code></li><li><code>.claude/agent-memory/${a.slug}/</code></li><li><code>${a.slug === "tudor" ? "CLAUDE.md" : `.claude/agents/${a.slug}.md`}</code></li></ul>`)}
  </div>
</article>`;

// --- Panou de control: HTML ---
const whoLink = (s) => { const t = plain(s); const ag = agents.find((x) => t.includes(x.name)); return ag ? `<a href="#${ag.slug}" class="who" style="--c:${ag.color}">${esc(t)}</a>` : esc(t); };
const cpRow = ({ id, idHref, idTitle = "", text, meta, src, dec = "" }) => `<li class="cp-row"${dec ? ` data-dec="${esc(dec)}"` : ""}>
  <div class="cp-tx"><a class="cp-id" href="${esc(idHref)}"${/^https?:/.test(idHref) ? ' target="_blank" rel="noopener"' : ""}${idTitle ? ` title="${esc(idTitle)}"` : ""}>${esc(id)}</a> ${esc(text)}</div>
  <div class="cp-m">${meta.filter(Boolean).join('<span aria-hidden="true">·</span>')}<a href="${esc(src)}" target="_blank" rel="noopener">sursa ↗</a>${dec ? '<span class="ans chip ok">ai răspuns</span>' : ""}</div>
</li>`;
const cpSub = (title, rows, k = 4) => rows.length ? `<div class="cp-sub"><h3>${esc(title)} <b>${rows.length}</b></h3><ul class="cp-list">${rows.slice(0, k).join("")}</ul>${rows.length > k ? `<details><summary>Încă ${rows.length - k}</summary><ul class="cp-list">${rows.slice(k).join("")}</ul></details>` : ""}</div>` : "";
// Sesiunea în care se lucrează (coloana „Sesiune” din docs/taskuri.md): link spre sesiunea Claude sau text simplu.
const sessHtml = (cell) => {
  const v = (cell || "").trim(); if (!v || v === "–" || v === "-") return "";
  const m = v.match(/^\[([^\]]+)\]\(((?:claude|https?):\/\/[^)\s]+)\)$/);
  return m ? `<a class="sess" href="${esc(m[2])}" title="Deschide sesiunea în aplicația Claude">⌘ ${esc(m[1])}</a>` : `<span class="sess">⌘ ${esc(plain(v))}</span>`;
};
const taskRow = (t, meta) => cpRow({ id: t.c[0], idHref: srcLink(tFile, t.n), text: short(t.c[4]), meta: [...meta, sessHtml(t.c[9])], src: srcLink(tFile, t.n) });
const decRow = ({ c, n }) => cpRow({
  id: c[0], idHref: `#dec-${c[0]}`, idTitle: "Răspunde în Decizii de luat", text: short(c[2]), dec: c[0], src: srcLink("docs/decizii.md", n),
  meta: [whoLink(c[4]), `din ${esc(c[1])}`, chip(c[5], /de luat/.test(c[5]) ? "warn" : "info"), cp.linked[c[0]] ? `și ${cp.linked[c[0]].map(esc).join(", ")}` : ""],
});
const qRow = (q) => cpRow({
  id: "Î" + q.nr, idHref: srcLink(qFile, q.n), idTitle: "Întrebarea " + q.nr, text: short(q.body), src: srcLink(qFile, q.n),
  meta: [`pentru ${whoLink(q.who)}`, `din ${esc(q.date)}`, q.urgent ? chip("urgent", "warn") : "", q.state === "parțial" ? chip("parțial răspunsă", "info") : ""],
});
const resultLink = (r) => { const m = (r || "").match(/\[[^\]]+\]\(([^)]+)\)/); if (!m) return ""; return /^https?:/.test(m[1]) ? m[1] : GH + encodeURI(path.posix.normalize(path.posix.join("docs", m[1]))); };
const doneRow = (t) => { const res = resultLink(t.c[8]); return cpRow({
  id: t.c[0], idHref: srcLink(tFile, t.n), text: short(t.c[4], 110), src: res || srcLink(tFile, t.n),
  meta: [whoLink(t.c[3]), `gata ${esc(t.changed)}`, sessHtml(t.c[9])],
}); };
const controlPanel = `
  <section aria-labelledby="cp-h" id="panou" class="cp">
    <div class="label" id="cp-h">Panou de control · la ${now}</div>
    <div class="cp-cols">
      <div class="card cp-col alex">
        <h2 class="cp-t">Așteaptă după tine <b>${alexCount}</b></h2>
        <p class="cp-sum">${[["de luat", /de luat/], ["de confirmat", /de confirmat/], ["de discutat", /de discutat/]].map(([t, re]) => [t, pendingDec.filter((x) => re.test(x.c[5])).length]).filter(([, n]) => n).map(([t, n]) => `${n} ${t}`).join(" · ")} · ${qOpen.length} întrebări<span id="cp-ans"></span></p>
        ${cpSub("Decizii de luat", pendingDec.filter((x) => /de luat/.test(x.c[5])).map(decRow), 3)}
        ${cpSub("Decizii de confirmat sau de discutat", pendingDec.filter((x) => !/de luat/.test(x.c[5])).map(decRow), 3)}
        ${cpSub("Întrebări deschise", qOpen.map(qRow), 3)}
        ${cpSub("Taskuri la tine sau blocate de tine", cp.alexTasks.map((t) => taskRow(t, [whoLink(t.c[3]), `din ${esc(t.c[1])}`, chip(t.c[7], "warn")])))}
        ${alexCount ? "" : '<p class="cp-empty">Nimic nu așteaptă după tine.</p>'}
      </div>
      <div class="card cp-col now">
        <h2 class="cp-t">În lucru acum <b>${cp.working.length}</b></h2>
        <p class="cp-sum">Taskurile cu status „în lucru”: cine lucrează, pentru cine și în ce sesiune (⌘ deschide sesiunea în aplicația Claude).</p>
        ${cp.working.length ? `<div class="cp-sub"><ul class="cp-list">${cp.working.map((t) => taskRow(t, [`${whoLink(t.c[3])} pentru ${whoLink(t.c[2])}`, `din ${esc(t.c[1])}`, `actualizat ${esc(t.changed)}`])).join("")}</ul></div>` : '<p class="cp-empty">Niciun task în lucru.</p>'}
        ${dirtyList.length ? `<div class="cp-sub"><h3>Necomis acum <b>${dirtyList.reduce((s, [, n]) => s + n, 0)}</b></h3><p class="cp-dirty">${dirtyList.map(([k, n]) => `<span>${esc(k)} <b>${n}</b></span>`).join("")}</p><p class="cp-note">Fișiere schimbate și încă necomise când s-a generat pagina: semn că o sesiune lucrează acolo.</p></div>` : ""}
      </div>
      <div class="card cp-col other">
        <h2 class="cp-t">Așteaptă alt input <b>${otherCount}</b></h2>
        <p class="cp-sum">${cp.blocked.length} blocate · ${cp.nou.length} noi, la trierea lui Tudor · ${cp.deFacut.length} aprobate, intră la următoarea rulare</p>
        ${cpSub("Blocate de altceva decât tine", cp.blocked.map((t) => taskRow(t, [whoLink(t.c[3]), `din ${esc(t.c[1])}`, chip(t.c[7], "warn")])))}
        ${cpSub("Noi: așteaptă trierea lui Tudor", cp.nou.map((t) => taskRow(t, [`pentru ${whoLink(t.c[3])}`, `de la ${whoLink(t.c[2])}`, `din ${esc(t.c[1])}`])), 3)}
        ${cpSub("De făcut: așteaptă următoarea rulare", cp.deFacut.map((t) => taskRow(t, [`pentru ${whoLink(t.c[3])}`, `din ${esc(t.c[1])}`])), 3)}
        ${cpSub("Status necunoscut", cp.other.map((t) => taskRow(t, [whoLink(t.c[3]), chip(t.c[7], "warn")])))}
        ${otherCount ? "" : '<p class="cp-empty">Nimic nu așteaptă.</p>'}
      </div>
    </div>
    ${cp.done.length ? `<div class="card cp-done"><h2 class="cp-t">Ultimele terminate <b>${Math.min(5, cp.done.length)}</b><span class="cp-of">din ${cp.done.length} gata</span></h2><ul class="cp-list">${cp.done.slice(0, 5).map(doneRow).join("")}</ul></div>` : ""}
    ${qParked.length ? `<p class="cp-note">Amânate de tine: ${qParked.map((q) => `întrebarea ${esc(q.nr)}`).join(", ")}. Nu apar mai sus.</p>` : ""}
  </section>`;

const html = `<title>Echipa lui Alex</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap">
<style>
/* Layout: glass header + org chart, apoi noutăți și panoul agentului selectat. Sticlă doar pe noduri și carduri. */
:root{
  --bg:#eef1f4; --bg2:#e3ebe8; --fg:#17202a; --muted:#566270; --line:rgba(23,32,42,.12);
  --glass:rgba(255,255,255,.62); --glass-solid:#fbfcfd; --edge:rgba(255,255,255,.8); --shadow:0 1px 2px rgba(23,32,42,.06),0 8px 24px rgba(23,32,42,.06);
  --accent:#1f6f8b; --ok:#2f7d4f; --warn:#9a6a00; --info:#3d5fa8;
  --display:"Sora",system-ui,sans-serif; --body:"Inter",system-ui,-apple-system,sans-serif; --mono:"JetBrains Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#10151b; --bg2:#122023; --fg:#e7edf2; --muted:#9aa7b3; --line:rgba(231,237,242,.12);
  --glass:rgba(28,36,45,.62); --glass-solid:#18202a; --edge:rgba(255,255,255,.08); --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.25);
  --accent:#6cc3d9; --ok:#6fcf97; --warn:#e6b84a; --info:#93b0f0; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#10151b; --bg2:#122023; --fg:#e7edf2; --muted:#9aa7b3; --line:rgba(231,237,242,.12);
  --glass:rgba(28,36,45,.62); --glass-solid:#18202a; --edge:rgba(255,255,255,.08); --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.25);
  --accent:#6cc3d9; --ok:#6fcf97; --warn:#e6b84a; --info:#93b0f0; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);background-image:radial-gradient(60rem 30rem at 85% -10%,var(--bg2),transparent 70%),radial-gradient(40rem 24rem at -10% 10%,var(--bg2),transparent 70%);background-attachment:fixed;color:var(--fg);font:15px/1.55 var(--body);margin:0}
.wrap{max-width:1180px;margin:0 auto;padding-block:28px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:grid;grid-template-columns:minmax(0,1fr);gap:28px} /* minmax(0): tabelele late nu mai lățesc pagina pe telefon */
h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0;font-weight:600}
h1{font-size:clamp(26px,4vw,36px);letter-spacing:-.01em}
.sub{color:var(--muted);margin:6px 0 0}
.top{display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-end}
.stats{display:flex;flex-wrap:wrap;gap:8px}
.stat{background:var(--glass);backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);border:1px solid var(--edge);border-radius:12px;padding:8px 12px;box-shadow:var(--shadow);font-size:13px;color:var(--muted)}
.stat b{display:block;font:600 18px/1.2 var(--display);color:var(--fg);font-variant-numeric:tabular-nums}
.label{font:600 12px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
/* Org chart */
.org{display:grid;gap:22px;justify-items:center}
.org-top,.org-mid{display:flex;justify-content:center;position:relative;width:100%}
.org-mid{gap:24px;flex-wrap:wrap;align-items:center}
.mid-main{display:flex;justify-content:center}
.mid-side{display:flex;flex-direction:column;align-items:center;gap:6px}
.side-note{font-size:12px;color:var(--muted);max-width:200px;text-align:center}
.org-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;width:100%;position:relative;padding-top:14px;border-top:1px dashed var(--line)}
.grp{display:grid;gap:10px;align-content:start}
.grp-h{font:600 12px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:center}
.node{display:grid;grid-template-columns:auto 1fr;column-gap:10px;row-gap:1px;align-items:center;text-decoration:none;color:inherit;min-width:210px;
  background:var(--glass);backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);border:1px solid var(--edge);border-radius:16px;padding:12px 14px;box-shadow:var(--shadow);transition:transform .15s ease,border-color .15s ease}
.node:hover{transform:translateY(-1px)}
.node:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.node.sel{border-color:var(--c);box-shadow:0 0 0 2px color-mix(in srgb,var(--c) 35%,transparent),var(--shadow)}
.node .dot{grid-row:span 3;width:12px;height:12px;border-radius:50%;background:var(--c)}
.node .nm{font:600 15px/1.2 var(--display)}
.node .rl{font-size:13px;color:var(--muted)}
.node .meta{font-size:11.5px;color:var(--muted);font-family:var(--mono)}
.node.alex{grid-template-columns:1fr;text-align:center;background:var(--fg);color:var(--bg);border-color:transparent;min-width:240px}
.node.alex .rl{color:var(--bg);opacity:.75}
.node.lead{min-width:260px}
.node.side{border-style:dashed}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.node,.stat,.card{background:var(--glass-solid)}}
@media (prefers-reduced-transparency:reduce){.node,.stat,.card{background:var(--glass-solid);backdrop-filter:none;-webkit-backdrop-filter:none}}
/* Noutăți */
.news{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
.card{background:var(--glass);backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);border:1px solid var(--edge);border-radius:18px;padding:18px 20px;box-shadow:var(--shadow);min-width:0;overflow-wrap:anywhere}
.card h3{font-size:15px;margin-bottom:10px}
.card p,.card li{margin:0 0 6px}
.card ul,.card ol{margin:0;padding-left:18px}
.log{list-style:none;padding:0!important;display:grid;gap:10px}
.log li{display:grid;grid-template-columns:86px 1fr;gap:10px;margin:0}
.log time{font:12px/1.6 var(--mono);color:var(--muted);font-variant-numeric:tabular-nums}
.log div{display:grid;gap:2px;min-width:0}
.log span{color:var(--muted);font-size:13.5px}
.log em{font-size:13px;color:var(--muted)}
.chip{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;padding:3px 9px;border-radius:999px;border:1px solid var(--line);color:var(--muted);white-space:nowrap}
.chip.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 40%,transparent)}
.chip.warn{color:var(--warn);border-color:color-mix(in srgb,var(--warn) 45%,transparent)}
.chip.info{color:var(--info);border-color:color-mix(in srgb,var(--info) 40%,transparent)}
.chip.cat{color:var(--c,var(--accent));border-color:color-mix(in srgb,var(--c,var(--accent)) 45%,transparent)}
/* Agent */
.agent{display:grid;gap:16px}
.agent-h{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.avatar{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font:600 20px var(--display);color:#fff;background:var(--c)}
.agent-t h2{font-size:24px}
.agent-t p{margin:0;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-left:auto}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.wide{grid-column:1/-1}
.jtbd ul{list-style:none;padding:0;display:grid;gap:8px}
.jtbd li{padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--c) 9%,transparent);margin:0}
.jtbd strong{color:var(--c)}
.mem h4,.mem h5{font:600 13px/1.3 var(--body);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:12px 0 6px}
.mem blockquote{margin:0 0 8px;color:var(--muted);font-size:13px}
.small{font-size:13px;color:var(--muted);margin-top:10px}
code,.path{font:12.5px var(--mono);background:color-mix(in srgb,var(--fg) 7%,transparent);padding:1px 5px;border-radius:6px;overflow-wrap:anywhere}
.docs code{justify-self:start}
.who{font-weight:600;color:var(--c);text-decoration:none;white-space:nowrap}
.who:hover{text-decoration:underline}
.stat{text-decoration:none}
a.stat:hover{border-color:var(--accent)}
.comp{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px}
.comp li{font-size:12px;padding:3px 9px;border-radius:999px;border:1px solid var(--line)}
.comp li.on{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 35%,transparent)}
.comp li.off{color:var(--warn);border-color:color-mix(in srgb,var(--warn) 45%,transparent)}
.dec-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px}
.dec-top .label{margin:0}
.filters{display:flex;flex-wrap:wrap;gap:6px}
.flt{font:500 13px var(--body);color:var(--muted);background:transparent;border:1px solid var(--line);border-radius:999px;padding:5px 12px;cursor:pointer}
.flt b{font-variant-numeric:tabular-nums;color:var(--fg);margin-left:4px}
.flt.on{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.flt.on b{color:var(--bg)}
.flt:focus-visible,.vb:focus-visible,.save:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sess{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:999px;border:1px solid var(--line);font-size:12.5px;color:var(--fg);text-decoration:none;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
a.sess:hover{border-color:currentColor}
.dec-status{margin:8px 0 12px;font-size:13px;color:var(--muted)}
.decs{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.dec{display:grid;gap:8px;align-content:start;min-width:0;background:var(--glass-solid);border:1px solid var(--line);border-left:4px solid var(--c);border-radius:16px;padding:16px 18px;box-shadow:var(--shadow)}
.dec header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.5px;color:var(--muted)}
.dec .by{margin-left:auto}
.dec h3{font:600 15px/1.4 var(--body)}
.dec .why{margin:0;color:var(--muted);font-size:13.5px}
.doclink{font-size:13px;justify-self:start}
.dec.done{opacity:.92}
.verdict{font-size:13.5px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--fg) 5%,transparent)}
.verdict.aprobat{background:color-mix(in srgb,var(--ok) 13%,transparent);color:var(--ok)}
.verdict.respins{background:color-mix(in srgb,var(--warn) 14%,transparent);color:var(--warn)}
.verdict.discutam{background:color-mix(in srgb,var(--info) 13%,transparent);color:var(--info)}
.verdict q{display:block;color:var(--fg);margin-top:4px;quotes:none;white-space:pre-wrap}
.actions{display:grid;gap:8px}
.btns{display:flex;flex-wrap:wrap;gap:6px}
.vb,.save{font:600 13px var(--body);border-radius:10px;padding:7px 14px;cursor:pointer;border:1px solid var(--line);background:transparent;color:var(--fg)}
.vb.ok{border-color:color-mix(in srgb,var(--ok) 50%,transparent);color:var(--ok)}
.vb.no{border-color:color-mix(in srgb,var(--warn) 55%,transparent);color:var(--warn)}
.vb.talk{border-color:color-mix(in srgb,var(--info) 50%,transparent);color:var(--info)}
.vb.sel.ok{background:var(--ok);color:var(--bg)}
.vb.sel.no{background:var(--warn);color:var(--bg)}
.vb.sel.talk{background:var(--info);color:var(--bg)}
.vb:disabled,.save:disabled{opacity:.55;cursor:default}
.nl{font-size:12px;color:var(--muted)}
.dec textarea{font:14px/1.45 var(--body);color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;resize:vertical;width:100%}
.dec .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dec .msg{font-size:12.5px;color:var(--muted)}
.files{list-style:none;padding:0!important;display:grid;gap:6px}
.tablewrap{overflow-x:auto}
table{border-collapse:collapse;font-size:13.5px;width:100%}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:600}
a{color:var(--accent)}
footer{color:var(--muted);font-size:13px}
/* Panou de control */
.cp-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:start}
.cp-col{border-top:3px solid var(--k,var(--line));padding:16px 18px}
.cp-col.alex{--k:var(--warn)} .cp-col.now{--k:var(--info)} .cp-col.other{--k:var(--muted)} .cp-done{--k:var(--ok);border-top:3px solid var(--k);margin-top:16px;padding:16px 18px}
.cp-t{font:600 16px/1.3 var(--display);display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.cp-t b{font:600 22px/1 var(--display);color:var(--k);font-variant-numeric:tabular-nums;margin-left:auto}
.cp-of{font:500 12.5px var(--body);color:var(--muted);flex-basis:100%;text-align:right;margin-top:-2px}
.cp-sum{margin:4px 0 10px!important;font-size:13px;color:var(--muted)}
.cp-sub{margin-top:12px}
.cp-sub h3{font:600 12px/1 var(--body)!important;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 4px!important}
.cp-sub h3 b{color:var(--fg);margin-left:2px;font-variant-numeric:tabular-nums}
.cp-list{list-style:none;margin:0;padding:0!important;display:grid}
.cp-row{display:grid;gap:3px;padding:8px 0;margin:0!important;border-top:1px solid var(--line);min-width:0}
.cp-tx{font-size:14px;line-height:1.4;overflow-wrap:anywhere}
.cp-id{font:12px var(--mono);color:var(--fg);background:color-mix(in srgb,var(--fg) 7%,transparent);padding:1px 6px;border-radius:6px;text-decoration:none;white-space:nowrap;margin-right:2px}
.cp-id:hover{background:color-mix(in srgb,var(--accent) 18%,transparent)}
.cp-m{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;font-size:12.5px;color:var(--muted)}
.cp-m a{font-size:12.5px}
.cp-m .chip{white-space:normal;padding:1px 8px}
.cp-row .ans{display:none}
.cp-row.answered .ans{display:inline-flex}
.cp-row.answered .cp-tx{opacity:.7}
.cp details{margin-top:2px}
.cp summary{cursor:pointer;font-size:13px;color:var(--accent);padding:6px 0;list-style-position:inside}
.cp summary:focus-visible,.cp-id:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.cp-dirty{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 0!important}
.cp-dirty span{font:12.5px var(--mono);padding:2px 8px;border-radius:999px;border:1px solid var(--line)}
.cp-dirty b{font-weight:600;color:var(--info)}
.cp-note{font-size:12.5px;color:var(--muted);margin:8px 0 0}
.cp-empty{color:var(--muted);font-size:13.5px}
.cp-done .cp-list{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));column-gap:20px}
@media (max-width:980px){.cp-cols{grid-template-columns:1fr}}
@media (max-width:720px){.grid{grid-template-columns:1fr}.node{min-width:0;width:100%}.org-mid{flex-direction:column}.mid-main,.mid-side{width:100%}.chips{margin-left:0}}
@media (prefers-reduced-motion:reduce){.node{transition:none}}
</style>

<div class="wrap">
  <header class="top">
    <div>
      <h1>Echipa lui Alex</h1>
      <p class="sub">Sistemul din spate: cine face ce, ce s-a întâmplat recent și ce așteaptă după tine. Generat ${now}${head ? `, ultimul commit ${head}` : ""}.</p>
    </div>
    <div class="stats">
      <div class="stat"><b>${agents.length}</b>agenți</div>
      <div class="stat"><b>${openTasks.length}</b>taskuri deschise</div>
      <div class="stat"><b>${activeIdeas}</b>idei active</div>
      <div class="stat"><b>${reports.length}</b>rapoarte</div>
      <a class="stat" href="#decizii"><b>${pendingDecisions}</b>decizii de luat</a>
      <div class="stat"><b>${qOpen.length}</b>întrebări pentru tine</div>
    </div>
  </header>
${controlPanel}

  <section aria-labelledby="org-h">
    <div class="label" id="org-h">Organigrama · alege un agent</div>
    ${orgChart}
  </section>

  <section aria-labelledby="dec-h" id="decizii">
    <div class="dec-top">
      <div class="label" id="dec-h">Decizii de luat · aprobi, respingi sau lași o notiță</div>
      <div class="filters" role="group" aria-label="Filtru decizii">
        <button type="button" class="flt on" data-f="toate">Toate <b>${pending.length}</b></button>
        <button type="button" class="flt" data-f="fara">Fără răspuns <b id="cnt-fara">${pending.length}</b></button>
        <button type="button" class="flt" data-f="raspuns">Răspunse <b id="cnt-raspuns">0</b></button>
      </div>
    </div>
    <p class="dec-status" id="dec-status">Se încarcă răspunsurile tale…</p>
    <div class="decs">
    ${pending.map((r) => { const ag = agents.find((x) => r[4].includes(x.name)); return `<article class="dec" id="dec-${r[0]}" data-id="${r[0]}" style="--c:${ag ? ag.color : "var(--accent)"}">
      <header><code>${esc(r[0])}</code>${chip(r[5], /de luat/.test(r[5]) ? "warn" : "info")}<span class="by">propune ${ag ? `<a href="#${ag.slug}" class="who">${esc(r[4])}</a>` : inline(r[4])}</span></header>
      <h3>${inline(r[2])}</h3>
      <p class="why">${inline(r[3])}</p>
      ${r[6] ? `<a class="doclink" href="${GH}${encodeURI(r[6])}" target="_blank" rel="noopener">Deschide documentul pe GitHub ↗</a>` : ""}
      <div class="verdict" hidden></div>
      <div class="actions" hidden>
        <div class="btns">
          <button type="button" class="vb ok" data-v="aprobat">Aprob</button>
          <button type="button" class="vb no" data-v="respins">Resping</button>
          <button type="button" class="vb talk" data-v="discutam">Discutăm</button>
        </div>
        <label class="nl" for="note-${r[0]}">Notițele tale</label>
        <textarea id="note-${r[0]}" rows="2" placeholder="Opțional: ce schimbăm, ce nu-ți place, întrebări pentru echipă"></textarea>
        <div class="row"><button type="button" class="save">Salvează notița</button><span class="msg" aria-live="polite"></span></div>
      </div>
    </article>`; }).join("")}
    </div>
  </section>

  <section aria-labelledby="ideas-h">
    <div class="label" id="ideas-h">Lista de idei · fiecare are un responsabil</div>
    <div class="card"><div class="tablewrap"><table><thead><tr><th>ID</th><th>Idee</th><th>DRI</th><th>Status</th><th>Următorul pas</th></tr></thead><tbody>
    ${ideas.map((r) => { const ag = agents.find((x) => r[3].includes(x.name)); return `<tr><td><code>${esc(r[0])}</code></td><td>${inline(r[1])}</td><td>${ag ? `<a href="#${ag.slug}" class="who" style="--c:${ag.color}">${esc(r[3])}</a>` : inline(r[3])}</td><td>${chip(r[4], /parcat|respins/.test(r[4]) ? "warn" : /live|aprobat/.test(r[4]) ? "ok" : "info")}</td><td>${inline(r[5])}</td></tr>`; }).join("")}
    </tbody></table></div></div>
  </section>

  <section aria-labelledby="tasks-h">
    <div class="label" id="tasks-h">Taskuri între agenți · ${openTasks.length} deschise</div>
    <div class="card"><div class="tablewrap"><table><thead><tr><th>ID</th><th>De la</th><th>Pentru</th><th>Task</th><th>Nivel</th><th>Status</th></tr></thead><tbody>
    ${openTasks.map((r) => { const ag = agents.find((x) => r[3].includes(x.name)); const from = agents.find((x) => r[2].includes(x.name)); return `<tr><td><code>${esc(r[0])}</code></td><td>${from ? `<a href="#${from.slug}" class="who" style="--c:${from.color}">${esc(r[2])}</a>` : inline(r[2])}</td><td>${ag ? `<a href="#${ag.slug}" class="who" style="--c:${ag.color}">${esc(r[3])}</a>` : inline(r[3])}</td><td>${inline(r[4])}<br><span class="small">${inline(r[5])}</span></td><td>${esc(r[6])}</td><td>${chip(r[7], taskCls(r[7]))}</td></tr>`; }).join("") || `<tr><td colspan="6">Niciun task deschis.</td></tr>`}
    </tbody></table></div><p class="small">Nivel 1 = fac și raportez · 2 = propun și aștept · 3 = doar Alex. Ritmurile fiecărui agent: <code>docs/ritmuri.md</code>.</p></div>
  </section>

  <section aria-labelledby="news-h">
    <div class="label" id="news-h">Ce e nou</div>
    <div class="news">
      ${card("Ultimele rapoarte", `<ul class="log">${reports.slice(0, 5).map((r) => `<li><time>${esc(r.date)}</time><div><strong>${inline(r.title.replace(/^Raport Tudor — /, ""))}</strong><span>${inline(r.result)}</span></div></li>`).join("")}</ul>`)}
      ${card("Decizii luate", decisions.length ? `<ul class="log">${decisions.slice(0, 6).map((r) => `<li><time>${esc(r[0])}</time><div><span>${inline(r[2])}</span>${chip(r[5], /respins/i.test(r[5]) ? "warn" : "ok")}</div></li>`).join("")}</ul>` : "<p>Nicio decizie încă.</p>")}
      ${card("Propuneri pentru echipă", proposals.length ? `<ul class="log">${proposals.map((r) => `<li><time>${esc(r[0])}</time><div><span>${inline(r[1])}</span><em>${inline(r[4] || "")}</em></div></li>`).join("")}</ul>` : "<p>Nicio propunere deschisă.</p>")}
      ${card("Ultimele schimbări în repo", `<ul class="log">${commits.map(([d, s]) => `<li><time>${esc(d)}</time><div><span>${inline(s)}</span></div></li>`).join("")}</ul>`)}
    </div>
  </section>

  <section aria-labelledby="agent-h">
    <div class="label" id="agent-h">Profil</div>
    ${agents.map(agentPanel).join("\n")}
  </section>

  <footer>Repo public: https://github.com/alexandrumolea/AgentsTeam. Pagina se regenerează din repo cu <code>node scripts/build-echipa.mjs</code>. Sursa de adevăr rămân fișierele din <code>team/</code>, <code>.claude/</code> și <code>docs/</code>.</footer>
</div>

<script>
(function(){
  var order=${JSON.stringify(agents.map((a) => a.slug))};
  function show(slug){
    if(order.indexOf(slug)<0) slug=order[0];
    document.querySelectorAll(".agent").forEach(function(p){p.hidden=p.dataset.slug!==slug});
    document.querySelectorAll(".node[data-slug]").forEach(function(n){n.classList.toggle("sel",n.dataset.slug===slug)});
  }
  function fromHash(){return (location.hash||"").replace("#","")}
  document.querySelectorAll(".node[data-slug]").forEach(function(n){
    n.addEventListener("click",function(e){e.preventDefault();var s=n.dataset.slug;try{history.replaceState(null,"","#"+s)}catch(_){location.hash=s}show(s);
      var t=document.getElementById("panel-"+s);if(t)t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})});
  });
  window.addEventListener("hashchange",function(){var h=fromHash();if(order.indexOf(h)>=0)show(h)}); // #dec-… și #panou nu schimbă agentul
  show(fromHash());
})();

// --- Decizii: verdicte și notițe în baza de date a paginii ---
(function(){
  var cards=[].slice.call(document.querySelectorAll(".dec"));
  var statusEl=document.getElementById("dec-status");
  var verdicts={}; var filter="toate"; var busy={};
  var LABEL={aprobat:"Ai aprobat",respins:"Ai respins",discutam:"Vrei să discutăm"};
  function fmt(iso){try{return new Date(iso).toLocaleString("ro-RO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch(e){return ""}}
  function render(){
    var nAns=0;
    cards.forEach(function(c){
      var id=c.dataset.id, v=verdicts[id], box=c.querySelector(".verdict");
      var answered=!!(v&&v.verdict); if(answered)nAns++;
      c.classList.toggle("done",answered);
      if(v&&(v.verdict||v.note)){
        box.hidden=false; box.className="verdict "+(v.verdict||"");
        box.textContent=(v.verdict?LABEL[v.verdict]:"Notiță salvată")+(v.updatedAt?" · "+fmt(v.updatedAt):"")+(v.applied?" · trecut în repo de Tudor":(v.verdict?" · Tudor îl trece în repo la următoarea sesiune":""));
        if(v.note){var q=document.createElement("q");q.textContent=v.note;box.appendChild(q)}
      } else { box.hidden=true; }
      c.querySelectorAll(".vb").forEach(function(b){b.classList.toggle("sel",!!v&&v.verdict===b.dataset.v)});
      var ta=c.querySelector("textarea");
      if(ta&&document.activeElement!==ta&&!ta.dataset.dirty)ta.value=(v&&v.note)||"";
      var show=filter==="toate"||(filter==="fara"&&!answered)||(filter==="raspuns"&&answered);
      c.hidden=!show;
    });
    var nCp=0;
    document.querySelectorAll(".cp-row[data-dec]").forEach(function(r){var v=verdicts[r.dataset.dec];var on=!!(v&&v.verdict&&!v.applied);r.classList.toggle("answered",on);if(on)nCp++});
    var ca=document.getElementById("cp-ans"); if(ca)ca.textContent=nCp?" · ai răspuns la "+nCp+", Tudor le trece în repo":"";
    document.getElementById("cnt-fara").textContent=cards.length-nAns;
    document.getElementById("cnt-raspuns").textContent=nAns;
  }
  document.querySelectorAll(".flt").forEach(function(b){b.addEventListener("click",function(){
    filter=b.dataset.f; document.querySelectorAll(".flt").forEach(function(x){x.classList.toggle("on",x===b)}); render();
  })});
  render();
  if(!window.claude||!window.claude.use){statusEl.textContent="Deschide pagina în Claude ca să aprobi deciziile și să lași notițe.";return}
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(function(res){
    var db=res[0], user=res[1];
    if(!db){statusEl.textContent="Răspunsurile nu se pot încărca aici. Deschide pagina în Claude, autentificat.";return}
    var timer=setTimeout(function(){statusEl.textContent="Răspunsurile nu au putut fi încărcate încă. Pagina încearcă în continuare."},10000);
    db.collection("verdicts").onSnapshot(function(snap){
      verdicts={}; snap.docs.forEach(function(d){verdicts[d.id]=d.data()});
      if(!snap.metadata.fromCache){clearTimeout(timer)}
      render();
    },function(){clearTimeout(timer);statusEl.textContent="Răspunsurile nu mai pot fi citite în această sesiune. Reîncarcă pagina mai târziu."});
    (user?user.isOwner():Promise.resolve(null)).then(function(owner){
      if(owner===false){statusEl.textContent="Doar Alex poate aproba deciziile. Le vezi aici, cu răspunsurile lui.";return}
      statusEl.textContent="Alegerile și notițele tale se salvează pe loc. Tudor le citește și le trece în repo.";
      cards.forEach(function(c){
        var id=c.dataset.id, act=c.querySelector(".actions"), msg=c.querySelector(".msg"), ta=c.querySelector("textarea");
        act.hidden=false;
        ta.addEventListener("input",function(){ta.dataset.dirty="1"});
        function save(patch){
          if(busy[id])return; busy[id]=true;
          var cur=verdicts[id]||{};
          var body={verdict:cur.verdict||null,note:cur.note||"",updatedAt:new Date().toISOString(),applied:false};
          Object.keys(patch).forEach(function(k){body[k]=patch[k]});
          c.querySelectorAll("button").forEach(function(b){b.disabled=true}); msg.textContent="Se salvează…";
          db.collection("verdicts").doc(id).set(body).then(function(){
            delete ta.dataset.dirty; msg.textContent="Salvat.";
          }).catch(function(e){
            msg.textContent=(e&&e.code==="invalid_argument")?"Nu ai drept de scriere aici.":(e&&e.code==="quota_exceeded")?"Baza de date e plină. Spune-i lui Tudor.":"Nu s-a salvat. Încearcă din nou.";
          }).then(function(){busy[id]=false;c.querySelectorAll("button").forEach(function(b){b.disabled=false})});
        }
        c.querySelectorAll(".vb").forEach(function(b){b.addEventListener("click",function(){
          var cur=verdicts[id]||{}; var v=cur.verdict===b.dataset.v?null:b.dataset.v;
          save({verdict:v,note:ta.value.trim()});
        })});
        c.querySelector(".save").addEventListener("click",function(){save({note:ta.value.trim()})});
      });
    });
  });
})();
</script>
`;
fs.writeFileSync(path.join(ROOT, "docs/echipa.html"), html);
console.log(`docs/echipa.html: ${agents.length} agenți, ${reports.length} rapoarte, ${decisions.length} decizii`);
