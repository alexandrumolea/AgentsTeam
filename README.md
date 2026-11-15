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

## Legarea de GitHub (o singură dată)
Repo-ul există local. Ca să-l pui pe GitHub, privat (GitHub CLI e instalat în `~/.local/bin`, fără Homebrew):
```bash
gh auth login
gh repo create my-website --private --source . --push
```
Sau creează un repo privat gol pe github.com și rulează:
```bash
git remote add origin https://github.com/<user>/my-website.git
git push -u origin main
```
