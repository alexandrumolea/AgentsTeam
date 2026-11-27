---
name: curs-online-ca
description: Cursul online Change Agility (oprit de D-099) și meditația The Positive Unknown: tehnici de layout și capturi
metadata:
  type: project
---

Adăugat: 2026-11-27 (mutat din MEMORY.md; intrările își păstrează datele)

- 2026-11-26: Cursul online Change Agility (privat/…/curs-online/index.html): pe telefon, schemele late din deck se citesc în zoom CULCATE pe lungimea ecranului (rotate 90° pe portrait, lățimea = min(100dvh−88px, (100vw−24px)·raport)); raportul îl pune JS la onload. „Mărește” stă sub imagine, nu peste ea (acoperea etichete din schemă). Capturile full-page le fac cu un script în scratchpad (captureBeyondViewport + clip), plus foi de contact randate tot în Chrome headless; elementele fixed apar la mijloc în capturi, nu e bug.

- 2026-11-26: Meditația „The Positive Unknown” (privat/…/design/positive-unknown-mockup.html): scenă DOM 1280×720 scalată, animația din timp, `__pu.seek('B', ms)` pentru capturi; `?v=noapte` / `?puntea=lumina` în URL. v2: doar B Orizontul, scriptul lui Alex în `SCRIPT`, comutator Lumină/Noapte (recomandat: Lumină cu puntea pe Noapte). Aștept alegerea; apoi Matei face PPTX-ul.
