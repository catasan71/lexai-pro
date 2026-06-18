import { useState } from "react";
import { GlobalStyles } from "./styles/GlobalStyles";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

type Page = "landing" | "dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  return (
    <>
      <GlobalStyles />
      {page === "landing" ? (
        <LandingPage onEnterApp={() => setPage("dashboard")} />
      ) : (
        <Dashboard onBack={() => setPage("landing")} />
      )}
    </>
  );
}
