---
name: project-arhitectura-v2
description: Arhitectura v2 (D-028): atelierul cu două familii de categorii, Live din taskuri, Învață, Ce m-a crescut, misiunea ca fir; ce e de confirmat și cine deține ce
metadata:
  type: project
---
2026-11-15: Livrat `team/radu/documente/arhitectura-v2.md`, decizia D-028 (de confirmat de Alex). Construită pe v1 (lansări, nevoi, descoperire rămân).

Structura propusă:
- Tot site-ul = Atelierul (metafora lui Alex: „inovație, work & living”). Două familii: drumuri directe (Coaching, Compania mea, Speaking) și camere (Invenții, Live, Ce m-a crescut, Învață). Despre = numele din titlu. Familiile/dimensiunile nu sunt click, nu sunt pagini.
- Toate categoriile din `content/categorii.yml`; varianta fără 3D le citește pe aceleași.
- Live = `/live`, include I-005 („Acum”, opțional, `content/acum.md`). Sursa principală: rândurile din `docs/taskuri.md` (cerința lui Alex), regenerat la push, fără deploy per eveniment (Netlify Free: 15 din 300 credite per deploy). Oamenii: fără luminițe, acord o dată, 24 h întârziere, doar ziua.
- Knowledge (afișat Învață): format comun al Mariei (întrebarea, ideea, ce faci azi, unealta), 4 tipuri, câmp `aprobat` obligatoriu, `stadiu` schita/incercata/in-carte.
- Povești (Ce m-a crescut): nivel 3, doar cuvintele lui Alex, o lecție → poate deveni unitate (`din_poveste`).
- Misiunea (D-026): inscripția la intrare, text în Despre, `pod` pe camere și business, `pod` opțional pe elemente. Fără pagină proprie.

**Why:** Alex a schimbat de 4 ori cerința în aceeași zi (Live din taskuri, I-012, atelierul în trei dimensiuni, misiunea). Maria a lucrat în paralel și a luat ID-urile D-025/D-027 și T-010.
**How to apply:** Când Alex răspunde la cele 11 întrebări din v2, actualizează v2 și D-028. Înainte să scrii un ID nou în decizii/taskuri, verifică ultimul ID chiar înainte de scriere (alții scriu în paralel). Vezi [[project-descoperire-v1]].
