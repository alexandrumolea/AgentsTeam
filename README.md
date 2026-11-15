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

## Rutina zilnică pe GitHub (fără aplicația deschisă)
Workflow-ul `.github/workflows/rutina-zilnica.yml` îl pornește pe Tudor de luni până vineri la 9:00, pe serverele GitHub. Folosește abonamentul tău Claude, printr-o cheie pe care o adaugi o singură dată:
1. Instalează Claude Code în terminal și generează cheia: `claude setup-token`.
2. Pune cheia în repo: `gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo alexandrumolea/AgentsTeam` (lipești cheia când ți-o cere).
3. Test: tab-ul Actions → „Rutina zilnică a lui Tudor” → Run workflow.
