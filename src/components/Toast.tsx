import { useEffect } from "react";
import type { ToastType } from "../types";

interface ToastProps {
  msg: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ msg, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
  const col: Record<ToastType, string> = { success: "#10b981", error: "#ef4444", info: "#818cf8" };
  return (
    <div style={{ position:"fixed",bottom:16,left:16,right:16,zIndex:9999,background:"#0f172a",border:"1px solid "+col[type]+"40",borderLeft:"3px solid "+col[type],borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"flex-start",gap:10,boxShadow:"0 8px 32px "+col[type]+"20",animation:"slideUp .3s ease",maxWidth:480,marginInline:"auto",fontFamily:"'DM Sans',sans-serif" }}>
      <span style={{ color:col[type],fontSize:16,flexShrink:0,marginTop:1 }}>{type==="success"?"✓":type==="error"?"✗":"ℹ"}</span>
      <span style={{ color:"#e2e8f0",fontSize:13,flex:1,wordBreak:"break-word",lineHeight:1.5 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:18,padding:0,lineHeight:1,flexShrink:0 }}>×</button>
    </div>
  );
}
