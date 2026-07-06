/**
 * LexAI Pro — design tokens
 * Centralizează paleta și tipografia folosite în toată aplicația.
 * Înlocuiește treptat valorile hex inline din componente.
 */

export const colors = {
  // surfaces
  bg: "#070d1a",
  bgDeep: "#050b16",
  surface: "#0f172a",
  surfaceAlt: "#0a1220",
  surfaceCard: "#0a1628",
  // borders
  border: "#1e293b",
  borderStrong: "#334155",
  // text
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  textFaint: "#475569",
  textGhost: "#334155",
  // brand
  indigo: "#818cf8",
  mint: "#6ee7b7",
  // semantic
  success: "#10b981",
  warning: "#fbbf24",
  danger: "#ef4444",
  orange: "#f97316",
  pink: "#f472b6",
  violet: "#a78bfa",
} as const;

export const gradient = {
  brand: "linear-gradient(135deg,#818cf8,#6ee7b7)",
} as const;

export const fonts = {
  display: "'Space Grotesk',sans-serif",
  body: "'Inter',sans-serif",
} as const;

/** Risk-severity → color map (Romanian labels, incl. diacritic variants). */
export const severityColor: Record<string, string> = {
  Scazut: colors.success,
  "Scăzut": colors.success,
  Mediu: colors.warning,
  Ridicat: colors.orange,
  Critic: colors.danger,
};
