# 🗺️ LexAI Pro — Roadmap de Dezvoltare

Plan de transformare din prototip single-file într-un SaaS complet, pregătit pentru clienți reali.

## Decizii de arhitectură

| Domeniu | Alegere |
|---------|---------|
| Backend / Auth / DB / Storage | **Supabase** (Postgres + Auth + Storage + RLS) |
| Plăți | **Revolut Merchant API** (one-time top-up + recurent gestionat în Supabase) |
| Monetizare | **Sistem de credite** (acțiuni ieftine = puține credite, analiză = multe) |
| Hosting | Vercel (proxy serverless `api/claude.js`) |
| Frontend | React 18 + Vite + **TypeScript** |

---

## Fazele

### ✅ Faza 0 — Baseline (gata)
- Dependențe instalate, build verificat (205 KB).

### ✅ Faza 1 — Fundație tehnică (gata)
- [x] Setup TypeScript (migrare incrementală, `allowJs`) + Prettier
- [x] Setup Vitest + Testing Library + primele teste (10 ✓)
- [x] Client API centralizat (`src/lib/claude.ts`) + config modele (`src/lib/models.ts`) cu modele AI noi
- [x] **Optimizare cost analiză:** extragere PDF client-side cu `pdf.js`, lazy-loaded (elimină apelul Claude scump)
- [x] Date extrase în module (`src/data/`), design tokens create (`src/styles/theme.ts`)
- [x] Split `App.jsx` (800 linii) în structură: `hooks/ components/ pages/ modules/ styles/`
- [ ] Rest de migrare TS: 3 module + LandingPage (`.jsx` → `.tsx`) — incremental
- [ ] ESLint (flat config) — amânat
- [ ] Aplicare design tokens în toate componentele — incremental

### ✅ Faza 2 — Conturi & persistență (gata)
- [x] Auth Supabase (email/parolă + OAuth Google) — `AuthProvider` + `AuthModal`
- [x] Schema DB live: profiles, documents, usage_log + RLS + `consume_credits()`
- [x] Istoric: salvare automată contracte/emailuri/analize per utilizator
- [x] Dashboard: credite afișate, deconectare, tab „Istoric"
- [ ] Pagină „Cont" dedicată (profil editabil, statistici consum) — opțional, ulterior

### ✅ Faza 3 — Monetizare (credite + Revolut) (gata)
- [x] Enforcement credite server-side (`consume_credits()` în proxy, 402 la sold 0)
- [x] Credite actualizate instant în UI după fiecare apel AI (fără round-trip DB)
- [x] Schema DB plăți: `plans`, `subscriptions`, `transactions`, `complete_payment()`
- [x] Revolut Merchant API: `api/revolut/checkout.js` + `api/revolut/webhook.js`
- [x] `PlansModule.tsx`: UI top-up credite + abonamente Starter/Pro
- [x] Header Dashboard: badge credite clickabil → Planuri; alertă + buton Top-up la < 5 credite
- [ ] Configurare Revolut (necesită cont Merchant activ): `REVOLUT_API_KEY`, `REVOLUT_WEBHOOK_SECRET`

### ✅ Faza 4 — Documente & export (gata)
- [x] Export **Word (.docx)** — librăria `docx`, lazy-loaded, heading detection, branding LexAI Pro
- [x] Export **PDF profesional** — `jsPDF`, lazy-loaded, header branded, footer cu număr pagină
- [x] Export raport analiză PDF — structurat pe secțiuni (riscuri, clauze lipsă, recomandări, scor)
- [x] Butoane Word + PDF în ContractModule; buton PDF în AnalysisModule
- [x] **6 tipuri noi de documente** (`NoticeModule`): Notificare, Somație Plată, Decizie Concediere, Decizie Disciplinară, Procură, Plângere/Contestație
- [x] Export Word + PDF disponibil și în NoticeModule
- [ ] Template-uri salvabile / reutilizabile — opțional, ulterior

### ✅ Faza 5 — Landing premium (gata)
- [x] **Three.js hero** 3D: torus knot + icosaedre wireframe + nor de particule + paralaxă mouse (lazy-loaded)
- [x] **GSAP ScrollTrigger**: feature cards, steps, pricing, testimoniale — stagger reveal la scroll
- [x] Secțiuni noi: „Cum funcționează" (3 pași), Testimoniale, CTA final
- [x] Feature cards cu hover lift + badge-uri contextuale (Popular, Nou)
- [x] Toggle lunar/anual prețuri; Starter cu 60 credite / Pro cu 200 credite
- [x] **SEO complet**: meta description, OG, Twitter Card, JSON-LD structured data, canonical
- [x] Footer extins: badges GDPR/Made in RO/AI-Powered, hover pe linkuri

### ✅ Faza 6 — Pregătire producție (gata)
- [x] **Rate limiting**: `check_rate_limit()` Postgres (fereastră fixă, atomic) — `api/claude.js` (20/min/user), `api/revolut/checkout.js` (10/min/user), `api/account/export.js` (5/min/user); fail-open la erori de infra
- [x] **Hardening webhook Revolut**: fix `crypto.timingSafeEqual` (lungimi diferite → crash) înainte de verificarea semnăturii
- [x] **Monitorizare erori (Sentry)**: opt-in via `VITE_SENTRY_DSN` (frontend, `@sentry/react`) și `SENTRY_DSN` (serverless, raportare directă prin Envelope API, fără SDK greu)
- [x] **Analytics**: `@vercel/analytics` (zero-config pe Vercel)
- [x] **GDPR real**: endpoint export date (`api/account/export.js`, JSON descărcabil) + ștergere cont ireversibilă (`api/account/delete.js`, cascadă pe toate tabelele) + UI `ContModule.tsx` (tab „Cont" în Dashboard)
- [x] **Cookie consent banner**: `CookieConsent.tsx`, alegere persistată local, link spre politica de cookies
- [x] **Teste E2E** (Playwright): landing (hero, CTA), cookie consent, modal GDPR, secțiune pricing, flux intrare în app → modal autentificare

---

*Actualizat: 2026-06-23*
