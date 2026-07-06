/**
 * Client centralizat pentru proxy-ul Anthropic (`/api/claude`).
 * Cheia API rămâne pe server — vezi `api/claude.js`.
 *
 * Dacă userul e autentificat, trimite JWT-ul în Authorization header.
 * Proxy-ul consumă creditele atomic înainte de apelul Anthropic.
 * La răspuns, creditele rămase ajung în header-ul `x-credits-remaining`
 * și sunt propagate în UI prin evenimentul `lexai:credits-updated`.
 */
import { TASK_CONFIG, type AiTask } from "./models";
import { supabase } from "./supabase";

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "document"; source: { type: "base64"; media_type: string; data: string } };

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
  stop_reason?: string;
}

/**
 * Extrage un JSON dintr-un răspuns text (eliminând eventualele garduri markdown).
 * Fără regex — doar indexOf — ca să fie robust la conținut neașteptat.
 */
export function extractJSON<T = unknown>(txt: string): T {
  if (!txt) throw new Error("Raspuns gol de la API");
  let s = txt;
  const fence = "```";
  // Dacă răspunsul e într-un bloc ```...```, păstrăm conținutul DINTRE garduri
  const fi = s.indexOf(fence);
  if (fi !== -1) {
    const fe = s.indexOf(fence, fi + 3);
    s = fe === -1 ? s.slice(fi + 3) : s.slice(fi + 3, fe);
    s = s.trim();
    // Elimină eticheta de limbaj de pe prima linie (ex: "json") dacă există
    const nl = s.indexOf("\n");
    if (nl !== -1 && /^[a-zA-Z]+$/.test(s.slice(0, nl).trim())) {
      s = s.slice(nl + 1);
    }
  }
  s = s.trim();
  try {
    return JSON.parse(s) as T;
  } catch {
    /* fall through */
  }
  // array: prima [ ... ultima ]
  const ai = s.indexOf("[");
  const ae = s.lastIndexOf("]");
  if (ai !== -1 && ae > ai) {
    try {
      return JSON.parse(s.slice(ai, ae + 1)) as T;
    } catch {
      /* fall through */
    }
  }
  // obiect: prima { ... ultima }
  const oi = s.indexOf("{");
  const oe = s.lastIndexOf("}");
  if (oi !== -1 && oe > oi) {
    try {
      return JSON.parse(s.slice(oi, oe + 1)) as T;
    } catch {
      /* fall through */
    }
  }
  const preview = txt.slice(0, 100).split("\n").join(" ");
  throw new Error("JSON invalid. Inceput raspuns: " + preview);
}

/**
 * Apel către Claude pentru o anumită acțiune. Modelul și max_tokens sunt
 * derivate din `TASK_CONFIG[task]`. JWT-ul userului e trimis automat dacă
 * există sesiune activă — proxy-ul consumă creditele server-side.
 */
export async function callClaude(task: AiTask, content: string | ContentBlock[]): Promise<string> {
  const cfg = TASK_CONFIG[task];

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Atașează JWT dacă userul e autentificat
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    }
  }

  const r = await fetch("/api/claude", {
    method: "POST",
    headers,
    body: JSON.stringify({
      task,                    // citit de proxy pentru cost; nu ajunge la Anthropic
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      messages: [{ role: "user", content }],
    }),
  });

  // 402 = credite insuficiente
  if (r.status === 402) {
    const body = await r.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "Credite insuficiente.");
  }
  // 429 = rate limit atins
  if (r.status === 429) {
    const body = await r.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "Prea multe cereri. Așteaptă puțin.");
  }

  const data: AnthropicResponse = await r.json();
  if (data.error) throw new Error("API: " + (data.error.message ?? JSON.stringify(data.error)));
  if (!r.ok) throw new Error("HTTP " + r.status);
  if (!data.content?.length) {
    throw new Error("Raspuns gol: " + JSON.stringify(data).slice(0, 200));
  }
  const textBlock = data.content.find((b) => b.type === "text")?.text;
  if (!textBlock) throw new Error("Niciun bloc text in raspuns");
  if (data.stop_reason === "max_tokens") {
    throw new Error("Răspunsul AI a fost trunchiat (prea lung). Încearcă cu mai puține detalii sau reîncearcă.");
  }

  // Propagă creditele rămase în UI fără a refresha din DB
  const remaining = r.headers.get("x-credits-remaining");
  if (remaining !== null) {
    window.dispatchEvent(
      new CustomEvent("lexai:credits-updated", { detail: { credits: Number(remaining) } })
    );
  }

  return textBlock;
}
