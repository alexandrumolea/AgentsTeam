---
name: wise-pdf-postare
description: PDF articol + postare în stilul The Wise: generatoare, capcane de tipar Chrome, verificarea textului
metadata:
  type: project
---

Adăugat: 2026-11-27 (mutat din MEMORY.md; intrările își păstrează datele)

- 2026-11-26: PDF articol + postare în stilul The Wise (wise-articol-postare-2026-11-26/, gen.mjs ia textele direct din draft-urile Sofiei, randare.sh headless). Capcane la tipar: un element mai lat decât zona paginii (margin negativ) face Chrome să micșoreze TOT documentul; flex cu gap pe h3 pune gol între span și text (înfășor titlul într-un span). Verific textul HTML vs. markdown cuvânt cu cuvânt (PDF-ul rupe literele spațiate). Tool-uri PDFKit (pagini PNG, foaie de contact) le refac în scratchpad cu swiftc. v2 (după manualul Wise, gen-v2.mjs + verifica-text.mjs + randare-v2.sh): wordmark în @page margin box cu content:url(svg cu width/height în mm), :first pentru dreapta pe copertă. Aura la tipar: elipse SVG cu feGaussianBlur, ținute în interiorul cutiei (altfel margini tăiate); un element absolut cu top negativ se scurge pe pagina anterioară. brand-wise/gen.mjs NU se importă (își regenerează PNG-urile): copiez piesele.
