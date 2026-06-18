/**
 * Client centralizat pentru proxy-ul Anthropic (`/api/claude`).
 * Cheia API rămâne pe server — vezi `api/claude.js`.
 */
import { TASK_CONFIG, type AiTask } from "./models";

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "document"; source: { type: "base64"; media_type: string; data: string } };

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
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
  // (un eventual tag de limbaj rămas, ex. "json", e tăiat de extragerea de obiect/array de mai jos).
  const fi = s.indexOf(fence);
  if (fi !== -1) {
    const fe = s.indexOf(fence, fi + 3);
    s = fe === -1 ? s.slice(fi + 3) : s.slice(fi + 3, fe);
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
 * derivate din `TASK_CONFIG[task]` — vezi `models.ts`.
 */
export async function callClaude(task: AiTask, content: string | ContentBlock[]): Promise<string> {
  const cfg = TASK_CONFIG[task];
  const messageContent = typeof content === "string" ? content : content;

  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      messages: [{ role: "user", content: messageContent }],
    }),
  });

  const data: AnthropicResponse = await r.json();
  if (data.error) throw new Error("API: " + (data.error.message || JSON.stringify(data.error)));
  if (!r.ok) throw new Error("HTTP " + r.status);
  if (!data.content || !data.content.length) {
    throw new Error("Raspuns gol: " + JSON.stringify(data).slice(0, 200));
  }
  const textBlock = data.content.find((b) => b.type === "text")?.text;
  if (!textBlock) throw new Error("Niciun bloc text in raspuns");
  return textBlock;
}
