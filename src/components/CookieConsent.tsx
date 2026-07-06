import { useEffect, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

const STORAGE_KEY = "lexai:cookie-consent";

export type CookieConsentChoice = "accepted" | "rejected";

/** Citește alegerea salvată (sau `null` dacă userul nu a răspuns încă). */
export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

interface CookieConsentProps {
  onOpenPolicy: () => void;
}

/** Banner GDPR de consimțământ cookies — necesar real, nu doar text în Modal. */
export function CookieConsent({ onOpenPolicy }: CookieConsentProps) {
  const isMobile = useIsMobile();
  const [choice, setChoice] = useState<CookieConsentChoice | null>(() => getCookieConsent());

  useEffect(() => {
    if (choice) window.localStorage.setItem(STORAGE_KEY, choice);
  }, [choice]);

  if (choice) return null;

  return (
    <div
      style={{
        position: "fixed", left: isMobile ? 12 : 24, right: isMobile ? 12 : 24, bottom: isMobile ? 12 : 24,
        maxWidth: 520, margin: isMobile ? "0 auto" : 0, zIndex: 2000,
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14,
        padding: isMobile ? 16 : 20, boxShadow: "0 10px 40px rgba(0,0,0,.5)",
        fontFamily: "'Inter',sans-serif", animation: "slideUp .3s ease",
      }}
    >
      <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>
        🍪 Folosim cookies tehnice (necesare) și, cu acordul tău, cookies analitice pentru a îmbunătăți LexAI Pro.{" "}
        <button onClick={onOpenPolicy} style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", padding: 0, font: "inherit", textDecoration: "underline" }}>
          Detalii politică cookies
        </button>
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => setChoice("accepted")}
          style={{ background: "linear-gradient(135deg,#818cf8,#6ee7b7)", border: "none", borderRadius: 9, padding: "10px 18px", color: "#070d1a", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Accept toate
        </button>
        <button
          onClick={() => setChoice("rejected")}
          style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 9, padding: "10px 18px", color: "#94a3b8", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Doar necesare
        </button>
      </div>
    </div>
  );
}
