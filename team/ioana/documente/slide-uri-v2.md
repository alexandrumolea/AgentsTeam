# Slide-uri v2: ecrane care arată ideea

Autor: Ioana. Data: 2026-11-18. Status: prototip, așteaptă alegerea lui Alex.
Continuă [slide-tipuri-v1.md](slide-tipuri-v1.md) (cele patru feluri plus pauza). Prototipul folosește conținutul unui curs real, deci stă în repo-ul privat al Studio (`privat/cursuri/change-agility/design/slide-uri-v2.html`). Aici scriu doar principiile, fără textele cursului.

## Cererea
Alex, 2026-11-18: slide-uri mult mai creative vizual. Între tipuri rămâne doar o notă comună, ca să le recunoască ușor. În rest, pentru că ecranele sunt HTML, nu ne limităm la un slide banal: arătăm schematic, uneori dinamic, cu elemente 3D.

Ce vrea vizitatorul aici: vizitatorul e sala. Vrea să *vadă* ideea înainte s-o citească. Alex vrea să știe dintr-o privire ce fel de moment urmează și să conducă ritmul (un → pe pas).

## Principiile
1. **Un ecran, o idee, un vizual.** Vizualul înlocuiește lista, nu se adaugă lângă ea. Dacă un ecran are nevoie de două vizualuri, sunt două ecrane.
2. **Textul autorului rămâne sursa.** Vizualul e un strat peste text. În sală se vede schema; în cursul online, în schiță și la tipar, același text apare ca listă. O sursă, trei ieșiri (D-048).
3. **Mișcarea explică, nu decorează.** Fiecare pas al animației corespunde unui pas al ideii (predicția, apoi realitatea, apoi eroarea). Se construiește o dată, la intrare sau la →. Nimic nu se repetă la nesfârșit (WCAG 2.2.2).
4. **3D doar unde volumul e ideea.** De exemplu: un nivel care urcă într-un vas care rămâne la fel, față de un vas care crește. Fără 3D decorativ. Desen tehnic: inele și linii fine, nu randări.
5. **Nota comună e mică și fixă; restul e liber.** Ce e comun stă în aceleași trei locuri pe fiecare ecran (sus-stânga, jos-stânga, sus-dreapta). Mijlocul ecranului e al vizualului.
6. **Lizibil de la 8 m.** Text de conținut de cel puțin 28 px la 1600 × 900, titluri de 50–60 px, cel mult 5–6 grupuri pe ecran. Contrast AA pe tot textul, calculat pe fondul real.
7. **Offline.** Un singur fișier, fără CDN. CSS 3D, SVG și JavaScript scris de mână. Fonturile sunt incluse (Sora și Inter Tight, din tema BEMORE).

## Nota comună: două variante
Ambele păstrează eticheta din v1 (semnul felului, felul, sursa ecranului), marca „BEMORE Learning Studio” jos în stânga (D-061) și pașii (puncte mici sus în dreapta, câte unul pe →). Diferă prin locul în care stă culoarea felului.

| | **A · Lumi** | **B · Cotor** |
|---|---|---|
| Ideea | Fondul spune felul, ca în v1: teorie pe Ceață, exercițiu pe alb cu panou piersică, reflecție pe Noapte, mesaj pe gradientul Sora, pauză pe sage. Vizualul trăiește în lumea felului. | Un singur fond luminos pentru toate. Felul stă într-un cotor de culoare pe marginea din stânga (ca la o carte) și într-un semn mai mare. Culoarea se mută în obiecte. |
| De la 8 m și în miniaturi | Foarte ușor: patru niveluri de lumină și patru siluete. | Mai greu: cotorul are 30 px; diferența o fac semnul și vizualul. |
| Libertatea vizualului | Mare, dar în culorile lumii lui. | Maximă: orice ecran poate fi oricum. |
| Riscul | Reflecția rămâne singurul ecran închis la culoare. | Ecranele se pot amesteca între ele; reflecția își pierde „noaptea”. |
| Brandul | Respectă v1 și tema actuală (`curs/tema/bemore.css`). | Mai aproape de regula 1 din manual („culoarea stă în obiecte, nu sub text”). |

**Recomandarea mea: A · Lumi.** Alex a cerut ca tipurile să fie „ușor de reperat”, iar fondul se vede din spatele sălii și în miniaturile „Acum / Urmează” din ecranul de comandă. Libertatea vizuală o câștigăm în mijlocul ecranului, nu din fond. Schimbarea față de azi e mică: tema rămâne, se adaugă vizualele.
Dacă Alex vrea ecrane mai unitare și mai luminoase, B e o schimbare de câteva rânduri de CSS (tokenii pe notă).

## Biblioteca de vizualuri din prototip
Nouă vizualuri, fiecare reutilizabil cu alt text. Numele sunt propuneri.

| Vizual | Ce arată | Mișcarea |
|---|---|---|
| `separare` | Două lucruri pe care le credem unul se despart | Discurile suprapuse se despart, apoi apare fraza |
| `bucla` | Un ciclu de 3–6 pași, cu un punct de tensiune | Un arc și un nod pe fiecare →; tensiunea se aprinde, apoi scade |
| `cronologie` | Aceeași realitate în timp, „la început” și „după” | Realitatea se desenează; erorile și alarma apar pe jumătăți |
| `ramificatie` | Un punct de plecare, două drumuri, factorii care decid | Trunchiul, apoi drumurile, apoi factorii |
| `recipiente` | Două procese ca volum (3D): nivelul urcă sau vasul crește | Camera se rotește o dată; nivelul urcă; vasul crește |
| `scara` | Trepte care urcă, ultima evidențiată (3D izometric) | O treaptă pe → |
| `cercuri` | Cuvintele cheie dintr-o frază se aprind, cercurile cresc | O singură dată, pe → |
| `opt` | Bucla în 8 cu patru zone și două capcane (Eco-cycle) | Bucla se desenează; fiecare → aprinde o zonă și întrebarea ei |
| `inel` | Cronometrul ca cerc care se golește, cu jumătatea marcată | Merge doar pornit (C sau click), se oprește la zero |

Exercițiul are cronometrul integrat în panou: inelul, cifrele mari, formatul și două puncte (perechea) care își schimbă rolul la jumătatea timpului.
Bucla în 8 rezolvă și cererea din piesa de închidere cu Eco-cycle: capcanele sunt puse ca în Liberating Structures (penuria între Gestație și Naștere, rigiditatea între Maturitate și Distrugere creativă).

## Cum se scrie (ideea de format, nu codul)
Autorul scrie ca azi, în piesa `.md`. Vizualul îl alege pe bloc, cu `vizual=`. Fiecare rând din listă devine un element al schemei și, implicit, un pas.

```
:::sala vizual=bucla
## Titlul ecranului
- primul pas
- al doilea pas
- pasul cu tensiune {tensiune}
- ultimul pas
centru: ce stă în mijloc
:::
```

```
:::sala vizual=ramificatie
## De unde pornim
- Primul drum: ce înseamnă
- Al doilea drum: ce înseamnă {stins}
depinde: factor unu · factor doi · factor trei
:::
```

```
:::sala vizual=propriu
![Textul care apare în curs și la tipar](materiale/schema-mea.svg)
:::
```

- **Parametri comuni:** `pasi=rand` (implicit: un rând pe →) sau `pasi=tot` (totul o dată, la intrare); `cronometru=8` ca azi; `miscare=nu` pentru un ecran static.
- **Rolurile unui rând:** `{tensiune}` (culoarea de atenție), `{stins}` (drum abandonat), `{accent}` (ideea principală).
- **Vizual propriu:** orice SVG sau HTML desenat de mână, 1600 × 900, doar cu tokenii temei (`var(--ink)`, `var(--acc)`, `var(--tens)`). Elementele cu `data-pas="2"` apar la al doilea →.
- **Fără vizual,** ecranul rămâne cum e azi.

Radu și Mike o transformă în arhitectură după ce Alex alege. Felul ecranului îl dă în continuare piesa (`tip:`), nu vizualul.

## Accesibilitate și browsere
- **Mișcarea:** se construiește o dată. Cu „reducere a mișcării” din sistem sau cu tasta M, pașii rămân, dar apar fără animație. ← dă înapoi un pas; R reia ecranul.
- **Contrastul** (WCAG 2.2, pe fondul real): text pe Ceață 15,8; accent 7,0; tensiune 5,5; reflecție: text 16,5, accent 10,4, portocaliu 7,4; eticheta pe gradient, în cel mai rău punct, 6,7; text pe sticla de 82 %, 15,3; text pe panoul piersică 10,5; pauză: accent 5,1. Varianta B: text 16,5, tensiune 5,8. Toate trec AA.
- **Sticla:** doar pe mesajele cheie, opacă la 82 %. Fără `backdrop-filter`, sticla devine 93 %; cu `prefers-reduced-transparency`, devine albă plină.
- **Verificat:** Chrome (capturi, pași, cronometru, nicio cerere externă). **Neverificat încă:** Safari, proiector real, telecomandă.

## Deschis
- Alex alege nota comună: A (recomandat) sau B.
- Ce vizualuri intră în bibliotecă și numele lor (cu Radu).
- Exercițiul din prototip e o piesă marcată `reflectie` în curs, cu cronometru. După maparea din v1, ar rămâne reflecție; l-am arătat ca exercițiu pentru că se lucrează în perechi. De confirmat cu Daria.
- Test în Safari și pe proiector, înainte să intre în generator.
