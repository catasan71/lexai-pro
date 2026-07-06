import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAuth } from "../auth/AuthProvider";
import { Spinner } from "./Spinner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const isMobile = useIsMobile();
  const { configured, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!open) return null;

  const INP = { background:"#070d1a",border:"1px solid #1e293b",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"'Inter',sans-serif",width:"100%",boxSizing:"border-box" as const,outline:"none" };

  async function submit() {
    setErr(null);
    setInfo(null);
    if (!email || !password || (mode === "signup" && !name)) {
      setErr("Completează toate câmpurile.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
        setInfo("Cont creat! Verifică emailul pentru confirmare, apoi autentifică-te.");
        setMode("login");
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Eroare la autentificare.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(8px)",zIndex:1100,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:20 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#0f172a",border:"1px solid #1e293b",borderRadius:isMobile?"20px 20px 0 0":20,width:"100%",maxWidth:isMobile?"100%":420,padding:isMobile?"28px 22px":34,animation:"fadeUp .3s ease" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:22,color:"#e2e8f0",margin:0 }}>{mode==="login"?"Bine ai revenit":"Creează cont"}</h2>
          <button onClick={onClose} style={{ background:"#1e293b",border:"none",color:"#94a3b8",width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:18,flexShrink:0 }}>×</button>
        </div>
        <p style={{ color:"#64748b",fontSize:13,margin:"0 0 22px" }}>{mode==="login"?"Autentifică-te ca să continui.":"Începe cu 10 credite gratuite."}</p>

        {!configured && (
          <div style={{ background:"#fbbf2415",border:"1px solid #fbbf2440",borderRadius:10,padding:12,marginBottom:18,color:"#fbbf24",fontSize:12,lineHeight:1.5 }}>
            ⚠️ Autentificarea nu e încă activă — Supabase nu e configurat (lipsesc cheile din .env.local).
          </div>
        )}

        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {mode==="signup" && (
            <input placeholder="Nume complet" value={name} onChange={e=>setName(e.target.value)} style={INP} />
          )}
          <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={INP} />
          <input placeholder="Parolă" type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={INP} />

          {err && <div style={{ color:"#ef4444",fontSize:12,lineHeight:1.4 }}>{err}</div>}
          {info && <div style={{ color:"#10b981",fontSize:12,lineHeight:1.4 }}>{info}</div>}

          <button onClick={submit} disabled={loading||!configured} style={{ background:"linear-gradient(135deg,#818cf8,#6ee7b7)",border:"none",borderRadius:10,padding:13,color:"#070d1a",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,cursor:(loading||!configured)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:(loading||!configured)?.6:1 }}>
            {loading ? <><Spinner /> Se procesează...</> : mode==="login" ? "Autentificare" : "Creează cont"}
          </button>

          <button onClick={()=>{ setErr(null); signInWithGoogle().catch(e=>setErr(e instanceof Error?e.message:"Eroare Google")); }} disabled={!configured} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:12,color:"#e2e8f0",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:14,cursor:configured?"pointer":"not-allowed",opacity:configured?1:.6 }}>
            Continuă cu Google
          </button>
        </div>

        <div style={{ textAlign:"center",marginTop:20,color:"#64748b",fontSize:13 }}>
          {mode==="login" ? "Nu ai cont? " : "Ai deja cont? "}
          <button onClick={()=>{ setErr(null); setInfo(null); setMode(mode==="login"?"signup":"login"); }} style={{ background:"none",border:"none",color:"#818cf8",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif",padding:0,fontWeight:600 }}>
            {mode==="login" ? "Creează unul" : "Autentifică-te"}
          </button>
        </div>
      </div>
    </div>
  );
}
