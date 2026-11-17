---
name: project-tema-culori
description: Paleta site-ului stă într-un singur fișier (content/tema.yml) din 2026-11-17; cum e legată, de ce așa, ce rămâne de făcut la alegerea paletei
metadata:
  type: project
---
Adăugat: 2026-11-17

2026-11-17: Alex a cerut ca o schimbare de design să fie ușoară. Toate culorile pleacă din `content/tema.yml`: CSS (`:root` generat de build), scena 3D (prin JSON-ul din pagină), theme-color, favicon (șablon), og.png și apple-touch-icon.png (`npm run imagini`, doar macOS, qlmanage + sips; reproduce PNG-urile octet cu octet).
**Why:** regula 7 (o schimbare = un fișier). Am ales generare la build, nu `getComputedStyle` în scenă, pentru că theme-color, favicon și OG nu pot citi CSS-ul la rulare, iar build-ul poate valida (o greșeală oprește build-ul).
**How to apply:** numele rolurilor sunt ale Ioanei (`bg`, `surface`, `muted`, `accent`, `human`, `alert`, `warm-*`, scena fără prefixul `scene-`). Valoare = hex, nume de rol sau oricare cu „/ alfa”. Transparențele din CSS: `rgb(var(--x-rgb) / .45)` (Safari 12.1+), nu color-mix. Excepții: `0xffffff` la sticla clară, `#000` în masca dock-ului.

2026-11-17: Verificare care a mers: în aceeași pagină, schimb `<link>` între CSS-ul nou și cel vechi (copiat în dist) și compar stilul calculat pe toate elementele și pseudo-elementele, plus regulă cu regulă (hover, media, keyframes) pe un element-sondă cu variabilele vechi. Diferențele care apar sunt tranziții în curs (`.mark` are tranziție de culoare): aștept 1,5 s.
Podurile din scenă foloseau `setRGB` în spațiu liniar; acum sunt hex sRGB echivalente (sub 0,5/255 diferență).

Deschis: T-024 (Ioana → Mike) aplică varianta pe care o alege Alex. Varianta B cere roluri noi `page-*` / `bar-*` pentru paginile interioare deschise; C cere refacerea scenei (vezi `culori-v1.md`) și schimbarea `color-scheme` din build. Vezi [[project-stack-hosting]].
