# Oportunitățile: scor și prioritate

> Cerut de Alex (2026-11-26): „Mă interesează să gestionăm toate oportunitățile pe care le avem după trei criterii: probabilitatea de a se întâmpla, dezirabilitatea din partea mea și efortul necesar ca să se întâmple. Aș vrea să le dăm un scor în funcție de treaba asta și să le prioritizăm. Avem coloana Opportunities în Trello, care va fi în responsabilitatea ta, Tudor.”
> Decizia: D-100. **DRI:** Tudor. **Backup:** Ana.

## Unde stau
- Pe Trello, board-ul „Planning”, coloana **Opportunities**. Un card înseamnă o oportunitate.
- Ce renunțăm merge în **Gave Up Opportunities**, cu motivul scris.
- Ce câștigăm trece în **In Delivery**. Oferta și relația cu clientul rămân la Ana.
- Detaliile despre clienți (nume, sume, discuții) stau doar pe Trello și în evidența privată a Anei, niciodată în repo-ul public.

## Cele trei criterii, de la 1 la 5

| Criteriul | 1 | 3 | 5 | Cine îl dă |
|---|---|---|---|---|
| **P · Probabilitatea** să se întâmple | doar o idee a noastră, nimeni n-a cerut nimic | interes spus, o discuție deschisă, o ofertă trimisă fără răspuns | clientul a cerut-o sau a spus „da” în principiu | Tudor, din emailuri, calendar și carduri |
| **D · Dezirabilitatea** pentru Alex | n-aș vrea s-o fac | e ok, aduce bani sau relații | exact ce vreau, avansează obiectivele (O1–O4) | **Alex.** Tudor propune, Alex confirmă sau schimbă |
| **E · Efortul** până se întâmplă | un mesaj, o ofertă care există deja | o propunere nouă, câteva discuții | un produs sau un program nou, multe luni | Tudor, cu Ana sau Andrei |

Efortul se măsoară de acum până când oportunitatea e câștigată și gata de livrat: discuții, ofertă, produsul care încă nu există. Livrarea în sine nu intră aici.

## Scorul
**Scor = P × D × (6 − E)**, de la 1 la 125.

Efortul se întoarce: efort 1 dă 5, efort 5 dă 1. Înmulțim criteriile, nu le adunăm. Așa, o oportunitate pe care Alex n-o vrea (D 1) coboară în listă oricât de sigură ar fi.

Exemplu: P 4 · D 5 · E 2 → 4 × 5 × 4 = **80**.

## Cum arată pe card
- **Titlul** începe cu scorul: `64 · Numele oportunității`. Ce nu are încă date are `? · Numele`.
- **Descrierea** începe cu blocul de scor. Ce era înainte pe card rămâne dedesubt, neschimbat:
  ```
  **Scor 64** = P 4 × D 4 × (6 − E 2)
  - P 4: de ce
  - D 4: de ce (propus de Tudor, confirmă Alex)
  - E 2: de ce
  **Pasul următor:** ce, cine, până când
  ```
- **Ordinea** din coloană e ordinea scorului, cel mai mare sus. La scor egal urcă cel cu probabilitatea mai mare.

## Când se actualizează
- **Card nou în Opportunities:** Tudor îl scorează în aceeași zi sau la următoarea ședință de dimineață. Dacă lipsesc date, scrie pe card întrebarea pentru Alex.
- **Când se schimbă ceva** (răspuns de la client, ofertă trimisă, discuție ținută): Tudor actualizează P sau E pe card și reordonează coloana.
- **Ședința de dimineață:** primele 3 oportunități din coloană intră în checklist dacă au un pas pentru azi.
- **Review-ul la 2 săptămâni (D-092):** Alex trece prin listă, confirmă D, iar ce stă de peste o lună fără mișcare și are scor sub 20 poate trece în Gave Up.
