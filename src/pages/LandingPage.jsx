import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { Toast } from "../components/Toast";
import { Modal } from "../components/Modal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroThree = lazy(() => import("../components/HeroThree"));

// ─── date statice ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "📜", color: "#818cf8", title: "Generator Contracte", desc: "46 tipuri conforme legislației române 2025, generate instant cu AI Claude.", tag: "Popular" },
  { icon: "📧", color: "#6ee7b7", title: "Email-uri Juridice",  desc: "Notificări, somații, corespondenţă profesională pe orice ton, instant.", tag: null },
  { icon: "🔍", color: "#f59e0b", title: "Analiză Riscuri",     desc: "Upload PDF/DOCX și primești un raport complet de riscuri și clauze lipsă.", tag: "Nou" },
  { icon: "📨", color: "#f472b6", title: "Documente HR",        desc: "Decizii concediere, sancțiuni, procuri și plângeri generate în secunde.", tag: null },
  { icon: "📕", color: "#34d399", title: "Export PDF & Word",   desc: "Descarcă orice document în format profesional .pdf sau .docx, cu branding.", tag: null },
  { icon: "🔒", color: "#a78bfa", title: "GDPR & Securitate",   desc: "Date criptate, stocare UE, cookie consent, export & ștergere cont.", tag: null },
];

const STEPS = [
  { n: "01", icon: "🎯", color: "#818cf8", title: "Alege tipul documentului", desc: "Selectează din 46+ tipuri: contracte, emailuri, documente HR, notificări." },
  { n: "02", icon: "📝", color: "#6ee7b7", title: "Completează câteva câmpuri", desc: "Datele părților, valoarea, durata — formularul e simplu, sub 2 minute." },
  { n: "03", icon: "⚡", color: "#f59e0b", title: "AI generează instant",       desc: "Claude Sonnet analizează legislația română în vigoare și redactează formal." },
  { n: "04", icon: "✅", color: "#f472b6", title: "Descarcă și folosește",      desc: "Export PDF sau Word profesional. Gata de semnat sau trimis la avocat." },
];

const COMPARISON = [
  {
    label: "Redactezi singur", color: "#64748b", highlight: false,
    rows: [
      ["⏱️ 2–4 ore per document", false],
      ["⚠️ Greșeli legislative frecvente", false],
      ["📚 Necesită cunoștințe juridice", false],
      ["🚫 Fără analiză de riscuri", false],
      ["💸 0 RON… + risc financiar mare", false],
    ],
  },
  {
    label: "Avocat tradițional", color: "#f59e0b", highlight: false,
    rows: [
      ["✅ Expert juridic uman", true],
      ["❌ 300–1000 RON / document", false],
      ["❌ Timp de așteptare 24–72h", false],
      ["✅ Personalizat pe situația ta", true],
      ["❌ Inaccesibil în afara orelor", false],
    ],
  },
  {
    label: "LexAI Pro", color: "#818cf8", highlight: true,
    rows: [
      ["✅ AI antrenat pe legea română", true],
      ["✅ 0.5–6 credite / document", true],
      ["✅ Sub 30 secunde", true],
      ["✅ Analiză riscuri automată", true],
      ["✅ Disponibil 24/7, oricând", true],
    ],
  },
];

const QUALITY = [
  { icon: "🇷🇴", label: "Legislație română 2025", color: "#818cf8" },
  { icon: "⚡", label: "Sub 30 de secunde",        color: "#6ee7b7" },
  { icon: "🔒", label: "GDPR & date în UE",       color: "#f59e0b" },
  { icon: "📜", label: "46+ tipuri de documente",  color: "#f472b6" },
  { icon: "🎯", label: "98% satisfacție clienți",  color: "#34d399" },
];

const TESTIMONIALS = [
  { name: "Andreea M.", role: "CEO, Agenție Marketing", initials: "AM", text: "\"Am economisit câteva mii de RON în servicii juridice. Contractele sunt impecabile și le revizuiesc rapid înainte de semnat.\"", stars: 5 },
  { name: "Radu C.",    role: "Fondator SaaS B2B",       initials: "RC", text: "\"Analiza de riscuri pe PDF-uri a schimbat felul în care negociez contractele cu partenerii. Știu exact ce să cer.\"", stars: 5 },
  { name: "Mihaela T.", role: "Administrator SRL",       initials: "MT", text: "\"Deciziile HR și notificările le generez în 3 minute. Înainte plăteam un consultant pe oră pentru asta.\"", stars: 5 },
];

const FAQS = [
  { q: "Documentele generate sunt valabile legal?",     a: "Da — AI-ul e antrenat pe legislația română actualizată 2025. Documentele sunt conforme, dar recomandăm validarea cu un avocat pentru situații complexe sau litigii." },
  { q: "Ce se întâmplă când creditele se termină?",     a: "Poți face top-up oricând (10/30/100 credite, fără abonament) sau te abonezi la un plan lunar. Creditele top-up nu expiră niciodată." },
  { q: "Datele mele sunt în siguranță?",               a: "Da — servere ISO 27001 în UE (Germania), criptare end-to-end, politici GDPR integrate. Poți exporta sau șterge contul oricând." },
  { q: "Pot exporta documentele în Word și PDF?",       a: "Da — fiecare document generat poate fi descărcat instant în .docx și .pdf, cu header branded profesional și footer cu număr de pagină." },
  { q: "Funcționează pe telefon?",                     a: "Da — interfața e complet responsivă: telefon, tabletă sau desktop, fără aplicație de instalat." },
  { q: "Există un plan gratuit?",                      a: "Da — la înregistrare primești 10 credite gratuite (suficiente pentru 3 contracte sau 10 emailuri). Nu e nevoie de card." },
];

const STARTER_F = ["60 credite / lună", "Generator contracte (46 tipuri)", "Email-uri juridice", "5 analize PDF / lună", "Documente juridice HR", "Export PDF & Word", "Suport email 48h"];
const PRO_F     = ["200 credite / lună", "Contracte nelimitate", "Email-uri nelimitate", "Analize PDF nelimitate + raport", "Doc. juridice nelimitate", "Clauze AI premium", "Export toate formatele", "Suport prioritar 4h"];

// ─── componenta principală ────────────────────────────────────────────────────
export default function LandingPage({ onEnterApp }) {
  const [modal,    setModal]    = useState(null);
  const [toast,    setToast]    = useState(null);
  const [billing,  setBilling]  = useState("lunar");
  const [statsVis, setStatsVis] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen,  setFaqOpen]  = useState(null);

  const statsRef   = useRef(null);
  const stepsRef   = useRef(null);
  const featRef    = useRef(null);
  const compRef    = useRef(null);
  const testRef    = useRef(null);
  const pricingRef = useRef(null);
  const faqRef     = useRef(null);
  const isMobile   = useIsMobile();

  const c1 = useAnimatedCounter("12400", 1800, statsVis);
  const c2 = useAnimatedCounter("98",    1800, statsVis);
  const c3 = useAnimatedCounter("46",    1800, statsVis);
  const c4 = useAnimatedCounter("30",    1800, statsVis);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // ── GSAP ScrollTrigger ────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const ctx = gsap.context(() => {
      gsap.from(".step-card", {
        scrollTrigger: { trigger: stepsRef.current,   start: "top 82%" },
        y: 55, opacity: 0, duration: 0.75, stagger: 0.13, ease: "power3.out",
      });
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: featRef.current,    start: "top 80%" },
        y: 60, opacity: 0, duration: 0.7, stagger: 0.09, ease: "power3.out",
      });
      gsap.from(".comp-col", {
        scrollTrigger: { trigger: compRef.current,   start: "top 82%" },
        y: 45, opacity: 0, duration: 0.7, stagger: 0.14, ease: "power3.out",
      });
      gsap.from(".test-card", {
        scrollTrigger: { trigger: testRef.current,   start: "top 85%" },
        x: -45, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power2.out",
      });
      gsap.from(".pricing-card", {
        scrollTrigger: { trigger: pricingRef.current, start: "top 80%" },
        scale: 0.9, opacity: 0, duration: 0.65, stagger: 0.15, ease: "back.out(1.4)",
      });
      gsap.from(".faq-item", {
        scrollTrigger: { trigger: faqRef.current,    start: "top 85%" },
        y: 30, opacity: 0, duration: 0.5, stagger: 0.07, ease: "power2.out",
      });
      gsap.from(".stat-pill", {
        scrollTrigger: { trigger: statsRef.current,  start: "top 88%" },
        y: 25, opacity: 0, duration: 0.55, stagger: 0.1, ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, [isMobile]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const mult = billing === "anual" ? 0.8 : 1;

  // ── helpers de stil ───────────────────────────────────────────────────────
  const SEC = (bg) => ({
    padding: isMobile ? "60px 20px" : "96px 6%",
    position: "relative", zIndex: 1,
    background: bg || "transparent",
    overflow: "hidden",
  });

  const H2 = {
    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
    fontSize: isMobile ? 27 : "clamp(30px,3.6vw,50px)",
    color: "#e2e8f0", margin: "0 0 16px", lineHeight: 1.12,
  };

  const GRAD_TXT = {
    background: "linear-gradient(135deg,#818cf8 30%,#6ee7b7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  };

  const BADGE = (c = "#818cf8") => ({
    display: "inline-block",
    background: c + "18", border: `1px solid ${c}35`,
    borderRadius: 100, padding: "5px 14px",
    color: c, fontSize: 11, fontWeight: 700,
    fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.5px",
    textTransform: "uppercase", marginBottom: 18,
  });

  const CARD_BASE = {
    background: "linear-gradient(145deg,#0f1829,#080f1e)",
    border: "1px solid #1e293b",
    borderRadius: 16,
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#070d1a", minHeight: "100vh", fontFamily: "'Inter',sans-serif", color: "#e2e8f0", overflowX: "hidden", position: "relative" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <Modal type={modal} onClose={() => setModal(null)} />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 18px" : "0 6%",
        background: "rgba(7,13,26,.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 19 }}>
            Lex<span style={GRAD_TXT}>AI</span> Pro
          </span>
        </div>

        {!isMobile ? (
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            {[["Funcții","features"],["Cum funcționează","steps"],["Prețuri","pricing"],["Contact",null]].map(([lbl,id]) => (
              <button key={lbl} onClick={() => id ? scrollTo(id) : setModal("contact")}
                style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:14,fontFamily:"'Inter',sans-serif",transition:"color .15s",padding:0 }}
                onMouseEnter={e=>e.target.style.color="#e2e8f0"} onMouseLeave={e=>e.target.style.color="#94a3b8"}>
                {lbl}
              </button>
            ))}
            <button onClick={onEnterApp} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:"9px 22px",color:"#070d1a",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>
              Intră în App →
            </button>
          </div>
        ) : (
          <button onClick={() => setMenuOpen(o => !o)} style={{ background:"none",border:"none",color:"#94a3b8",fontSize:24,cursor:"pointer" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ position:"fixed",top:64,left:0,right:0,bottom:0,zIndex:190,background:"#070d1a",padding:"28px 24px",display:"flex",flexDirection:"column",gap:4 }}>
          {[["Funcții","features"],["Cum funcționează","steps"],["Prețuri","pricing"],["Contact",null]].map(([lbl,id]) => (
            <button key={lbl} onClick={() => id ? scrollTo(id) : (setModal("contact"),setMenuOpen(false))}
              style={{ background:"none",border:"none",borderBottom:"1px solid #1e293b",color:"#e2e8f0",fontSize:18,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,cursor:"pointer",textAlign:"left",padding:"16px 0" }}>
              {lbl}
            </button>
          ))}
          <button onClick={() => { setMenuOpen(false); onEnterApp(); }}
            style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:12,padding:16,color:"#070d1a",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer",marginTop:16 }}>
            🚀 Intră în App →
          </button>
        </div>
      )}

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding: isMobile ? "110px 20px 80px" : "120px 6% 100px", position:"relative", overflow:"hidden" }}>
        {!isMobile && (
          <Suspense fallback={null}>
            <HeroThree />
          </Suspense>
        )}

        {/* Gradient radial overlay */}
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 90% 70% at 50% 50%,rgba(7,13,26,0) 0%,#070d1a 78%)",zIndex:1,pointerEvents:"none" }} />

        {/* Blob decorative stânga + dreapta */}
        <div style={{ position:"absolute",top:"20%",left:"-10%",width:500,height:500,background:"radial-gradient(circle,#818cf810 0%,transparent 70%)",pointerEvents:"none",zIndex:1 }} />
        <div style={{ position:"absolute",bottom:"10%",right:"-8%",width:400,height:400,background:"radial-gradient(circle,#6ee7b710 0%,transparent 70%)",pointerEvents:"none",zIndex:1 }} />

        <div style={{ position:"relative",zIndex:2, maxWidth: 920 }}>
          {/* Live badge */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#818cf812",border:"1px solid #818cf828",borderRadius:100,padding:"7px 18px",marginBottom:30,animation:"fadeUp .5s ease both" }}>
            <span style={{ width:7,height:7,background:"#10b981",borderRadius:"50%",animation:"pulse 2s infinite",display:"inline-block",flexShrink:0 }} />
            <span style={{ color:"#818cf8",fontSize:12,fontWeight:600 }}>AI antrenat pe legislația română · 46 tipuri de documente</span>
          </div>

          <h1 style={{ fontSize: isMobile ? 36 : "clamp(48px,6.5vw,86px)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, letterSpacing:"-2.5px", lineHeight:1.05, margin:"0 0 24px", animation:"fadeUp .7s ease .1s both" }}>
            Documente juridice<br />
            <span style={GRAD_TXT}>profesionale</span><br />
            în 30 de secunde
          </h1>

          <p style={{ color:"#94a3b8", fontSize: isMobile ? 15 : 18, maxWidth:540, margin:"0 auto 38px", lineHeight:1.75, animation:"fadeUp .7s ease .2s both" }}>
            Contracte, emailuri, somații și analize de riscuri — generate cu AI antrenat pe Codul Civil și legile române în vigoare, fără servicii juridice scumpe.
          </p>

          <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", gap:12, justifyContent:"center", animation:"fadeUp .7s ease .3s both" }}>
            <button onClick={onEnterApp} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:12,padding: isMobile ? "15px 28px" : "16px 36px",color:"#070d1a",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:"0 0 40px #818cf828" }}>
              🚀 Începe Gratuit — 10 credite
            </button>
            <button onClick={() => scrollTo("steps")} style={{ background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding: isMobile ? "15px 28px" : "16px 36px",color:"#e2e8f0",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer" }}>
              Cum funcționează →
            </button>
          </div>

          {/* Trust pills */}
          <div style={{ marginTop:40, display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", animation:"fadeUp .7s ease .45s both" }}>
            {["🔒 Date UE · GDPR", "⚡ Sub 30s", "📕 Export PDF & Word", "✅ Legislație 2025", "🇷🇴 Made in România"].map(p => (
              <span key={p} style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:100,padding:"6px 14px",fontSize:12,color:"#64748b",whiteSpace:"nowrap" }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────── */}
      <section ref={statsRef} style={{ ...SEC("#0a1220"), padding: isMobile ? "44px 20px" : "56px 6%", borderTop:"1px solid #1e293b", borderBottom:"1px solid #1e293b" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 1 : 0 }}>
          {[
            { v:c1, suf:"+",  lbl:"Documente generate" },
            { v:c2, suf:"%",  lbl:"Satisfacție clienți" },
            { v:c3, suf:"+",  lbl:"Tipuri de contracte" },
            { v:c4, suf:"s",  lbl:"Timp mediu generare", pre:"< " },
          ].map(({ v, suf, lbl, pre }, i) => (
            <div key={lbl} className="stat-pill" style={{ textAlign:"center", padding: isMobile ? "20px 12px" : "10px 24px", borderRight: !isMobile && i<3 ? "1px solid #1e293b" : "none", borderBottom: isMobile && i<2 ? "1px solid #1e293b" : "none" }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize: isMobile ? 36 : 52, lineHeight:1, ...GRAD_TXT }}>
                {pre||""}{typeof v === "number" ? v.toLocaleString("ro-RO") : v}{suf}
              </div>
              <div style={{ color:"#475569", fontSize:13, marginTop:8 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUM FUNCȚIONEAZĂ ───────────────────────────────────────────── */}
      <section id="steps" ref={stepsRef} style={SEC()}>
        {/* blob decorativ */}
        <div style={{ position:"absolute",top:"-10%",right:"5%",width:350,height:350,background:"radial-gradient(circle,#818cf808 0%,transparent 70%)",pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: isMobile ? 36 : 56 }}>
            <span style={BADGE()}>⚡ Simplu și rapid</span>
            <h2 style={H2}>Patru pași până la<br /><span style={GRAD_TXT}>documentul tău juridic</span></h2>
            <p style={{ color:"#475569", fontSize:15, maxWidth:440, margin:"0 auto" }}>Nicio cunoștință juridică necesară.</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap:16, position:"relative" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="step-card" style={{ ...CARD_BASE, padding: isMobile ? 22 : 28, position:"relative", overflow:"hidden", transition:"border-color .2s, transform .2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=s.color+"50"; e.currentTarget.style.transform="translateY(-4px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.transform="translateY(0)"; }}>
                {/* top color bar */}
                <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${s.color},${s.color}00)` }} />
                {/* number watermark */}
                <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:58,lineHeight:1,color:s.color+"14",position:"absolute",top:10,right:14,userSelect:"none" }}>{s.n}</div>
                <div style={{ fontSize:30, marginBottom:14 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,color:"#e2e8f0",margin:"0 0 10px",lineHeight:1.3 }}>{s.title}</h3>
                <p style={{ color:"#475569",fontSize:13,lineHeight:1.65,margin:0 }}>{s.desc}</p>
                {!isMobile && i < STEPS.length-1 && (
                  <div style={{ position:"absolute",right:-10,top:"50%",transform:"translateY(-50%)",color:"#334155",fontSize:20,zIndex:2,fontWeight:300 }}>›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section id="features" ref={featRef} style={SEC("#050c16")}>
        <div style={{ position:"absolute",bottom:"5%",left:"3%",width:300,height:300,background:"radial-gradient(circle,#6ee7b708 0%,transparent 70%)",pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: isMobile ? 36 : 52 }}>
            <span style={BADGE("#6ee7b7")}>🛠️ Funcționalități</span>
            <h2 style={H2}>Tot ce ai nevoie<br /><span style={GRAD_TXT}>într-un singur loc</span></h2>
            <p style={{ color:"#475569",fontSize:15,maxWidth:440,margin:"0 auto" }}>Instrumente AI specializate pe legislația română în vigoare.</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:18 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card" style={{ ...CARD_BASE, padding: isMobile ? 22 : 28, position:"relative", overflow:"hidden", transition:"border-color .2s, transform .2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=f.color+"55"; e.currentTarget.style.transform="translateY(-4px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.transform="translateY(0)"; }}>
                {/* radial glow */}
                <div style={{ position:"absolute",top:-30,right:-30,width:120,height:120,background:`radial-gradient(circle,${f.color}12 0%,transparent 70%)`,pointerEvents:"none" }} />
                {/* tag */}
                {f.tag && (
                  <div style={{ position:"absolute",top:16,right:16,background:f.color+"18",color:f.color,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:100,border:`1px solid ${f.color}35`,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"0.5px",textTransform:"uppercase" }}>{f.tag}</div>
                )}
                <div style={{ width:48,height:48,background:f.color+"18",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18,border:`1px solid ${f.color}25` }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,color:"#e2e8f0",margin:"0 0 10px" }}>{f.title}</h3>
                <p style={{ color:"#475569",fontSize:13,lineHeight:1.65,margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARAȚIE ─────────────────────────────────────────────────── */}
      <section ref={compRef} style={SEC()}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: isMobile ? 36 : 52 }}>
            <span style={BADGE("#f59e0b")}>⚖️ Comparație</span>
            <h2 style={H2}>De ce <span style={GRAD_TXT}>LexAI Pro</span>?</h2>
            <p style={{ color:"#475569",fontSize:15,maxWidth:400,margin:"0 auto" }}>Compară costul, viteza și calitatea față de alternativele tradiționale.</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1.15fr", gap:16 }}>
            {COMPARISON.map(col => (
              <div key={col.label} className="comp-col" style={{
                background: col.highlight ? "linear-gradient(165deg,#161f38,#0d1527)" : "#0a1220",
                border: `${col.highlight ? 2 : 1}px solid ${col.highlight ? "#818cf840" : "#1e293b"}`,
                borderRadius:16, padding: isMobile ? 22 : 28, position:"relative", overflow:"hidden",
              }}>
                {col.highlight && <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#818cf8,#6ee7b7)" }} />}
                {col.highlight && <div style={{ position:"absolute",top:14,right:14,background:"linear-gradient(135deg,#818cf8,#6ee7b7)",color:"#070d1a",fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:100,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"0.5px",textTransform:"uppercase" }}>Recomandat</div>}
                <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:16,color:col.color,marginBottom:20 }}>{col.label}</div>
                <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
                  {col.rows.map(([txt, ok]) => (
                    <div key={txt} style={{ fontSize:13,color: ok ? "#94a3b8" : "#374151",display:"flex",gap:6,alignItems:"flex-start",lineHeight:1.45 }}>{txt}</div>
                  ))}
                </div>
                {col.highlight && (
                  <button onClick={onEnterApp} style={{ marginTop:24,width:"100%",background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:"12px 0",color:"#070d1a",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>
                    Încearcă gratuit →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALITATE ───────────────────────────────────────────────────── */}
      <section style={{ ...SEC("#050c16"), textAlign:"center" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <span style={BADGE("#a78bfa")}>🏆 Calitate</span>
          <h2 style={{ ...H2, textAlign:"center", marginBottom:44 }}>Cei 5 piloni ai<br /><span style={GRAD_TXT}>platformei LexAI Pro</span></h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center" }}>
            {QUALITY.map((q, i) => (
              <div key={q.label} style={{ background:`${q.color}12`,border:`1px solid ${q.color}30`,borderRadius:100,padding: isMobile ? "13px 20px" : "15px 26px",display:"flex",alignItems:"center",gap:10,animation:`fadeUp .6s ease ${i*0.1}s both` }}>
                <span style={{ fontSize:20 }}>{q.icon}</span>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:q.color }}>{q.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALE ───────────────────────────────────────────────── */}
      <section ref={testRef} style={SEC()}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: isMobile ? 36 : 48 }}>
            <span style={BADGE("#f472b6")}>⭐ Testimoniale</span>
            <h2 style={H2}>Ce spun antreprenorii<br /><span style={GRAD_TXT}>care folosesc LexAI Pro</span></h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:18 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="test-card" style={{ ...CARD_BASE, padding: isMobile ? 22 : 26 }}>
                <div style={{ color:"#f59e0b",fontSize:16,marginBottom:14,letterSpacing:2 }}>{"★".repeat(t.stars)}</div>
                <p style={{ color:"#94a3b8",fontSize:14,lineHeight:1.75,margin:"0 0 22px",fontStyle:"italic" }}>{t.text}</p>
                <div style={{ display:"flex",alignItems:"center",gap:12, borderTop:"1px solid #1e293b", paddingTop:18 }}>
                  <div style={{ width:38,height:38,background:"linear-gradient(135deg,#818cf8,#6ee7b7)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,color:"#070d1a",flexShrink:0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"#e2e8f0" }}>{t.name}</div>
                    <div style={{ color:"#475569",fontSize:12 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={SEC("#050c16")}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: isMobile ? 32 : 44 }}>
            <span style={BADGE("#fbbf24")}>💳 Prețuri</span>
            <h2 style={H2}>Transparent.<br /><span style={GRAD_TXT}>Fără surprize.</span></h2>
            {/* Billing toggle */}
            <div style={{ display:"inline-flex",background:"#0f172a",border:"1px solid #1e293b",borderRadius:100,padding:"4px 5px",gap:2,marginTop:20 }}>
              {[["lunar","Lunar"],["anual","Anual −20%"]].map(([v,lbl]) => (
                <button key={v} onClick={() => setBilling(v)} style={{ background: billing===v ? "linear-gradient(135deg,#818cf8,#6ee7b7)" : "none",border:"none",borderRadius:100,padding:"8px 22px",color: billing===v ? "#070d1a" : "#64748b",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s" }}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap:18 }}>
            {/* Trial */}
            <div className="pricing-card" style={{ ...CARD_BASE, padding: isMobile ? 24 : 30 }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:18,color:"#6ee7b7",marginBottom:6 }}>Trial Gratuit</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:42,color:"#e2e8f0",lineHeight:1,marginBottom:4 }}>0 <span style={{ fontSize:15,color:"#475569",fontWeight:400 }}>RON</span></div>
              <div style={{ color:"#475569",fontSize:13,marginBottom:22 }}>10 credite la înregistrare</div>
              <div style={{ display:"flex",flexDirection:"column",gap:9,marginBottom:26 }}>
                {["10 credite gratuite (fără card)","Generator contracte","Email-uri juridice","1 analiză PDF","Export PDF & Word"].map(f => (
                  <div key={f} style={{ display:"flex",gap:8,alignItems:"flex-start",fontSize:13,color:"#94a3b8" }}>
                    <span style={{ color:"#6ee7b7",flexShrink:0,marginTop:1,fontWeight:700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={onEnterApp} style={{ width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"13px 0",color:"#6ee7b7",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>
                Încearcă Gratuit
              </button>
            </div>

            {/* Starter */}
            <div className="pricing-card" style={{ ...CARD_BASE, border:"1px solid #6ee7b730", padding: isMobile ? 24 : 30 }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:18,color:"#6ee7b7",marginBottom:6 }}>Starter</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:42,color:"#e2e8f0",lineHeight:1,marginBottom:4 }}>
                {Math.round(49*mult)} <span style={{ fontSize:15,color:"#475569",fontWeight:400 }}>RON/lună</span>
              </div>
              <div style={{ color:"#475569",fontSize:13,marginBottom:22 }}>60 credite / lună</div>
              <div style={{ display:"flex",flexDirection:"column",gap:9,marginBottom:26 }}>
                {STARTER_F.map(f => (
                  <div key={f} style={{ display:"flex",gap:8,alignItems:"flex-start",fontSize:13,color:"#94a3b8" }}>
                    <span style={{ color:"#6ee7b7",flexShrink:0,marginTop:1,fontWeight:700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={onEnterApp} style={{ width:"100%",background:"#1e293b",border:"1px solid #6ee7b740",borderRadius:10,padding:"13px 0",color:"#6ee7b7",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>
                Alege Starter
              </button>
            </div>

            {/* Pro */}
            <div className="pricing-card" style={{ background:"linear-gradient(165deg,#161f38,#0d1527)",border:"2px solid #818cf840",borderRadius:16,padding: isMobile ? 24 : 30,position:"relative",overflow:"hidden",boxShadow:"0 0 60px #818cf812" }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#818cf8,#6ee7b7)" }} />
              <div style={{ position:"absolute",top:14,right:14,background:"linear-gradient(135deg,#818cf8,#6ee7b7)",color:"#070d1a",fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:100,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"0.5px",textTransform:"uppercase" }}>Popular</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:18,color:"#818cf8",marginBottom:6 }}>Pro Business</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:42,color:"#e2e8f0",lineHeight:1,marginBottom:4 }}>
                {Math.round(149*mult)} <span style={{ fontSize:15,color:"#475569",fontWeight:400 }}>RON/lună</span>
              </div>
              <div style={{ color:"#475569",fontSize:13,marginBottom:22 }}>200 credite / lună</div>
              <div style={{ display:"flex",flexDirection:"column",gap:9,marginBottom:26 }}>
                {PRO_F.map(f => (
                  <div key={f} style={{ display:"flex",gap:8,alignItems:"flex-start",fontSize:13,color:"#94a3b8" }}>
                    <span style={{ color:"#818cf8",flexShrink:0,marginTop:1,fontWeight:700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={onEnterApp} style={{ width:"100%",background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:"14px 0",color:"#070d1a",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>
                Alege Pro Business →
              </button>
            </div>
          </div>

          <p style={{ textAlign:"center",color:"#334155",fontSize:13,marginTop:22 }}>
            ✓ Fără card de credit la trial · ✓ Anulezi oricând · ✓ Facturare în RON + TVA<br />
            <span style={{ color:"#2d3748" }}>Preferi top-up? 10 cr = 9 RON · 30 cr = 24 RON · 100 cr = 69 RON — nu expiră.</span>
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section ref={faqRef} style={SEC()}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: isMobile ? 36 : 48 }}>
            <span style={BADGE("#f472b6")}>❓ FAQ</span>
            <h2 style={H2}>Întrebări frecvente</h2>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {FAQS.map((item, i) => (
              <div key={i} className="faq-item" style={{ ...CARD_BASE, overflow:"hidden", border:`1px solid ${faqOpen===i ? "#818cf840" : "#1e293b"}`, transition:"border-color .2s" }}>
                <button onClick={() => setFaqOpen(faqOpen===i ? null : i)} style={{ width:"100%",background:"none",border:"none",padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",textAlign:"left",gap:16 }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"#e2e8f0",lineHeight:1.4 }}>{item.q}</span>
                  <span style={{ color:"#818cf8",fontSize:22,fontWeight:200,flexShrink:0,display:"inline-block",transform: faqOpen===i ? "rotate(45deg)" : "rotate(0deg)",transition:"transform .25s" }}>+</span>
                </button>
                {faqOpen===i && (
                  <div style={{ padding:"0 22px 20px",color:"#64748b",fontSize:14,lineHeight:1.75 }}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
      <section style={{ ...SEC("#050c16"), textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ background:"linear-gradient(165deg,#0f1829,#080f1e)",border:"1px solid #818cf828",borderRadius:22,padding: isMobile ? "44px 24px" : "64px 52px",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"70%",height:1,background:"linear-gradient(90deg,transparent,#818cf8,transparent)" }} />
            <div style={{ position:"absolute",bottom:"-20%",right:"-10%",width:300,height:300,background:"radial-gradient(circle,#818cf810 0%,transparent 70%)",pointerEvents:"none" }} />
            <div style={{ fontSize:44,marginBottom:20 }}>⚖️</div>
            <h2 style={{ ...H2, marginBottom:16, textAlign:"center" }}>
              Gata să economisești<br /><span style={GRAD_TXT}>mii de RON în servicii juridice?</span>
            </h2>
            <p style={{ color:"#475569",fontSize:16,lineHeight:1.75,marginBottom:32,maxWidth:480,margin:"0 auto 32px" }}>
              Alătură-te antreprenorilor care generează documente juridice profesionale cu AI, în loc de consulturi costisitoare.
            </p>
            <button onClick={onEnterApp} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:12,padding:"16px 40px",color:"#070d1a",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:"0 0 50px #818cf830",display:"inline-flex",alignItems:"center",gap:10 }}>
              🚀 Încearcă gratuit — 10 credite
            </button>
            <p style={{ color:"#2d3748",fontSize:12,marginTop:18 }}>Nu necesită card · GDPR compliant · Anulezi oricând</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ background:"#040a14",borderTop:"1px solid #1e293b",padding: isMobile ? "52px 20px 32px" : "68px 6% 36px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 32 : 48, marginBottom:48 }}>
            <div style={{ gridColumn: isMobile ? "1/-1" : "auto" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
                <span style={{ fontSize:22 }}>⚖️</span>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:19 }}>
                  Lex<span style={GRAD_TXT}>AI</span> Pro
                </span>
              </div>
              <p style={{ color:"#334155",fontSize:13,lineHeight:1.75,maxWidth:280,margin:"0 0 20px" }}>Asistentul juridic AI pentru antreprenorii români — contracte, documente și analize în secunde.</p>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {["🔒 GDPR","🇷🇴 Made in RO","⚡ AI-Powered"].map(b => (
                  <span key={b} style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:100,padding:"5px 12px",fontSize:11,color:"#334155",whiteSpace:"nowrap" }}>{b}</span>
                ))}
              </div>
            </div>
            {[
              { title:"Produs", links:[["Funcționalități",()=>scrollTo("features")],["Cum funcționează",()=>scrollTo("steps")],["Prețuri",()=>scrollTo("pricing")]] },
              { title:"Legal",  links:[["Termeni și Condiții",()=>setModal("terms")],["GDPR & Confidențialitate",()=>setModal("gdpr")],["Politica Cookies",()=>setModal("cookies")]] },
              { title:"Suport", links:[["Contact",()=>setModal("contact")],["contact@lexaipro.ro",null]] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:10,color:"#334155",textTransform:"uppercase",letterSpacing:"1px",marginBottom:18 }}>{col.title}</div>
                {col.links.map(([lbl, fn]) => fn ? (
                  <button key={lbl} onClick={fn} style={{ display:"block",background:"none",border:"none",color:"#334155",fontSize:13,marginBottom:11,cursor:"pointer",transition:"color .15s",lineHeight:1.5,padding:0,textAlign:"left",fontFamily:"'Inter',sans-serif" }}
                    onMouseEnter={e=>{ e.currentTarget.style.color="#64748b"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.color="#334155"; }}>
                    {lbl}
                  </button>
                ) : (
                  <div key={lbl} style={{ color:"#334155",fontSize:13,marginBottom:11,lineHeight:1.5 }}>{lbl}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid #1e293b",paddingTop:24,display:"flex",flexDirection: isMobile ? "column" : "row",justifyContent:"space-between",gap:12,alignItems: isMobile ? "flex-start" : "center" }}>
            <span style={{ color:"#1e293b",fontSize:12 }}>© 2025 LexAI Pro SRL · Toate drepturile rezervate.</span>
            <span style={{ background:"#0a1220",border:"1px solid #f59e0b20",borderRadius:8,padding:"7px 14px",fontSize:11,color:"#374151" }}>⚠️ Conținut informativ — consultați un avocat autorizat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
