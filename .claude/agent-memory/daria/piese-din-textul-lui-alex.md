---
name: piese-din-textul-lui-alex
description: Cum transform un text de conținut al lui Alex în piese (împărțire pe ecrane, ce adaug, capcanele build-ului)
metadata:
  type: feedback
---

2026-11-17: Regula de la Andrei/Alex: textul lui Alex se împarte pe ecrane, nu se rescrie. Pe ecrane cel mult titluri scurte; tot ce adaug eu merge în `:::trainer`, marcat „Propunere Daria”.

- Mesajele cheie și ipoteza = piese `tip: mesaj`, câte una pe ecran. Exemplele cu scheme = `model`.
- Ecranele lui Alex trec des de 30 de cuvinte: e doar avertisment, textul rămâne. Ecranele mele (activități) le țin sub 30.
- Textul pentru participanți dintr-o activitate trebuie formulat altfel decât ecranul din sală (fragmente de 4+ cuvinte identice opresc build-ul).
- Un `.md` fără antet în rădăcina cursului (de ex. un brief) oprește build-ul: e citit ca modul. Brief-urile trebuie ținute în alt folder.
- Schemele le face Matei; în piese pun numele de fișier convenite, iar în copia de probă SVG-uri goale.
- Obiectivele se leagă cu `obiective: [n]` doar după ce există în `curs.yml` (îl editează Tudor/Andrei, nu eu).

**Why:** Alex vrea vocea și ideile lui pe ecrane; designul meu se vede în ordine, timpi, activități și note.
**How to apply:** la orice brief de conținut de la Alex, aceeași împărțire; rulez build-ul pe o copie înainte de raport.
