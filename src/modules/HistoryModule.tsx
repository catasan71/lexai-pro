import { useEffect, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Spinner } from "../components/Spinner";
import { listDocuments, deleteDocument, type DocumentRow } from "../lib/documents";
import type { ShowToast } from "../types";

const KIND_META: Record<string, { icon: string; label: string; color: string }> = {
  contract: { icon: "📜", label: "Contract", color: "#818cf8" },
  email: { icon: "📧", label: "Email", color: "#6ee7b7" },
  analysis: { icon: "🔍", label: "Analiză", color: "#f472b6" },
};

function renderContent(doc: DocumentRow) {
  const c = doc.content as Record<string, unknown>;
  if (doc.kind === "email" && c && typeof c === "object") {
    return String(c.corp ?? "");
  }
  if (doc.kind === "contract" && c && typeof c === "object") {
    return String(c.text ?? "");
  }
  return JSON.stringify(doc.content, null, 2);
}

export default function HistoryModule({ showToast }: { showToast: ShowToast }) {
  const isMobile = useIsMobile();
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setDocs(await listDocuments());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    const ok = await deleteDocument(id);
    if (ok) {
      setDocs((d) => d.filter((x) => x.id !== id));
      showToast("Document șters.", "success");
    } else {
      showToast("Nu am putut șterge documentul.", "error");
    }
  }

  return (
    <div style={{ overflowY: "auto", padding: isMobile ? 16 : 24, height: "100%" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div style={{ color:"#818cf8",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>🗂️ Istoric documente</div>
        <button onClick={load} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif" }}>↻ Reîmprospătează</button>
      </div>

      {loading ? (
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"#64748b",minHeight:200 }}>
          <Spinner /> Se încarcă...
        </div>
      ) : docs.length === 0 ? (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:240,textAlign:"center",padding:20 }}>
          <div style={{ fontSize:52,marginBottom:14 }}>🗂️</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#475569",marginBottom:8 }}>Niciun document salvat</div>
          <div style={{ fontSize:13,color:"#334155",maxWidth:320,lineHeight:1.5 }}>Tot ce generezi (contracte, email-uri, analize) apare aici automat.</div>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:10,maxWidth:880,margin:"0 auto" }}>
          {docs.map((doc) => {
            const meta = KIND_META[doc.kind] ?? { icon: "📄", label: doc.kind, color: "#94a3b8" };
            const isOpen = open === doc.id;
            return (
              <div key={doc.id} style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,overflow:"hidden" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,padding:14,cursor:"pointer" }} onClick={()=>setOpen(isOpen?null:doc.id)}>
                  <span style={{ fontSize:20,flexShrink:0 }}>{meta.icon}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ color:"#e2e8f0",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{doc.title}</div>
                    <div style={{ color:"#64748b",fontSize:11,marginTop:3 }}>
                      <span style={{ color:meta.color }}>{meta.label}</span> · {new Date(doc.created_at).toLocaleString("ro-RO")}
                    </div>
                  </div>
                  <button onClick={(e)=>{ e.stopPropagation(); remove(doc.id); }} title="Șterge" style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"5px 10px",color:"#ef4444",cursor:"pointer",fontSize:12,flexShrink:0 }}>🗑️</button>
                </div>
                {isOpen && (
                  <div style={{ background:"#0a1628",borderTop:"1px solid #1e293b",padding:16,whiteSpace:"pre-wrap",fontSize:12,color:"#94a3b8",lineHeight:1.7,maxHeight:360,overflowY:"auto",fontFamily:"'DM Sans',sans-serif" }}>
                    {renderContent(doc)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
