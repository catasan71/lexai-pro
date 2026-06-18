import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Toast } from "../components/Toast";
import ContractModule from "../modules/ContractModule";
import EmailModule from "../modules/EmailModule";
import AnalysisModule from "../modules/AnalysisModule";
import type { ShowToast, ToastState } from "../types";

interface DashboardProps {
  onBack: () => void;
}

type Tab = "contracte" | "emailuri" | "analiza";

export default function Dashboard({ onBack }: DashboardProps) {
  const [tab, setTab] = useState<Tab>("contracte");
  const [toast, setToast] = useState<ToastState | null>(null);
  const isMobile = useIsMobile();
  const showToast: ShowToast = (msg, type) => setToast({ msg, type: type || "info" });
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "contracte", icon: "📜", label: "Contracte" },
    { id: "emailuri", icon: "📧", label: "Email-uri" },
    { id: "analiza", icon: "🔍", label: "Analiză" },
  ];
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
