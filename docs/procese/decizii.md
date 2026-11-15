# Proces: decizii

**DRI:** Tudor. **Scop:** Alex decide dintr-un singur loc, cu un click, iar fiecare decizie rămâne scrisă în repo.

## Unde decide Alex
În pagina echipei, secțiunea **Decizii de luat**: https://claude.ai/artifact/C1JTTZXjf92TTuyt6fjzhs#decizii
- **Aprob**, **Resping** sau **Discutăm**, plus notițe libere.
- Fiecare decizie are un link către documentul din spatele ei, pe GitHub.
- Alegerile se salvează pe loc, în baza de date a paginii (colecția `verdicts`, un document per ID de decizie). Doar Alex, ca proprietar, poate scrie acolo.

## Cum ajunge o decizie în listă
1. Un agent propune ceva care cere acordul lui Alex. Tudor adaugă un rând în `docs/decizii.md` cu ID nou (`D-NNN`), statusul **de luat** sau **de confirmat de Alex**, cine propune și documentul.
2. Tudor regenerează pagina (`node scripts/build-echipa.mjs`) și o republică la același link.

## Cum ajunge verdictul lui Alex în repo
La începutul fiecărei sesiuni, și înainte de orice raport:
1. Tudor citește colecția `verdicts` din baza de date a paginii.
2. Pentru fiecare verdict nou (`applied: false`):
   - **aprobat:** status „aprobată de Alex (data)”, cu notița lui la „De ce”, dacă există.
   - **respins:** status „respinsă de Alex (data)”, plus notița.
   - **discutăm:** status „de discutat”, iar Tudor pune subiectul pe agenda următoarei sesiuni.
   - **doar notiță:** Tudor o citește și răspunde în raport. Statusul rămâne neschimbat.
3. Tudor transmite consecințele agentului care deține decizia (de ex.: direcția vizuală aprobată ajunge la Ioana și Mike).
4. Tudor marchează verdictul `applied: true` în baza de date, regenerează pagina și face commit.
