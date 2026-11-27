# Butonul de email pe paginile de curs (propunere v1)

> 2026-11-27, Ioana, la cererea lui Tudor (pregătirea postării de LinkedIn pentru Change Agility). **Propunere, nu e construită.** Mock-up: `buton-email-curs-v1.html` (captura: `buton-email-curs-v1.png`).

## Problema
Pe pagina Change Agility singurul drum de contact e „Scrie-mi pe WhatsApp”. Cine vine din postare ca să aducă workshopul într-o organizație (HR, L&D, un manager) scrie de obicei din emailul de serviciu: îi rămâne în istoric, îl poate trimite mai departe, nu-și dă numărul de telefon unui necunoscut. Capsula Contact are emailul, dar e o iconiță în colț, nu pe drumul paginii.

Ce vrea vizitatorul aici: să afle dacă workshopul se potrivește echipei lui și să scrie fără efort, pe canalul lui.

## Varianta A · Două drumuri (recomandată)
În cardul „Hai să vorbim” de la finalul paginii:
1. **„Trimite-mi un email”**, butonul plin (singurul plin din card). Deschide emailul cu subiectul „Workshop Change Agility” și cu primul rând deja scris, ca la WhatsApp.
2. **„WhatsApp”**, buton gol, cu iconița din capsula Contact.
3. Dedesubt, un rând mic: „Sau scrie direct la *adresa*”. Adresa se selectează dintr-un clic. Ajută pe calculatoarele fără program de email setat, unde un link `mailto:` nu deschide nimic (des întâlnit la cine folosește Gmail sau Outlook în browser).

**De ce emailul e plin pe paginile de curs:** publicul lor sunt organizațiile. Pe Coaching (oameni, nu companii) WhatsApp poate rămâne primul. **De decis de Alex:** care canal e butonul plin pe paginile de curs.

## Varianta B · Panoul Contact (fără cod nou)
Butonul din card devine „Scrie-mi” și deschide panoul Contact, cel de pe tot site-ul (`popovertarget="contact"` + `data-contact`, merge deja). Mai simplu, dar e un clic în plus, canalele sunt doar iconițe și mesajul nu vine pregătit cu numele cursului.

## Pentru Mike, dacă Alex alege A
Același tipar ca butonul WhatsApp (`whatsappLinks` în `site/build.mjs`), ca un curs nou să ceară doar textul din pagină:

```html
<a class="btn plin" href="#email" data-email="Bună, Alex! Aș vrea să aflu mai multe despre workshopul Change Agility." data-subiect="Workshop Change Agility">Trimite-mi un email</a>
<a class="btn gol wa" href="#whatsapp" data-whatsapp="…">WhatsApp</a>
<p class="adresa">Sau scrie direct la <span data-email-adresa></span></p>
```

- La build: `href` devine `mailto:<CONTACT_EMAIL>?subject=…&body=…`, cu `encodeURIComponent` (spațiile ca `%20`, nu `+`; unele programe de email arată `+` ca atare). `<span data-email-adresa>` primește adresa ca text.
- Adresa vine doar din secretul `CONTACT_EMAIL`, ca în capsula Contact. **Nu apare în niciun fișier din repo.** Fără secret (build local), butonul și rândul cu adresa dispar, cu avertisment, cum face deja WhatsApp.
- Rândul cu adresa: text de 16 px, culoarea `muted`, adresa în `text` + `user-select: all`. Fără JavaScript (paginile din repo nu au voie), deci fără buton „Copiază”.
- Iconița WhatsApp: aceeași din `svgIcon('whatsapp')`, 20 px, `aria-hidden`; textul butonului rămâne numele accesibil.
- Pe telefon (sub 420 px) butoanele se pun unul sub altul, fiecare de cel puțin 48 px înălțime.
- Șablonul (`site/README.md`, „Pentru un workshop nou”): la cursul nou se schimbă numele cursului din `data-email`, `data-subiect` și `data-whatsapp`. Trust & Difficult Conversations și Listening & Leading primesc același card.

## Riscuri
- O adresă scrisă ca text pe pagină poate primi ceva mai mult spam. Ea e deja în `mailto:` în capsula Contact, pe fiecare pagină, deci riscul nou e mic.
- Butonul plin se schimbă de la WhatsApp la email: e o schimbare de direcție pe pagină, așa că o decide Alex.
