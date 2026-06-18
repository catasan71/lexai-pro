/**
 * Configurare modele AI — un singur loc pentru a alege ce model rulează
 * pentru fiecare tip de acțiune. Acțiunile ieftine folosesc modele rapide/ieftine,
 * iar cele unde contează calitatea juridică folosesc modele mai puternice.
 *
 * Costul fiecărei acțiuni (în credite) e definit aici, lângă model, ca să fie
 * ușor de menținut sincronizat cu costul real Anthropic. Vezi ROADMAP Faza 3.
 */

export type ModelId =
  | "claude-opus-4-8"
  | "claude-sonnet-4-6"
  | "claude-haiku-4-5-20251001";

export type AiTask = "email" | "clauses" | "contract" | "analysis";

export interface TaskConfig {
  model: ModelId;
  maxTokens: number;
  /** Cost în credite — reflectă costul real al operației. */
  credits: number;
}

export const TASK_CONFIG: Record<AiTask, TaskConfig> = {
  // Email: scurt, structurat → model rapid/ieftin.
  email: { model: "claude-haiku-4-5-20251001", maxTokens: 1200, credits: 1 },
  // Sugestii de clauze: necesită acuratețe juridică, dar output mic.
  clauses: { model: "claude-sonnet-4-6", maxTokens: 2000, credits: 2 },
  // Contract complet: calitate juridică ridicată, output mare.
  contract: { model: "claude-sonnet-4-6", maxTokens: 4000, credits: 3 },
  // Analiză de risc: cea mai costisitoare — prompt mare + raționament + output mare.
  analysis: { model: "claude-opus-4-8", maxTokens: 4000, credits: 6 },
};
