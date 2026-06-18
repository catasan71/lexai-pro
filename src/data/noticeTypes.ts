/** Tipuri de documente juridice formale (altele decât contracte și email-uri). */
export interface NoticeType {
  id: string;
  label: string;
  icon: string;
  color: string;
  credits: number;
  fields: Array<{ key: string; label: string; type?: "text" | "date" | "textarea" | "number"; required?: boolean }>;
  promptTemplate: (form: Record<string, string>) => string;
}

export const NOTICE_TYPES: NoticeType[] = [
  {
    id: "notificare",
    label: "Notificare Juridică",
    icon: "📨",
    color: "#818cf8",
    credits: 3,
    fields: [
      { key: "expeditor",   label: "Expeditor (denumire/nume, CUI/CNP, adresă)", type: "textarea", required: true },
      { key: "destinatar",  label: "Destinatar (denumire/nume, CUI/CNP, adresă)", type: "textarea", required: true },
      { key: "obiect",      label: "Obiectul notificării", type: "textarea", required: true },
      { key: "termen",      label: "Termen acordat pentru răspuns (zile)", type: "number" },
      { key: "baza_legala", label: "Baza legală (articole, legi — opțional)", type: "text" },
      { key: "data",        label: "Data", type: "date", required: true },
    ],
    promptTemplate: (f) =>
      `Redacteaza o notificare juridica formala in romana, conform Codului Civil roman.\n\nEXPEDITOR: ${f.expeditor}\nDESTINATAR: ${f.destinatar}\nOBIECT: ${f.obiect}\nTERMEN RASPUNS: ${f.termen || "15"} zile\nBAZA LEGALA: ${f.baza_legala || "Cod Civil art. 1522, art. 1523"}\nDATA: ${f.data}\n\nInclude: antet formal, corp cu faptele si pretentiile, termen clar, consecinte nerespectare, semnatura. Limbaj juridic formal.`,
  },
  {
    id: "somatie",
    label: "Somație de Plată",
    icon: "⚖️",
    color: "#f472b6",
    credits: 3,
    fields: [
      { key: "creditor",     label: "Creditor (denumire, CUI, adresă, reprezentant)", type: "textarea", required: true },
      { key: "debitor",      label: "Debitor (denumire, CUI, adresă)", type: "textarea", required: true },
      { key: "suma",         label: "Suma datorată (RON)", type: "number", required: true },
      { key: "temeiul",      label: "Temeiul creanței (factură/contract nr., data)", type: "textarea", required: true },
      { key: "penalitati",   label: "Penalități %/zi (dacă există)", type: "number" },
      { key: "termen_plata", label: "Termen de plată acordat (zile)", type: "number" },
      { key: "data",         label: "Data", type: "date", required: true },
    ],
    promptTemplate: (f) =>
      `Redacteaza o somatie de plata formala in romana juridica, conform Codului Civil si OG 5/2001.\n\nCREDITOR: ${f.creditor}\nDEBITOR: ${f.debitor}\nSUMA: ${f.suma} RON\nTEMEIUL CREANTEI: ${f.temeiul}\nPENALITATI: ${f.penalitati || "0.1"}%/zi\nTERMEN PLATA: ${f.termen_plata || "10"} zile\nDATA: ${f.data}\n\nInclude: baza legala (art. 1516, 1522 Cod Civil), suma principala + penalitati calculate, avertizare procedura executare silita / cerere de valoare, termen ultimativ, date bancare pentru plata.`,
  },
  {
    id: "decizie_concediere",
    label: "Decizie Concediere",
    icon: "📋",
    color: "#fbbf24",
    credits: 3,
    fields: [
      { key: "angajator",  label: "Angajator (denumire, CUI, sediu, reprezentant)", type: "textarea", required: true },
      { key: "angajat",    label: "Angajat (nume, CNP, funcție, departament)", type: "textarea", required: true },
      { key: "motiv",      label: "Motivul concedierii (art. din Codul Muncii)", type: "textarea", required: true },
      { key: "preaviz",    label: "Durata preaviz (zile lucrătoare)", type: "number" },
      { key: "data_ef",    label: "Data efectivă a încetării", type: "date", required: true },
      { key: "drepturi",   label: "Drepturi cuvenite la încetare (compensații, concediu neefectuat)", type: "textarea" },
      { key: "data",       label: "Data deciziei", type: "date", required: true },
    ],
    promptTemplate: (f) =>
      `Redacteaza o decizie de concediere conform Legii 53/2003 (Codul Muncii).\n\nANGAJATOR: ${f.angajator}\nANGAJAT: ${f.angajat}\nMOTIV CONCEDIERE: ${f.motiv}\nPREAVIZ: ${f.preaviz || "20"} zile lucratoare\nDATA EFECTIVA INCETARE: ${f.data_ef}\nDREPTURI CUVENITE: ${f.drepturi || "drepturile salariale cuvenite pana la data incetarii"}\nDATA DECIZIEI: ${f.data}\n\nInclude: temeiul legal complet (art. din Codul Muncii), motivarea, termenul de contestatie (45 zile la Tribunal), mentiunea privind dreptul la somaj, semnatura si stampila. Respecta formatul legal obligatoriu.`,
  },
  {
    id: "decizie_disciplinara",
    label: "Decizie Sancțiune Disciplinară",
    icon: "🔔",
    color: "#f97316",
    credits: 3,
    fields: [
      { key: "angajator",  label: "Angajator (denumire, CUI, sediu, reprezentant)", type: "textarea", required: true },
      { key: "angajat",    label: "Angajat (nume, CNP, funcție)", type: "textarea", required: true },
      { key: "fapta",      label: "Fapta disciplinară săvârșită", type: "textarea", required: true },
      { key: "sanctiune",  label: "Sancțiunea aplicată", type: "text", required: true },
      { key: "cercetare",  label: "Rezultatul cercetării disciplinare prealabile", type: "textarea" },
      { key: "data",       label: "Data deciziei", type: "date", required: true },
    ],
    promptTemplate: (f) =>
      `Redacteaza o decizie de sanctionare disciplinara conform art. 247-252 din Codul Muncii (Legea 53/2003).\n\nANGAJATOR: ${f.angajator}\nANGAJAT: ${f.angajat}\nFAPTA: ${f.fapta}\nSANCTIUNEA: ${f.sanctiune}\nCERCETARE PREALABILA: ${f.cercetare || "s-a efectuat cercetare disciplinara prealabila conform procedurii legale"}\nDATA: ${f.data}\n\nInclude: descrierea faptei, incadrarea juridica (art. din regulament + Codul Muncii), sanctiunea motivata, termenul de contestatie (30 zile la Tribunal), comunicarea deciziei.`,
  },
  {
    id: "procura",
    label: "Procură / Împuternicire",
    icon: "🖊️",
    color: "#6ee7b7",
    credits: 3,
    fields: [
      { key: "mandant",    label: "Mandant (cel care dă procura) — nume, CNP/CUI, adresă", type: "textarea", required: true },
      { key: "mandatar",   label: "Mandatar (cel care primește procura) — nume, CNP, adresă", type: "textarea", required: true },
      { key: "obiect",     label: "Obiectul mandatului (ce poate face mandatarul)", type: "textarea", required: true },
      { key: "limitari",   label: "Limitări / restricții (opțional)", type: "textarea" },
      { key: "valabilitate", label: "Valabilitate (ex: 6 luni, 1 an, nedeterminată)", type: "text" },
      { key: "data",       label: "Data", type: "date", required: true },
    ],
    promptTemplate: (f) =>
      `Redacteaza o procura/imputernicire conform art. 2009-2038 Cod Civil roman.\n\nMANDANT: ${f.mandant}\nMANDATAR: ${f.mandatar}\nOBIECTUL MANDATULUI: ${f.obiect}\nLIMITARI: ${f.limitari || "fara limitari speciale"}\nVALABILITATE: ${f.valabilitate || "1 an de la data semnarii"}\nDATA: ${f.data}\n\nInclude: identificarea completa a partilor, puterile conferite (enumerate explicit), limitele mandatului, conditia revocarii, mentiunea autentificarii daca e necesara. Limbaj juridic precis.`,
  },
  {
    id: "plangere",
    label: "Plângere / Contestație",
    icon: "📝",
    color: "#a78bfa",
    credits: 3,
    fields: [
      { key: "petent",      label: "Petent (persoana care depune plângerea)", type: "textarea", required: true },
      { key: "autoritate",  label: "Autoritatea destinatară (ANAF, ITM, ANPC, etc.)", type: "text", required: true },
      { key: "obiect",      label: "Obiectul plângerii / ce se contestă", type: "textarea", required: true },
      { key: "fapte",       label: "Faptele și situația de fapt", type: "textarea", required: true },
      { key: "solicitare",  label: "Ce se solicită (anulare, restituire, sancționare etc.)", type: "textarea", required: true },
      { key: "dovezi",      label: "Mijloacele de probă anexate", type: "textarea" },
      { key: "data",        label: "Data", type: "date", required: true },
    ],
    promptTemplate: (f) =>
      `Redacteaza o plangere/contestatie formala adresata autoritatii publice, conform OG 27/2002 si legislatiei specifice.\n\nPETENT: ${f.petent}\nAUTORITATEA DESTINATARA: ${f.autoritate}\nOBIECTUL PLANGERII: ${f.obiect}\nFAPTELE: ${f.fapte}\nSOLICITAREA: ${f.solicitare}\nDOVEZI ANEXATE: ${f.dovezi || "documente justificative"}\nDATA: ${f.data}\n\nInclude: antet formal, expunerea faptelor si a drepturilor incalcate, temeiul legal, solicitarea concreta, lista anexelor, mentiunea termenului legal de raspuns (30 zile), semnatura.`,
  },
];
