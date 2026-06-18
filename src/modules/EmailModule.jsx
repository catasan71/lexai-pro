// NOTE: migrare TS planificată (formularul folosește indexare dinamică form[key]).
import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Spinner } from "../components/Spinner";
import { callClaude, extractJSON } from "../lib/claude";
import { saveDocument } from "../lib/documents";
import { EMAIL_TYPES, EMAIL_TONES } from "../data/emailTypes";

export default function EmailModule({ showToast }) {
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
      saveDocument("email", form.emailType + (form.toName ? " — " + form.toName : ""), parsed);
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
