# Uz comercial pe planuri gratuite: Netlify, Cloudflare Pages, Cal.com — v0

> Autor: Mike. Data verificării: 2026-11-15. Task: T-003. Completează `stack-tehnic-v0.md` (D-005). Nu e sfat juridic.
> **Legendă:** VERIFICAT = citat dintr-o pagină oficială citită azi. NEVERIFICAT = nu am putut citi sursa sau pagina tace.

## Concluzie scurtă
Niciun text citit azi nu interzice explicit uz comercial pe planurile gratuite Netlify sau Cloudflare, spre deosebire de Vercel Hobby (necomercial, verificat anterior). Dar pentru **Netlify** textul decisiv (acordul de abonare) nu a putut fi citit, deci rămâne **neverificat**. Cal.com Free: embed-ul e documentat, dar nu am găsit o pagină care să-l confirme explicit pe planul Free.

## Netlify Free
| Afirmație | Stare | Sursă |
|---|---|---|
| Free = „$0 forever”, etichetat „Individual”, limită „300 credit limit”; include deploy-uri, domenii proprii cu SSL, funcții, CDN | VERIFICAT | [Netlify pricing](https://www.netlify.com/pricing/) (2026-11-15) |
| Pagina de prețuri nu spune ce se întâmplă când se termină creditele și nu face nicio afirmație despre uz comercial | VERIFICAT (că tace) | idem |
| Termenii site-ului (Terms of Use) nu menționează uz comercial; trimit la „Self-Serve Subscription Agreement” pentru servicii | VERIFICAT | [Netlify Terms of Use](https://www.netlify.com/legal/terms-of-use/) (2026-11-15) |
| Ce spune Self-Serve Subscription Agreement despre uz comercial pe Free | **NEVERIFICAT**: e PDF, textul nu s-a putut extrage | [Self-Serve Agreement](https://www.netlify.com/legal/self-serve-subscription-agreement/) |
| Comportament la epuizarea creditelor (site oprit? deploy blocat?) | **NEVERIFICAT** | caută în [docs.netlify.com](https://docs.netlify.com) |

Etichetarea „Individual” nu e o restricție scrisă, dar merită întrebată.

## Cloudflare Pages Free
| Afirmație | Stare | Sursă |
|---|---|---|
| 500 build-uri pe lună, 1 build simultan, timeout 20 min, maxim 20.000 de fișiere pe Free | VERIFICAT | [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) (2026-11-15) |
| Limită de trafic pentru fișiere statice | NEVERIFICAT: pagina de limite nu o menționează (cererile către Functions se numără la cota Workers) | idem |
| Acordul de abonare nu restricționează expres uz comercial pe servicii gratuite; Secțiunea 2.6: fără răspundere pentru Free Services; 2.2.1(h): interzis să procesezi date de card pe un site pe plan gratuit; se aplică „plan or product limits” de pe site/documentație | VERIFICAT (citat dintr-o extragere automată; recitește textul integral înainte de decizie) | [Cloudflare Terms](https://www.cloudflare.com/terms/) (2026-11-15) |
| Termenii site-ului (website-terms) nu se aplică produselor | VERIFICAT | [Website terms](https://www.cloudflare.com/website-terms/) |

Atenție practică: plățile pentru sesiuni nu trec prin site (rămân la Cal.com/Stripe), deci regula 2.2.1(h) nu ne atinge atâta timp cât site-ul nu colectează carduri.

## Cal.com Free și embed
| Afirmație | Stare | Sursă |
|---|---|---|
| Free = „Everything you could need for scheduling as an individual”, „Unlimited links”; pagina nu listează embed-ul | VERIFICAT (că nu îl listează) | [Cal.com pricing](https://cal.com/pricing) (2026-11-15) |
| Embed documentat în trei forme: inline, buton plutitor, popup la click; generator în editorul Cal.com | VERIFICAT (rezumat din căutare + docs oficiale) | [Cal.com help: embedding](https://cal.com/help/embedding/adding-embed) · [docs embed](https://cal.com/docs/core-features/embed/embed-instructions) |
| Pagina de ajutor despre embed nu menționează nicio restricție de plan | VERIFICAT (că tace) | [adding-embed.md](https://cal.com/help/embedding/adding-embed.md) |
| Embed funcționează efectiv pe contul Free | **NEVERIFICAT**: se testează în 5 minute cu un cont Free și un `<script>` pe o pagină de probă (nu l-am creat: ar cere date ale lui Alex) | – |

## Ce recomand
1. Rămâne **Netlify Free** ca primă variantă și **Cloudflare Pages** ca plan B, dar fără să afirmăm „permis comercial” în documente până nu citim textul integral al celor două acorduri (Netlify în primul rând).
2. Pasul de 10 minute care închide întrebarea: Alex sau un om citește Self-Serve Agreement Netlify (căutare „commercial”) sau scrie suportului Netlify; la fel un test de embed pe Cal.com Free.
3. Dacă Netlify se dovedește restrictiv, Cloudflare Pages are 500 build-uri și nicio restricție comercială găsită azi.

## Surse
[Netlify pricing](https://www.netlify.com/pricing/) · [Netlify Terms of Use](https://www.netlify.com/legal/terms-of-use/) · [Netlify Self-Serve Agreement](https://www.netlify.com/legal/self-serve-subscription-agreement/) · [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [Cloudflare Terms](https://www.cloudflare.com/terms/) · [Cloudflare Website Terms](https://www.cloudflare.com/website-terms/) · [Cal.com pricing](https://cal.com/pricing) · [Cal.com embed help](https://cal.com/help/embedding/adding-embed)
