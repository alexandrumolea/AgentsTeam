# Research: descoperire și recomandări pe site

> Autor: Radu. Dată: 2026-11-15. Folosit în `docs/site/arhitectura-v1.md`.
> Sursele sunt amestecate: câteva de cercetare UX (NN/g), multe de la vânzători de tool-uri. Cifrele de la vânzători sunt ipoteze, nu dovezi.

## 1. Recomandări „S-ar putea să-ți placă”
- NN/g: recomandările ajută când spun **de unde vin** („pentru că te interesează X”) și când sunt grupate pe categorii, nu aruncate toate într-un singur bloc.
- NN/g (studiu mic, 8 participanți): utilizatorii apreciază recomandările ca mod de a restrânge opțiunile.
- Algolia (vânzător): conținutul înrudit pus doar la final de pagină pierde din vizibilitate. Pentru noi, finalul e totuși locul corect: nu vrem să stea în drumul intenției principale.
- Surse: [NN/g recommendation guidelines](https://www.nngroup.com/articles/recommendation-guidelines), [NN/g recommendation expectations](https://nngroup.com/articles/recommendation-expectations), [Algolia: related content](https://www.algolia.com/blog/ux/how-related-content-recommendations-keep-users-engaged/).

## 2. Quiz / mini-diagnostic pentru coachi
- Recomandare repetată: întrebările trebuie să oglindească oferta, iar rezultatul trebuie legat direct de pasul următor (rezervare, tool). Altfel quiz-ul e divertisment.
- Rate de conversie raportate între 11% și 42%, dar de la vânzători și măsurând lucruri diferite. Nu le folosim ca argument.
- Nicio sursă nu compară 3 întrebări cu mai multe. De testat.
- Surse: [Interact: quiz lead generation for coaches](https://www.tryinteract.com/blog/quiz-lead-generation-for-coaches), [Fyrebox: quizzes for coaches](https://www.fyrebox.com/blog/coaches-consultants-use-quizzes-book-more-discovery-calls), [Growbo: coaching quiz funnels](https://www.growbo.com/coaching-quiz-funnels-essential-techniques).

## 3. Fezabilitate tehnică (pentru Mike)
- Astro content collections validează câmpurile din fișiere (schema) și permit etichete și referințe între fișiere. Asta face posibil: o etichetă greșită oprește build-ul, nu strică recomandările în tăcere.
- Surse: [Astro: content collections](https://docs.astro.build/core-concepts/collections), [SitePoint: content collections](https://www.sitepoint.com/getting-started-with-content-collections-in-astro).

## 4. Principiu de fond
- Legea lui Hick: timpul de decizie crește cu numărul de opțiuni. De aici limita de 3 elemente în bandă și în recomandări.
- Sursă: [Laws of UX: Hick's law](https://lawsofux.com/hicks-law/).
