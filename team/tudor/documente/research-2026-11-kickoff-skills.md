# Research kickoff: ce skill-uri contează pentru fiecare rol

> Autor: Tudor. Dată: 2026-11-15.
> Scop: înainte să pornim, verificăm ce abilități (soft skills și Claude skills) au nevoie agenții și ce spun trendurile actuale.
> Concluziile sunt deja integrate în `team/*/profil.md`.

## 1. Cum funcționează agenții în Claude Code (fundația tehnică)
- Fiecare agent e un fișier Markdown în `.claude/agents/`, cu `name` și `description` obligatorii.
- Câmpul `memory: project` dă fiecărui agent o memorie persistentă în `.claude/agent-memory/<nume>/`, care intră în git. Primele 200 de rânduri din `MEMORY.md` se încarcă automat.
- Subagenții nu pot chema alți subagenți. De aceea **Tudor e sesiunea principală** (definit în `CLAUDE.md`), iar ceilalți sunt subagenți.
- Un raport public semnalează că `memory` poate să nu funcționeze când agentul are o listă restrictivă de `tools`. Am lăsat agenții fără restricție de tools, iar regulile de siguranță sunt în prompturi și în `.claude/settings.json` (trimiterea de emailuri, evenimentele din calendar și `git push` cer mereu confirmare).
- Surse: [documentația oficială sub-agents](https://code.claude.com/docs/en/sub-agents.md), [ghid agent memory](https://mintlify.com/shanraisshan/claude-code-best-practice/reports/agent-memory), [raport bug memory](https://claudeissues.com/issue/57507-bug-memory-field-in-subagent-frontmatter-not-functional-reproduces-on-v2-1-137-t).

## 2. Design: Liquid Glass pe web (pentru Ioana și Mike)
- Pe web, Liquid Glass se aproximează cu `backdrop-filter` și fundaluri semi-transparente. Suportul în browsere e bun; efectele de refracție avansate merg doar în Chromium.
- Critica principală e **contrastul textului**. Infinum și Axess Lab spun că sticla poate fi accesibilă doar dacă e aplicată cu grijă.
- Consensul practicienilor: sticla e „condiment, nu fel principal”. Folosită peste tot, face site-ul lent și greu de citit.
- **Decizie de design:** sticla doar pe navigare, carduri de intenție și overlay-uri. Textul lung stă pe suprafețe solide. Fallback pentru `prefers-reduced-transparency`. Contrast WCAG AA obligatoriu.
- Surse: [backdrop-filter recipes 2026](https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026), [Axess Lab: glassmorphism și accesibilitate](https://axesslab.com/?p=5111), [Infinum review](https://infinum.com/?p=19266836), [DesignRush trends 2026](https://www.designrush.com/agency/website-design-development/trends/web-design-trends), [should you use glassmorphism 2026](https://www.pravinkumar.co/blog/should-you-use-glassmorphism-website-2026).

## 3. Site personal de coach și fondator (pentru Radu și Maria)
- Greșeala cea mai frecventă: navigarea reflectă felul în care gândește proprietarul, nu drumul vizitatorului. Exact ce vrea Alex să evite.
- Meniul se construiește pe ce caută clienții. Un caz raportat: redenumirea „The Journey” în „Coaching Services” a crescut click-urile cu 18% (un singur caz, nu dovadă solidă).
- Ofertele principale nu se ascund în dropdown-uri.
- Pentru un fondator cu mai multe business-uri, site-ul personal e locul unde „se leagă punctele”. Asta e provocarea centrală pentru Maria.
- Pentru un coach, pagina Despre e una dintre cele mai importante: persoana e produsul.
- Un site propriu e un activ pe care îl controlezi, spre deosebire de platformele sociale.
- Surse: [Unicorn Platform: personal website strategy 2026](https://unicornplatform.com/blog/personal-website-strategy-and-execution-in-2026/), [Growbo: coaching website navigation](https://www.growbo.com/coaching-website-navigation), [Seahawk: coaching website design 2026](https://seahawkmedia.com/design/top-coaching-website-design/), [Simply.Coach](https://simply.coach/blog/coach-website-design-inspiration/).

## 4. LinkedIn și thought leadership (pentru Sofia și Maria)
- Consecvența bate volumul. Conversațiile din primele ore contează.
- Conținutul de la o persoană performează mai bine decât cel de pe pagini de companie.
- Focus tematic îngust: un cont care vorbește despre orice e greu de clasificat. **Implicație pentru Alex:** 2–3 piloni de conținut clari, chiar dacă personalitatea e complexă.
- Cercetarea originală e cel mai greu de copiat. Tool-urile lui Alex (ex.: diagnosticele de echipă) pot genera date și insight-uri proprii.
- Sursele sunt mai ales bloguri de marketing. Le tratăm ca ipoteze și le testăm pe datele lui Alex.
- Surse: [Reach Social: LinkedIn algorithm 2026](https://reachsocial.substack.com/p/what-the-linkedin-algorithm-2026), [Everything PR playbook 2026](https://everything-pr.com/linkedin-thought-leadership-a-2026-playbook), [Lilach Bullock: content strategy for founders](https://www.lilachbullock.com/linkedin-content-strategy-for-founders/).

## 5. Unelte Claude deja disponibile în contul lui Alex
| Unealtă | Cine o folosește |
|---|---|
| Skill `design` (Liquid Glass) | Ioana |
| `artifact-design`, `canvas-design`, `theme-factory` | Ioana |
| Conectorii Canva și Miro | Ioana, Sofia, Radu |
| `deep-research`, WebSearch | Tudor, Maria, Victor, Ioana |
| `docs` (documente partajabile) | toți |
| `run`, `code-review`, `simplify`, `security-review`, browserul integrat | Mike |
| `innersis-ive`, `bemore-ls-ive` (identități existente) | Maria, Ioana |
| Gmail, Google Calendar, Trello | Tudor, Victor (doar draft-uri și citire) |
| Sarcini programate | Tudor (raport săptămânal), Elena (retro lunar) |

## Ce rămâne de cercetat
- Platforma de rezervare potrivită (Cal.com vs. Calendly vs. ce folosește deja Alex).
- Găzduire și domeniu (ce are deja Alex).
- Platforme sociale secundare după ce confirmă Alex.
