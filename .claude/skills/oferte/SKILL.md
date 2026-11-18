---
name: oferte
description: Metoda echipei pentru oferte comerciale către clienții lui Alex (training, workshop-uri, coaching, evaluări precum CliftonStrengths). Folosește-o înainte de orice ofertă, email de ofertă sau follow-up comercial. Lecții generale, fără date de clienți.
---

# Cum facem o ofertă relevantă (metoda Anei)

Adăugat: 2026-11-18. Proprietar: Ana. Se îmbunătățește după fiecare feedback al lui Alex (cu dată).

O ofertă bună nu e o listă de prețuri. E răspunsul la întrebarea clientului: „De ce să facem asta, de ce acum și de ce cu Alex?”, urmat de ce primește și cât investește.

## 1. Înainte de a scrie: ascultă
- Citește tot firul de email cu clientul. Notează, în cuvintele lui: problema, ce a cerut exact, termenele, cine decide, ce obiecții a avut.
- Ce s-a întâmplat deja împreună (pilot, livrări anterioare, rezultate, feedback)? Asta e dovada cea mai puternică.
- Ce a decis deja Alex (variantă, tarif, format)? Ce a ales clientul se prezintă ca recomandare, nu ca meniu.
- Ce lipsește? Listează pentru Alex; nu ghici prețuri, termene sau cine livrează.

## 2. Structura ofertei (1–2 pagini)
1. **Titlu cu rezultatul**, nu cu produsul. „Profesori care lucrează cu talentele elevilor”, nu „Ofertă CliftonStrengths”.
2. **Ce am înțeles** (2–3 rânduri): problema și obiectivul clientului, în cuvintele lui. Clientul trebuie să se recunoască.
3. **Propunerea**: ce facem, pe pași, cu un mic calendar. Fiecare pas spune ce primește clientul, nu doar ce facem noi.
4. **De ce funcționează / de ce noi**: ce s-a dovedit deja (pilotul, experiența lui Alex, metoda), concret, fără superlative.
5. **Investiția**: tabel simplu, cu cantitate × preț unitar = total, fiecare sumă „+ TVA” (sau mențiunea clară sus că sumele nu includ TVA). Total la final, vizibil. Prețul per participant când ajută la înțelegere.
6. **Ce e inclus / ce nu** (transport, cazare, limba rapoartelor etc.): onest, fără surprize mai târziu.
7. **Pasul următor**: o acțiune concretă și simplă („confirmați pe email și programăm primele date”), plus valabilitatea ofertei (de exemplu 30 de zile).

## 3. Tonul
- Vocea lui Alex (skill `vocea-alex`): cald, direct, în română, fără jargon și fără presiune. Vânzare prin claritate și prin rezultat, nu prin adjective.
- Fraze scurte. Verbe la persoana I („vă propun”, „lucrăm”), cu „dumneavoastră” sau „voi” după cum vorbește Alex deja cu clientul în email.
- Nu promite ce nu controlăm (rezultate garantate, termene ale altora).
- 2026-11-18: **Limbaj permisiv și suportiv, nu asertiv** (Alex). Fără imperative de vânzare („Confirmați-mi”, „Vreau să…”) și fără presiune pe termen. În loc: „Dacă vi se potrivește…”, „Mă bucur să ajustăm…”, „Spuneți-mi ce ar fi de schimbat”, plus o invitație deschisă la întrebări. Valabilitatea se spune blând („rămâne valabilă până pe…”). „Sună a sales” înseamnă clar și relevant, nu insistent.

## 4. Forma ofertei (D-073, cu Ioana, 2026-11-18)
- **Pornești mereu din șablonul Ioanei:** `team/ioana/documente/oferta-sablon-v1.html`. Copia ofertei stă doar în `.claude/agent-memory-local/ana/oferte/<client-scurt>-<AAAA-LL-ZZ>.html`. Schimbi doar textele dintre comentariile `ANA`; stilul, fonturile și poza rămân neatinse.
- **Brandul implicit e BEMORE Learning Studio** (D-073): fundalul de pe site (câmpul de lumină), lentila cu Alex la final. Alt brand doar la cererea lui Alex.
- **Două foi** (cel mult trei; finalul cu poza rămâne ultimul):
  1. *Povestea:* titlul cu rezultatul, „Pe scurt” cu investiția, Ce am înțeles, 3 pași, De ce credem că ajută.
  2. *Înțelegerea:* Investiția, Ce rămâne după / Ce e inclus / Bine de știut, Dacă vi se potrivește + semnătura.
- **Limitele de lungime:** titlul are cel mult 10 cuvinte; „Pe scurt” are 3 rânduri, fiecare de cel mult 8 cuvinte; exact 3 pași (cel mult 25 de cuvinte fiecare); exact 3 motive; tabelul are cel mult 4 rânduri. Totalul apare de două ori („Pe scurt” și Investiția), identic. „+ TVA” la fiecare sumă.
- **PDF:** `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --print-to-pdf=oferta.pdf oferta.html`.
- **Verificarea formei:** numărul de pagini din PDF = numărul de foi; fiecare pagină privită ca imagine (într-un folder propriu din scratchpad); HTML-ul la 375 px fără derulare laterală (Chrome headless nu coboară sub 500 px: testezi într-un iframe de 375 px). Dacă o foaie trece pe pagina următoare, scurtezi textul, nu stilul.
- **Emailul care o însoțește:** scurt și cald (vezi Tonul): ce e atașat, totalul o dată, o invitație deschisă la discuție.

## 5. Verificarea înainte de predare
- [ ] Aritmetica verificată de două ori; totalurile se potrivesc cu tabelul.
- [ ] „+ TVA” peste tot (sau mențiunea clară).
- [ ] Numele, rolurile și cifrele vin din surse (email, Alex), nu inventate.
- [ ] Ce lipsește e în „Am nevoie de la Alex”, nu ascuns în ofertă.
- [ ] Nimic din ofertă nu ajunge în repo-ul public.

## 6. Lecții (cu dată, generale)
- 2026-11-18: Brandul implicit al ofertelor e „BEMORE Learning Studio” (D-073), cu fundalul de pe site și poza lui Alex în lentilă la final. Șablonul vizual îl face Ioana; Ana îl folosește.
- 2026-11-18: Rapoartele CliftonStrengths pot fi în engleză sau în română (Alex). Nu scrie „doar în engleză”.
- 2026-11-18: Alex vrea „+ TVA” la fiecare sumă sau mențiunea clară că oferta nu include TVA.
- 2026-11-18: Alex vrea ofertele să „sune a sales”: pornesc din problema clientului și din ce s-a dovedit deja, nu din lista de produse.
- 2026-11-18: Când varianta e aleasă, nu mai oferim alternative; prezentăm alegerea ca recomandare clară.
- 2026-11-18: Dovada pentru „De ce funcționează” se caută și în afara firului comercial: rezumatele trimise după livrare (pe zile, cu scorul de la final) sunt mai convingătoare decât orice argument. Se citează fapte, nu adjective.
- 2026-11-18: Ce nu e inclus și ce ține de client (limba rapoartelor, acordul părinților, sesiuni care nu sunt în ofertă) se spune onest într-o secțiune „Bine de știut”, fără preț pentru extra-uri nedecise de Alex.
- 2026-11-18: Alex a corectat tonul unui email de ofertă: îl simțea „asertiv, chiar agresiv”. Emailul de ofertă e scurt și cald: ce e atașat, cifra totală o dată, o invitație deschisă la discuție.
- 2026-11-18: Fără referințe la alți clienți, la grupe sau la pilote anterioare în ofertă, dacă Alex nu le cere explicit. „De ce funcționează” se construiește atunci din metodă (cum e gândit programul), fără promisiuni.
- 2026-11-18: Materialele pe care participanții le pot refolosi după formare sunt o parte valoroasă a ofertei: le numim concret, ca parte inclusă, fără să inventăm formate sau număr de pagini neconfirmate de Alex.
- 2026-11-18: Ana și Ioana lucrează împreună la forma ofertelor: Ana scrie conținutul în șablon, iar orice schimbare vizuală a șablonului o face Ioana. Dacă textul nu încape, îl scurtează Ana, nu umblă la stil.
- 2026-11-18: Nu scriem o limitare a unui produs (de exemplu limba rapoartelor) din informații vechi de la furnizor; verificăm cu Alex ce e valabil acum.
