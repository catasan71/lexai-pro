import { useState, useEffect } from "react";
import { GlobalStyles } from "./styles/GlobalStyles";
import { AuthModal } from "./components/AuthModal";
import { Modal } from "./components/Modal";
import { CookieConsent } from "./components/CookieConsent";
import { useAuth } from "./auth/AuthProvider";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

type Page = "landing" | "dashboard";

export default function App() {
  const { user, configured } = useAuth();
  const [page, setPage] = useState<Page>("landing");
  const [authOpen, setAuthOpen] = useState(false);
  const [cookiePolicyOpen, setCookiePolicyOpen] = useState(false);

  // Intrarea în app: dacă avem auth activ și userul nu e logat → cerem login.
  // Altfel (logat, sau Supabase neconfigurat) → mergem direct în dashboard.
  function enterApp() {
    if (configured && !user) setAuthOpen(true);
    else setPage("dashboard");
  }

  // După login reușit, închidem modalul și intrăm în dashboard.
  useEffect(() => {
    if (user && authOpen) {
      setAuthOpen(false);
      setPage("dashboard");
    }
  }, [user, authOpen]);

  // Redirect după plată Revolut (?payment=success) — intrăm direct în dashboard.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      setPage("dashboard");
    }
  }, []);

  return (
    <>
      <GlobalStyles />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      {cookiePolicyOpen && <Modal type="cookies" onClose={() => setCookiePolicyOpen(false)} />}
      <CookieConsent onOpenPolicy={() => setCookiePolicyOpen(true)} />
      {page === "landing" ? (
        <LandingPage onEnterApp={enterApp} />
      ) : (
        <Dashboard onBack={() => setPage("landing")} />
      )}
    </>
  );
}
