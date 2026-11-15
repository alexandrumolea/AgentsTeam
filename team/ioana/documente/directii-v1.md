# Trei direcții pentru site (v1)

> Autor: Ioana. Dată: 2026-11-15. Status: **propunere, de ales de Alex**.
> Înlocuiește direcțiile A și B din `descoperire-v0.md` și `mock-descoperire.html`, pe care Alex le-a respins: „prea banale, nu transmit inovație, nu transmit viitor”.
> Conținutul din prototipuri e **fictiv**: textele, invenția „Busola”, orele, jurnalul echipei. Numele companiilor apar fără descrieri reale.

## Ce s-a schimbat față de v0
v0 a pornit de la „calm, premium”. Rezultatul a fost corect și sigur, adică exact ce nu voia Alex. v1 pornește de la altă întrebare: **ce poate face site-ul lui Alex și n-ar putea face un template bun din 2024?**

Răspunsul comun al celor trei direcții: site-ul nu doar spune că Alex e inventator, **se comportă ca o invenție**. Fiecare are un singur moment „wow”, legat de ce e Alex, nu de un efect la modă. Accesibilitatea și viteza rămân limite: text pe suprafețe solide, `prefers-reduced-motion` respectat, totul merge pe telefon.

Liquid Glass a rămas doar ca material: panourile din direcția 2 și sticla invenției 3D.

## Cum le vezi
Deschide fișierele direct în browser (Chrome sau Safari, desktop sau telefon). Fiecare are sus o bară cu legături către celelalte două.
- `prototip-v1-dialog.html`
- `prototip-v1-spatial.html`
- `prototip-v1-viu.html`

---

## Direcția 1: Dialog („site-ul te întreabă”)
**Ideea.** Pagina principală e o întrebare, nu un meniu. Un titlu editorial mare, apoi „De ce ai nevoie?”: un câmp în care scrii cu cuvintele tale, plus 6 răspunsuri gata făcute. Tipografie: Instrument Serif (titluri, italic expresiv) cu Geist și Geist Mono. Hârtie caldă, cerneală, un singur albastru electric.
**Momentul wow.** După ce răspunzi, apare traseul agenților („Tudor înțelege, Radu alege drumul, Ioana așază pagina, Mike construiește”), apoi pagina ta se **desenează ca schiță** (contururi cu etichete ca `‹titlu›`, `‹calendar›`) și se umple cu conținut real, bloc cu bloc. Vezi cum ți se construiește pagina.
**Ce transmite despre Alex.** Că site-ul e un produs AI-native, nu o broșură. Și că Alex gândește în nevoi: întrebarea vine înaintea catalogului.
**Riscuri.** (1) Momentul durează cam 2,5 secunde; la a doua vizită poate enerva, deci versiunea reală trebuie să-l scurteze pentru cine revine. (2) Câmpul liber promite înțelegere reală. În prototip e potrivire de cuvinte; live are nevoie de un model AI cu costuri, limite și un plan pentru răspunsurile greșite. (3) Arată cel mai „editorial” dintre cele trei, deci e cel mai aproape de zona sigură.
**Cost pentru Mike.** Mic spre mediu. CSS, puțin JS, View Transitions ca îmbunătățire progresivă, fără librării. Partea scumpă e opțională: înțelegerea întrebării libere printr-un model AI (backend, costuri pe cerere, moderare).

## Direcția 2: Spațiu („atelierul în spațiu”)
**Ideea.** Pagina principală e o scenă 3D (three.js r160): o planșă de atelier care se pierde în ceață. În centru stă invenția lunii, o busolă din sticlă. În jur, pe orbită, sunt 6 obiecte de sticlă, câte unul pentru fiecare intenție. Le alegi din bara de jos (accesibilă de la tastatură), dând click pe obiect sau trăgând de spațiu. Agenții sunt luminițe pe orbite înclinate, iar cel activ își arată numele. Tipografie: Unbounded (lată, tehnică) cu Onest și JetBrains Mono.
**Momentul wow.** „Desfă invenția”: camera se apropie, iar busola se desface **strat cu strat**, ca un desen tehnic în explozie. Fiecare strat are o etichetă: întrebarea, acul, inelul, sticla, baza (unde scrie cine a construit-o). Inventatorul îți arată cum e făcută invenția.
**Ce transmite despre Alex.** „Construiesc lucruri și îți arăt cum funcționează pe dinăuntru.” Cea mai puternică impresie de viitor dintre cele trei, în spiritul visionOS.
**Riscuri.** (1) E cea mai grea pagină: three.js trece de 150 KB comprimat (în prototip se încarcă varianta neminificată; live, doar ce folosim), iar materialele de sticlă cer GPU. Pe telefoane folosesc un material mai ieftin, dar pe Android-uri slabe tot trebuie testat. (2) Fiecare invenție nouă cere un model 3D, deci costă la fiecare lansare. (3) 3D-ul poate deveni decor fără rost; aici se justifică doar prin vederea desfăcută. (4) Fără WebGL rămâne o variantă simplă, cu bara de intenții și lista straturilor, dar arată mult mai sărac.
**Cost pentru Mike.** Mare. Scena, performanța pe mobil, varianta fără WebGL și un model 3D pentru fiecare invenție (sau un șablon de „obiect în straturi” reutilizabil).

## Direcția 3: Sistem viu („echipa lucrează sub ochii tăi”)
**Ideea.** Ecran împărțit. În stânga: titlul, o linie de comandă („> de ce ai nevoie?”, cu `/coaching`, `/tool-uri` etc.; tasta `/` o activează) și „Pe banc acum”, invenția în lucru, cu progres, teste și ultima modificare. În dreapta: rețeaua echipei, desenată live. Alex (om, romb) în centru, Tudor lângă el, ceilalți agenți în jur. Sarcinile circulă ca impulsuri de lumină între noduri, iar fiecare intră în jurnal. **Fiecare vizită arată altfel**: culoarea de accent (din 4 verificate pentru contrast), așezarea rețelei și rândul „Azi în atelier” se generează la încărcare. Cuvântul „crească” din titlu respiră pe axa de lățime a fontului variabil. Tipografie: Bricolage Grotesque (variabil, cu caracter) cu Martian Mono.
**Momentul wow.** Când alegi o intenție, apare **nodul tău** („Tu”), iar cererea ta traversează echipa: Tu → Tudor → Mike → înapoi la tine. Restul rețelei se estompează, traseul se luminează, jurnalul notează fiecare pas, iar răspunsul se deschide în cerc chiar din nodul tău, semnat „construit acum de Tudor, Mike”.
**Ce transmite despre Alex.** Ideea I-001 pusă direct pe prima pagină: „Conduc o echipă de agenți AI și o vezi lucrând.” Arată organizarea lui Alex ca invenție.
**Riscuri.** (1) Jurnalul simulat e o promisiune: live, trebuie să vină din activitatea reală a echipei (repo-ul public, `docs/decizii.md`), altfel e teatru. Asta depinde de răspunsurile lui Alex la întrebările din I-001. (2) Un ecran „tehnic” poate speria un client de coaching. Linia de comandă are butoane, nu cere să știi comenzi, dar tonul e mai rece. (3) Conținut care se actualizează singur: WCAG 2.2.2 cere un buton de pauză. Am pus unul.
**Cost pentru Mike.** Mediu. Un canvas 2D, fără librării, ~28 KB cu tot cu text. Partea de muncă reală e un flux de date din repo (ultimele decizii, lansări, commit-uri) într-un JSON public, generat la build.

---

## Recomandarea mea
**Direcția 3 (Sistem viu) ca fundație, cu momentul din direcția 2 ca pagină a fiecărei invenții.**

De ce:
1. E singura în care inovația **nu se poate copia** cu un template. Nimeni altcineva nu are echipa lui Alex. Celelalte două sunt execuții excelente ale unor idei pe care le pot avea și alții.
2. Leagă direct ideea I-001 de prima pagină. Site-ul devine dovada, nu descrierea.
3. E ușoară: canvas 2D, fără librării, merge bine pe telefon. Viteza nu e sacrificată.
4. Vederea desfăcută din direcția 2 e perfectă pentru pagina unei invenții (o vizită lungă, cu atenție), nu pentru prima pagină (decizie în 5 secunde).

Din direcția 1 aș păstra câmpul liber „scrie cu cuvintele tale”. Deja există în linia de comandă din direcția 3.

**Ce trebuie decis înainte de implementare:** ce date reale alimentează jurnalul (răspunsurile lui Alex la întrebările din `idee-I-001-echipa-la-vedere.md`).

## Limite respectate în toate trei
- Textul stă pe suprafețe solide sau aproape solide. Contrast verificat pe toate perechile de culori: minimum 5:1 pe text, iar majoritatea între 7:1 și 15:1. Accentele generate în direcția 3 au fost alese din start ca să treacă AA, atât pe fundal, cât și ca fundal pentru butoane.
- `prefers-reduced-motion`: fără rotiri, derive sau impulsuri. Rezultatele apar direct, iar busola se desface fără animație. Codul tratează cazul peste tot, dar nu l-am putut emula în browserul integrat; Mike îl testează din setările sistemului.
- Mobil: verificate la 375 px. Fără scroll orizontal, fără blocaje. Pe telefon, direcția 2 folosește materiale mai ieftine și arată straturile ca listă sub obiect.
- Fonturi de pe Google Fonts, three.js fixat la versiunea exactă `0.160.0` pe jsDelivr. Fiecare prototip e un singur fișier HTML.
- Verificate în browserul integrat (desktop 1440 px și mobil 375 px): zero erori în consolă.
- De rezolvat la implementare: pastila rotativă din direcția 1 și ticker-ul din direcția 2 au nevoie de pauză la hover/focus (WCAG 2.2.2), ca în direcția 3.

---

## Research: ce e de frontieră la final de 2026
Pe scurt, ce am reținut și cum am folosit:

| Semnal | Ce înseamnă | Unde l-am folosit |
|---|---|---|
| **Site of the Year 2025 la Awwwards: site-ul lui Lando Norris** (OFF+BRAND.), o cască 3D în three.js, un brand personal tratat ca experiență | Brandurile personale câștigă cu un obiect-erou 3D și o singură idee puternică, nu cu multe efecte | Direcția 2: un singur obiect-erou, invenția |
| **Portofolii-lume explorabile** (ex. „Where Worlds Take Shape”, Site of the Day pe 3 mai 2026: portofoliu ca lume WebGL) | Proiectele devin locuri sau obiecte pe care le descoperi | Direcția 2 |
| **Generative UI**: interfața construită de un agent AI în timp real; Google a prezentat-o pentru AI Mode la I/O 2026 (sursă secundară) | Site-urile încep să-și compună pagina după intenție | Direcția 1 (pagina compusă sub ochii tăi) și direcția 3 (răspunsul construit de echipă) |
| **Interfețe agentice și WebMCP**: site-uri pe care agenții le pot folosi, iar agenții devin vizibili în interfață | Agentul nu mai e ascuns în spate | Direcția 3 |
| **Tipografie cinetică și fonturi variabile**, considerate de unii principalul element de design din 2026, dar „doar în hero” după un review sceptic | Litera ca material viu, cu doză mică | Direcția 3 (un singur cuvânt respiră) |
| **Design spațial ușor în locul 3D-ului greu** și parallax înlocuit de adâncime reală | 3D doar unde explică ceva | Direcția 2 (vederea desfăcută explică invenția) |
| **View Transitions** (Baseline pentru aceeași pagină) și **animații legate de scroll** (Chromium și Safari; Firefox încă parțial) | Mișcare nativă, fără librării grele | Direcția 1 |

Ce am evitat intenționat, pentru că s-a banalizat: hero cu gradient-orb, grile bento pentru orice, glassmorphism peste tot, cursor personalizat, text animat literă cu literă, „desktop OS” cu ferestre (teritoriul 4 din brief). Din teritoriul 4 am păstrat doar linia de comandă și tasta `/`, în direcția 3: au energie de OS fără să imite un desktop din 2020.

### Surse (consultate 2026-11-15)
Premiate și studii de caz:
- [Awwwards: Lando Norris, Site of the Year 2025](https://www.awwwards.com/sites/lando-norris)
- [Awwwards: profilul OFF+BRAND.](https://www.awwwards.com/offbrand/)
- [Codrops: povestea OFF+BRAND. (august 2026)](https://tympanus.net/codrops/2026/08/17/creativity-at-enterprise-scale-without-compromise-the-offbrand-story/)
- [Recapio: rezumatul unei analize video a stack-ului (three.js, glTF)](https://recapio.com/digest/this-website-is-insane-stack-explained-by-syntax)
- [Awwwards: Where Worlds Take Shape, Site of the Day, 3 mai 2026](https://www.awwwards.com/sites/where-worlds-take-shape)

Interfețe AI-native și generative UI (multe sunt surse de vânzare, deci le tratez ca semnale):
- [GitNation: Agentic Interfaces, Generative UI și WebMCP](https://gitnation.com/contents/agentic-interfaces-tools-skills-generative-ui-and-web-mcp)
- [Builder.io: designing generative UI in an agent-native world](https://www.builder.io/blog/designing-generative-ui-in-an-agent-native-world)
- [Generative UI in 2026: what actually works](https://alexcloudstar.com/blog/generative-ui-developer-guide-2026/) (sursa secundară pentru anunțul Google I/O 2026)
- [Thesys: AI-native frontends](https://www.thesys.dev/blogs/ai-native-frontends-what-web-developers-must-know-about-generative-ui)
- [The New Stack: 2025's radical frontend AI shift](https://thenewstack.io/2025s-radical-frontend-ai-shift/)

Trenduri vizuale (bloguri de agenții, semnale, nu dovezi):
- [DesignRush: 17 web design trends 2026](https://www.designrush.com/agency/website-design-development/trends/web-design-trends)
- [StudioMeyer: webdesign trends 2026, reality check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)
- [Lovable: website design trends 2026](https://lovable.dev/guides/website-design-trends-2026)

Tehnic:
- [Chrome for Developers: what's new in view transitions](https://developer.chrome.com/blog/view-transitions-in-2025)
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)
- [BuildMVPFast: CSS scroll-driven animations cross-browser](https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026)
- [CoderCops: view transitions și scroll animations 2026](https://blog.codercops.com/blog/css-view-transitions-scroll-animations-2026)

Notă: sursele se contrazic la suportul exact al browserelor (de ex. Firefox pentru animațiile legate de scroll). Mike verifică pe caniuse sau MDN înainte de implementare. Niciuna dintre direcții nu depinde de ele.
