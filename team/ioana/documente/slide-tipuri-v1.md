# Ecranele din sală: patru feluri, v1

Autor: Ioana. Data: 2026-11-17. Status: implementat în `curs/` (necomis), Alex îl vede la primul „Prezintă”.
Capturi: [slide-tipuri-v1/](slide-tipuri-v1/). Planșa cu cele patru: [plansa-patru-feluri.png](slide-tipuri-v1/plansa-patru-feluri.png). Aceeași planșă fără culoare, ca pe un proiector spălat: [plansa-spalat-fara-culoare.png](slide-tipuri-v1/plansa-spalat-fara-culoare.png). Toate cele 15 ecrane ale exemplului: [plansa-toate-ecranele.png](slide-tipuri-v1/plansa-toate-ecranele.png). Ecranul de comandă cu banda zilei: [comanda-banda.png](slide-tipuri-v1/comanda-banda.png).

## Cererea
Alex, 2026-11-17: vrea ca slide-urile să fie foarte diferite între ele, ca să le găsească ușor: reflecție, mesaj cheie, teorie, exerciții. Elemente puternic distinctive, inspirate din linia mea de design.

Ce vrea vizitatorul aici (vizitatorul e Alex, în sală): să știe dintr-o privire ce fel de moment urmează. La proiector, din spatele sălii și în cele două miniaturi din ecranul de comandă („Acum” și „Urmează”).

## Maparea (decizia mea)

| Felul | Tipurile din curs | De ce |
|---|---|---|
| **Teorie** | `teorie`, `model`, `poveste` | Toate trei explică ceva. Sunt conținut de citit. |
| **Exercițiu** | `exercitiu`, `energizant`, plus orice ecran cu `cronometru` dintr-un modul de `teorie` sau de `mesaj` | Un ecran cu cronometru e o activitate, chiar dacă stă într-un modul de mesaj (în exemplu: „Prezentări, câte 30 de secunde” din deschidere). |
| **Reflecție** | `reflectie`, `deschidere`, `inchidere` | La Alex, deschiderea și închiderea sunt întrebări puse grupului: un cuvânt, un lucru bun văzut la un coleg. |
| **Mesaj cheie** | `mesaj` | O singură idee de ținut minte. |
| **Pauză** | `pauza` (rând de pauză, piesă sau modul) | Varianta separată: nu e conținut, e liniște cu ceas. |

Ecranul de titlu al unui modul (numărul și titlul) ia felul modulului. Ecranele dintr-o piesă iau felul piesei, nu al modulului în care stă.

## Ce face fiecare fel distinct
Cinci semnale deodată. Culoarea nu e niciodată singurul semnal, deci tipul se recunoaște și fără culoare (vezi planșa „spălat”).

| | Fond | Semn | Așezare | Text | Element recurent |
|---|---|---|---|---|---|
| **Teorie** | hârtie caldă `#F5F2EC` | ■ pătrat | pornește de sus, aliniat la stânga, ca o pagină; titlul de modul stă jos, ca un capitol | 60 px, subțire | o linie fină sub etichetă, pe toată lățimea |
| **Exercițiu** | alb `#FBFAF7` + panou de aur `#D9B567` pe o treime | ▶ triunghi | pașii la stânga, panoul la dreapta | 58 px, pași numerotați 01, 02, 03 | **cronometrul mare (150 px) în panou** și formatul („în perechi”, „toată sala”); fără cronometru, un ▶ mare |
| **Reflecție** | navy de cerneală `#13202F` | ● cerc de aur | la stânga, centrat pe verticală, rar | 74 px, cel mai mare text de conținut | un cerc subțire, larg, tăiat de marginea din dreapta: loc de gândit |
| **Mesaj cheie** | câmp teal `#1E5E63` | ▬ linie | totul în centru | 92 px, subțire | o linie groasă de aur deasupra ideii |
| **Pauză** | salvie `#DCE5DD` | ‖ două bare | totul în centru | titlul 72 px | cronometrul de 230 px, în centru |

Eticheta e aceeași peste tot, în stilul slide-urilor lui Alex: mică, spațiată, majuscule, în accent, cu semnul felului înainte. Spune felul și de unde vine ecranul: „Exercițiu · Unde sunt eu pe curbă”, „Reflecție · Ce iei cu tine”. Ecranele de titlu au doar felul. Etichetele interne ale pieselor (Positive Outlook etc.) nu apar.

Pe proiector spălat sau fără culoare, ce rămâne: patru niveluri de luminozitate (hârtie, alb cu panou, navy, teal mediu), patru siluete (pagină de sus, două coloane, stânga cu cerc, centru) și semnul din etichetă.

## Inspirația
- **Slide-urile Ive ale lui Alex** (cele trei date azi): Helvetica Neue subțire, eticheta mică și spațiată în teal, punctul de aur la reflecție, listele numerotate 01, 02 cu linii fine între rânduri. Le-am păstrat aproape exact.
- **Linia mea (design v3, D-054):** câmpurile mari de culoare, un singur accent activ, salvia ca „sage undeva în ansamblu”, cifrele subțiri și mari. Fără sticlă și fără gradient: pe proiector, sticla nu adaugă nimic și scade contrastul.
- **Fonturi:** doar de sistem (Helvetica Neue, apoi -apple-system), deci merge fără internet. Sora nu e esențială aici: Helvetica Neue e chiar litera slide-urilor lui Alex.

## Banda zilei, în ecranul de comandă
Sub „Acum”, un rând de semne mici: câte unul pe ecran, în ordinea zilei, cu forma și culoarea felului. Un spațiu desparte modulele. Ecranul de acum e încadrat, cele trecute se estompează. Un click sare la ecranul ales. Dedesubt, o legendă (■ teorie, ▶ exercițiu, ● reflecție, ▬ mesaj cheie, ‖ pauză).
Răspunde la întrebarea lui Alex despre ordine fără s-o schimbe: ordinea rămâne cea din agenda ediției, dar vede dintr-o privire ce urmează (de exemplu, trei exerciții la rând). Același semn apare și în coloana „Tip” din vederea Ziua.

## Contrastul (WCAG 2.2, calculat în pagină pe ecranele randate)

| Felul | Text / fond | Eticheta / fond | Altele |
|---|---|---|---|
| Teorie | 13,55 | 4,91 | cronometru gata 5,66 |
| Exercițiu | 14,50 | 5,26 | cronometrul pe panou 8,43; gata pe panou 4,40 |
| Reflecție | 14,59 | 7,31 | punctul de aur 7,02 |
| Mesaj cheie | 7,40 | 5,36 | |
| Pauză | 10,43 | 4,74 | |

Toate trec AA. Eticheta are 26 px la 1600 px lățime, deci pe orice proiector e text mare; tot am ținut-o peste 4,5.
Semnul ▶ mic din banda zilei, pe alb: 3,95 (prag 3 pentru grafice).

## Unde e în cod
- `curs/lib/trainer.mjs`: `FEL` (maparea), `ecranul()` (eticheta, conținutul, panoul exercițiului, cronometrul). Același HTML în sală, în previzualizările din Modul, în ecranul de comandă și la tipar.
- `curs/lib/stil.css`: secțiunea „Ecranul din sală” (felurile, semnele, așezările) și banda zilei.
- `curs/tema/innersis.css`: tema nouă, doar tokeni `--fel-*` și `--t-*`, cu contrastul notat lângă fiecare culoare. `curs/tema/sobru.css` are aceiași tokeni, în tonuri neutre, pentru orice alt brand.
- `curs/lib/prezinta.js`: clasa `fel-*` pe ecran și banda zilei.
- `curs/build.mjs`: numără ecranele după `"fel"`.

## Ce rămâne deschis
- **BEMORE LS:** tema `bemore-ls.css` (Amalfi, travertin, citron) se face copiind `innersis.css`. Nu am făcut-o încă, pentru că cele două workshop-uri sunt Innersis.
- **Test pe proiector real:** am simulat proiectorul spălat (fără culoare, contrast redus). Salvia și hârtia sunt apropiate ca luminozitate; le despart așezarea (centru față de pagină) și cronometrul uriaș. De văzut în sală.
- Un ecran de exercițiu fără cronometru și fără format (de exemplu „Ce faci luni, între 9 și 10?”) arată un ▶ mare în panou. Dacă Alex vrea acolo altceva (durata piesei, de exemplu), e o schimbare de un rând.
