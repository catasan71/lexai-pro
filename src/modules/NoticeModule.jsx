// NOTE: migrare TS planificată — câmpurile dinamice din noticeTypes fac indexarea complexă.
import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Spinner } from "../components/Spinner";
import { callClaude } from "../lib/claude";
import { saveDocument } from "../lib/documents";
import { exportDocx, exportPdf } from "../lib/export";
import { NOTICE_TYPES } from "../data/noticeTypes";

export default function NoticeModule({ showToast }) {
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState("form");
  const [selected, setSelected] = useState(NOTICE_TYPES[0]);
  const [form, setForm] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadExp, setLoadExp] = useState(null);

  var upd = function(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); };

  var generate = async function() {
    var missing = selected.fields.filter(function(f) { return f.required && !form[f.key]; });
    if (missing.length) {
      showToast("Completează câmpurile obligatorii: " + missing.map(function(f) { return f.label; }).join(", "), "error");
      return;
    }
    setLoading(true);
    try {
      var prompt = selected.promptTemplate(form);
      var txt = await callClaude("contract", prompt); // contract task → Sonnet, 4000 tokens
      if (!txt) throw new Error("Răspuns gol");
      setResult(txt);
      saveDocument("contract", selected.label + " — " + new Date().toLocaleDateString("ro-RO"), { text: txt, type: selected.id });
      showToast("Document generat!", "success");
      if (isMobile) setPanel("result");
    } catch(e) {
      showToast("Eroare: " + (e.message || "Încearcă din nou"), "error");
    }
    setLoading(false);
  };

  var doExport = async function(type) {
    if (!result) return;
    setLoadExp(type);
    try {
      var title = selected.label + " " + new Date().toLocaleDateString("ro-RO");
      if (type === "docx") await exportDocx(title, result);
      else await exportPdf(title, result);
    } catch(e) { showToast("Eroare export: " + e.message, "error"); }
    setLoadExp(null);
  };

  var INP = { background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:13,fontFamily:"'DM Sans',sans-serif",width:"100%",boxSizing:"border-box",outline:"none" };
  var LBL = { color:"#64748b",fontSize:11,marginBottom:5,display:"block",fontWeight:600,textTransform:"uppercase",letterSpacing:.4 };

  var formContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      {/* Selector tip document */}
      <div style={{ marginBottom:18 }}>
        <label style={LBL}>Tip document juridic</label>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:8 }}>
          {NOTICE_TYPES.map(function(t) { return (
            <button key={t.id} onClick={function() { setSelected(t); setForm({}); setResult(""); }}
              style={{ background:selected.id===t.id?"#1e293b":"#0f172a",border:"1px solid "+(selected.id===t.id?t.color:"#1e293b"),borderRadius:10,padding:"10px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .15s" }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontSize:10,fontFamily:"'Syne',sans-serif",fontWeight:700,color:selected.id===t.id?t.color:"#64748b",textAlign:"center",lineHeight:1.3 }}>{t.label}</span>
            </button>
          ); })}
        </div>
      </div>

      {/* Câmpuri dinamice */}
      <div style={{ background:"#0a1220",borderRadius:12,padding:14,marginBottom:16 }}>
        <div style={{ color:selected.color,fontSize:11,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:.5 }}>
          {selected.icon} {selected.label}
        </div>
        {selected.fields.map(function(f) { return (
          <div key={f.key} style={{ marginBottom:12 }}>
            <label style={LBL}>{f.label}{f.required && <span style={{ color:"#ef4444" }}> *</span>}</label>
            {f.type === "textarea" ? (
              <textarea rows={3} value={form[f.key]||""} onChange={function(e) { upd(f.key,e.target.value); }}
                style={{ ...INP,resize:"vertical",lineHeight:1.5 }} placeholder={f.label + "..."} />
            ) : (
              <input type={f.type||"text"} value={form[f.key]||""} onChange={function(e) { upd(f.key,e.target.value); }}
                style={INP} placeholder={f.label} />
            )}
          </div>
        ); })}
      </div>

      <button onClick={generate} disabled={loading}
        style={{ width:"100%",background:loading?"#1e293b":"linear-gradient(135deg,"+selected.color+"cc,"+selected.color+")",border:"none",borderRadius:11,padding:13,color:loading?"#475569":"#070d1a",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.7:1 }}>
        {loading ? <><Spinner /> Se generează...</> : selected.icon + " Generează " + selected.label}
      </button>
    </div>
  );

  var resultContent = (
    <div style={{ overflowY:"auto",padding:isMobile?16:24,flex:1 }}>
      {isMobile && (
        <button onClick={function() { setPanel("form"); }} style={{ background:"#1e293b",border:"none",borderRadius:8,padding:"8px 14px",color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",marginBottom:16 }}>← Formular</button>
      )}
      {result ? (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8 }}>
            <div style={{ color:"#10b981",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>
              {selected.icon} {selected.label} Generat
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              <button onClick={function() { navigator.clipboard.writeText(result); showToast("Copiat!","success"); }}
                style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#e2e8f0",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer" }}>📋 Copiază</button>
              <button onClick={function() { doExport("docx"); }} disabled={!!loadExp}
                style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#818cf8",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,cursor:loadExp?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:5,opacity:loadExp?.7:1 }}>
                {loadExp==="docx"?<><Spinner/>...</>:"📝 Word"}
              </button>
              <button onClick={function() { doExport("pdf"); }} disabled={!!loadExp}
                style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#f472b6",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,cursor:loadExp?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:5,opacity:loadExp?.7:1 }}>
                {loadExp==="pdf"?<><Spinner/>...</>:"📕 PDF"}
              </button>
            </div>
          </div>
          <div style={{ background:"#0a1628",border:"1px solid #1e293b",borderRadius:12,padding:18,whiteSpace:"pre-wrap",fontSize:12,color:"#94a3b8",lineHeight:1.8,maxHeight:500,overflowY:"auto",fontFamily:"'DM Sans',sans-serif" }}>
            {result}
          </div>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:280,textAlign:"center",padding:20 }}>
          <div style={{ fontSize:52,marginBottom:14 }}>{selected.icon}</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#475569",marginBottom:8 }}>Niciun document generat</div>
          <div style={{ fontSize:13,color:"#334155",maxWidth:300,lineHeight:1.5 }}>Completează formularul și apasă „Generează".</div>
        </div>
      )}
    </div>
  );

  if (isMobile) return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",overflow:"hidden" }}>
      <div style={{ display:"flex",borderBottom:"1px solid #1e293b",flexShrink:0 }}>
        {[["form","✏️ Formular"],["result","📄 Document"]].map(function(x) { return (
          <button key={x[0]} onClick={function() { setPanel(x[0]); }}
            style={{ flex:1,background:panel===x[0]?"#1e293b":"none",border:"none",borderBottom:"2px solid "+(panel===x[0]?selected.color:"transparent"),padding:"12px 0",color:panel===x[0]?"#e2e8f0":"#64748b",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer" }}>{x[1]}</button>
        ); })}
      </div>
      {panel==="form" ? formContent : resultContent}
    </div>
  );
  return (
    <div style={{ display:"grid",gridTemplateColumns:"380px 1fr",height:"100%",overflow:"hidden" }}>
      {formContent}
      <div style={{ borderLeft:"1px solid #1e293b" }}>{resultContent}</div>
    </div>
  );
}
