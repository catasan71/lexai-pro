/**
 * LexAI Pro — Proxy securizat pentru Anthropic API
 * Vercel Serverless Function: /api/claude
 *
 * Variabile de mediu necesare (Vercel Dashboard → Settings → Environment Variables):
 *   ANTHROPIC_API_KEY       — sk-ant-...
 *   SUPABASE_URL            — https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — cheia service_role (secretă, NICIODATĂ în frontend)
 *
 * Fluxul de credit enforcement (dacă Supabase e configurat):
 *   1. Extrage JWT-ul userului din header-ul Authorization
 *   2. Verifică tokenul prin Supabase Auth → obține user_id real
 *   3. Apelează consume_credits() atomic (scade sold, jurnalizează) — 402 dacă insuficiente
 *   4. Dacă OK → apel Anthropic → răspuns cu header x-credits-remaining
 */

const TASK_CREDITS = {
  email:    1,
  clauses:  2,
  contract: 3,
  analysis: 6,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    return res.status(500).json({ error: { message: "Server configuration error: API key missing" } });
  }

  const supabaseUrl  = process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const enforceCredits = !!(supabaseUrl && serviceKey);

  // Extrage `task` din body (nu se trimite la Anthropic)
  const { task, ...anthropicBody } = req.body ?? {};

  if (enforceCredits) {
    const authHeader = req.headers["authorization"] ?? "";
    const userToken  = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!userToken) {
      return res.status(401).json({ error: { message: "Autentificare necesară pentru a folosi LexAI Pro." } });
    }

    // Verifică tokenul → obține user_id verificat de Supabase
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        apikey: serviceKey,
      },
    }).catch(() => null);

    if (!userRes || !userRes.ok) {
      return res.status(401).json({ error: { message: "Sesiune expirată. Reconectează-te." } });
    }

    const { id: userId } = await userRes.json();
    if (!userId) {
      return res.status(401).json({ error: { message: "Token invalid." } });
    }

    const cost  = TASK_CREDITS[task] ?? 1;
    const model = anthropicBody.model ?? null;

    // consume_credits() — atomic: scade credite + inserează în usage_log
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ p_user_id: userId, p_action: task ?? "unknown", p_cost: cost, p_model: model }),
    }).catch(() => null);

    if (!rpcRes || !rpcRes.ok) {
      const body = await rpcRes?.json().catch(() => ({})) ?? {};
      const msg  = body?.message ?? "";
      if (msg.includes("INSUFFICIENT_CREDITS")) {
        return res.status(402).json({
          error: { message: "Credite insuficiente. Reîncarcă-ți contul pentru a continua." },
          code: "INSUFFICIENT_CREDITS",
        });
      }
      console.error("consume_credits error:", body);
      return res.status(500).json({ error: { message: "Eroare la verificarea creditelor." } });
    }

    const remaining = await rpcRes.json();
    if (typeof remaining === "number") {
      res.setHeader("x-credits-remaining", String(remaining));
    }
  }

  // Apel Anthropic
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(anthropicBody),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: { message: "Proxy error: " + (error.message ?? "Unknown error") },
    });
  }
}
