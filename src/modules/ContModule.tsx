import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabase";
import type { ShowToast } from "../types";

export default function ContModule({ showToast }: { showToast: ShowToast }) {
  const isMobile = useIsMobile();
  const { user, profile, signOut } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function exportData() {
    if (!user || !supabase) {
      showToast("Trebuie să fii autentificat.", "error");
      return;
    }
    setExporting(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sesiune expirată.");

      const r = await fetch("/api/account/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "Eroare la export.");
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lexai-pro-date-${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Datele tale au fost descărcate.", "success");
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    if (!user || !supabase) return;
    setDeleting(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sesiune expirată.");

      const r = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "Eroare la ștergerea contului.");
      }
      showToast("Contul a fost șters.", "success");
      await signOut();
    } catch (e) {
      showToast((e as Error).message, "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const CARD: React.CSSProperties = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: isMobile ? 16 : 22, marginBottom: 18 };

  return (
    <div style={{ overflowY: "auto", padding: isMobile ? 16 : 28, height: "100%" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: isMobile ? 18 : 22, color: "#e2e8f0", marginBottom: 20 }}>Contul meu</h2>

        <div style={CARD}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Date de identificare</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#94a3b8" }}>
            <div>Email: <span style={{ color: "#e2e8f0" }}>{user?.email ?? "—"}</span></div>
            <div>Nume: <span style={{ color: "#e2e8f0" }}>{profile?.full_name ?? "—"}</span></div>
            <div>Plan: <span style={{ color: "#6ee7b7" }}>{profile?.plan ?? "trial"}</span></div>
          </div>
        </div>

        <div style={CARD}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Confidențialitate (GDPR)</div>
          <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Ai dreptul la portabilitatea datelor tale (export complet) și la ștergere ("dreptul de a fi uitat"), conform Regulamentului (UE) 2016/679.
          </p>
          <button
            onClick={exportData}
            disabled={exporting}
            style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 9, padding: "11px 18px", color: "#e2e8f0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: exporting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: exporting ? 0.7 : 1 }}
          >
            {exporting ? <><Spinner /> Se generează...</> : "⬇️ Exportă datele mele (JSON)"}
          </button>
        </div>

        <div style={{ ...CARD, border: "1px solid #7f1d1d40" }}>
          <div style={{ color: "#f87171", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Zonă periculoasă</div>
          <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Ștergerea contului este <strong style={{ color: "#f87171" }}>ireversibilă</strong>. Toate documentele, istoricul și creditele tale vor fi eliminate definitiv.
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ background: "transparent", border: "1px solid #f8717150", borderRadius: 9, padding: "11px 18px", color: "#f87171", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              🗑️ Șterge contul
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                style={{ background: "#f87171", border: "none", borderRadius: 9, padding: "11px 18px", color: "#070d1a", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? <><Spinner /> Se șterge...</> : "Confirmă ștergerea definitivă"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 9, padding: "11px 18px", color: "#94a3b8", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Anulează
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
