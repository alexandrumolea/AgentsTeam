# Ritmurile echipei

> Ce face fiecare agent din proprie inițiativă și când. Rulările le pornește **rutina zilnică a lui Tudor**, un workflow GitHub Actions (`.github/workflows/rutina-zilnica.yml`) care rulează pe serverele GitHub de luni până vineri la 9:00 (ora României, iarna), fără aplicația Claude deschisă. Rutina verifică acest tabel și panoul de taskuri.
> Rutina nu poate citi verdictele din pagina echipei. Pe acelea le aplică Tudor când deschizi o sesiune în aplicație.
> **DRI:** Tudor. Alex poate schimba orice ritm.

| Agent | Ritm | Ce face din proprie inițiativă | Nivel |
|---|---|---|---|
| Tudor | zilnic, în zilele lucrătoare | Aplică verdictele lui Alex, triază `docs/taskuri.md`, deleagă cel mult 3 taskuri, face commit, push și regenerează pagina echipei. Lasă un raport scurt doar dacă s-a întâmplat ceva | 1 |
| Tudor | luni | Raportul săptămânal (`docs/procese/raport-saptamanal.md`) | 1 |
| Sofia | luni | Draftul calendarului editorial pentru săptămâna următoare, din ce a produs echipa | 1 (postarea e 3) |
| Victor | joi | Actualizează pipeline-ul de oportunități și propune cel mult 2 oportunități noi. Fără cartea (parcată, D-035) | 1 (contactarea e 3) |
| Maria | prima zi lucrătoare din lună | Research de trenduri de brand și comunicare | 1 |
| Ioana | prima zi lucrătoare din lună | Research de trenduri de design: ce adoptăm, ce a devenit datat | 1 |
| Maria | prima săptămână din ian, apr, iul, oct | Îi propune lui Alex interviul de 30 de minute pentru povestea trimestrială (I-012), apoi scrie draftul doar din cuvintele lui | 1 (publicarea e 3) |
| Elena | ultima vineri din lună | Retrospectiva lunară, direct către Alex | 1 |
| Tudor + Elena | după retro | Review-ul echipei (`docs/procese/review-echipa.md`) | 2 |
| Mike, Radu | la cerere | Lucrează din taskuri. Nu au ritm propriu | – |

## Limite, ca să nu ardă abonamentul
- Cel mult **3 taskuri delegate pe rulare zilnică**. Restul așteaptă.
- Fiecare agent propune cel mult **2 taskuri noi** pe rulare.
- O rulare care nu găsește nimic de făcut se oprește repede, fără raport.
