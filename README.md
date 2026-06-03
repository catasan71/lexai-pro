# ⚖️ LexAI Pro — Asistent Juridic AI

Platformă AI pentru antreprenori români: generează contracte, analizează riscuri și redactează email-uri profesionale.

---

## 🚀 Deploy pe Vercel (Recomandat)

### Pasul 1 — Pregătire locală

```bash
# Clonează / descarcă proiectul
cd lexai-pro

# Instalează dependențele
npm install
```

### Pasul 2 — Configurare API Key

1. Mergi pe [console.anthropic.com](https://console.anthropic.com/) și obține un API Key
2. Copiază `.env.example` → `.env.local`
3. Adaugă key-ul tău:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Pasul 3 — Test local

```bash
# Instalează Vercel CLI
npm install -g vercel

# Rulează local cu serverless functions
vercel dev
```

Deschide `http://localhost:3000`

### Pasul 4 — Deploy pe Vercel

```bash
# Prima oară — conectează la Vercel
vercel

# Deploy producție
vercel --prod
```

**SAU prin GitHub (recomandat):**

1. Creează repo pe GitHub și fă push:
```bash
git init
git add .
git commit -m "Initial commit — LexAI Pro"
git branch -M main
git remote add origin https://github.com/USERNAME/lexai-pro.git
git push -u origin main
```

2. Mergi pe [vercel.com](https://vercel.com) → **New Project** → Import din GitHub
3. La **Environment Variables** adaugă:
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
4. Click **Deploy** ✅

---

## 🌐 Deploy pe Netlify (alternativă)

```bash
npm run build
```

Trage folderul `dist/` pe [netlify.com/drop](https://app.netlify.com/drop)

⚠️ **Netlify nu suportă serverless functions Node.js simplu** — vei avea nevoie de Netlify Functions. Recomandat Vercel pentru acest proiect.

---

## 💻 Development Local (fără Vercel CLI)

```bash
npm run dev
```

> ⚠️ În modul `vite dev` pur, API calls-urile merg direct la Anthropic.
> Creează `.env.local` cu `VITE_ANTHROPIC_API_KEY=sk-ant-...`
> și modifică `callClaude()` să folosească `import.meta.env.VITE_ANTHROPIC_API_KEY`

---

## 📁 Structura Proiectului

```
lexai-pro/
├── api/
│   └── claude.js          # Proxy securizat Anthropic API (Vercel Function)
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx             # Aplicația completă (Landing + Dashboard)
│   └── main.jsx            # Entry point React
├── index.html
├── package.json
├── vite.config.js
├── vercel.json             # Configurare Vercel
├── .env.example            # Template variabile de mediu
├── .gitignore
└── README.md
```

---

## ⚙️ Variabile de Mediu

| Variabilă | Descriere | Obligatorie |
|-----------|-----------|-------------|
| `ANTHROPIC_API_KEY` | API Key Anthropic | ✅ Da |

---

## 🔒 Securitate

- API Key-ul **nu este expus** în frontend
- Toate request-urile trec prin `/api/claude` (serverless proxy)
- CORS configurat pentru domeniul tău

---

## 📝 Licență

© 2025 LexAI Pro SRL. Toate drepturile rezervate.

> ⚠️ Aplicația oferă asistență informativă. Pentru decizii juridice importante, consultați un avocat autorizat.
