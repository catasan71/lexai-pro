/** Tipuri partajate în toată aplicația. */

/** Profilul utilizatorului (tabela public.profiles). */
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  company_cui: string | null;
  plan: "trial" | "starter" | "pro";
  credits: number;
}

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  msg: string;
  type: ToastType;
}

/** Funcția prin care modulele afișează notificări. */
export type ShowToast = (msg: string, type?: ToastType) => void;

/** Tipurile de modal din landing page. */
export type ModalType = "terms" | "gdpr" | "cookies" | "contact" | null;

/** O clauză sugerată de AI pentru un contract. */
export interface ClauseSuggestion {
  titlu: string;
  descriere: string;
  text: string;
}

/** Rezultatul generării unui email. */
export interface EmailResult {
  subiect: string;
  corp: string;
}

/** Raportul de analiză a unui contract. */
export interface AnalysisResult {
  rezumat?: {
    tip?: string;
    parti?: string;
    valoare?: string;
    durata?: string;
    scor?: string;
  };
  riscuri?: Array<{
    titlu: string;
    categorie: string;
    severitate: string;
    descriere: string;
    clauza?: string;
    remediere?: string;
  }>;
  clauze_lipsa?: Array<{ titlu: string; importanta: string; sugestie?: string }>;
  recomandari?: string[];
  avocat?: { necesar: boolean; motiv?: string };
}
