/** Tipuri de email business suportate de generatorul de email-uri. */
export const EMAIL_TYPES: string[] = [
  "Emitere factură nouă",
  "Reminder scadență",
  "Notificare întârziere plată",
  "Somare plată",
  "Confirmare plată primită",
  "Ofertă comercială",
  "Follow-up ofertă nesoluționată",
  "Confirmare comandă",
  "Notificare livrare/finalizare serviciu",
  "Transmitere contract spre semnare",
  "Notificare reziliere contract",
  "Punere în întârziere (Cod Civil)",
];

/** Tonuri disponibile pentru email-uri. */
export const EMAIL_TONES: { v: string; l: string }[] = [
  { v: "formal-juridic", l: "🎩 Formal-Juridic" },
  { v: "profesional", l: "💼 Profesional" },
  { v: "prietenos", l: "🤝 Prietenos" },
  { v: "urgent", l: "⚡ Urgent" },
  { v: "ferm", l: "🧊 Ferm" },
];
