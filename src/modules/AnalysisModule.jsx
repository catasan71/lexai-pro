// NOTE: migrare TS planificată (rezultatul analizei e dinamic — vezi types.ts AnalysisResult).
import { useState, useRef } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Spinner } from "../components/Spinner";
import { callClaude, extractJSON } from "../lib/claude";
import { extractPdfText } from "../lib/pdf";

export default function AnalysisModule({ showToast }) {
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
