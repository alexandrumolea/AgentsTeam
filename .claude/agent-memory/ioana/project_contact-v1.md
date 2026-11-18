---
name: project-contact-v1
description: Contactul pe site (2026-11-18) — doar iconițe-link; Alex a ales capsula A, numită „Contact” (D-072), construită de Mike
metadata:
  type: project
---
Adăugat: 2026-11-18

2026-11-18: Alex vrea Instagram, LinkedIn, WhatsApp, Substack și mail „foarte la îndemână”. Regula lui, venită în timpul sarcinii: **„Să nu fie vizibile, ci link-uri. Aș vrea să avem pentru fiecare iconițe.”** Deci pe pagină doar iconițe; nicio adresă, niciun număr scris. Nume accesibil pe fiecare („Scrie-mi pe WhatsApp”, „Trimite-mi un email”, „Instagram”), numele scurt la hover/Tab, ținte ≥ 44 px.

- Mostra: `team/ioana/documente/contact-propuneri-v1.html` (`?solo=a.coaching.open`, `&book`), capturi în `contact-propuneri-v1-capturi/`.
- A Capsula „Scrie-mi” (recomandată): un buton în același colț, se transformă în panou cu două grupuri (Scrie-mi: WhatsApp, email · Mă urmărești: LinkedIn, Instagram, Substack); pe prima pagină lângă misiune, pe telefon deasupra drumurilor. B Raftul (Dock vertical / bandă jos). C cardul „Hai să vorbim” la final + rând în drumuri și în Meniu.
- Profilurile publice: instagram.com/alexandrumolea, linkedin.com/in/alexandrumolea, alexandrumolea.substack.com. Numărul și emailul reale: doar din secretele GitHub, la build (Mike); `dist/` e în .gitignore.

**Why:** Tudor a cerut să nu încărcăm bara și primul card (Alex: mai puțin pe primul ecran).
**How to apply:** după alegere, Mike construiește (`contact` în `content/site.yml`, `secret:` pentru WhatsApp/email, popover fără JS); numele le-a dat Alex (D-072); review-ul meu pe build: T-042. Legat de [[feedback-element-in-pagina]], [[feedback-scris-mic]].

2026-11-18: Capcană: hook-ul pre-push acceptă doar `@example.com/org`; un exemplu ca `nume@exemplu.ro` blochează push-ul. În mock-uri folosesc `nume@example.com`.

2026-11-18: **Alex a ales A (D-072):** „Aș merge pe capsulă, aș numi-o contact. Scrie-mi. Urmărește-mă aici.” Butonul se cheamă „Contact”, grupurile „Scrie-mi” și „Urmărește-mă aici”. Mike a construit-o în aceeași seară. Rămâne review-ul meu pe build (T-042). A mers: recomandarea clară + mock-uri apăsabile; Alex a ales din prima și a redenumit.
