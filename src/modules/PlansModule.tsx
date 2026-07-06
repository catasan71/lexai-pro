import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabase";
import type { ShowToast } from "../types";

interface Pack {
  id: string;
  label: string;
  credits: number;
  price: number;
  badge?: string;
  color: string;
  type: "topup" | "subscription";
}

const TOPUPS: Pack[] = [
  { id: "topup_10",  label: "10 credite",  credits: 10,  price: 9,  color: "#6ee7b7", type: "topup" },
  { id: "topup_30",  label: "30 credite",  credits: 30,  price: 24, color: "#818cf8", badge: "Popular", type: "topup" },
  { id: "topup_100", label: "100 credite", credits: 100, price: 69, color: "#f472b6", badge: "Cel mai bun raport", type: "topup" },
];

const SUBSCRIPTIONS: Pack[] = [
  { id: "starter", label: "Starter",      credits: 60,  price: 49,  color: "#6ee7b7", type: "subscription" },
  { id: "pro",     label: "Pro Business", credits: 200, price: 149, color: "#818cf8", badge: "Recomandat", type: "subscription" },
];

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["60 credite / lună", "Generator contracte (40 tipuri)", "Generator email-uri", "5 analize / lună", "Export PDF & DOCX", "Suport email 48h"],
  pro:     ["200 credite / lună", "Contracte nelimitate", "Email-uri nelimitate", "Analize nelimitate", "Clauze AI premium", "Suport prioritar 4h"],
};

export default function PlansModule({ showToast }: { showToast: ShowToast }) {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"topup" | "subscription">("topup");

  async function initCheckout(pack: Pack) {
    if (!user || !supabase) {
      showToast("Trebuie să fii autentificat.", "error");
      return;
    }
    setLoading(pack.id);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sesiune expirată.");

      const r = await fetch("/api/revolut/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packId: pack.id }),
      });
      const body = await r.json() as { checkoutUrl?: string; error?: { message?: string } };

      if (!r.ok || !body.checkoutUrl) {
        throw new Error(body.error?.message ?? "Eroare la inițierea plății.");
      }
      // Redirect to Revolut hosted checkout
      window.location.href = body.checkoutUrl;
    } catch (e) {
      showToast((e as Error).message, "error");
      setLoading(null);
    }
  }

  const planColor = profile?.plan === "pro" ? "#818cf8" : profile?.plan === "starter" ? "#6ee7b7" : "#64748b";
  const planLabel = profile?.plan === "pro" ? "Pro Business" : profile?.plan === "starter" ? "Starter" : "Trial Gratuit";

  return (
    <div style={{ overflowY: "auto", padding: isMobile ? 16 : 28, height: "100%" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header status cont */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: isMobile ? 16 : 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Plan curent</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 18, color: planColor }}>{planLabel}</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Credite disponibile</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 28, color: "#6ee7b7" }}>⚡ {profile?.credits ?? 0}</div>
          </div>
          <div style={{ flex: 1, minWidth: 160, textAlign: isMobile ? "left" : "right" }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Cost acțiuni</div>
            <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
              📧 Email — <span style={{ color: "#6ee7b7" }}>1 credit</span><br />
              📜 Contract — <span style={{ color: "#818cf8" }}>3 credite</span><br />
              🔍 Analiză — <span style={{ color: "#f472b6" }}>6 credite</span>
            </div>
          </div>
        </div>

        {/* Tab selector */}
        <div style={{ display: "flex", gap: 0, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 4, marginBottom: 20, width: "fit-content" }}>
          {(["topup", "subscription"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#1e293b" : "none", border: "none", borderRadius: 7, padding: "8px 18px", color: tab === t ? "#e2e8f0" : "#64748b", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
              {t === "topup" ? "⚡ Top-up credite" : "📋 Abonamente"}
            </button>
          ))}
        </div>

        {/* Top-up packs */}
        {tab === "topup" && (
          <>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>Creditele nu expiră. Adaugă oricând, fără abonament.</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
              {TOPUPS.map((pack) => (
                <div key={pack.id} style={{ background: "#0f172a", border: `1px solid ${pack.color}30`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
                  {pack.badge && (
                    <div style={{ position: "absolute", top: 12, right: 12, background: pack.color + "20", color: pack.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 100, border: `1px solid ${pack.color}40` }}>{pack.badge}</div>
                  )}
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 22, color: pack.color }}>⚡ {pack.credits}</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>credite</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 26, color: "#e2e8f0", marginTop: 4 }}>
                    {pack.price} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400 }}>RON</span>
                  </div>
                  <div style={{ color: "#475569", fontSize: 11 }}>{(pack.price / pack.credits).toFixed(2)} RON / credit</div>
                  <button
                    onClick={() => initCheckout(pack)}
                    disabled={loading !== null}
                    style={{ background: `linear-gradient(135deg,${pack.color}cc,${pack.color})`, border: "none", borderRadius: 9, padding: "11px 0", color: "#070d1a", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.7 : 1, marginTop: "auto" }}
                  >
                    {loading === pack.id ? <><Spinner /> Se procesează...</> : "Cumpără acum"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Subscription plans */}
        {tab === "subscription" && (
          <>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>Creditele se reînnoiesc lunar. Anulezi oricând.</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 14 }}>
              {SUBSCRIPTIONS.map((pack) => (
                <div key={pack.id} style={{ background: "#0f172a", border: `1px solid ${pack.color}40`, borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
                  {pack.badge && (
                    <div style={{ position: "absolute", top: 14, right: 14, background: pack.color + "20", color: pack.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, border: `1px solid ${pack.color}40` }}>{pack.badge}</div>
                  )}
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 18, color: pack.color, marginBottom: 4 }}>{pack.label}</div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 30, color: "#e2e8f0" }}>
                      {pack.price} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400 }}>RON/lună</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {(PLAN_FEATURES[pack.id] ?? []).map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8" }}>
                        <span style={{ color: pack.color, fontSize: 14, flexShrink: 0 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => initCheckout(pack)}
                    disabled={loading !== null || profile?.plan === pack.id}
                    style={{ background: profile?.plan === pack.id ? "#1e293b" : `linear-gradient(135deg,${pack.color}cc,${pack.color})`, border: profile?.plan === pack.id ? "1px solid #334155" : "none", borderRadius: 10, padding: "12px 0", color: profile?.plan === pack.id ? "#64748b" : "#070d1a", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: (loading || profile?.plan === pack.id) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.7 : 1, marginTop: "auto" }}
                  >
                    {loading === pack.id ? <><Spinner /> Se procesează...</> : profile?.plan === pack.id ? "Plan activ" : "Abonează-te"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 20, padding: "12px 16px", background: "#0a1220", borderRadius: 10, fontSize: 11, color: "#334155", lineHeight: 1.6, textAlign: "center" }}>
          🔒 Plățile sunt procesate securizat prin <strong style={{ color: "#475569" }}>Revolut Business</strong>. Nu stocăm date de card.
        </div>
      </div>
    </div>
  );
}
