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

### 💳 Faza 3 — Monetizare (credite + Revolut)
- [ ] Schema credite: planuri, abonamente, tranzacții, solduri
- [ ] Integrare Revolut Merchant API (checkout + webhooks)
- [ ] Logică abonament recurent + top-up one-time
- [ ] Enforcement credite pe fiecare acțiune AI (server-side)
- [ ] Rebalansare prețuri/planuri

### 📄 Faza 4 — Documente & export
- [ ] Export **Word (.docx)** și **PDF** profesional
- [ ] Tipuri noi de documente (notificări, somații, decizii, procuri etc.)
- [ ] Template-uri salvabile / reutilizabile

### 🎨 Faza 5 — Landing premium
- [ ] Redesign landing
- [ ] Animații **Three.js** (hero) + **GSAP** (scroll/secțiuni)
- [ ] SEO + performanță

### 🚀 Faza 6 — Pregătire producție
- [ ] Rate limiting + abuse protection
- [ ] Monitorizare erori (Sentry) + analytics
- [ ] GDPR real, ToS, facturare
- [ ] Teste E2E pe fluxurile critice

---

*Actualizat: 2026-06-18*
