---
name: feedback-scris-mic
description: Alex observă scrisul mic (2026-11-17, legenda din Planșa la 16 px i s-a părut „foarte mic”); sub 16 px doar etichete, niciodată ce se apasă
metadata:
  type: feedback
---
Adăugat: 2026-11-17

2026-11-17: Regula: sub 16 px doar etichete (litere mari spațiate). Tot ce se apasă are cel puțin 16 px; listele de navigare 18–20 px; textul de citit 17+ px, lecțiile 19–20 px.

**Why:** Alex, despre legenda din B (16 px pe un mock scalat): „Nu-mi place că e foarte mic scrisul din lista din stânga de pe desktop.” Mock-urile se văd scalate (~0,95), deci 16 px ajung să pară 15.
**How to apply:** verifică și textul din SVG-urile scalate (viewBox mai mare decât ecranul îl micșorează). Verifică la 1440 și la 1280. Legat de [[project-design-v2]].
