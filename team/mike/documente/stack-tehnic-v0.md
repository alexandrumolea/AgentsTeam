# Stack tehnic — v0 (propunere)

> Autor: Mike. Data: 2026-11-15. Status: propunere, legată de D-005 (de confirmat de Alex).
> Prețurile sunt verificate pe site-urile oficiale la 2026-11-15, în USD, fără TVA. Ce n-am putut verifica e marcat „de verificat”.

## 1. Stack-ul propus

| Piesă | De ce | Alternativa principală | Cost lunar |
|---|---|---|---|
| **Astro** (generator de site static) | Pagini HTML gata făcute, fără JavaScript inutil: rapid pe orice telefon. Are „content collections”: fiecare fișier din `content/lansari/` e verificat după o schemă | **Eleventy**: mai simplu, dar validarea câmpurilor ar trebui scrisă de mână | 0 (open source) |
| **Markdown + YAML în git** | O schimbare = un fișier. Istoric complet, revizie înainte de publicare | Un CMS vizual (ex. Decap) peste aceleași fișiere, doar dacă Alex vrea să editeze fără git | 0 |
| **Netlify Free** (găzduire) | Deploy automat din git, domeniu propriu cu SSL inclus | **Cloudflare Pages Free**: 500 build-uri pe lună | 0, cu limită de 300 credite |
| **Cal.com Free** (rezervări) | Un utilizator, calendare nelimitate, plăți Stripe/PayPal incluse | **Calendly** sau programările din calendarul pe care îl folosește deja Alex | 0; Teams e 12/utilizator |

**Ce s-a schimbat față de D-005: Vercel nu mai e prima variantă.** Termenii Vercel (secțiunea 4) limitează planul gratuit Hobby la uz personal sau necomercial. Un site care vinde sesiuni de coaching e comercial, deci pe Vercel ar fi Pro: 20 pe lună. Netlify și Cloudflare au planuri gratuite fără restricția asta pe paginile citite (de verificat în termenii lor).

**Riscul Netlify Free:** 300 de credite pe lună. Un deploy în producție costă 15 credite, iar traficul 20 de credite pe GB. Asta înseamnă cam 10–15 publicări pe lună plus traficul unui site mic. Ce se întâmplă când se termină creditele nu scrie pe pagina de prețuri (de verificat). Dacă Alex publică des, trecem pe Cloudflare Pages, nu pe un plan plătit.

**Cum respectă stack-ul modelul lui Radu** (`team/radu/documente/arhitectura-v1.md`):
- `content/nevoi.yml` devine o colecție Astro, încărcată cu `file()` (citește YAML).
- `content/lansari/*.md` are o schemă: `tip` dintr-o listă fixă, `nevoi` = 1–3 referințe la `nevoi.yml`, `business` = referință la `content/business/`.
- „Etichetă greșită = build oprit”: Astro dă eroare la un fișier care încalcă schema. Documentația nu spune explicit că o referință spre o etichetă inexistentă oprește build-ul. O testez la primul prototip; dacă nu, adaug o verificare de 10 rânduri în schemă.
- Recomandările, banda „Nou” și vitrina se calculează la build din aceleași fișiere. Fără server, fără bază de date.

**Total estimat la start: 0 pe lună** (fără domeniu; costul lui e de verificat la registrar). Variantă cu Vercel: 20 pe lună.

**Surse:** [Vercel pricing](https://vercel.com/pricing) · [Vercel Hobby](https://vercel.com/docs/plans/hobby) · [Vercel terms](https://vercel.com/legal/terms) · [Netlify pricing](https://www.netlify.com/pricing/) · [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [Cal.com pricing](https://cal.com/pricing) · [Astro content collections](https://docs.astro.build/en/guides/content-collections/)

## 2. Generatorul paginii echipei (`scripts/build-echipa.mjs`)

**Rulare:** `node scripts/build-echipa.mjs`, din orice folder. Doar module Node incluse, fără `npm install`. Testat pe o copie a repo-ului la 2026-11-15 (Node 24): 8 agenți, 2 rapoarte, 5 decizii.

**Produce:** `docs/echipa.html`, un fragment HTML fără `<!doctype>` (îl adaugă artifact-ul la publicare). Fișierul generat nu se editează de mână: se regenerează.

**Citește:**
- `team/<slug>/profil.md`, `scorecard.md`, `documente/`, `rapoarte/` (`.md` și `.html`, titlul din primul `# `)
- `.claude/agents/<slug>.md` (doar `color:`) și `.claude/agent-memory/<slug>/`
- `docs/decizii.md`, `docs/idei.md`, `docs/aor.md`, `docs/intrebari-pentru-alex.md` (numără rândurile `1. `)
- `team/tudor/rapoarte/*.md` (data din numele fișierului, câmpul `**Rezultat:**`)
- `ECHIPA.md`, tabelul de sub `### Propuneri deschise`
- `git log` și `git status`, pentru date și „modificat local”

**Ce nu trebuie schimbat, ca să nu se strice:**
1. **Profil:** primul rând `# Nume — Rol` (cu liniuță lungă). Câmpurile `**Categorie:**`, `**Raportează către:**`, `**Status:**`. Titlurile `##` exact așa: `Scop`, `Jobs to be done`, `Context`, `Responsabilități`, `Soft skills`, `Claude skills și unelte`, `Cum măsurăm dacă e util (KPI)`, `Ce NU face`, `Istoric rol`. Un titlu redenumit = card dispărut, fără eroare. La Jobs to be done se afișează doar rândurile care încep cu `- `.
2. **`docs/decizii.md`:** coloanele în ordinea `ID | Dată | Decizie | De ce | Cine propune / decide | Status | Document`. ID-ul `D-NNN`. Statusurile `de luat`, `de confirmat`, `de discutat` ajung în panoul de decizii. „Cine propune” trebuie să conțină numele agentului (pentru culoare). „Document” e o cale din repo (devine link pe GitHub).
3. **`docs/idei.md`:** `ID | Idee | De ce contează | DRI | Status | Următorul pas | Document`, ID `I-NNN`. Statusurile cu `respins` sau `live` nu se numără ca active.
4. **`docs/aor.md`:** `Arie | DRI | Backup | Documente | Ritm | Cum știm că merge`, cu numele agentului scris exact ca în profil.
5. **Scorecard:** rândurile încep cu data `AAAA-LL-ZZ` și stau înainte de `## Review-uri`.
6. **Un singur tabel per fișier** în `aor.md`, `idei.md`, `decizii.md`. Generatorul ia toate rândurile de tabel din fișier și sare doar peste primul antet; un al doilea tabel în `aor.md` ar apărea ca arii false. Și fără `|` în interiorul unei celule.
7. Folderul `team/tudor/rapoarte/` trebuie să existe: dacă lipsește, scriptul se oprește cu eroare.
8. Un agent nou apare automat dacă are `profil.md`, dar la coada listei până e adăugat în `ORDER` din script.

**Panoul de decizii:** în Claude, pagina salvează verdictele lui Alex în baza de date atașată artifact-ului, colecția `verdicts`. Un document per decizie, cu ID-ul deciziei (`D-005`) și câmpurile `verdict` (`aprobat`, `respins`, `discutam` sau gol), `note`, `updatedAt`, `applied`. Doar proprietarul artifact-ului poate scrie; ceilalți văd doar. Tudor citește colecția, trece verdictul în `docs/decizii.md` și pune `applied: true`. **Un ID de decizie redenumit pierde verdictul.** Deschisă în afara Claude, pagina e doar de citit.

## 3. Întrebări deschise pentru Alex
1. **Domeniu:** ai deja un domeniu? La ce registrar? Dacă nu, ce nume vrei?
2. **Găzduire existentă:** ai acum un site sau un cont la un hosting (WordPress, Wix, alt furnizor)? Ce trebuie păstrat sau redirecționat?
3. **Calendar pentru rezervări:** ce calendar folosești (Google, Outlook, iCloud)? Folosești deja un tool de programări (Calendly, Cal.com)? Cal.com se leagă de calendarul tău, ca să nu apară suprapuneri.
