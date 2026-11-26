---
name: project-mini-curs-online
description: Mini-cursul online Change Agility „Drumul Danei” (D-094): prototipul clicabil Bun venit + Stația 1, deciziile mele de design și ce rămâne de ales
metadata:
  type: project
---
Adăugat: 2026-11-25

- 2026-11-25: Prototipul e în `privat/cursuri/change-agility/online/prototip-statia-1.html` (un fișier, fonturile base64 din `curs/tema/bemore.css`, ~300 KB), capturile în `online/capturi/`. Textele: `ecrane-statia-1.md` (Daria), neschimbate.
- **Why:** Alex vrea un curs online gratuit, ecran cu ecran, ca omul să-și reamintească ce a învățat (D-094). **How to apply:** stațiile 2, 3 și Finalul se adaugă în același tipar (un obiect pe ecran în lista SCREENS, butoanele după `btn`).
- Deciziile mele: un card de citit (sticlă 93 %) + bara de acțiuni (Înapoi · Sar peste/Mai departe); un singur buton plin. Pe ecranele cu răspuns, „Sar peste” devine „Mai departe” după răspuns. Planul: coloană pe laptop (≥980 px), pastilă cu 3 puncte + foaie (dialog) pe telefon. Noapte doar la 1.3. Semnul Danei = cerc cu „D” Sora + punctul portocaliu. 1.8 și 1.9 = același ecran în două stări. Aprinderea planului la 1.12 = halou cald, o dată.
- Ghilimelele din jurul ecourilor în fișierul Dariei le-am tratat ca delimitatori (nu apar pe ecran); ghilimelele din poveste rămân.
- Capturi: `?demo&static#1.9`; între capturi navighează la about:blank, altfel e doar hashchange și starea se scurge dintr-un ecran în altul.
