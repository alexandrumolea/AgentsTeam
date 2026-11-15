---
name: reference-browser-support-glass
description: Suport browsere relevant pentru sticlă și mișcare pe web (verificat 2026-11-15): Safari NU suportă prefers-reduced-transparency
metadata:
  type: reference
---

- `prefers-reduced-transparency`: Chrome/Edge 118+, Firefox doar cu flag, **Safari (macOS și iOS) nesuportat până la 27.x** (caniuse, 2026-11-15). Consecință: sticla implicită trebuie să treacă singură WCAG AA; textul din card stă pe un strat aproape opac (`--glass-tint-strong` ~.86).
- Animații legate de scroll: sursele secundare se contrazic la versiuni; le tratăm ca îmbunătățire progresivă cu `@supports (animation-timeline: view())`.
- Verifică din nou pe https://caniuse.com/mdn-css_at-rules_media_prefers-reduced-transparency la fiecare raport trimestrial.
- Context: [[project-descoperire-v0]].
