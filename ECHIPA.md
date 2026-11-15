# Echipa lui Alex

> Pagina internă a sistemului. Versiunea web, cu organigramă și ultimele noutăți: https://claude.ai/artifact/C1JTTZXjf92TTuyt6fjzhs (privată). Se regenerează cu `node scripts/build-echipa.mjs`.
> O vedem doar noi (repo privat). Aici luăm decizii despre cum îmbunătățim echipa.
> Owner: Tudor. Ultima actualizare: 2026-11-15.

## Organigrama
```mermaid
flowchart TD
  ALEX([Alex])
  TUDOR[Tudor<br/>Chief of Staff]
  ELENA[Elena<br/>Coach extern]
  subgraph Strategie
    MARIA[Maria<br/>Personal Branding]
    VICTOR[Victor<br/>Impresar]
  end
  subgraph Produs
    RADU[Radu<br/>Arhitect]
    IOANA[Ioana<br/>Designer UI/UX]
    MIKE[Mike<br/>Developer]
  end
  subgraph Comunicare
    SOFIA[Sofia<br/>Social Media]
  end
  ALEX <--> TUDOR
  TUDOR --> MARIA & VICTOR & RADU & IOANA & MIKE & SOFIA
  ELENA -. auditează .-> TUDOR
  ELENA -. raportează direct .-> ALEX
  RADU --> MIKE
  IOANA --> MIKE
  MARIA --> SOFIA
  VICTOR --> MARIA
```

## Roluri
| Agent | Categorie | Rol | Scop în o propoziție | Status | Profil | Scorecard |
|---|---|---|---|---|---|---|
| Tudor | Coordonare | Chief of Staff | Proiectul își atinge scopul și Alex e mulțumit. | Activ | [profil](team/tudor/profil.md) | [scorecard](team/tudor/scorecard.md) |
| Radu* | Produs | Arhitect | Structură simplă, navigare pe intenții. | Activ | [profil](team/radu/profil.md) | [scorecard](team/radu/scorecard.md) |
| Ioana* | Produs | Designer UI/UX | Liquid Glass, actual, lizibil, ușor de folosit. | Activ | [profil](team/ioana/profil.md) | [scorecard](team/ioana/scorecard.md) |
| Mike | Produs | Developer | Site rapid, accesibil, ușor de actualizat. | Activ | [profil](team/mike/profil.md) | [scorecard](team/mike/scorecard.md) |
| Maria | Strategie | Personal Branding | Brand coerent, relevant, recognoscibil. | Activ | [profil](team/maria/profil.md) | [scorecard](team/maria/scorecard.md) |
| Sofia | Comunicare | Social Media | Prezență constantă și autentică. | Probă 30 zile | [profil](team/sofia/profil.md) | [scorecard](team/sofia/scorecard.md) |
| Victor* | Strategie | Impresar | Alex în contextele potrivite. | Activ | [profil](team/victor/profil.md) | [scorecard](team/victor/scorecard.md) |
| Elena* | Calitate | Coach extern | Sistemul se îmbunătățește lunar. | Activ | [profil](team/elena/profil.md) | [scorecard](team/elena/scorecard.md) |

\* Nume propuse de Tudor. Alex le poate schimba (vezi „Cum redenumim un agent”).

## Fluxurile principale
| Flux | Cine | Ritm |
|---|---|---|
| Cerere nouă de la Alex | Alex → Tudor → agent(ți) → Tudor → Alex | la cerere |
| Schimbare pe site | Radu (structură) → Ioana (design) → Mike (cod) → Alex aprobă → deploy | la cerere |
| Conținut social | Maria (mesaj) → Sofia (draft) → Ioana (vizual) → Alex aprobă → Alex publică | săptămânal |
| Oportunități | Victor (pipeline) → Alex decide → Maria (materiale) | lunar |
| Raport Tudor | Tudor → Alex | săptămânal |
| Retrospectivă | Elena → Alex | lunar |
| Review echipă | Tudor + Elena → Alex decide | lunar |

## Cum evoluează echipa
1. **Fiecare agent își notează munca** în scorecard după fiecare sarcină.
2. **Lunar, Tudor și Elena fac review-ul**: pentru fiecare agent, verdictul e *păstrăm*, *ajustăm* sau *renunțăm*.
3. **Semnale că un rol nu merge:** e chemat de mai puțin de 2 ori pe lună, Alex rescrie majoritatea rezultatelor, sau munca lui se suprapune cu a altui agent.
4. **Tudor propune, Alex decide.** Propunerile intră în tabelul de mai jos. Nimic nu se schimbă fără „da” de la Alex.
5. **Când renunțăm la un agent**, mutăm fișierul în `.claude/agents/_arhiva/`, păstrăm profilul și memoria pentru istoric și notăm lecția în `docs/lectii.md`.

### Propuneri deschise
| Dată | Propunere | De ce | Propus de | Decizia lui Alex |
|---|---|---|---|---|
| 2026-11-15 | Rol viitor: **Editor de carte** (structură, ritm de scriere, redactare) | Cartea e un proiect de luni de zile, cu nevoi diferite de social media | Tudor | în așteptare |
| 2026-11-15 | Rol viitor: **Product manager pentru tool-uri** (dacă tool-urile devin multe) | Lansarea și întreținerea aplicațiilor e o muncă separată de site | Tudor | în așteptare |

## Cum adăugăm un agent nou
1. Copiază un fișier din `.claude/agents/` și schimbă `name`, `description` și misiunea.
2. Copiază un folder din `team/` și completează `profil.md` (inclusiv **Categorie** și **Jobs to be done**); golește `scorecard.md`.
3. Creează `.claude/agent-memory/<nume>/MEMORY.md`.
4. Adaugă rândul în tabelele de mai sus și în `CLAUDE.md`.

## Cum redenumim un agent
Spune-i lui Tudor „redenumește-l pe Radu în X”. El schimbă numele în `.claude/agents/`, `team/`, `.claude/agent-memory/`, `CLAUDE.md` și această pagină.
