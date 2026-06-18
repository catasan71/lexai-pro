import { useState, useEffect, useRef } from "react";
import { callClaude, extractJSON } from "./lib/claude";
import { extractPdfText } from "./lib/pdf";
import { CONTRACT_TYPES } from "./data/contractTypes";
import { EMAIL_TYPES, EMAIL_TONES } from "./data/emailTypes";

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

function useAnimatedCounter(target, duration, start) {
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0 = null;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ""));
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / (duration || 1800), 1);
      setC(Math.floor((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return c;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  const col = { success: "#10b981", error: "#ef4444", info: "#818cf8" };
  return (
    <div style={{ position:"fixed",bottom:16,left:16,right:16,zIndex:9999,background:"#0f172a",border:"1px solid "+col[type]+"40",borderLeft:"3px solid "+col[type],borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"flex-start",gap:10,boxShadow:"0 8px 32px "+col[type]+"20",animation:"slideUp .3s ease",maxWidth:480,marginInline:"auto",fontFamily:"'DM Sans',sans-serif" }}>
      <span style={{ color:col[type],fontSize:16,flexShrink:0,marginTop:1 }}>{type==="success"?"✓":type==="error"?"✗":"ℹ"}</span>
      <span style={{ color:"#e2e8f0",fontSize:13,flex:1,wordBreak:"break-word",lineHeight:1.5 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:18,padding:0,lineHeight:1,flexShrink:0 }}>×</button>
    </div>
  );
}

function ParticlesBg() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    const sz = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    sz(); window.addEventListener("resize", sz);
    const pts = Array.from({ length: 45 }, () => ({ x:Math.random()*c.width, y:Math.random()*c.height, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, r:Math.random()*2+1 }));
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => { p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>c.width)p.vx*=-1; if(p.y<0||p.y>c.height)p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle="rgba(129,140,248,.4)"; ctx.fill(); });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle="rgba(129,140,248,"+(0.12*(1-d/120))+")";ctx.lineWidth=.5;ctx.stroke();}}
      id=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize",sz); };
  },[]);
  return <canvas ref={ref} style={{ position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none" }} />;
}

function Modal({ type, onClose }) {
  const [sent, setSent] = useState(false);
  const [cf, setCf] = useState({ name:"", email:"", msg:"" });
  const [toast, setToast] = useState(null);
  const isMobile = useIsMobile();
  if (!type) return null;
  const titles = { terms:"Termeni și Condiții", gdpr:"GDPR & Confidențialitate", cookies:"Politica Cookies", contact:"Contact" };
  const INP = { background:"#070d1a",border:"1px solid #1e293b",borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"'DM Sans',sans-serif",width:"100%",boxSizing:"border-box",outline:"none" };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:20 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <div style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:isMobile?"20px 20px 0 0":20,width:"100%",maxWidth:isMobile?"100%":680,maxHeight:isMobile?"90vh":"82vh",overflowY:"auto",padding:isMobile?"24px 20px":36,animation:"fadeUp .3s ease" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:isMobile?18:22,color:"#e2e8f0",margin:0 }}>{titles[type]}</h2>
          <button onClick={onClose} style={{ background:"#1e293b",border:"none",color:"#94a3b8",width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>×</button>
        </div>
        {type==="terms" && (
          <div style={{ color:"#94a3b8",fontSize:13,lineHeight:1.8 }}>
            {[["1. Acceptarea Termenilor","Prin accesarea platformei LexAI Pro ești de acord cu acești termeni."],["2. Descrierea Serviciului","LexAI Pro oferă instrumente AI cu caracter informativ. Conținutul generat nu constituie consultanță juridică."],["3. Limitarea Răspunderii","Nu suntem responsabili pentru decizii luate pe baza conținutului generat. Consultați un avocat autorizat."],["4. Proprietatea Intelectuală","Documentele generate aparțin utilizatorului. Codul platformei aparține LexAI Pro SRL."],["5. Plăți și Abonamente","Facturare lunară/anuală în RON cu TVA. Anulare oricând fără penalități."],["6. Legislație Aplicabilă","Guvernat de legislația română. Litigiile la instanțele competente din România."]].map(function(item){ return (
              <div key={item[0]} style={{ marginBottom:18 }}><div style={{ color:"#818cf8",fontWeight:700,fontSize:14,marginBottom:6 }}>{item[0]}</div><p style={{ margin:0 }}>{item[1]}</p></div>
            ); })}
          </div>
        )}
        {type==="gdpr" && (
          <div style={{ color:"#94a3b8",fontSize:13,lineHeight:1.8 }}>
            {[["Operatorul de Date","LexAI Pro SRL, CUI RO12345678, Str. Victoriei 45, București. DPO: dpo@lexaipro.ro"],["Date Colectate","Identificare (nume, email, CUI), utilizare și date tehnice. Fără date sensibile."],["Scopul Prelucrării","Furnizarea serviciului, facturare și marketing cu consimțământ."],["Drepturile Dvs.","Acces, rectificare, ștergere, portabilitate, opoziție — gdpr@lexaipro.ro"],["Stocarea Datelor","Servere ISO 27001 în UE (Germania). Retenție 3 ani."],["Cookies","Tehnice (necesare), analitice și marketing (cu consimțământ)."]].map(function(item){ return (
              <div key={item[0]} style={{ marginBottom:18 }}><div style={{ color:"#6ee7b7",fontWeight:700,fontSize:14,marginBottom:6 }}>{item[0]}</div><p style={{ margin:0 }}>{item[1]}</p></div>
            ); })}
          </div>
        )}
        {type==="cookies" && (
          <div>
            {[{icon:"🔧",title:"Tehnice (Necesare)",color:"#10b981",desc:"Esențiale funcționării.",cookies:"session_id, auth_token",ret:"Sesiune/30 zile"},{icon:"📊",title:"Analitice",color:"#818cf8",desc:"Date anonimizate despre utilizare.",cookies:"_ga, _gid (GA4)",ret:"2 ani"},{icon:"🎯",title:"Marketing",color:"#f472b6",desc:"Doar cu consimțământ explicit.",cookies:"_fbp, _gcl_au",ret:"90 zile"}].map(function(ck){ return (
              <div key={ck.title} style={{ background:"#070d1a",border:"1px solid "+ck.color+"30",borderRadius:12,padding:16,marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}><span>{ck.icon}</span><span style={{ color:ck.color,fontWeight:700,fontSize:14 }}>{ck.title}</span></div>
                <p style={{ color:"#94a3b8",fontSize:12,margin:"0 0 10px" }}>{ck.desc}</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  <div style={{ background:"#0f172a",borderRadius:8,padding:"8px 12px" }}><div style={{ color:"#64748b",fontSize:10,marginBottom:3 }}>COOKIE-URI</div><div style={{ color:"#e2e8f0",fontSize:11 }}>{ck.cookies}</div></div>
                  <div style={{ background:"#0f172a",borderRadius:8,padding:"8px 12px" }}><div style={{ color:"#64748b",fontSize:10,marginBottom:3 }}>RETENȚIE</div><div style={{ color:"#e2e8f0",fontSize:11 }}>{ck.ret}</div></div>
                </div>
              </div>
            ); })}
          </div>
        )}
        {type==="contact" && (sent ? (
          <div style={{ textAlign:"center",padding:"32px 0" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>✅</div>
            <h3 style={{ color:"#10b981",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,marginBottom:10 }}>Mesaj trimis!</h3>
            <p style={{ color:"#94a3b8",fontSize:14 }}>Îți răspundem în maxim 48h.</p>
            <button onClick={onClose} style={{ marginTop:20,background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:"12px 28px",color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,cursor:"pointer" }}>Închide</button>
          </div>
        ) : (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22 }}>
              {[["📧","Email","contact@lexaipro.ro"],["💼","Business","business@lexaipro.ro"],["📍","Adresă","Str. Victoriei 45, Buc."],["🕐","Program","L-V: 09:00-18:00"]].map(function(x){ return (
                <div key={x[1]} style={{ background:"#070d1a",border:"1px solid #1e293b",borderRadius:10,padding:14 }}><div style={{ fontSize:18,marginBottom:4 }}>{x[0]}</div><div style={{ color:"#64748b",fontSize:10,marginBottom:3 }}>{x[1].toUpperCase()}</div><div style={{ color:"#e2e8f0",fontSize:12 }}>{x[2]}</div></div>
              ); })}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              <input placeholder="Nume *" value={cf.name} onChange={e=>setCf({...cf,name:e.target.value})} style={INP} />
              <input placeholder="Email *" value={cf.email} onChange={e=>setCf({...cf,email:e.target.value})} style={INP} />
              <textarea placeholder="Mesaj *" rows={4} value={cf.msg} onChange={e=>setCf({...cf,msg:e.target.value})} style={{ ...INP,resize:"vertical" }} />
              <button onClick={()=>{ if(!cf.name||!cf.email||!cf.msg){setToast({msg:"Toate câmpurile sunt obligatorii.",type:"error"});return;} setSent(true); }} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:14,color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer" }}>✉️ Trimite Mesaj</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingPage({ onEnterApp }) {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [billing, setBilling] = useState("lunar");
  const [statsVis, setStatsVis] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const statsRef = useRef(null);
  const isMobile = useIsMobile();
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setStatsVis(true); },{threshold:.2});
    if(statsRef.current) obs.observe(statsRef.current);
    return ()=>obs.disconnect();
  },[]);
  const c1 = useAnimatedCounter("12400",1800,statsVis);
  const c2 = useAnimatedCounter("98",1800,statsVis);
  const c3 = useAnimatedCounter("40",1800,statsVis);
  const scrollTo = id => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({behavior:"smooth"}); };
  const features = [
    {icon:"📜",title:"Generator Contracte",desc:"40 tipuri conforme legislației române, generate instant cu AI.",color:"#818cf8"},
    {icon:"📧",title:"Generator Email-uri",desc:"Email-uri profesionale pe 5 tonuri, pentru orice situație business.",color:"#6ee7b7"},
    {icon:"🔍",title:"Analizor Riscuri",desc:"Upload PDF/DOCX și primești raport complet de riscuri în secunde.",color:"#f472b6"},
    {icon:"⚖️",title:"Conformitate GDPR",desc:"Verificare automată clauze GDPR și recomandări de conformitate.",color:"#fbbf24"},
    {icon:"✨",title:"Clauze AI Smart",desc:"Asistentul AI sugerează clauze speciale adaptate situației tale.",color:"#a78bfa"},
    {icon:"📊",title:"Rapoarte Detaliate",desc:"Exportă rapoarte cu scoruri de risc și recomandări complete.",color:"#34d399"}
  ];
  const starterF = [[true,"5 contracte / lună (toate 40 tipurile)"],[true,"Generator email-uri"],[true,"3 analize / lună"],[true,"Asistent AI clauze"],[true,"Export PDF & DOCX"],[true,"Suport email 48h"],[false,"API acces"],[false,"White-label"],[false,"Manager dedicat"]];
  const proF = [[true,"Contracte nelimitate"],[true,"Email-uri nelimitate"],[true,"Analize nelimitate + PDF"],[true,"AI clauze premium + GDPR"],[true,"Export toate formatele"],[true,"Toate 40 tipuri RO"],[true,"Suport prioritar 4h"],[true,"API acces (500 req/zi)"],[false,"White-label"],[false,"Manager dedicat"]];

  return (
    <div style={{ background:"#070d1a",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",color:"#e2e8f0",position:"relative",overflowX:"hidden" }}>
      {!isMobile && <ParticlesBg />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <Modal type={modal} onClose={()=>setModal(null)} />

      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(7,13,26,.93)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e293b40",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:20 }}>⚖️</span>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#e2e8f0" }}>Lex<span style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>AI</span> Pro</span>
        </div>
        {isMobile ? (
          <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:"none",border:"none",color:"#94a3b8",fontSize:24,cursor:"pointer",padding:4,lineHeight:1 }}>{menuOpen?"✕":"☰"}</button>
        ) : (
          <div style={{ display:"flex",gap:28,alignItems:"center" }}>
            {[["Funcționalități","features"],["Prețuri","pricing"],["Contact",null]].map(function(x){ return (
              <button key={x[0]} onClick={()=>x[1]?scrollTo(x[1]):setModal("contact")} style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,padding:0 }} onMouseEnter={e=>e.target.style.color="#e2e8f0"} onMouseLeave={e=>e.target.style.color="#94a3b8"}>{x[0]}</button>
            ); })}
            <button onClick={onEnterApp} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:"9px 20px",color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>Intră în App →</button>
          </div>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={{ position:"fixed",top:60,left:0,right:0,background:"#0a1220",borderBottom:"1px solid #1e293b",zIndex:99,padding:"16px 20px",display:"flex",flexDirection:"column",gap:4,animation:"fadeUp .2s ease" }}>
          {[["Funcționalități","features"],["Prețuri","pricing"],["Contact",null]].map(function(x){ return (
            <button key={x[0]} onClick={()=>x[1]?scrollTo(x[1]):(setModal("contact"),setMenuOpen(false))} style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:15,padding:"12px 0",textAlign:"left",borderBottom:"1px solid #1e293b40" }}>{x[0]}</button>
          ); })}
          <button onClick={()=>{setMenuOpen(false);onEnterApp();}} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:13,color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer",marginTop:8 }}>Intră în App →</button>
        </div>
      )}

      <section style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:isMobile?"100px 20px 60px":"120px 5% 80px",position:"relative",zIndex:1 }}>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#818cf820",border:"1px solid #818cf840",borderRadius:100,padding:"7px 16px",marginBottom:28,animation:"fadeUp .6s ease both" }}>
          <span style={{ width:8,height:8,background:"#10b981",borderRadius:"50%",animation:"pulse 2s infinite",display:"inline-block",flexShrink:0 }} />
          <span style={{ color:"#818cf8",fontSize:isMobile?11:13,fontWeight:500 }}>Nou: Analiză riscuri în sub 30 secunde</span>
        </div>
        <h1 style={{ fontSize:isMobile?34:"clamp(40px,6vw,76px)",fontFamily:"'Syne',sans-serif",fontWeight:800,letterSpacing:"-2px",lineHeight:1.1,margin:"0 0 20px",animation:"fadeUp .7s ease .1s both",maxWidth:800 }}>
          Asistentul juridic<br />al antreprenorului<br /><span style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>român</span>
        </h1>
        <p style={{ color:"#94a3b8",fontSize:isMobile?15:18,maxWidth:560,margin:"0 auto 36px",lineHeight:1.7,animation:"fadeUp .7s ease .2s both" }}>Generează contracte conforme, analizează riscuri și redactează email-uri profesionale cu AI antrenat pe legislația românească.</p>
        <div style={{ display:"flex",flexDirection:isMobile?"column":"row",gap:12,width:isMobile?"100%":"auto",maxWidth:isMobile?320:"none",animation:"fadeUp .7s ease .3s both" }}>
          <button onClick={onEnterApp} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:14,padding:"15px 32px",color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer" }}>🚀 Începe Gratuit 14 Zile</button>
          <button onClick={()=>scrollTo("features")} style={{ background:"none",border:"1px solid #334155",borderRadius:14,padding:"15px 32px",color:"#e2e8f0",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer" }}>Vezi Demo →</button>
        </div>
        <div style={{ marginTop:48,display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:"14px 20px",animation:"float 4s ease-in-out infinite" }}>
          {["📜 40 tipuri contracte","⚡ < 30s generare","🔒 Date stocate UE"].map(p=><span key={p} style={{ background:"#1e293b",borderRadius:100,padding:"5px 13px",fontSize:12,color:"#94a3b8",whiteSpace:"nowrap" }}>{p}</span>)}
        </div>
      </section>

      <section ref={statsRef} style={{ padding:isMobile?"50px 20px":"70px 5%",position:"relative",zIndex:1 }}>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:14,maxWidth:960,margin:"0 auto" }}>
          {[{v:c1,s:"+",l:"Contracte generate"},{v:c2,s:"%",l:"Satisfacție clienți"},{v:c3,s:"",l:"Tipuri contracte"},{v:"< 30",s:"s",l:"Timp generare"}].map(function(x,i){ return (
            <div key={i} style={{ textAlign:"center",padding:isMobile?"20px 12px":28,background:"#0f172a",border:"1px solid #1e293b",borderRadius:16 }}>
              <div style={{ fontSize:isMobile?28:44,fontFamily:"'Syne',sans-serif",fontWeight:800,background:"linear-gradient(135deg,#818cf8,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1 }}>{typeof x.v==="number"?x.v.toLocaleString("ro-RO"):x.v}{x.s}</div>
              <div style={{ color:"#64748b",fontSize:isMobile?11:13,marginTop:8,lineHeight:1.4 }}>{x.l}</div>
            </div>
          ); })}
        </div>
      </section>

      <section id="features" style={{ padding:isMobile?"50px 20px":"70px 5%",position:"relative",zIndex:1 }}>
        <div style={{ textAlign:"center",marginBottom:44 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:isMobile?26:42,color:"#e2e8f0",margin:"0 0 14px" }}>Tot ce ai nevoie pentru <span style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>business-ul tău</span></h2>
          <p style={{ color:"#64748b",fontSize:16,maxWidth:480,margin:"0 auto" }}>Instrumente AI specializate pe legislația românească.</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(300px,1fr))",gap:16,maxWidth:1060,margin:"0 auto" }}>
          {features.map(function(f,i){ return (
            <div key={i} style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:isMobile?20:26,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-16,right:-16,width:80,height:80,background:"radial-gradient(circle,"+f.color+"18 0%,transparent 70%)",pointerEvents:"none" }} />
              <div style={{ fontSize:28,marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#e2e8f0",margin:"0 0 8px" }}>{f.title}</h3>
              <p style={{ color:"#64748b",fontSize:13,lineHeight:1.7,margin:0 }}>{f.desc}</p>
            </div>
          ); })}
        </div>
      </section>

      <section id="pricing" style={{ padding:isMobile?"50px 20px":"70px 5%",background:"#050b16",position:"relative",zIndex:1 }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:isMobile?26:42,color:"#e2e8f0",margin:"0 0 24px" }}>Prețuri transparente</h2>
          <div style={{ display:"inline-flex",alignItems:"center",background:"#0f172a",border:"1px solid #1e293b",borderRadius:100,padding:"5px 6px" }}>
            {[["lunar","Lunar"],["anual","Anual −20%"]].map(function(x){ return (
              <button key={x[0]} onClick={()=>setBilling(x[0])} style={{ background:billing===x[0]?"linear-gradient(135deg,#818cf8,#6ee7b7)":"none",border:"none",borderRadius:100,padding:"8px 18px",color:billing===x[0]?"#070d1a":"#94a3b8",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap" }}>{x[1]}</button>
            ); })}
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fit,minmax(280px,1fr))",gap:20,maxWidth:840,margin:"0 auto 28px" }}>
          <div style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:18,padding:isMobile?24:32 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}><span style={{ fontSize:22 }}>🚀</span><span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#e2e8f0" }}>Starter</span></div>
            <div style={{ marginBottom:22 }}><span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:38,color:"#6ee7b7" }}>{billing==="lunar"?"49":"39"}</span><span style={{ color:"#64748b" }}> RON/lună</span>{billing==="anual"&&<div style={{ color:"#10b981",fontSize:12,marginTop:4 }}>Economisești 120 RON/an</div>}</div>
            <div style={{ display:"flex",flexDirection:"column",gap:9,marginBottom:24 }}>
              {starterF.map(function(x,i){ return <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:9,fontSize:13,color:x[0]?"#94a3b8":"#334155" }}><span style={{ color:x[0]?"#6ee7b7":"#334155",flexShrink:0 }}>{x[0]?"✓":"✗"}</span>{x[1]}</div>; })}
            </div>
            <button onClick={onEnterApp} style={{ width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:11,padding:13,color:"#6ee7b7",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>Începe Gratuit 14 Zile</button>
          </div>
          <div style={{ background:"#0f172a",border:"2px solid #818cf840",borderRadius:18,padding:isMobile?24:32,position:"relative" }}>
            <div style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#818cf8,#6ee7b7)",borderRadius:100,padding:"4px 16px",fontSize:11,fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#070d1a",whiteSpace:"nowrap" }}>⚡ POPULAR</div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}><span style={{ fontSize:22 }}>⚡</span><span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#e2e8f0" }}>Pro Business</span></div>
            <div style={{ marginBottom:22 }}><span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:38,color:"#818cf8" }}>{billing==="lunar"?"149":"119"}</span><span style={{ color:"#64748b" }}> RON/lună</span>{billing==="anual"&&<div style={{ color:"#10b981",fontSize:12,marginTop:4 }}>Economisești 360 RON/an</div>}</div>
            <div style={{ display:"flex",flexDirection:"column",gap:9,marginBottom:24 }}>
              {proF.map(function(x,i){ return <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:9,fontSize:13,color:x[0]?"#94a3b8":"#334155" }}><span style={{ color:x[0]?"#818cf8":"#334155",flexShrink:0 }}>{x[0]?"✓":"✗"}</span>{x[1]}</div>; })}
            </div>
            <button onClick={onEnterApp} style={{ width:"100%",background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:11,padding:13,color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>Alege Pro Business</button>
          </div>
        </div>
        <div style={{ textAlign:"center",color:"#475569",fontSize:13 }}>✓ Fără card de credit · ✓ Anulezi oricând · ✓ Facturare RON+TVA</div>
      </section>

      <footer style={{ background:"#050b16",padding:isMobile?"44px 20px 24px":"60px 5% 28px",position:"relative",zIndex:1,borderTop:"1px solid #1e293b" }}>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?28:36,marginBottom:36 }}>
          <div style={{ gridColumn:isMobile?"1/-1":"auto" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><span>⚖️</span><span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#e2e8f0" }}>Lex<span style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>AI</span> Pro</span></div>
            <p style={{ color:"#475569",fontSize:13,lineHeight:1.6,margin:"0 0 16px" }}>Asistentul juridic AI pentru antreprenorii români.</p>
          </div>
          <div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#e2e8f0",marginBottom:12,textTransform:"uppercase",letterSpacing:1 }}>Produs</div>{["Funcționalități","Prețuri","API Docs","Changelog"].map(l=><div key={l} style={{ color:"#475569",fontSize:13,marginBottom:9,cursor:"pointer" }}>{l}</div>)}</div>
          <div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#e2e8f0",marginBottom:12,textTransform:"uppercase",letterSpacing:1 }}>Companie</div>{["Despre noi","Blog","Cariere","Parteneri"].map(l=><div key={l} style={{ color:"#475569",fontSize:13,marginBottom:9,cursor:"pointer" }}>{l}</div>)}</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#e2e8f0",marginBottom:12,textTransform:"uppercase",letterSpacing:1 }}>Legal</div>
            {[["Termeni și Condiții","terms"],["GDPR & Confidențialitate","gdpr"],["Politica Cookies","cookies"],["Contact","contact"]].map(function(x){ return (
              <button key={x[0]} onClick={()=>setModal(x[1])} style={{ display:"block",background:"none",border:"none",color:"#475569",fontSize:13,marginBottom:9,cursor:"pointer",padding:0,fontFamily:"'DM Sans',sans-serif",textAlign:"left" }}>{x[0]}</button>
            ); })}
          </div>
        </div>
        <div style={{ borderTop:"1px solid #1e293b",paddingTop:20,display:"flex",flexDirection:isMobile?"column":"row",justifyContent:"space-between",gap:12,alignItems:isMobile?"flex-start":"center" }}>
          <div style={{ color:"#334155",fontSize:12 }}>© 2025 LexAI Pro SRL | CUI: RO12345678 | J40/1234/2024</div>
          <div style={{ color:"#475569",fontSize:11,background:"#0f172a",border:"1px solid #f59e0b30",borderRadius:8,padding:"7px 12px" }}>⚠️ Conținut informativ. Consultați un avocat autorizat.</div>
        </div>
      </footer>
    </div>
  );
}

function Spinner() {
  return <span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.25)",borderTop:"2px solid currentColor",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block",flexShrink:0 }} />;
}

function ContractModule({ showToast }) {
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState("form");
  const [form, setForm] = useState({ contractType:"Contract de Prestări Servicii (Cod Civil art. 1851)", p1Name:"",p1CUI:"",p1Reg:"",p1Address:"",p1Rep:"",p1Email:"", p2Name:"",p2CUI:"",p2Reg:"",p2Address:"",p2Rep:"",p2Email:"", contractNo:"CTR-"+Date.now(),contractDate:new Date().toISOString().slice(0,10),location:"București",dueDate:"",value:"",currency:"RON",penalties:"0.1",duration:"determinată",object:"" });
  const [clauses, setClauses] = useState([]);
  const [sel, setSel] = useState([]);
  const [contract, setContract] = useState("");
  const [loadC, setLoadC] = useState(false);
  const [loadG, setLoadG] = useState(false);
  const upd = (k,v) => setForm(function(f){ var n={};Object.assign(n,f);n[k]=v;return n; });
  const toggleSel = i => setSel(function(s){ return s.indexOf(i)>=0 ? s.filter(function(x){return x!==i;}) : s.concat([i]); });
  const INP = { background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:13,fontFamily:"'DM Sans',sans-serif",width:"100%",boxSizing:"border-box",outline:"none" };
  const LBL = { color:"#64748b",fontSize:11,marginBottom:5,display:"block",fontWeight:600,textTransform:"uppercase",letterSpacing:.4 };

  var suggestClauses = async function() {
    setLoadC(true);
    try {
      var prompt = "Esti expert juridic roman. Pentru contractul de tip: " + form.contractType + "\nSugereaza exact 6 clauze speciale importante.\nRaspunde DOAR cu un array JSON, fara alt text, fara markdown:\n[{\"titlu\":\"Titlul clauzei\",\"descriere\":\"Descriere scurta a clauzei\",\"text\":\"Textul juridic complet al clauzei\"}]";
      var txt = await callClaude("clauses", prompt);
      var parsed = extractJSON(txt);
      if (!Array.isArray(parsed)) throw new Error("Raspunsul nu este un array JSON");
      setClauses(parsed);
      setSel([]);
      showToast("Clauze sugerate cu succes!", "success");
      if (isMobile) setPanel("result");
    } catch(e) {
      console.error("suggestClauses:", e);
      showToast("Eroare: " + (e.message || "Incearca din nou"), "error");
    }
    setLoadC(false);
  };

  var generateContract = async function() {
    setLoadG(true);
    var selC = sel.map(function(i){ return clauses[i]; }).filter(Boolean);
    var extra = selC.length ? "\n\nCLAUZE SPECIALE:\n" + selC.map(function(c,i){ return (i+1)+". "+c.titlu+": "+c.text; }).join("\n") : "";
    try {
      var prompt = "Redacteaza un contract complet in romana juridica formala, cu articole numerotate, conform legislatiei romane in vigoare.\n\nTIP CONTRACT: " + form.contractType + "\nPARTEA 1 (Furnizor): " + (form.p1Name||"_____") + ", CUI: " + (form.p1CUI||"_____") + ", Reg.Com.: " + (form.p1Reg||"_____") + ", Sediu: " + (form.p1Address||"_____") + ", Reprezentant: " + (form.p1Rep||"_____") + ", Email: " + (form.p1Email||"_____") + "\nPARTEA 2 (Beneficiar): " + (form.p2Name||"_____") + ", CUI: " + (form.p2CUI||"_____") + ", Reg.Com.: " + (form.p2Reg||"_____") + ", Sediu: " + (form.p2Address||"_____") + ", Reprezentant: " + (form.p2Rep||"_____") + ", Email: " + (form.p2Email||"_____") + "\nNr. contract: " + form.contractNo + "\nData: " + form.contractDate + "\nLocul incheierii: " + (form.location||"Bucuresti") + "\nScadenta: " + (form.dueDate||"_____") + "\nValoare: " + (form.value||"_____") + " " + form.currency + "\nPenalitati: " + form.penalties + "%/zi\nDurata: " + form.duration + "\nObiectul contractului: " + (form.object||"_____") + extra;
      var txt = await callClaude("contract", prompt);
      if (!txt) throw new Error("Raspuns gol");
      setContract(txt);
      showToast("Contract generat cu succes!", "success");
      if (isMobile) setPanel("result");
    } catch(e) {
      console.error("generateContract:", e);
      showToast("Eroare: " + (e.message || "Incearca din nou"), "error");
    }
    setLoadG(false);
  };

  var formContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      <div style={{ marginBottom:16 }}>
        <label style={LBL}>Tip Contract</label>
        <select value={form.contractType} onChange={e=>upd("contractType",e.target.value)} style={{ ...INP,cursor:"pointer" }}>
          {Object.keys(CONTRACT_TYPES).map(function(g){ return (
            <optgroup key={g} label={g}>{CONTRACT_TYPES[g].map(function(o){ return <option key={o}>{o}</option>; })}</optgroup>
          ); })}
        </select>
      </div>
      {[["Furnizor / Vânzător","#818cf8","p1"],["Beneficiar / Cumpărător","#6ee7b7","p2"]].map(function(row){ return (
        <div key={row[2]} style={{ background:"#0a1220",borderRadius:12,padding:14,marginBottom:14 }}>
          <div style={{ color:row[1],fontSize:11,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5 }}>Partea — {row[0]}</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {[["Name","Denumire / Nume"],["CUI","CUI / CNP"],["Reg","Nr. Reg. Comerțului"],["Address","Sediu social"],["Rep","Reprezentant legal"],["Email","Email"]].map(function(f){ return (
              <div key={f[0]}><label style={LBL}>{f[1]}</label><input value={form[row[2]+f[0]]} onChange={e=>upd(row[2]+f[0],e.target.value)} style={INP} placeholder={f[1]} /></div>
            ); })}
          </div>
        </div>
      ); })}
      <div style={{ background:"#0a1220",borderRadius:12,padding:14,marginBottom:16 }}>
        <div style={{ color:"#fbbf24",fontSize:11,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5 }}>Date Contract</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[["contractNo","Nr. Contract","text"],["contractDate","Data","date"],["location","Locul","text"],["dueDate","Scadența","date"]].map(function(f){ return (
            <div key={f[0]}><label style={LBL}>{f[1]}</label><input type={f[2]} value={form[f[0]]} onChange={e=>upd(f[0],e.target.value)} style={INP} /></div>
          ); })}
          <div><label style={LBL}>Valoare</label><input type="number" value={form.value} onChange={e=>upd("value",e.target.value)} style={INP} placeholder="0" /></div>
          <div><label style={LBL}>Monedă</label><select value={form.currency} onChange={e=>upd("currency",e.target.value)} style={{ ...INP,cursor:"pointer" }}>{["RON","EUR","USD"].map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={LBL}>Penalități %/zi</label><input type="number" value={form.penalties} onChange={e=>upd("penalties",e.target.value)} step=".01" style={INP} /></div>
          <div><label style={LBL}>Durată</label><select value={form.duration} onChange={e=>upd("duration",e.target.value)} style={{ ...INP,cursor:"pointer" }}>{["determinată","nedeterminată"].map(d=><option key={d}>{d}</option>)}</select></div>
        </div>
        <div style={{ marginTop:10 }}><label style={LBL}>Obiectul contractului *</label><textarea rows={3} value={form.object} onChange={e=>upd("object",e.target.value)} style={{ ...INP,resize:"vertical" }} placeholder="Descrieți obiectul contractului..." /></div>
      </div>
      <div style={{ display:"flex",gap:10,flexDirection:isMobile?"column":"row" }}>
        <button onClick={suggestClauses} disabled={loadC} style={{ flex:1,background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"12px",color:"#e2e8f0",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:loadC?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loadC?.7:1 }}>
          {loadC ? <><Spinner /> Se generează...</> : "✨ Sugerează Clauze AI"}
        </button>
        <button onClick={generateContract} disabled={loadG} style={{ flex:1,background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:"12px",color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:loadG?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loadG?.7:1 }}>
          {loadG ? <><Spinner /> Se generează...</> : "📄 Generează Contract"}
        </button>
      </div>
    </div>
  );

  var resultContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      {isMobile && <button onClick={()=>setPanel("form")} style={{ background:"#1e293b",border:"none",borderRadius:8,padding:"8px 14px",color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",marginBottom:16,display:"flex",alignItems:"center",gap:6 }}>← Formular</button>}
      {clauses.length>0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ color:"#818cf8",fontSize:11,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5 }}>✨ Clauze Sugerate — selectează pentru incluziune</div>
          {clauses.map(function(c,i){ return (
            <div key={i} onClick={()=>toggleSel(i)} style={{ background:sel.indexOf(i)>=0?"#818cf810":"#0f172a",border:"1px solid "+(sel.indexOf(i)>=0?"#818cf8":"#1e293b"),borderRadius:12,padding:14,marginBottom:10,cursor:"pointer",transition:"all .2s" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:17,height:17,border:"2px solid "+(sel.indexOf(i)>=0?"#818cf8":"#334155"),borderRadius:4,background:sel.indexOf(i)>=0?"#818cf8":"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{sel.indexOf(i)>=0&&<span style={{ color:"#070d1a",fontSize:11,fontWeight:700 }}>✓</span>}</div>
                <span style={{ fontWeight:700,fontSize:13,color:"#e2e8f0" }}>{c.titlu}</span>
              </div>
              <div style={{ color:"#64748b",fontSize:12,marginTop:8,lineHeight:1.6,paddingLeft:27 }}>{c.descriere}</div>
            </div>
          ); })}
        </div>
      )}
      {contract ? (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8 }}>
            <div style={{ color:"#10b981",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>📄 Contract Generat</div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>{navigator.clipboard.writeText(contract);showToast("Contract copiat!","success");}} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer" }}>📋 Copiază</button>
              <button onClick={()=>window.print()} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer" }}>🖨️ Print</button>
            </div>
          </div>
          <div style={{ background:"#0a1628",border:"1px solid #1e293b",borderRadius:12,padding:18,whiteSpace:"pre-wrap",fontSize:12,color:"#94a3b8",lineHeight:1.8,maxHeight:400,overflowY:"auto",fontFamily:"'DM Sans',sans-serif" }}>{contract}</div>
        </div>
      ) : !clauses.length && (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:240,textAlign:"center",padding:20 }}>
          <div style={{ fontSize:52,marginBottom:14 }}>📜</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#475569",marginBottom:8 }}>Niciun contract generat</div>
          <div style={{ fontSize:13,color:"#334155",maxWidth:280,lineHeight:1.5 }}>Completează formularul și apasă „Generează Contract".</div>
        </div>
      )}
    </div>
  );

  if (isMobile) return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",overflow:"hidden" }}>
      <div style={{ display:"flex",borderBottom:"1px solid #1e293b",flexShrink:0 }}>
        {[["form","✏️ Formular"],["result","📄 Rezultat"]].map(function(x){ return (
          <button key={x[0]} onClick={()=>setPanel(x[0])} style={{ flex:1,background:panel===x[0]?"#1e293b":"none",border:"none",borderBottom:"2px solid "+(panel===x[0]?"#818cf8":"transparent"),padding:"12px 0",color:panel===x[0]?"#e2e8f0":"#64748b",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer" }}>{x[1]}</button>
        ); })}
      </div>
      {panel==="form" ? formContent : resultContent}
    </div>
  );
  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",height:"100%",overflow:"hidden" }}>
      {formContent}
      <div style={{ borderLeft:"1px solid #1e293b" }}>{resultContent}</div>
    </div>
  );
}

function EmailModule({ showToast }) {
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState("form");
  const emailTypes = EMAIL_TYPES;
  const tones = EMAIL_TONES;
  const [form, setForm] = useState({ emailType:"Emitere factură nouă",tone:"profesional",from:"",toName:"",toCompany:"",invoiceNo:"",amount:"",dueDate:"",details:"",language:"română" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const upd = (k,v) => setForm(function(f){ var n={};Object.assign(n,f);n[k]=v;return n; });
  const INP = { background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:13,fontFamily:"'DM Sans',sans-serif",width:"100%",boxSizing:"border-box",outline:"none" };
  const LBL = { color:"#64748b",fontSize:11,marginBottom:5,display:"block",fontWeight:600,textTransform:"uppercase",letterSpacing:.4 };

  var generate = async function() {
    setLoading(true);
    try {
      var prompt = "Genereaza un email business profesional in " + form.language + ".\nTip email: " + form.emailType + "\nTon: " + form.tone + "\nDe la: " + (form.from||"Compania noastra") + "\nCatre: " + (form.toName||"Client") + " (" + (form.toCompany||"") + ")\nNr. factura: " + (form.invoiceNo||"-") + "\nSuma: " + (form.amount||"-") + " RON\nScadenta: " + (form.dueDate||"-") + "\nDetalii: " + (form.details||"-") + "\n\nRaspunde DOAR cu JSON, fara alt text, fara markdown:\n{\"subiect\":\"subiectul emailului\",\"corp\":\"corpul complet al emailului\"}";
      var txt = await callClaude("email", prompt);
      var parsed = extractJSON(txt);
      if (!parsed.subiect || !parsed.corp) throw new Error("Raspuns incomplet — lipsesc campuri");
      setResult(parsed);
      showToast("Email generat!", "success");
      if (isMobile) setPanel("result");
    } catch(e) {
      console.error("generateEmail:", e);
      showToast("Eroare: " + (e.message || "Incearca din nou"), "error");
    }
    setLoading(false);
  };

  var formContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      <div style={{ marginBottom:14 }}><label style={LBL}>Tip Email</label><select value={form.emailType} onChange={e=>upd("emailType",e.target.value)} style={{ ...INP,cursor:"pointer" }}>{emailTypes.map(t=><option key={t}>{t}</option>)}</select></div>
      <div style={{ marginBottom:14 }}>
        <label style={LBL}>Ton</label>
        <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
          {tones.map(function(t){ return <button key={t.v} onClick={()=>upd("tone",t.v)} style={{ background:form.tone===t.v?"#818cf815":"none",border:"1px solid "+(form.tone===t.v?"#818cf8":"#1e293b"),borderRadius:100,padding:"6px 13px",color:form.tone===t.v?"#818cf8":"#64748b",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer" }}>{t.l}</button>; })}
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
        {[["from","De la (companie)"],["toName","Către (nume)"],["toCompany","Compania destinatarului"],["invoiceNo","Nr. Factură"],["amount","Sumă (RON)"]].map(function(f){ return <div key={f[0]}><label style={LBL}>{f[1]}</label><input value={form[f[0]]} onChange={e=>upd(f[0],e.target.value)} style={INP} placeholder={f[1]} /></div>; })}
        <div><label style={LBL}>Data Scadenței</label><input type="date" value={form.dueDate} onChange={e=>upd("dueDate",e.target.value)} style={INP} /></div>
        <div><label style={LBL}>Detalii suplimentare</label><textarea rows={3} value={form.details} onChange={e=>upd("details",e.target.value)} style={{ ...INP,resize:"vertical" }} placeholder="Informații relevante..." /></div>
        <div><label style={LBL}>Limbă</label><select value={form.language} onChange={e=>upd("language",e.target.value)} style={{ ...INP,cursor:"pointer" }}>{["română","engleză","franceză"].map(l=><option key={l}>{l}</option>)}</select></div>
      </div>
      <button onClick={generate} disabled={loading} style={{ width:"100%",marginTop:18,background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:11,padding:13,color:"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.7:1 }}>
        {loading ? <><Spinner /> Se generează...</> : "✉️ Generează Email"}
      </button>
    </div>
  );

  var resultContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      {isMobile && <button onClick={()=>setPanel("form")} style={{ background:"#1e293b",border:"none",borderRadius:8,padding:"8px 14px",color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",marginBottom:16,display:"flex",alignItems:"center",gap:6 }}>← Configurare</button>}
      {result ? (
        <div>
          <div style={{ background:"#0f172a",border:"1px solid #818cf840",borderRadius:12,padding:14,marginBottom:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8,flexWrap:"wrap" }}>
              <span style={{ color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:1,fontWeight:700 }}>SUBIECT</span>
              <button onClick={()=>{navigator.clipboard.writeText(result.subiect);showToast("Subiect copiat!","success");}} style={{ background:"#1e293b",border:"none",borderRadius:6,padding:"4px 10px",color:"#94a3b8",fontSize:11,cursor:"pointer" }}>📋 Copiază</button>
            </div>
            <div style={{ color:"#e2e8f0",fontWeight:700,fontSize:14,lineHeight:1.4 }}>{result.subiect}</div>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8 }}>
            <div style={{ color:"#6ee7b7",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>📧 Corp Email</div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>{navigator.clipboard.writeText(result.corp);showToast("Email copiat!","success");}} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600 }}>📋 Copiază</button>
              <button onClick={()=>setResult(null)} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600 }}>🔄 Nou</button>
            </div>
          </div>
          <div style={{ background:"#0a1628",border:"1px solid #1e293b",borderRadius:12,padding:16,whiteSpace:"pre-wrap",fontSize:13,color:"#94a3b8",lineHeight:1.8,maxHeight:400,overflowY:"auto",fontFamily:"'DM Sans',sans-serif" }}>{result.corp}</div>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:240,textAlign:"center",padding:20 }}>
          <div style={{ fontSize:52,marginBottom:14 }}>📧</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#475569",marginBottom:8 }}>Niciun email generat</div>
          <div style={{ fontSize:13,color:"#334155",maxWidth:280 }}>Configurează tipul și tonul, apoi apasă „Generează Email".</div>
        </div>
      )}
    </div>
  );

  if (isMobile) return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",overflow:"hidden" }}>
      <div style={{ display:"flex",borderBottom:"1px solid #1e293b",flexShrink:0 }}>
        {[["form","✏️ Configurare"],["result","📧 Email"]].map(function(x){ return (
          <button key={x[0]} onClick={()=>setPanel(x[0])} style={{ flex:1,background:panel===x[0]?"#1e293b":"none",border:"none",borderBottom:"2px solid "+(panel===x[0]?"#818cf8":"transparent"),padding:"12px 0",color:panel===x[0]?"#e2e8f0":"#64748b",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer" }}>{x[1]}</button>
        ); })}
      </div>
      {panel==="form" ? formContent : resultContent}
    </div>
  );
  return (
    <div style={{ display:"grid",gridTemplateColumns:"360px 1fr",height:"100%",overflow:"hidden" }}>
      {formContent}
      <div style={{ borderLeft:"1px solid #1e293b" }}>{resultContent}</div>
    </div>
  );
}

function AnalysisModule({ showToast }) {
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState("upload");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  var processFile = async function(f) {
    setFile(f);
    var ext = f.name.split(".").pop().toLowerCase();
    if (ext === "txt") {
      var r = new FileReader();
      r.onload = function(e) { setText(e.target.result); };
      r.readAsText(f);
    } else if (ext === "docx") {
      if (window.mammoth) {
        var ab = await f.arrayBuffer();
        var res = await window.mammoth.extractRawText({ arrayBuffer: ab });
        setText(res.value);
      } else { showToast("Mammoth nu este disponibil.", "error"); }
    } else if (ext === "pdf") {
      // Extragere text client-side (pdf.js) — gratuit, fără apel Claude.
      try {
        var pdfTxt = await extractPdfText(f);
        if (!pdfTxt) throw new Error("Nu am găsit text în PDF (poate fi scanat/imagine).");
        setText(pdfTxt);
        showToast("PDF procesat!", "success");
      } catch(err) { showToast("Eroare PDF: " + err.message, "error"); }
    } else {
      showToast("Format nesuportat. Folosește PDF, DOCX sau TXT.", "error");
    }
  };

  var analyze = async function() {
    setLoading(true);
    try {
      var contractText = text.slice(0, 6000);
      var prompt = "Esti expert juridic roman. Analizeaza contractul de mai jos si returneaza EXCLUSIV JSON valid, fara markdown, fara text inainte sau dupa.\nStructura JSON ceruta:\n{\"rezumat\":{\"tip\":\"tipul contractului\",\"parti\":\"partile implicate\",\"valoare\":\"valoarea\",\"durata\":\"durata\",\"scor\":\"Scazut sau Mediu sau Ridicat sau Critic\"},\"riscuri\":[{\"titlu\":\"titlu risc\",\"categorie\":\"Financiar sau Juridic sau Operational sau Fiscal\",\"severitate\":\"Critic sau Ridicat sau Mediu sau Scazut\",\"descriere\":\"descriere\",\"clauza\":\"textul clauzei\",\"remediere\":\"cum se remediaza\"}],\"clauze_lipsa\":[{\"titlu\":\"clauza lipsa\",\"importanta\":\"de ce e importanta\",\"sugestie\":\"text sugerat\"}],\"recomandari\":[\"recomandare 1\",\"recomandare 2\"],\"avocat\":{\"necesar\":true,\"motiv\":\"motivul\"}}\n\nCONTRACT:\n" + contractText;
      var txt = await callClaude("analysis", prompt);
      var parsed = extractJSON(txt);
      setResult(parsed);
      showToast("Analiză completă!", "success");
      if (isMobile) setPanel("result");
    } catch(e) {
      console.error("analyze:", e);
      showToast("Eroare: " + (e.message || "Incearca din nou"), "error");
    }
    setLoading(false);
  };

  var SC = { "Scazut":"#10b981","Scăzut":"#10b981","Mediu":"#fbbf24","Ridicat":"#f97316","Critic":"#ef4444" };

  var uploadContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      <div onClick={()=>fileRef.current&&fileRef.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);var f=e.dataTransfer.files[0];if(f)processFile(f);}}
        style={{ border:"2px dashed "+(drag?"#818cf8":"#334155"),borderRadius:14,padding:28,textAlign:"center",cursor:"pointer",background:drag?"#818cf808":"none",transition:"all .2s",marginBottom:16 }}>
        <div style={{ fontSize:36,marginBottom:10 }}>{file?"📄":"📂"}</div>
        {file ? (
          <div><div style={{ color:"#e2e8f0",fontWeight:700,fontSize:14,marginBottom:4 }}>{file.name}</div><div style={{ color:"#64748b",fontSize:12 }}>{(file.size/1024).toFixed(1)} KB</div></div>
        ) : (
          <div><div style={{ color:"#94a3b8",fontWeight:600,fontSize:14,marginBottom:6 }}>Trage fișierul sau apasă</div><div style={{ color:"#475569",fontSize:12 }}>PDF, DOCX, TXT</div></div>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display:"none" }} onChange={e=>{if(e.target.files[0])processFile(e.target.files[0]);}} />
      </div>
      {text && (
        <div style={{ background:"#0f172a",border:"1px solid #10b98130",borderRadius:12,padding:14,marginBottom:14 }}>
          <div style={{ color:"#10b981",fontSize:11,fontWeight:700,marginBottom:8 }}>✓ TEXT EXTRAS</div>
          <div style={{ color:"#64748b",fontSize:12,lineHeight:1.5 }}>{text.slice(0,180)}...</div>
          <div style={{ color:"#475569",fontSize:11,marginTop:8 }}>{text.length.toLocaleString("ro-RO")} caractere</div>
        </div>
      )}
      <button onClick={analyze} disabled={loading||!text} style={{ width:"100%",background:!text?"#1e293b":"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:11,padding:13,color:!text?"#475569":"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:(!text||loading)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.7:1,marginBottom:16 }}>
        {loading ? <><Spinner /> Analizează...</> : "🔍 Analizează Contractul"}
      </button>
      <div style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:14 }}>
        <div style={{ color:"#64748b",fontSize:11,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:.5 }}>Sau paste text direct:</div>
        <textarea rows={5} value={text} onChange={e=>setText(e.target.value)} style={{ background:"#070d1a",border:"1px solid #1e293b",borderRadius:8,padding:"10px 13px",color:"#94a3b8",fontSize:12,fontFamily:"'DM Sans',sans-serif",width:"100%",boxSizing:"border-box",outline:"none",resize:"vertical",lineHeight:1.5 }} placeholder="Lipește textul contractului..." />
      </div>
    </div>
  );

  var resultContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      {isMobile && <button onClick={()=>setPanel("upload")} style={{ background:"#1e293b",border:"none",borderRadius:8,padding:"8px 14px",color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",marginBottom:16,display:"flex",alignItems:"center",gap:6 }}>← Upload</button>}
      {result ? (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20 }}>
            <div style={{ background:"#0f172a",border:"1px solid "+(SC[result.rezumat&&result.rezumat.scor]||"#818cf8")+"30",borderRadius:12,padding:14,textAlign:"center" }}>
              <div style={{ color:"#64748b",fontSize:10,marginBottom:6 }}>SCOR RISC</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:isMobile?18:24,color:SC[result.rezumat&&result.rezumat.scor]||"#818cf8" }}>{result.rezumat&&result.rezumat.scor||"N/A"}</div>
            </div>
            <div style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:14,textAlign:"center" }}>
              <div style={{ color:"#64748b",fontSize:10,marginBottom:6 }}>TIP CONTRACT</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"#e2e8f0",lineHeight:1.3 }}>{result.rezumat&&result.rezumat.tip||"—"}</div>
            </div>
            <div style={{ background:"#0f172a",border:"1px solid "+(result.avocat&&result.avocat.necesar?"#ef444430":"#10b98130"),borderRadius:12,padding:14,textAlign:"center" }}>
              <div style={{ color:"#64748b",fontSize:10,marginBottom:6 }}>AVOCAT</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:isMobile?16:20,color:result.avocat&&result.avocat.necesar?"#ef4444":"#10b981" }}>{result.avocat&&result.avocat.necesar?"DA":"NU"}</div>
            </div>
          </div>
          {result.riscuri&&result.riscuri.length>0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ color:"#ef4444",fontSize:11,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5 }}>⚠️ Riscuri ({result.riscuri.length})</div>
              {result.riscuri.map(function(r,i){ return (
                <div key={i} style={{ background:"#0f172a",border:"1px solid #1e293b",borderLeft:"3px solid "+(SC[r.severitate]||"#818cf8"),borderRadius:"0 12px 12px 0",padding:14,marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:7,flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700,fontSize:13,color:"#e2e8f0" }}>{r.titlu}</span>
                    <span style={{ background:(SC[r.severitate]||"#818cf8")+"20",color:SC[r.severitate]||"#818cf8",fontSize:10,padding:"2px 8px",borderRadius:100,fontWeight:700 }}>{r.severitate}</span>
                    <span style={{ background:"#1e293b",color:"#64748b",fontSize:10,padding:"2px 8px",borderRadius:100 }}>{r.categorie}</span>
                  </div>
                  <p style={{ color:"#64748b",fontSize:12,lineHeight:1.5,margin:"0 0 7px" }}>{r.descriere}</p>
                  {r.clauza&&<div style={{ background:"#0a1628",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#94a3b8",fontStyle:"italic",marginBottom:7,lineHeight:1.5 }}>{r.clauza}</div>}
                  {r.remediere&&<div style={{ color:"#6ee7b7",fontSize:12,lineHeight:1.5 }}>💡 {r.remediere}</div>}
                </div>
              ); })}
            </div>
          )}
          {result.clauze_lipsa&&result.clauze_lipsa.length>0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ color:"#fbbf24",fontSize:11,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5 }}>📋 Clauze Lipsă</div>
              {result.clauze_lipsa.map(function(c,i){ return (
                <div key={i} style={{ background:"#0f172a",border:"1px solid #fbbf2420",borderRadius:12,padding:14,marginBottom:10 }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#fbbf24",marginBottom:5 }}>{c.titlu}</div>
                  <div style={{ color:"#64748b",fontSize:12,marginBottom:6 }}>{c.importanta}</div>
                  {c.sugestie&&<div style={{ color:"#94a3b8",fontSize:11,lineHeight:1.5,fontStyle:"italic" }}>{c.sugestie}</div>}
                </div>
              ); })}
            </div>
          )}
          {result.recomandari&&result.recomandari.length>0 && (
            <div>
              <div style={{ color:"#818cf8",fontSize:11,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5 }}>🎯 Recomandări</div>
              {result.recomandari.map(function(r,i){ return (
                <div key={i} style={{ display:"flex",gap:10,marginBottom:9,alignItems:"flex-start" }}>
                  <span style={{ color:"#818cf8",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,flexShrink:0 }}>{i+1}.</span>
                  <span style={{ color:"#94a3b8",fontSize:13,lineHeight:1.5 }}>{r}</span>
                </div>
              ); })}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:240,textAlign:"center",padding:20 }}>
          <div style={{ fontSize:52,marginBottom:14 }}>🔍</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#475569",marginBottom:8 }}>Niciun contract analizat</div>
          <div style={{ fontSize:13,color:"#334155",maxWidth:280 }}>Încarcă un fișier și apasă „Analizează Contractul".</div>
        </div>
      )}
    </div>
  );

  if (isMobile) return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",overflow:"hidden" }}>
      <div style={{ display:"flex",borderBottom:"1px solid #1e293b",flexShrink:0 }}>
        {[["upload","📂 Upload"],["result","📊 Raport"]].map(function(x){ return (
          <button key={x[0]} onClick={()=>setPanel(x[0])} style={{ flex:1,background:panel===x[0]?"#1e293b":"none",border:"none",borderBottom:"2px solid "+(panel===x[0]?"#818cf8":"transparent"),padding:"12px 0",color:panel===x[0]?"#e2e8f0":"#64748b",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer" }}>{x[1]}</button>
        ); })}
      </div>
      {panel==="upload" ? uploadContent : resultContent}
    </div>
  );
  return (
    <div style={{ display:"grid",gridTemplateColumns:"330px 1fr",height:"100%",overflow:"hidden" }}>
      {uploadContent}
      <div style={{ borderLeft:"1px solid #1e293b" }}>{resultContent}</div>
    </div>
  );
}

function Dashboard({ onBack }) {
  const [tab, setTab] = useState("contracte");
  const [toast, setToast] = useState(null);
  const isMobile = useIsMobile();
  const showToast = (msg, type) => setToast({ msg, type:type||"info" });
  const tabs = [{id:"contracte",icon:"📜",label:"Contracte"},{id:"emailuri",icon:"📧",label:"Email-uri"},{id:"analiza",icon:"🔍",label:"Analiză"}];
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",background:"#070d1a",fontFamily:"'DM Sans',sans-serif",color:"#e2e8f0" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <div style={{ height:56,background:"#0a1220",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",padding:"0 12px",gap:10,flexShrink:0,zIndex:10,minWidth:0 }}>
        <button onClick={onBack} style={{ background:"#1e293b",border:"none",borderRadius:8,padding:"6px 10px",color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",flexShrink:0,whiteSpace:"nowrap" }}>← {!isMobile&&"Înapoi"}</button>
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
          <span style={{ fontSize:18 }}>⚖️</span>
          {!isMobile&&<span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#e2e8f0" }}>Lex<span style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>AI</span> Pro</span>}
        </div>
        {!isMobile && (
          <div style={{ display:"flex",gap:4,flex:1,justifyContent:"center" }}>
            {tabs.map(function(t){ return <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:tab===t.id?"#1e293b":"none",border:"1px solid "+(tab===t.id?"#334155":"transparent"),borderRadius:8,padding:"6px 16px",color:tab===t.id?"#e2e8f0":"#64748b",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap" }}>{t.icon} {t.label}</button>; })}
          </div>
        )}
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
          <span style={{ width:7,height:7,background:"#10b981",borderRadius:"50%",animation:"pulse 2s infinite",display:"inline-block",flexShrink:0 }} />
          {!isMobile&&<span style={{ color:"#10b981",fontSize:12,fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:"nowrap" }}>Pro Business</span>}
        </div>
      </div>
      <div style={{ flex:1,overflow:"hidden",minHeight:0 }}>
        {tab==="contracte"&&<ContractModule showToast={showToast} />}
        {tab==="emailuri"&&<EmailModule showToast={showToast} />}
        {tab==="analiza"&&<AnalysisModule showToast={showToast} />}
      </div>
      {isMobile && (
        <div style={{ display:"flex",borderTop:"1px solid #1e293b",background:"#0a1220",flexShrink:0,zIndex:10 }}>
          {tabs.map(function(t){ return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,background:"none",border:"none",borderTop:"2px solid "+(tab===t.id?"#818cf8":"transparent"),padding:"10px 4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer" }}>
              <span style={{ fontSize:20 }}>{t.icon}</span>
              <span style={{ color:tab===t.id?"#818cf8":"#475569",fontSize:10,fontFamily:"'Syne',sans-serif",fontWeight:700 }}>{t.label}</span>
            </button>
          ); })}
        </div>
      )}
      <div style={{ padding:"6px 14px",borderTop:"1px solid #1e293b",background:"#050b16",textAlign:"center",fontSize:10,color:"#334155",flexShrink:0,lineHeight:1.4 }}>⚠️ Asistență informativă. Consultați un avocat autorizat.</div>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;}
    body{background:#070d1a;color:#e2e8f0;overflow-x:hidden;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-track{background:#0f172a;}
    ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
    select option{background:#0f172a;color:#e2e8f0;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    input:focus,select:focus,textarea:focus{border-color:#818cf8!important;box-shadow:0 0 0 2px rgba(129,140,248,.15);}
    input::placeholder,textarea::placeholder{color:#475569;}
    button{-webkit-tap-highlight-color:transparent;}
  `}</style>
);

export default function App() {
  const [page, setPage] = useState("landing");
  return (
    <>
      <GlobalStyles />
      {page==="landing"
        ? <LandingPage onEnterApp={()=>setPage("dashboard")} />
        : <Dashboard onBack={()=>setPage("landing")} />}
    </>
  );
}
