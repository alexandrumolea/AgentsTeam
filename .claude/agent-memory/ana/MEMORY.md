# Memoria Anei (Ofertare și clienți)

Doar lecții generale. Clienții, sumele și ofertele stau în `.claude/agent-memory-local/ana/`. Fiecare intrare începe cu data.

## Preferințele lui Alex la oferte
- 2026-11-18: Fiecare sumă cu „+ TVA” sau mențiunea clară că oferta nu include TVA.
- 2026-11-18: Vrea oferte care „sună a sales”: convingătoare, legate de problema clientului, nu o listă de prețuri.
- 2026-11-18: Când clientul (sau Alex) a ales deja varianta, oferta o prezintă pe aceea, fără meniuri de alternative.
- 2026-11-18: Limbajul e mereu permisiv și suportiv, nu asertiv: fără imperative și fără presiune pe termen („Dacă vi se potrivește…”, „Mă bucur să ajustăm…”).
- 2026-11-18: Nu pun în ofertă referințe la alți clienți, grupe sau pilote, dacă Alex nu le cere.
- 2026-11-18: Materialele refolosibile pentru participanți intră în ofertă ca parte inclusă, numite concret.

## Lecții din oferte
- 2026-11-18: Dovada cea mai puternică stă de obicei în emailurile de după livrare (rezumatele zilelor, scoruri la final), nu în firul comercial. Caut-le separat înainte de secțiunea „De ce funcționează”.
- 2026-11-18: Firul Gmail poate depăși limita de citire; extrag doar textul nou din fiecare mesaj (fără citatele vechi). Mesajele trimise doar ca HTML apar goale în text simplu: le citesc din citatul răspunsului următor.
- 2026-11-18: Testez oferta HTML la 375 px într-un iframe (Chrome headless nu coboară fereastra sub 500 px); tabelele cu coloane fără împachetare dau derulare laterală pe telefon.
- 2026-11-18: Ofertele pornesc din șablonul Ioanei (BEMORE Learning Studio implicit, D-073); eu schimb doar textele ANA. Primul șablon real a trecut cu o pagină peste: pe foaia 1 textele trebuie ținute scurte (2 rânduri la Ce am înțeles, motive de o frază).
- 2026-11-18: Limitările unui produs (limba rapoartelor etc.) le verific cu Alex înainte să le scriu; informația de la furnizor se poate schimba.
- 2026-11-18: PRINCIPIUL LUI ALEX pentru „Ce am înțeles”: numesc scopul profund și schimbarea pe care o vrea clientul în oameni (misiunea), nu formatul; descriu procesul uman (reflecție, auto-cunoaștere), nu produsul; nu definesc oferta prin ce nu e; Alex stă alături de client în misiune („să începem”). Lentila e pentru „Ce am înțeles”, nu automat peste tot (vezi mai jos). Textul scris de Alex nu se scurtează; scurtez altceva.
- 2026-11-18: Pachetul trebuie să pară cât mai bogat: tot ce primește clientul e rând în Investiția; ce e inclus fără cost apare cu 0 EUR.
- 2026-11-18: Nu schimb titlul (sau alte secțiuni) din proprie inițiativă după o rescriere a lui Alex în altă parte; un titlu care a mers rămâne.
- 2026-11-18: Citatul clientului doar dacă adaugă sens, nu dacă repetă textul.
- 2026-11-18: Emailul de ofertă: fără sumă și fără pas de programare. Doar ce e atașat și deschiderea de a ajusta împreună (Alex a rescris așa emailul trimis). Înlocuiește regula „totalul o dată în email”.
- 2026-11-20: Când clientul cere o ofertă sub una concurentă, schimb doar ce a decis Alex (preț, volum) și ce decurge din cifre. Nu numesc concurentul și nu compar: valoarea reiese din ce conține pachetul (tot raportul, limba testului, zilele de formare, materialele). Comparația o pun doar în notele pentru Alex.
- 2026-11-20: Când prețul de vânzare se apropie de costul furnizorului, îi arăt lui Alex marja și pragurile de volum ale furnizorului (uneori o treaptă mai mare, cu coduri în plus, costă mai puțin). Decizia e a lui.
- 2026-11-20: La bugetele pentru finanțări cu decizie peste luni, semnalez lui Alex distanța dintre valabilitatea ofertei și momentul comenzii; o clauză despre tarifele furnizorului o propun separat, nu o pun singură în ofertă.
- 2026-11-20: Verific vârsta sau publicul recomandat de furnizor pentru un instrument față de publicul clientului; nepotrivirea o semnalez, nu o rezolv singură în ofertă.
- 2026-11-20: PDF-ul pe imagini: pdftoppm lipsește pe Mac și Read nu poate deschide PDF-ul pe pagini; merge un script Swift cu PDFKit (page.thumbnail → PNG) într-un folder din scratchpad. Testul la 375 px: iframe + Chrome headless cu --allow-file-access-from-files și --dump-dom.
- 2026-11-20: Pentru un client vechi, tariful de referință stă de obicei în firul comercial recent (prețuri pe format: 3 ore, zi întreagă). Îl caut acolo înainte să propun o sumă și spun lui Alex de unde vine.
- 2026-11-20: Când Alex cere o ofertă fără email de la client, verific calendarul și firele recente: poate înlocui o zi recontractată. Nu creez ciornă Gmail dacă destinatarul nu e sigur; las emailul în fișier, cu variantele de destinatar.
- 2026-11-20: Temele lui Alex devin „experiență” din propriile lui materiale (definițiile programelor și uneltele lor, în emailurile trimise), nu din flow-uri inventate.
- 2026-11-20: Când conținutul are mai multe teme decât cele 3 coloane ale șablonului, le pun într-un bloc simplu (listă) pe o foaie proprie, fără să ating stilul; oferta poate avea 3 foi.
- 2026-11-21: Când o ofertă înlocuiește o livrare deja convenită, prețul convenit rămâne (îl verific în fir) și oferta arată legătura cu restul seriei. Emailul merge celor care au ridicat obiecția, cu organizatorul comercial în CC; ca email nou, ca să poată avea PDF-ul atașat.
- 2026-11-21: PRINCIPIUL LUI ALEX pentru clienți care nu sunt din training: relevanța pe limba lor → agenda cu titlu, subtitlu și durată → ce iau oamenii → format → investiție. Titlurile de pe agendă nu sunt termeni de facilitator („contractarea” nu spune nimic unui manager). Fără promisiuni de adaptare; o zi dintr-o serie stă singură. Detalii în skill-ul `oferte`, secțiunea 2b.
- 2026-11-21: Verific atașamentul unei ciorne Gmail din formatul RAW (MIME decodat, SHA-256 al PDF-ului comparat cu fișierul local); PLAIN_TEXT și FULL_CONTENT nu arată atașamentele ciornelor.
- 2026-11-25: Mai multe workshop-uri scurte într-o ofertă: un singur document, câte o foaie pe workshop (relevanță, agendă cu durate, ce iau oamenii), plus o foaie comună (format, Bine de știut, investiție, final). În Investiția, un rând pe workshop cu inclusele sub el, și o notă cu prețul unuia singur. Detalii în skill-ul `oferte`, 2b.
- 2026-11-25: Lista de rezultate din căutarea Gmail scoate punctele din partea dinaintea lui @ a adreselor. Adresa exactă a destinatarului o iau din get_message sau din calendar, nu din search_threads.
- 2026-11-25: Banda de total din PDF poate ieși cu o linie peste ea (defect de randare care depinde de poziția pe pagină). Privesc banda mărită după orice schimbare de lungime a tabelului; am rezolvat-o scurtând tabelul (incluse comasate), fără să ating stilul.
- 2026-11-25: PREFERINȚA LUI ALEX: în agendă, doar titluri pe limba clientului (română), fără expresii în engleză; titlul principal poate fi în engleză; subtitlul e într-o singură limbă. Situațiile din „De ce e relevant” acoperă toate conversațiile de lucru (unu la unu cu un coleg sau cu șeful, în echipă), nu doar ședințele. Modelul de concretețe: o frază de deschidere cu scene recognoscibile.
- 2026-11-25: Prețul unei evaluări pe participant (ex. CliftonStrengths) îl iau din ultima ofertă la volum mic decisă de Alex, nu din oferta la volum mare; în tabel: „N × preț”, cu prețul pe persoană scris și în descriere, și o notă cu prețul fiecărei piese separat. Cu 3–4 piese, inclusele intră într-un singur rând pe piesă, ca foaia comună să încapă.
- 2026-11-25: Varianta „fără costuri” a unei oferte (de dat mai departe în firma clientului): scot Investiția și valabilitatea, numesc documentul „Propunere” în loc de „Ofertă” și verific textul extras din PDF (nu doar HTML-ul) după EUR, TVA și sume. Restul rămâne identic cu varianta cu costuri.
- 2026-11-26: Când o invitație sau un email sare cu „Recipient address rejected”, compar întâi adresa din eveniment cu adresa exactă din mesajele vechi (get_message): de obicei e o greșeală de scriere (ex. punctul lipsă), iar remedierea e corectarea adresei, nu un ocol prin altcineva.
- 2026-11-26: REGULĂ ALEX (D-098): în majoritatea timpului lucrăm în imaginea BEMORE Learning Studio (brand-bemore). Când lucrăm pe Wise Teams: culorile și stilul Wise (team/ioana/documente/brand-wise/manual-wise-v1.html). Un material, un singur brand.
