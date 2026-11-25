# Site-ul v1: cum funcționează

> Autor: Mike. Dată: 2026-11-15. Taskul T-017, decizia D-036 (plus D-038 pentru adresă).
> Lucrăm pe variantele „de confirmat” D-025 (nume), D-027 (misiunea), D-028 (structura) și D-031 (Spațiu v2), pentru că Alex a cerut pagina acum.

## Pe scurt
- Site static, fără server. Codul e în `site/`, conținutul în `content/`, iar Live se generează din `docs/taskuri.md` și din istoricul git.
- Direcția Spațiu din prototipul Ioanei (`prototip-v2-spatial.html`): aceeași scenă, cele două momente „wow” (Desfă invenția, Intră în Live), podurile, camera caldă, varianta fără 3D și varianta de telefon.
- **Doar conținut real.** Nimic din prototip (Busola, lecții, povești, colaboratori) nu a intrat. Camerele fără conținut spun „În pregătire. Atelierul e deschis, camera asta se construiește acum.”
- Se publică singur pe GitHub Pages la fiecare push pe `main` (workflow-ul `.github/workflows/site.yml`).
- Adresa nu e fixată în cod: aceeași construcție merge la rădăcina unui domeniu (`alexandrumolea.com`) și sub `/AgentsTeam/` (D-038).

## Cum rulezi local
```sh
cd site
npm ci              # o dată, sau după ce se schimbă package-lock.json
npm run build       # scrie site/dist
npm run serve       # http://localhost:4321/
```
- În Claude Code: configurația `site` din `.claude/launch.json` pornește același server (fă `npm run build` înainte).
- `?nogl` la finalul adresei arată varianta fără 3D.
- Ca să vezi site-ul sub o cale, ca pe github.io: `SITE_BASE=/AgentsTeam/ npm run build && SITE_BASE=/AgentsTeam/ npm run serve`.
- Build-ul se oprește cu un mesaj clar dacă un fișier din `content/` e greșit (câmp lipsă, cheie dublă, nevoie inexistentă, link fără https). Așa nu se publică nimic stricat.

## Cum adaugi sau schimbi conținut (fără cod)
O schimbare = un fișier editat, apoi commit și push. Câmp gol = elementul nu apare.

| Vrei să schimbi | Fișierul |
|---|---|
| Introducerea, inscripția misiunii, titlul, descrierea pentru Google | `content/site.yml` (`intro`, `titlu`, `descriere`) |
| Butonul „Rezervă o sesiune” | `content/site.yml`, câmpul `rezervare` (un link https, ex. Cal.com). Gol = butonul e ascuns |
| Domeniul | `content/site.yml`, câmpul `domeniu` (vezi „Deploy”) |
| Etichetele, frazele, ordinea categoriilor, „în pregătire” → „deschis”, propoziția `pod` | `content/categorii.yml` (Maria) |
| Un business: ce nevoie rezolvă, rolul lui Alex, linkul, podul | `content/business/<nume>.md` (azi doar numele sunt completate) |
| Pagina Despre | `content/despre.md` (Markdown) |
| Textul despre echipă | `content/site.yml`, `echipa`. Rolurile se citesc automat din `team/*/profil.md` |
| Invenția din centru („Desfă invenția”) | `content/site.yml`, `in_centru` (exact 5 straturi). Acum e chiar site-ul |
| Cine apare cu numele în Live, cuvintele care ascund un rând | `content/site.yml`, `live` |
| Live | Nimic. Se scrie singur din munca din repo |

Datele sunt expuse și ca JSON, pentru o viitoare aplicație (D-030): `/api/continut.json` și `/api/live.json`.

## Live și Jurnalul atelierului
**De unde vin rândurile.** Build-ul citește toate versiunile lui `docs/taskuri.md` din git și le compară după ID. Un rând nou sau un status schimbat devine un eveniment, cu ora commit-ului. Celelalte commit-uri apar ca „salvat în repo”, cu subiectul lor. Un commit care a schimbat un task nu apare de două ori.

**Ce câmpuri ies public** (arhitectura v2, 4.2): ID, data și ora, De la → Pentru, textul taskului (max. 120 de caractere), statusul în cuvinte, rezultatul doar dacă e un fișier din repo. **Nu ies:** „De ce”, „Nivel”, autorii și emailurile commit-urilor.

**Filtrul (D-032, în ordinea aplicării):**
1. Doar ce e în git (deci a trecut de verificarea de la push). Modificările necomise nu intră.
2. Rândurile care conțin `[intern]`, `I-012`, „povest”, „povești” sau „curious mind” nu apar (lista e în `content/site.yml`). „Curious mind” stă acolo până decide Maria (T-016).
3. Statusul `anulat` nu apare.
4. Agenții apar cu numele și ora (sunt agenți AI, iar pagina o spune). Alex apare cu numele, ca om. Orice alt nume devine „un colaborator”.
5. Un rând cu un om (inclusiv Alex) apare abia după 24 de ore, doar cu ziua, fără oră.
6. Un text care arată a email, telefon, sumă de bani sau cheie e oprit, iar build-ul afișează un avertisment.

**Ce e real în scenă:** luminița unui agent e aprinsă doar dacă are un task în ultimele 24 de ore, altfel e stinsă (25%). Ticker-ul arată ultimele taskuri din ultimele 7 zile; dacă nu sunt, dispare. Când intri în Live, impulsurile din rețea **reiau ultimele 6 taskuri reale dintre agenți** și aprind rândul din jurnal care le corespunde. Nu se inventează nimic, iar cu „mișcare redusă” impulsurile nu pornesc.

**Cât de proaspăt e:** Live se reconstruiește la fiecare push pe `main`, după fiecare rulare a rutinei zilnice și o dată pe zi (05:15 UTC). Pe GitHub Pages un deploy nu costă credite, deci cerința din D-033 (fără deploy per eveniment, din cauza Netlify) nu mai e o problemă.

## Deploy
**Workflow-ul** `.github/workflows/site.yml`:
- pornește la push pe `main`, manual (Actions → Site → Run workflow), după rutina zilnică și zilnic la 05:15 UTC;
- `build`: checkout cu tot istoricul (orele din Live), Node 24, `npm ci` (versiuni fixe din `package-lock.json`), `node build.mjs`, apoi încarcă `site/dist`;
- `deploy`: publică pe mediul `github-pages`;
- permisiuni minime: `contents: read`, `pages: write`, `id-token: write`;
- acțiunile oficiale sunt fixate pe commit (SHA), cu versiunea în comentariu: checkout v7.0.1, setup-node v7.1.0, configure-pages v6.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1.

**Adresa vine din setările Pages, nu din cod.** `actions/configure-pages` dă adresa reală și calea de bază, iar build-ul le primește prin `SITE_BASE` și `SITE_URL`. Implicit, local, baza e `/`. Nicio cale nu e scrisă de mână.

**Ce face Tudor o singură dată (T-018):** Settings → Pages → Source: **GitHub Actions**. Fără pasul ăsta, primul pas din workflow („Setările Pages”) dă eroare.

### Varianta (a): domeniul propriu (`alexandrumolea.com`, `docs/domeniu.md`)
1. DNS-ul în GoDaddy, ca în `docs/domeniu.md`.
2. **Settings → Pages → Custom domain: `alexandrumolea.com`**, apoi „Enforce HTTPS”. **Asta e setarea care contează.** Când publici prin GitHub Actions, GitHub ignoră fișierul `CNAME` din site (documentația GitHub Pages despre domenii, secțiunea pentru workflow-uri personalizate).
3. Completează `domeniu: "alexandrumolea.com"` în `content/site.yml`. Build-ul scrie atunci și fișierul `CNAME` (inofensiv, util dacă mutăm vreodată pe alt mod de publicare) și folosește domeniul pentru adresa canonică și Open Graph când rulează local.
4. Site-ul ajunge la rădăcina domeniului, cu baza `/`. Nu se schimbă nimic în cod.

### Varianta (b): `alexandrumolea.github.io` (repo separat)
Un site la `alexandrumolea.github.io` trebuie să fie publicat **din repo-ul numit `alexandrumolea.github.io`**. Codul și Live rămân în AgentsTeam. Ce trebuie schimbat:
1. Alex creează repo-ul public `alexandrumolea.github.io` (gol) și activează acolo Pages din „GitHub Actions” sau dintr-o ramură.
2. **Build-ul rămâne în AgentsTeam** (are nevoie de `docs/taskuri.md` și de istoric pentru Live). În `site.yml`, jobul `deploy` se înlocuiește cu un pas care urcă `site/dist` în celălalt repo (de ex. un commit pe ramura `gh-pages` a lui `alexandrumolea.github.io`).
3. **Accesul:** `GITHUB_TOKEN` nu poate scrie în alt repo. E nevoie de un secret nou: o cheie de deploy (SSH, doar pentru repo-ul site-ului, cu drept de scriere) sau un token fin-granular limitat la acel repo. Asta e o decizie de securitate pentru Alex (nivel 2): cheia de deploy e varianta mai îngustă.
4. **Live la zi:** declanșatoarele rămân în AgentsTeam (push, rutina zilnică, zilnic), deci Live se actualizează la fel. Repo-ul site-ului doar primește rezultatul.
5. Baza rămâne `/`: în build se setează `SITE_BASE=/` și `SITE_URL=https://alexandrumolea.github.io/`, pentru că în AgentsTeam `configure-pages` nu mai e folosit.
6. Costul: un repo în plus, un secret de întreținut, încă un pas care poate cădea. De aceea recomand varianta (a) dacă domeniul se cumpără în zilele astea. Varianta (b) e bună ca soluție imediată.

### Varianta temporară: `/AgentsTeam/`
Dacă Pages e activat în AgentsTeam înainte de domeniu, site-ul apare la `https://alexandrumolea.github.io/AgentsTeam/` fără nicio schimbare (calea vine din `configure-pages`). D-038 spune că adresa finală nu conține „AgentsTeam”, deci e doar pentru verificare.

## Tehnic, pe scurt
- **Stack:** un build Node fără framework (`site/build.mjs`, ~560 de rânduri) și scena (`site/src/scena.js`, din prototip). Am renunțat la Astro: site-ul e o scenă și 9 pagini simple, iar un framework ar fi adăugat sute de dependențe pentru puțin câștig. Dependențe (7, toate fixate): `yaml`, `marked`, `three@0.160.0` (aceeași versiune ca prototipul) și 4 fonturi `@fontsource-variable`.
- **Fără cereri către terți din browser:** three.js și fonturile (Unbounded, Onest, JetBrains Mono, Fraunces) sunt găzduite pe site. Asta înseamnă fără Google Fonts și fără CDN, deci nimic de declarat în politica de confidențialitate (arhitectura v2, 4.5.5).
- **Securitate:** Content-Security-Policy strictă (doar resurse de pe site; import map-ul permis prin hash), fără formulare, tot textul din date e „escapat”, linkurile externe au `rel="noopener"`.
- **Pagini:** `/` (scena), `/coaching/`, `/business/`, `/speaking/`, `/inventii/`, `/live/`, `/live/echipa/`, `/ce-m-a-crescut/`, `/invata/`, `/despre/`, plus adresele vechi din arhitectură (1.10) ca redirecționări, `404.html`, `robots.txt`, `sitemap.xml` (când adresa e cunoscută).
- **Fără JavaScript:** pagina principală devine lista de drumuri, cu linkuri spre toate paginile.
- **Accesibilitate:** `lang="ro"`, link „Sari la conținut”, ticker cu pauză (WCAG 2.2.2), focus vizibil, panourile ies din ordinea de Tab când sunt ascunse, culorile Ioanei (AA verificat de ea). Mișcarea redusă oprește pragul, orbita, impulsurile și reluarea.
- **Imaginea Open Graph:** `site/static/og.png` (sursa: `site/src/og.svg`).
- **Mărime:** pagina principală ~5 KB comprimată; three.js ~167 KB comprimat, încărcat doar când există WebGL.

## Ce am verificat (2026-11-15)
- Build-ul trece pe o copie curată, cu `npm ci`, la fel ca în CI. Am testat baza `/`, baza `/AgentsTeam/` și un domeniu de test (fișierul `CNAME` apare doar când `domeniu` e completat). 232 de legături interne verificate, zero rupte, zero căi fără bază.
- În browserul integrat: desktop (1440 × 900, 1280 × 860) și telefon (375 × 812), cu 3D și cu `?nogl`. Desfă invenția, Live (rețeaua, impulsurile, jurnalul), Ce m-a crescut (hârtia), panourile, paginile interioare. Zero erori în consolă, fără scroll orizontal.
- `api/live.json`: cheile sunt doar `id, tip, linie, ref, cand, ora_reala, titlu, link, stadiu, stadiu_cheie, de_la, pentru, detaliu, rezultat`. Fără „De ce”, „Nivel”, emailuri, „curious mind” sau povești. 7 rânduri oprite de filtru.
- `sh scripts/verifica-public.sh HEAD`: OK. Același tipar, rulat pe fișierele noi și pe site-ul generat: nimic. Singura potrivire e o constantă numerică din three.js, care nu intră în git.

**Neverificat:** cadrele pe un telefon real și „mișcare redusă” setată din sistem (browserul integrat nu are GPU și nu emulează setarea; e T-014). Primul deploy real (după ce Tudor activează Pages).

## Ce lipsește (și e în regulă să lipsească azi)
- Conținutul camerelor: Invenții, Învață, Ce m-a crescut, Coaching, Speaking. Apar onest, „în pregătire”.
- Descrierile business-urilor, linkurile lor, rolul lui Alex în fiecare.
- Propozițiile `pod` (T-015) și numele familiilor („De ce ai nevoie?”, „Intră în atelier” sunt cele de lucru ale lui Radu).
- Linkul de rezervare, deci butonul „Rezervă” e ascuns.
- `content/acum.md` (stratul „Acum” din Live) și `content/participanti/` (colaboratorii cu acord): build-ul are deja regulile, dar fișierele nu există încă.

## Texte noi, de validat de Maria și Alex
Le-am scris factual, fără promisiuni. Toate stau în `content/`, deci se schimbă fără cod.
- Cardul invenției din centru: „Site-ul pe care îl vezi. Prima invenție din atelier. Desfă-l și vezi cum funcționează pe dinăuntru.” și cele 5 straturi.
- Pagina echipei: trei propoziții la persoana întâi (`content/site.yml`, `echipa.text`).
- Subsolul: „Site construit de Alex cu o echipă de agenți AI, la vedere.”

## Întrebări pentru Alex
1. **Adresa (D-038):** domeniul `alexandrumolea.com` (varianta a, recomandată) sau repo-ul `alexandrumolea.github.io` (varianta b, cere o cheie de deploy)? Până atunci, e OK să verificăm la `/AgentsTeam/`?
2. **Centrul scenei:** e OK ca prima „invenție” desfăcută să fie chiar site-ul, până apare una reală?
3. **Live:** arătăm și taskurile „la Alex” și „blocat” („așteaptă decizia lui Alex”)? Acum apar (e întrebarea 7 a lui Radu).
4. **Commit-urile în Live:** le arătăm ca „salvat în repo” cu subiectul lor, sau doar taskurile?
5. **Instrucțiunea din introducere** spune „Trage de spațiu”. Fără 3D nu ai de ce trage. O lăsăm așa (e textul aprobat) sau Maria propune o variantă pentru fără 3D?
