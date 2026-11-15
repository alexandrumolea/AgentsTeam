# Domeniul site-ului: alexandrumolea.com (GoDaddy) → GitHub Pages

> **DRI:** Tudor (configurarea), Alex (cumpărarea și setările din GoDaddy). D-038. Creat 2026-11-15.

## 1. Alex: cumpără domeniul pe GoDaddy
- Doar domeniul `alexandrumolea.com`. Nu ai nevoie de hosting, website builder sau email de la GoDaddy: site-ul stă pe GitHub Pages.
- Confidențialitatea datelor din WHOIS (Domain Privacy) e de obicei inclusă. Verifică să fie activă.
- Bifează reînnoirea automată, ca domeniul să nu expire.

## 2. Alex: setările DNS în GoDaddy
GoDaddy → My Products → domeniul → **DNS** → Manage DNS. Șterge înregistrările implicite de tip **A** pentru `@` („Parked”), apoi adaugă:

| Tip | Nume | Valoare |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | alexandrumolea.github.io |

## 3. Alex: verifică domeniul în GitHub (protecție)
GitHub → Settings (contul tău) → Pages → **Add a domain** → `alexandrumolea.com`. GitHub îți dă o înregistrare **TXT** (`_github-pages-challenge-alexandrumolea`). Adaug-o în GoDaddy, apoi apasă Verify. Asta împiedică pe altcineva să-ți folosească domeniul pe GitHub.

## 4. Tudor: legarea în GitHub Pages
- Setează domeniul personalizat pe Pages și câmpul `domeniu` în `content/site.yml` (din el se generează fișierul `CNAME`).
- Activează HTTPS după ce GitHub emite certificatul (de la câteva minute la câteva ore).
- Verifică `https://alexandrumolea.com` și `https://www.alexandrumolea.com`.

DNS-ul se propagă în câteva minute, uneori până la 24 de ore.
