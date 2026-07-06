import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAuth } from "../auth/AuthProvider";
import { Toast } from "../components/Toast";
import ContractModule from "../modules/ContractModule";
import EmailModule from "../modules/EmailModule";
import AnalysisModule from "../modules/AnalysisModule";
import HistoryModule from "../modules/HistoryModule";
import PlansModule from "../modules/PlansModule";
import NoticeModule from "../modules/NoticeModule";
import ContModule from "../modules/ContModule";
import type { ShowToast, ToastState } from "../types";

interface DashboardProps {
  onBack: () => void;
}

type Tab = "contracte" | "emailuri" | "analiza" | "documente" | "istoric" | "planuri" | "cont";

export default function Dashboard({ onBack }: DashboardProps) {
  const [tab, setTab] = useState<Tab>("contracte");
  const [toast, setToast] = useState<ToastState | null>(null);
  const isMobile = useIsMobile();
  const { user, profile, signOut } = useAuth();
  const showToast: ShowToast = (msg, type) => setToast({ msg, type: type || "info" });
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "contracte", icon: "📜", label: "Contracte" },
    { id: "emailuri", icon: "📧", label: "Email-uri" },
    { id: "analiza", icon: "🔍", label: "Analiză" },
    { id: "documente", icon: "📨", label: "Documente" },
    ...(user ? [{ id: "istoric" as Tab, icon: "🗂️", label: "Istoric" }] : []),
    { id: "planuri" as Tab, icon: "💳", label: "Planuri" },
    ...(user ? [{ id: "cont" as Tab, icon: "👤", label: "Cont" }] : []),
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",background:"#070d1a",fontFamily:"'Inter',sans-serif",color:"#e2e8f0" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <div style={{ height:56,background:"#0a1220",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",padding:"0 12px",gap:10,flexShrink:0,zIndex:10,minWidth:0 }}>
        <button onClick={onBack} style={{ background:"#1e293b",border:"none",borderRadius:8,padding:"6px 10px",color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif",flexShrink:0,whiteSpace:"nowrap" }}>← {!isMobile&&"Înapoi"}</button>
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
          <span style={{ fontSize:18 }}>⚖️</span>
          {!isMobile&&<span style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:16,color:"#e2e8f0" }}>Lex<span style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>AI</span> Pro</span>}
        </div>
        {!isMobile && (
          <div style={{ display:"flex",gap:4,flex:1,justifyContent:"center" }}>
            {tabs.map(function(t){ return <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:tab===t.id?"#1e293b":"none",border:"1px solid "+(tab===t.id?"#334155":"transparent"),borderRadius:8,padding:"6px 16px",color:tab===t.id?"#e2e8f0":"#64748b",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap" }}>{t.icon} {t.label}</button>; })}
          </div>
        )}
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          {user && profile ? (
            <>
              <span title="Credite disponibile" onClick={()=>setTab("planuri")} style={{ display:"flex",alignItems:"center",gap:5,background:"#1e293b",borderRadius:100,padding:"5px 12px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,color:profile.credits<5?"#f87171":"#6ee7b7",whiteSpace:"nowrap",cursor:"pointer" }}>⚡ {profile.credits}{!isMobile&&" credite"}</span>
              {profile.credits < 5 && !isMobile && (
                <button onClick={()=>setTab("planuri")} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:8,padding:"5px 12px",color:"#070d1a",cursor:"pointer",fontSize:11,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,whiteSpace:"nowrap",animation:"pulse 2s infinite" }}>+ Top-up</button>
              )}
              <button onClick={()=>signOut()} title="Deconectare" style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"5px 10px",color:"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap" }}>{isMobile?"⎋":"Ieși"}</button>
            </>
          ) : (
            <>
              <span style={{ width:7,height:7,background:"#10b981",borderRadius:"50%",animation:"pulse 2s infinite",display:"inline-block",flexShrink:0 }} />
              {!isMobile&&<span style={{ color:"#10b981",fontSize:12,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,whiteSpace:"nowrap" }}>Pro Business</span>}
            </>
          )}
        </div>
      </div>
      <div style={{ flex:1,overflow:"hidden",minHeight:0 }}>
        {tab==="contracte"&&<ContractModule showToast={showToast} />}
        {tab==="emailuri"&&<EmailModule showToast={showToast} />}
        {tab==="analiza"&&<AnalysisModule showToast={showToast} />}
        {tab==="istoric"&&<HistoryModule showToast={showToast} />}
        {tab==="documente"&&<NoticeModule showToast={showToast} />}
        {tab==="planuri"&&<PlansModule showToast={showToast} />}
        {tab==="cont"&&<ContModule showToast={showToast} />}
      </div>
      {isMobile && (
        <div style={{ display:"flex",borderTop:"1px solid #1e293b",background:"#0a1220",flexShrink:0,zIndex:10 }}>
          {tabs.map(function(t){ return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,background:"none",border:"none",borderTop:"2px solid "+(tab===t.id?"#818cf8":"transparent"),padding:"10px 4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer" }}>
              <span style={{ fontSize:20 }}>{t.icon}</span>
              <span style={{ color:tab===t.id?"#818cf8":"#475569",fontSize:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700 }}>{t.label}</span>
            </button>
          ); })}
        </div>
      )}
      <div style={{ padding:"6px 14px",borderTop:"1px solid #1e293b",background:"#050b16",textAlign:"center",fontSize:10,color:"#334155",flexShrink:0,lineHeight:1.4 }}>⚠️ Asistență informativă. Consultați un avocat autorizat.</div>
    </div>
  );
}
