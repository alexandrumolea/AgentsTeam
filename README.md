# My Website

Site-ul personal al lui Alex și echipa de agenți care îl ține la zi.

## Cum lucrezi cu echipa
Deschide acest folder în Claude Code. Sesiunea principală este **Tudor**, Chief of Staff. Spune-i ce vrei, în cuvintele tale:
- „Tudor, am lansat un tool nou, pune-l pe site și pregătește o postare.”
- „Vreau să schimb textul de la coaching.”
- „Ce s-a întâmplat săptămâna asta?”

Tudor deleagă, verifică și îți raportează. Poți chema și direct un agent: „Ioana, propune-mi două variante pentru pagina principală.”

## Unde găsești ce
- [ECHIPA.md](ECHIPA.md): echipa, rolurile, cum evoluează.
- [docs/charter.md](docs/charter.md): scopul proiectului.
- [docs/intrebari-pentru-alex.md](docs/intrebari-pentru-alex.md): ce avem nevoie de la tine.
- [docs/idei.md](docs/idei.md): lista ta de idei, fiecare cu un responsabil.
- [docs/aor.md](docs/aor.md): cine răspunde de ce (arii de responsabilitate).
- [docs/procese/](docs/procese/): cum lucrăm, pas cu pas.
- [team/](team/): fiecare agent, cu profilul, scorecard-ul și documentele lui.
- [team/tudor/rapoarte/](team/tudor/rapoarte/): rapoartele lui Tudor.

## GitHub
Repo public: https://github.com/alexandrumolea/AgentsTeam. Tudor face push după fiecare commit.
Un hook (`.githooks/pre-push`) oprește push-ul dacă apar date private. Pe un clone nou, rulează o dată:
```bash
git config core.hooksPath .githooks
```
