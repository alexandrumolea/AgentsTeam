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
  return {
    slug, name: name.trim(), role: (role || "").trim(), color: COLORS[color] || COLORS.teal,
    category: field(prof, "Categorie") || "Altele", reportsTo: field(prof, "Raportează către"), status: field(prof, "Status"),
    sec: sections(prof), scRows, memory: rd(`${memDir}/MEMORY.md`), memFiles, last: last || "—", dirty: !!dirty,
  };
});
const ORDER = ["tudor", "elena", "maria", "victor", "radu", "ioana", "mike", "sofia"];
const rank = (s) => (ORDER.indexOf(s) < 0 ? 99 : ORDER.indexOf(s));
agents.sort((a, b) => rank(a.slug) - rank(b.slug));
const GROUP_ORDER = ["Strategie", "Produs", "Comunicare"];

// --- Noutăți ---
const reports = fs.readdirSync(path.join(ROOT, "docs/rapoarte")).filter((f) => f.endsWith(".md")).sort().reverse().map((f) => {
  const s = rd(`docs/rapoarte/${f}`);
  return { file: f, date: (f.match(/\d{4}-\d{2}-\d{2}/) || [""])[0], title: (s.match(/^# (.+)$/m) || [, f])[1], result: field(s, "Rezultat") };
});
const decisions = tableRows(rd("docs/decizii.md")).reverse();
const proposals = tableRows((rd("ECHIPA.md").split("### Propuneri deschise")[1] || "").split("\n## ")[0]);
const questions = (rd("docs/intrebari-pentru-alex.md").match(/^\d+\. /gm) || []).length;
const commits = git("log -8 --format=%cs%x09%s").split("\n").filter(Boolean).map((l) => l.split("\t"));
const head = git("log -1 --format=%cs");
const now = new Date().toISOString().slice(0, 10);
const pendingDecisions = decisions.filter((r) => /confirmat|propunere/i.test(r[r.length - 1] || "")).length;

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
    ${card("Fișiere", `<ul class="files"><li><code>team/${a.slug}/profil.md</code></li><li><code>team/${a.slug}/scorecard.md</code></li><li><code>.claude/agent-memory/${a.slug}/</code></li><li><code>${a.slug === "tudor" ? "CLAUDE.md" : `.claude/agents/${a.slug}.md`}</code></li></ul>`)}
  </div>
</article>`;

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
.wrap{max-width:1180px;margin:0 auto;padding-block:28px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:grid;gap:28px}
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
.card{background:var(--glass);backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);border:1px solid var(--edge);border-radius:18px;padding:18px 20px;box-shadow:var(--shadow);min-width:0}
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
.files{list-style:none;padding:0!important;display:grid;gap:6px}
.tablewrap{overflow-x:auto}
table{border-collapse:collapse;font-size:13.5px;width:100%}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:600}
a{color:var(--accent)}
footer{color:var(--muted);font-size:13px}
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
      <div class="stat"><b>${reports.length}</b>rapoarte</div>
      <div class="stat"><b>${pendingDecisions}</b>decizii de confirmat</div>
      <div class="stat"><b>${questions}</b>întrebări pentru tine</div>
    </div>
  </header>

  <section aria-labelledby="org-h">
    <div class="label" id="org-h">Organigrama · alege un agent</div>
    ${orgChart}
  </section>

  <section aria-labelledby="news-h">
    <div class="label" id="news-h">Ce e nou</div>
    <div class="news">
      ${card("Ultimele rapoarte", `<ul class="log">${reports.slice(0, 5).map((r) => `<li><time>${esc(r.date)}</time><div><strong>${inline(r.title.replace(/^Raport Tudor — /, ""))}</strong><span>${inline(r.result)}</span></div></li>`).join("")}</ul>`)}
      ${card("Decizii recente", `<ul class="log">${decisions.slice(0, 6).map((r) => `<li><time>${esc(r[0])}</time><div><span>${inline(r[1])}</span>${chip(r[r.length - 1], /activ/i.test(r[r.length - 1]) ? "ok" : "info")}</div></li>`).join("")}</ul>`)}
      ${card("Propuneri pentru echipă", proposals.length ? `<ul class="log">${proposals.map((r) => `<li><time>${esc(r[0])}</time><div><span>${inline(r[1])}</span><em>${inline(r[4] || "")}</em></div></li>`).join("")}</ul>` : "<p>Nicio propunere deschisă.</p>")}
      ${card("Ultimele schimbări în repo", `<ul class="log">${commits.map(([d, s]) => `<li><time>${esc(d)}</time><div><span>${inline(s)}</span></div></li>`).join("")}</ul>`)}
    </div>
  </section>

  <section aria-labelledby="agent-h">
    <div class="label" id="agent-h">Profil</div>
    ${agents.map(agentPanel).join("\n")}
  </section>

  <footer>Pagina se regenerează din repo cu <code>node scripts/build-echipa.mjs</code>. Sursa de adevăr rămân fișierele din <code>team/</code>, <code>.claude/</code> și <code>docs/</code>.</footer>
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
  window.addEventListener("hashchange",function(){show(fromHash())});
  show(fromHash());
})();
</script>
`;
fs.writeFileSync(path.join(ROOT, "docs/echipa.html"), html);
console.log(`docs/echipa.html: ${agents.length} agenți, ${reports.length} rapoarte, ${decisions.length} decizii`);
