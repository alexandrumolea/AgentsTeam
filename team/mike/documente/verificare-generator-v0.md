# Verificare pentru generatorul paginii echipei — v0 (propunere de cod)

> Autor: Mike. Data: 2026-11-15. Task: T-002 (I-008). Status: propunere, nimic aplicat. `scripts/` nu s-a modificat; un om (sau o rulare cu drept pe `scripts/`) o aplică.

## Problema
Generatorul `scripts/build-echipa.mjs` strică pagina **în tăcere**: un titlu `##` redenumit în profil = card dispărut; o coloană mutată în `decizii.md` = date în câmpul greșit; un ID `D-NNN` redenumit = verdictul lui Alex pierdut. Regulile sunt scrise în `stack-tehnic-v0.md`, secțiunea 2, dar nimic nu le verifică.

## Soluția simplă
Un fișier nou, `scripts/verifica-echipa.mjs` (cod mai jos), cu o funcție care întoarce o listă de avertismente. **Doar avertizează, nu oprește build-ul** (pagina trebuie să iasă oricum). Verifică:
1. Profil: primul rând `# Nume — Rol`, câmpurile `Categorie`, `Raportează către`, `Status`, cele 9 titluri `##`.
2. `decizii.md`, `idei.md`, `aor.md`: antetul exact, un singur tabel, număr corect de celule pe rând (prinde `|` în celulă), ID valid și unic.
3. ID-uri `D-NNN` care existau în ultimul commit și lipsesc acum (verdict pierdut).
4. Folderul `team/tudor/rapoarte/` și secțiunea `### Propuneri deschise` din `ECHIPA.md`.

## Unde se leagă (2 linii în `build-echipa.mjs`)
- După linia 4 (importuri): `import { verifica } from "./verifica-echipa.mjs";`
- Înainte de `fs.writeFileSync(... "docs/echipa.html" ...)` (linia 494):
```js
const avertismente = verifica(ROOT, { agenti: agents.map((a) => a.slug) });
avertismente.forEach((w) => console.warn("AVERTISMENT:", w));
```
Opțional, pentru GitHub Actions: `if (avertismente.length && process.env.CI) process.exitCode = 1;` (rularea eșuează vizibil, fișierul tot se scrie).

## Cod propus: `scripts/verifica-echipa.mjs`
Testat azi pe o copie a repo-ului din `/tmp` (Node 24): pe starea curentă dă 0 avertismente. După ce am redenumit un titlu și un ID, a dat exact 2 avertismente corecte (titlu lipsă, `D-001` dispărut). Nu e rulat în repo.

```js
