// NOTE: migrare TS planificată (formularul folosește indexare dinamică form[key]).
import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Spinner } from "../components/Spinner";
import { callClaude, extractJSON } from "../lib/claude";
import { CONTRACT_TYPES } from "../data/contractTypes";

export default function ContractModule({ showToast }) {
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
