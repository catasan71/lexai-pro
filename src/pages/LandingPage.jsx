import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { Toast } from "../components/Toast";
import { Modal } from "../components/Modal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Three.js hero — chunk separat, nu blochează First Paint
const HeroThree = lazy(() => import("../components/HeroThree"));

export default function LandingPage({ onEnterApp }) {
  const [modal, setModal]       = useState(null);
  const [toast, setToast]       = useState(null);
  const [billing, setBilling]   = useState("lunar");
  const [statsVis, setStatsVis] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const statsRef    = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef    = useRef(null);
  const pricingRef  = useRef(null);
  const testRef     = useRef(null);
  const isMobile    = useIsMobile();

  // Animated counters (se declanșează la scroll)
  const c1 = useAnimatedCounter("12400", 1800, statsVis);
  const c2 = useAnimatedCounter("98",    1800, statsVis);
  const c3 = useAnimatedCounter("46",    1800, statsVis);
  const c4 = useAnimatedCounter("30",    1800, statsVis);

  // IntersectionObserver pentru stats counter
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // GSAP ScrollTrigger — animații la scroll
  useEffect(() => {
    if (isMobile) return; // Skip pe mobile pentru perf

    const ctx = gsap.context(() => {
      // Feature cards — stagger slide-up
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
        y: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
      });

      // Steps — slide din stânga / dreapta alternant
      gsap.from(".step-card", {
        scrollTrigger: { trigger: stepsRef.current, start: "top 80%" },
        x: (i) => (i % 2 === 0 ? -60 : 60), opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
      });

      // Pricing cards — scale + fade
      gsap.from(".pricing-card", {
        scrollTrigger: { trigger: pricingRef.current, start: "top 80%" },
        scale: 0.9, opacity: 0, duration: 0.7, stagger: 0.15, ease: "back.out(1.4)",
      });

      // Testimoniale — fade
      gsap.from(".test-card", {
        scrollTrigger: { trigger: testRef.current, start: "top 85%" },
        y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out",
      });

      // Stats cards
      gsap.from(".stat-card", {
        scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        scale: 0.85, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)",
      });
    });

    return () => ctx.revert();
  }, [isMobile]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { icon: "📜", title: "Generator Contracte", desc: "46 tipuri conforme legislației române, generate instant cu AI.", color: "#818cf8", tag: "Nou: 46 tipuri" },
    { icon: "📧", title: "Generator Email-uri",  desc: "Email-uri profesionale pe 5 tonuri, pentru orice situație business.", color: "#6ee7b7", tag: null },
    { icon: "🔍", title: "Analizor Riscuri",     desc: "Upload PDF/DOCX și primești raport complet de riscuri în secunde.", color: "#f472b6", tag: "Popular" },
    { icon: "📨", title: "Documente Juridice",  desc: "Notificări, somații, decizii HR, procuri și plângeri generate automat.", color: "#fbbf24", tag: "Nou" },
    { icon: "✨", title: "Clauze AI Smart",      desc: "Asistentul AI sugerează clauze speciale adaptate situației tale.", color: "#a78bfa", tag: null },
    { icon: "📕", title: "Export PDF & Word",    desc: "Exportă orice document profesional în format PDF sau Word (.docx).", color: "#34d399", tag: "Nou" },
  ];

  const steps = [
    { n: "01", icon: "📝", title: "Completezi formularul", desc: "Câteva câmpuri — tip document, datele părților, valoare. Sub 2 minute.", color: "#818cf8" },
    { n: "02", icon: "⚡", title: "AI generează documentul", desc: "Claude Opus analizează legislația română în vigoare și redactează în juridic formal.", color: "#6ee7b7" },
    { n: "03", icon: "📥", title: "Descărci și folosești",  desc: "Export direct în PDF sau Word. Gata de semnat sau de trimis la avocat pentru validare finală.", color: "#f472b6" },
  ];

  const testimonials = [
    { name: "Andreea M.", role: "CEO, Agenție Marketing", avatar: "👩‍💼", text: "Am economisit câteva mii de RON în avocați. Contractele sunt la fel de bune și le revizuiesc rapid cu avocatul meu înainte de semnat.", stars: 5 },
    { name: "Radu C.",   role: "Fondator SaaS B2B",       avatar: "👨‍💻", text: "Analiza de riscuri pe PDF-uri a schimbat felul în care semnez contracte cu partenerii. Acum știu exact ce clauze să neg.", stars: 5 },
    { name: "Mihaela T.", role: "Administrator SRL",      avatar: "👩‍💼", text: "Deciziile HR și notificările le generez în 3 minute. Înainte plăteam un consultant pe oră pentru asta.", stars: 5 },
  ];

  const starterF = [
    [true,  "60 credite / lună"],
    [true,  "Generator contracte (46 tipuri)"],
    [true,  "Generator email-uri"],
    [true,  "5 analize riscuri / lună"],
    [true,  "Documente juridice (notificări, somații etc.)"],
    [true,  "Export PDF & Word"],
    [true,  "Suport email 48h"],
    [false, "API acces"],
    [false, "White-label"],
  ];
  const proF = [
    [true,  "200 credite / lună"],
    [true,  "Contracte nelimitate"],
    [true,  "Email-uri nelimitate"],
    [true,  "Analize nelimitate + export PDF raport"],
    [true,  "Documente juridice nelimitate"],
    [true,  "Clauze AI premium + GDPR"],
    [true,  "Export PDF & Word toate formatele"],
    [true,  "Suport prioritar 4h"],
    [false, "White-label"],
  ];

  // ─── Styles shorthand ───────────────────────────────────────────────
  const S = {
    section: (bg) => ({
      padding: isMobile ? "56px 20px" : "90px 5%",
      position: "relative",
      zIndex: 1,
      background: bg || "transparent",
    }),
    h2: {
      fontFamily: "'Syne',sans-serif",
      fontWeight: 800,
      fontSize: isMobile ? 26 : 42,
      color: "#e2e8f0",
      margin: "0 0 14px",
      lineHeight: 1.15,
    },
    grad: {
      background: "linear-gradient(135deg,#818cf8,#6ee7b7)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    badge: (color) => ({
      display: "inline-flex", alignItems: "center", gap: 5,
      background: (color || "#818cf8") + "18",
      border: "1px solid " + (color || "#818cf8") + "35",
      borderRadius: 100, padding: "5px 13px",
      color: color || "#818cf8",
      fontSize: 11, fontWeight: 700, fontFamily: "'Syne',sans-serif",
      marginBottom: 16,
    }),
  };

  return (
    <div style={{ background: "#070d1a", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", color: "#e2e8f0", position: "relative", overflowX: "hidden" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <Modal type={modal} onClose={() => setModal(null)} />

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(7,13,26,.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid #1e293b50", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, color: "#e2e8f0" }}>
            Lex<span style={S.grad}>AI</span> Pro
          </span>
        </div>
        {isMobile ? (
          <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 24, cursor: "pointer", padding: 4 }}>{menuOpen ? "✕" : "☰"}</button>
        ) : (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {[["Funcționalități", "features"], ["Cum funcționează", "steps"], ["Prețuri", "pricing"], ["Contact", null]].map(([label, id]) => (
              <button key={label} onClick={() => id ? scrollTo(id) : setModal("contact")}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 14, padding: 0, transition: "color .15s" }}
                onMouseEnter={e => e.target.style.color = "#e2e8f0"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>{label}</button>
            ))}
            <button onClick={onEnterApp} style={{ background: "linear-gradient(135deg,#818cf8,#6ee7b7)", border: "none", borderRadius: 11, padding: "10px 22px", color: "#070d1a", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Intră în App →
            </button>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ position: "fixed", top: 62, left: 0, right: 0, background: "#0a1220", borderBottom: "1px solid #1e293b", zIndex: 99, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[["Funcționalități", "features"], ["Cum funcționează", "steps"], ["Prețuri", "pricing"], ["Contact", null]].map(([label, id]) => (
            <button key={label} onClick={() => id ? scrollTo(id) : (setModal("contact"), setMenuOpen(false))}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 15, padding: "12px 0", textAlign: "left", borderBottom: "1px solid #1e293b40" }}>{label}</button>
          ))}
          <button onClick={() => { setMenuOpen(false); onEnterApp(); }} style={{ background: "linear-gradient(135deg,#818cf8,#6ee7b7)", border: "none", borderRadius: 10, padding: 13, color: "#070d1a", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>Intră în App →</button>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: isMobile ? "110px 20px 70px" : "130px 5% 90px", position: "relative", overflow: "hidden" }}>
        {/* Three.js background — lazy */}
        {!isMobile && (
          <Suspense fallback={null}>
            <HeroThree />
          </Suspense>
        )}
        {/* Gradient overlay sub text */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%,#070d1a00 0%,#070d1a 85%)", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#818cf815", border: "1px solid #818cf830", borderRadius: 100, padding: "8px 18px", marginBottom: 30, animation: "fadeUp .6s ease both" }}>
            <span style={{ width: 7, height: 7, background: "#10b981", borderRadius: "50%", animation: "pulse 2s infinite", display: "inline-block" }} />
            <span style={{ color: "#818cf8", fontSize: isMobile ? 11 : 13, fontWeight: 600 }}>Acum: 6 tipuri de documente juridice + export Word/PDF</span>
          </div>

          <h1 style={{ fontSize: isMobile ? 34 : "clamp(42px,6vw,80px)", fontFamily: "'Syne',sans-serif", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.08, margin: "0 0 22px", animation: "fadeUp .7s ease .1s both", maxWidth: 820 }}>
            Asistentul juridic<br />
            al antreprenorului<br />
            <span style={S.grad}>român</span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: isMobile ? 15 : 18, maxWidth: 580, margin: "0 auto 38px", lineHeight: 1.75, animation: "fadeUp .7s ease .2s both" }}>
            Contracte, emailuri, analize de riscuri și documente juridice — generate cu AI antrenat pe legislația românească, în secunde.
          </p>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, justifyContent: "center", width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 320 : "none", animation: "fadeUp .7s ease .3s both" }}>
            <button onClick={onEnterApp}
              style={{ background: "linear-gradient(135deg,#818cf8,#6ee7b7)", border: "none", borderRadius: 14, padding: "16px 34px", color: "#070d1a", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 0 40px #818cf830" }}>
              🚀 Începe Gratuit
            </button>
            <button onClick={() => scrollTo("steps")}
              style={{ background: "rgba(30,41,59,.8)", border: "1px solid #334155", borderRadius: 14, padding: "16px 34px", color: "#e2e8f0", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              Cum funcționează →
            </button>
          </div>

          <div style={{ marginTop: 44, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", animation: "float 4s ease-in-out infinite" }}>
            {["🔒 Date stocate UE", "⚡ < 30s generare", "📕 Export PDF & Word", "✅ Legislație RO 2025"].map(p => (
              <span key={p} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 100, padding: "6px 14px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────── */}
      <section ref={statsRef} style={S.section("#050b16")}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, maxWidth: 1000, margin: "0 auto" }}>
          {[
            { v: c1, s: "+", l: "Documente generate" },
            { v: c2, s: "%", l: "Satisfacție clienți" },
            { v: c3, s: "",  l: "Tipuri de documente" },
            { v: c4, s: "s", l: "Timp mediu generare", prefix: "< " },
          ].map((x, i) => (
            <div key={i} className="stat-card" style={{ textAlign: "center", padding: isMobile ? "20px 14px" : 28, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18 }}>
              <div style={{ fontSize: isMobile ? 30 : 46, fontFamily: "'Syne',sans-serif", fontWeight: 800, ...S.grad, lineHeight: 1 }}>
                {x.prefix || ""}{typeof x.v === "number" ? x.v.toLocaleString("ro-RO") : x.v}{x.s}
              </div>
              <div style={{ color: "#64748b", fontSize: isMobile ? 11 : 13, marginTop: 8, lineHeight: 1.4 }}>{x.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUM FUNCȚIONEAZĂ ────────────────────────────────────────── */}
      <section id="steps" ref={stepsRef} style={S.section()}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
          <div style={S.badge()}>⚡ Simplu și rapid</div>
          <h2 style={S.h2}>Trei pași până la<br /><span style={S.grad}>documentul tău juridic</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20, maxWidth: 960, margin: "0 auto" }}>
          {steps.map((step, i) => (
            <div key={i} className="step-card" style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: isMobile ? 22 : 30, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${step.color},${step.color}00)` }} />
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 48, color: step.color + "20", lineHeight: 1, marginBottom: 12 }}>{step.n}</div>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{step.icon}</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "#e2e8f0", margin: "0 0 10px" }}>{step.title}</h3>
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" ref={featuresRef} style={S.section("#050b16")}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
          <div style={S.badge("#6ee7b7")}>🛠️ Funcționalități</div>
          <h2 style={S.h2}>Tot ce ai nevoie pentru<br /><span style={S.grad}>business-ul tău</span></h2>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Instrumente AI specializate pe legislația românească în vigoare.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: 16, maxWidth: 1060, margin: "0 auto" }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, padding: isMobile ? 20 : 28, position: "relative", overflow: "hidden", transition: "border-color .2s, transform .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "60"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle,${f.color}15 0%,transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 30 }}>{f.icon}</span>
                {f.tag && <span style={{ background: f.color + "18", color: f.color, border: `1px solid ${f.color}30`, fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 100, fontFamily: "'Syne',sans-serif" }}>{f.tag}</span>}
              </div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALE ────────────────────────────────────────────── */}
      <section ref={testRef} style={S.section()}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 48 }}>
          <div style={S.badge("#f472b6")}>⭐ Testimoniale</div>
          <h2 style={S.h2}>Ce spun <span style={S.grad}>clienții noștri</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16, maxWidth: 960, margin: "0 auto" }}>
          {testimonials.map((t, i) => (
            <div key={i} className="test-card" style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, padding: isMobile ? 20 : 26 }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {"★".repeat(t.stars).split("").map((s, j) => <span key={j} style={{ color: "#fbbf24", fontSize: 14 }}>{s}</span>)}
              </div>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.75, margin: "0 0 20px", fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: "#1e293b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>{t.name}</div>
                  <div style={{ color: "#475569", fontSize: 12 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={S.section("#050b16")}>
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <div style={S.badge("#fbbf24")}>💳 Prețuri</div>
          <h2 style={S.h2}>Prețuri <span style={S.grad}>transparente</span></h2>
          <div style={{ display: "inline-flex", alignItems: "center", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 100, padding: "5px 6px", marginTop: 16 }}>
            {[["lunar", "Lunar"], ["anual", "Anual −20%"]].map(([val, lbl]) => (
              <button key={val} onClick={() => setBilling(val)}
                style={{ background: billing === val ? "linear-gradient(135deg,#818cf8,#6ee7b7)" : "none", border: "none", borderRadius: 100, padding: "8px 20px", color: billing === val ? "#070d1a" : "#94a3b8", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}>{lbl}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(300px,1fr))", gap: 20, maxWidth: 860, margin: "0 auto 28px" }}>
          {/* Starter */}
          <div className="pricing-card" style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: isMobile ? 24 : 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🚀</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#e2e8f0" }}>Starter</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 42, color: "#6ee7b7" }}>{billing === "lunar" ? "49" : "39"}</span>
              <span style={{ color: "#64748b" }}> RON/lună</span>
              {billing === "anual" && <div style={{ color: "#10b981", fontSize: 12, marginTop: 4 }}>Economisești 120 RON/an</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
              {starterF.map(([ok, txt], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: ok ? "#94a3b8" : "#334155" }}>
                  <span style={{ color: ok ? "#6ee7b7" : "#334155", flexShrink: 0, fontWeight: 700 }}>{ok ? "✓" : "✗"}</span>{txt}
                </div>
              ))}
            </div>
            <button onClick={onEnterApp} style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 14, color: "#6ee7b7", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Începe Gratuit 14 Zile
            </button>
          </div>

          {/* Pro */}
          <div className="pricing-card" style={{ background: "#0f172a", border: "2px solid #818cf840", borderRadius: 20, padding: isMobile ? 24 : 34, position: "relative", boxShadow: "0 0 50px #818cf815" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#818cf8,#6ee7b7)", borderRadius: 100, padding: "4px 18px", fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#070d1a", whiteSpace: "nowrap" }}>⚡ POPULAR</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#e2e8f0" }}>Pro Business</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 42, color: "#818cf8" }}>{billing === "lunar" ? "149" : "119"}</span>
              <span style={{ color: "#64748b" }}> RON/lună</span>
              {billing === "anual" && <div style={{ color: "#10b981", fontSize: 12, marginTop: 4 }}>Economisești 360 RON/an</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
              {proF.map(([ok, txt], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: ok ? "#94a3b8" : "#334155" }}>
                  <span style={{ color: ok ? "#818cf8" : "#334155", flexShrink: 0, fontWeight: 700 }}>{ok ? "✓" : "✗"}</span>{txt}
                </div>
              ))}
            </div>
            <button onClick={onEnterApp} style={{ width: "100%", background: "linear-gradient(135deg,#818cf8,#6ee7b7)", border: "none", borderRadius: 12, padding: 14, color: "#070d1a", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Alege Pro Business
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", color: "#475569", fontSize: 13 }}>✓ Fără card de credit · ✓ Anulezi oricând · ✓ Facturare RON + TVA</div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────── */}
      <section style={{ ...S.section(), textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", background: "linear-gradient(135deg,#818cf808,#6ee7b708)", border: "1px solid #818cf825", borderRadius: 24, padding: isMobile ? "40px 24px" : "60px 48px" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚖️</div>
          <h2 style={{ ...S.h2, fontSize: isMobile ? 24 : 36, marginBottom: 16 }}>
            Gata să economisești timp<br />și bani cu <span style={S.grad}>LexAI Pro</span>?
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 30, lineHeight: 1.7 }}>10 credite gratuite la înregistrare. Fără card de credit.</p>
          <button onClick={onEnterApp}
            style={{ background: "linear-gradient(135deg,#818cf8,#6ee7b7)", border: "none", borderRadius: 14, padding: "16px 42px", color: "#070d1a", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, cursor: "pointer", boxShadow: "0 0 50px #818cf835" }}>
            🚀 Creează Cont Gratuit
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ background: "#050b16", padding: isMobile ? "48px 20px 28px" : "64px 5% 32px", position: "relative", zIndex: 1, borderTop: "1px solid #1e293b" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 28 : 40, marginBottom: 40, maxWidth: 1100, margin: "0 auto 40px" }}>
          <div style={{ gridColumn: isMobile ? "1/-1" : "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span>⚖️</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#e2e8f0" }}>Lex<span style={S.grad}>AI</span> Pro</span>
            </div>
            <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 280 }}>Asistentul juridic AI pentru antreprenorii români. Contracte, documente și analize juridice în secunde.</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["🔒 GDPR", "🇷🇴 Made in RO", "⚡ AI-Powered"].map(b => (
                <span key={b} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "4px 10px", fontSize: 10, color: "#64748b", whiteSpace: "nowrap" }}>{b}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: "#e2e8f0", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Produs</div>
            {["Funcționalități", "Prețuri", "Changelog", "API Docs"].map(l => (
              <div key={l} style={{ color: "#475569", fontSize: 13, marginBottom: 10, cursor: "pointer", transition: "color .15s" }} onMouseEnter={e => e.target.style.color = "#94a3b8"} onMouseLeave={e => e.target.style.color = "#475569"}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: "#e2e8f0", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Companie</div>
            {["Despre noi", "Blog", "Cariere", "Parteneri"].map(l => (
              <div key={l} style={{ color: "#475569", fontSize: 13, marginBottom: 10, cursor: "pointer", transition: "color .15s" }} onMouseEnter={e => e.target.style.color = "#94a3b8"} onMouseLeave={e => e.target.style.color = "#475569"}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: "#e2e8f0", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Legal</div>
            {[["Termeni și Condiții", "terms"], ["GDPR & Confidențialitate", "gdpr"], ["Politica Cookies", "cookies"], ["Contact", "contact"]].map(([lbl, id]) => (
              <button key={id} onClick={() => setModal(id)} style={{ display: "block", background: "none", border: "none", color: "#475569", fontSize: 13, marginBottom: 10, cursor: "pointer", padding: 0, fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "color .15s" }} onMouseEnter={e => e.target.style.color = "#94a3b8"} onMouseLeave={e => e.target.style.color = "#475569"}>{lbl}</button>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 22, maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 12, alignItems: isMobile ? "flex-start" : "center" }}>
          <div style={{ color: "#334155", fontSize: 12 }}>© 2025 LexAI Pro SRL · CUI: RO12345678 · J40/1234/2024</div>
          <div style={{ color: "#475569", fontSize: 11, background: "#0f172a", border: "1px solid #f59e0b25", borderRadius: 8, padding: "7px 14px" }}>
            ⚠️ Conținut informativ. Consultați un avocat autorizat.
          </div>
        </div>
      </footer>
    </div>
  );
}
