---
name: project-tema-culori
description: Tema site-ului (culori, gradient, fonturi, contrast) stă în content/tema.yml; din D-057 e și brandingul BEMORE pentru cursuri; ce e fragil
metadata:
  type: project
---
Adăugat: 2026-11-17

2026-11-17: Toate culorile pleacă din `content/tema.yml`: CSS (`:root`), scena 3D (JSON în pagină), theme-color, favicon și og.png (șabloane SVG, `npm run imagini`, doar macOS).
**Why:** regula 7 (o schimbare = un fișier); build-ul poate valida, iar theme-color/favicon/OG nu pot citi CSS la rulare.
**How to apply:** roluri pe sens, nu pe nuanță. Transparențe: `rgb(var(--x-rgb) / .45)`, nu color-mix.

2026-11-17 (T-024): tema.yml are acum `fonturi` (titluri Sora, text Inter Tight → `--font-*`), `mesh` (gradientul → `--mesh-*`), `contrast` (perechi verificate la build peste fiecare culoare din fiecare gradient; sub prag = build oprit) și perechi `[sus, jos]` în `scena` (gradientul obiectelor).
**Why:** Alex a ales paleta Sora (D-054), iar D-057 a făcut-o brandingul BEMORE; aceiași tokeni îi folosește `curs/tema/bemore.css`.
**How to apply:** valorile din tema.yml câștigă în fața manualului (`team/ioana/documente/manual-brand-v1.md`), dar înainte de a alege o valoare, citește manualul. Sora nu coboară sub 26 px, cu excepția semnăturii. Semnătura („Alex · Atelier”) e în discuție (D-058): o schimbi doar în `content/site.yml`.

Fragil: qlmanage (imagini.mjs) nu înțelege `gradientTransform` pe radialGradient: folosește `gradientUnits="userSpaceOnUse"` cu cx/cy/r. Inline `<style>` în HTML e blocat de CSP: stilurile merg în site.css. Vezi [[project-stack-hosting]].

2026-11-17: scena nu mai are cristal, inel și cupolă translucidă: am scos din tema.yml `ring`, `ticks`, `core`, `core-emissive`, `disc`, `dome`. `obj-despre` = [cer, piersica] (lentila, manualul §7). Fără transmisie, punctul lentilei stă pe fața ei, nu sub sticlă.
