import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Toast } from "./Toast";
import type { ModalType, ToastState } from "../types";

interface ModalProps {
  type: ModalType;
  onClose: () => void;
}

export function Modal({ type, onClose }: ModalProps) {
  const [sent, setSent] = useState(false);
  const [cf, setCf] = useState({ name: "", email: "", msg: "" });
  const [toast, setToast] = useState<ToastState | null>(null);
  const isMobile = useIsMobile();
  if (!type) return null;
  const titles: Record<string, string> = { terms:"Termeni și Condiții", gdpr:"GDPR & Confidențialitate", cookies:"Politica Cookies", contact:"Contact" };
  const INP = { background:"#070d1a",border:"1px solid #1e293b",borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"'DM Sans',sans-serif",width:"100%",boxSizing:"border-box" as const,outline:"none" };
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
