import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { ParticlesBg } from "../components/ParticlesBg";
import { Toast } from "../components/Toast";
import { Modal } from "../components/Modal";

export default function LandingPage({ onEnterApp }) {
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
