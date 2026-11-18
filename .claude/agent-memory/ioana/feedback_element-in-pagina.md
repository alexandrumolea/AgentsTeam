---
name: feedback-element-in-pagina
description: Un element nou cerut de Alex se gândește în pagina întreagă, nu se pune doar undeva (2026-11-18, cărțile de sticlă din Despre „aruncate în mijloc”)
metadata:
  type: feedback
---
Adăugat: 2026-11-18

2026-11-18: Când Alex cere un element pe o pagină, propun compoziția paginii întregi, nu doar locul elementului: ce poveste spune pagina de sus în jos, ce rol are elementul în ea, cum se leagă de ce e deja acolo (aici: lentila ↔ cărțile, aceleași culori).

**Why:** Tudor a pus cărțile „Rezultate · Colaborare · Umanitate” sub misiune, centrate, într-un card de 880 px. Alex: „mi se pare aruncat în mijloc… Dacă cer o implementare, mă aștept să i se gândească și logica, potrivirea.” Pe vechiul site, cărțile erau imaginea misiunii (două coloane, banda ei).

**How to apply:**
- Întâi întreb ce rol avea elementul în original (ornament sau piesa vizuală a unei secțiuni) și păstrez rolul, nu doar forma.
- Verific ritmul: o pagină dintr-un singur card lung nu are moment; momentul principal primește lățime, fond sau sticlă diferite.
- Lățimile se aliniază cu bara de sus (1200 px), altfel pagina pare pusă în mijloc.
- Mișcarea care durează peste 5 s are pauză din tastatură, nu doar hover.
- Livrabil: 2 compoziții la 1440 + 390, cu textele și poza reale, plus recomandarea. Model: `team/ioana/documente/arhiva/despre-compozitie-v1.html`.
- Legat de [[project-manual-brand]], [[feedback-inovatie-nu-calm]].

2026-11-18 (runda 2): Alex a ales A, dar „background-ul este fragmentat și arată ciudat”: banda cu gradient propriu, cu margini tăiate, peste gradientul paginii. Regula: **un singur câmp de lumină pe toată pagina**. Momentul unei secțiuni îl fac cu lumină care se intensifică (pete radiale mult mai mari decât secțiunea, care se sting înainte de margini), spațiu și lățime, nu cu o bandă. Granulația trebuie să stea deasupra luminii.
2026-11-18: Linia timpului i s-a părut „nu suficient de imaginativă, dar nu rea”. Varianta nouă: Orbita drumului (cadran la scară, arce cât a durat rolul, numere de reper în discuri de sticlă, formarea pe orbita interioară, lista cu tot textul alături). Aștept alegerea.

2026-11-18 (runda 3): Despre publicat (A + Orbita) i s-a părut „prea complexă”, cu „spații prea mari” și „despre mine e prea gol”. Reguli noi:
- **Densitatea se măsoară, nu se simte.** Spațiul dintre blocuri = cel dintre bară și primul card (16 px desktop, 12 px telefon). Momentul îl face conținutul, nu golul. Golurile de 120 px din runda 2 („aer” pentru misiune) au fost greșeala.
- **Primul ecran plin:** cine e, poza și fapte concrete (acum, cu cine lucrează, formarea, butonul) deasupra pliului; următorul bloc începe vizibil. Mock-urile au linia pliului (900 / 844 px).
- **Un element vizual = un singur strat de informație.** Fără numere și litere de referință, fără două orbite; textul lung stă într-o listă alături.
- Ce îi place sigur: lentila cu poza („lupa”), orbita ca idee (nouă, nu banală), compactul.
- Unealtă: `?solo=a` în mock + CDP cu `setDeviceMetricsOverride` și un script care măsoară golurile, overflow-ul și coliziunile etichetelor.

2026-11-18 (runda 3.1): Alex a ales orbita, dar: „Acum lipsesc elementele dinamice… Nu înțeleg de ce mi-ai scoate elementul vizual care mi-a plăcut care este dinamic.” Regula: **ce i-a plăcut și se mișcă nu se face static**. Densitatea nu se obține tăind mișcarea. Mișcarea rămâne, cu oprire (un buton global „Oprește mișcarea”, plus pauză la clic pe element) și o variantă statică la reduced-motion.
- Cuvintele de pe cărțile rotitoare: plăcuțe albe care plutesc în fața pachetului (translateZ până la aceeași adâncime), ca să nu se vadă niciodată prin sticlă.
- Orbita vie: lumina (`conic-gradient` rotit) trece din 2007 până azi în 12 s, iar punctele se aprind cu aceeași animație și o întârziere din an; eticheta de jos arată rolul la hover, focus sau atingere.
2026-11-18 (runda 3.2): Alex despre cărți: „nu are nevoie să aibă pauză… se rotește încontinuu… fiecare card avea scris pe el ceva. Nu erau 3 etichete peste.” Regula: **un element pe care Alex îl cere „ca înainte” se reproduce după original** (vechiul site: `alexandrumolea.github.io/home/`, `.mission-deck`), nu se „îmbunătățește”. Doar culorile se schimbă. Lizibilitatea o rezolv în limitele lui (sticlă mai transparentă, text mai închis; am măsurat contrastul pe cadre: minimum 4,1:1, text mare). Pauza o dă doar butonul global, plus reduce motion.
2026-11-18: Două roluri din același an (Wise Teams și LIFT, 2025) = un punct cu inel dublu și eticheta pe două rânduri; atingerea arată ambele roluri.
