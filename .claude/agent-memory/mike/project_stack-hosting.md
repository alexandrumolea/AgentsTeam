---
name: project-stack-hosting
description: Găzduirea site-ului (GitHub Pages din 2026-11-15, D-036/D-037/D-038), plus fapte verificate despre Vercel/Netlify/Cloudflare pentru o eventuală mutare
metadata:
  type: project
---
Adăugat: 2026-11-15


Propunerea de stack e în `team/mike/documente/stack-tehnic-v0.md` (2026-11-15): Astro + Markdown/YAML + Netlify Free (plan B Cloudflare Pages) + Cal.com Free. D-005 e încă „de confirmat de Alex”.

- Vercel Hobby = doar uz personal/necomercial (Terms, secțiunea 4, verificat 2026-11-15). Site cu coaching plătit = comercial → Vercel Pro 20 USD/lună.
- Netlify Free: 300 credite/lună, 15 credite per deploy în producție, 20 credite/GB trafic. Ce se întâmplă la epuizare: neverificat.
- Cloudflare Pages Free: 500 build-uri/lună; trafic și termeni comerciali neverificați.
- Astro: de testat la primul prototip dacă `reference()` spre o etichetă inexistentă oprește build-ul (cerința lui Radu).

**Why:** D-005 inițial spunea „Vercel sau Netlify”; restricția comercială schimbă recomandarea.
**How to apply:** Re-verifică prețurile înainte de decizia finală (se schimbă des). Așteaptă răspunsul lui Alex la domeniu, hosting existent, calendar. Vezi [[generator-echipa]].

2026-11-15: **Site-ul v1 e pe GitHub Pages (D-036)**, build Node fără framework în `site/`, workflow `.github/workflows/site.yml`. D-037: Pages nu permite site făcut în principal pentru tranzacții; dacă vindem direct pe site, mutăm (Netlify/Cloudflare, faptele de mai sus rămân utile). D-038: adresa finală fără „AgentsTeam”: domeniul `alexandrumolea.com` (GoDaddy, `docs/domeniu.md`) sau repo `alexandrumolea.github.io`.
2026-11-15: La publicarea prin GitHub Actions, GitHub ignoră fișierul CNAME; domeniul contează doar din Settings → Pages. Calea de bază vine din `actions/configure-pages` (outputs `base_path`, `base_url`), nu din cod.
2026-11-15: Push-urile făcute cu GITHUB_TOKEN (rutina zilnică) nu pornesc alte workflow-uri → site.yml are `workflow_run` pe rutină + cron zilnic.
