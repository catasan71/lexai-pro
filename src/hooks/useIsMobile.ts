import { useState, useEffect } from "react";

/** `true` când lățimea ferestrei e sub breakpoint-ul dat (default 768px). */
export function useIsMobile(bp = 768): boolean {
  const [m, setM] = useState(() => (typeof window !== "undefined" ? window.innerWidth < bp : false));
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}
