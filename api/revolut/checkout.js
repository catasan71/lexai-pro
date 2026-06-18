/**
 * LexAI Pro — Creare comandă Revolut Merchant
 * POST /api/revolut/checkout
 *
 * Body: { packId: "topup_10" | "topup_30" | "topup_100" | "starter" | "pro" }
 * Headers: Authorization: Bearer <supabase_jwt>
 *
 * Răspuns: { checkoutUrl: "https://..." }
 *
 * Variabile de mediu (Vercel):
 *   REVOLUT_API_KEY           — cheia secretă Revolut Merchant (Settings → API)
 *   REVOLUT_SANDBOX           — "true" în dev, absent/false în producție
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — pentru verificare JWT + DB
 *   APP_URL                   — URL-ul aplicației (ex: https://lexai.pro)
 */

const PACKS = {
  topup_10:  { credits: 10,  amount: 9,   type: "topup",        desc: "LexAI Pro — 10 credite" },
  topup_30:  { credits: 30,  amount: 24,  type: "topup",        desc: "LexAI Pro — 30 credite" },
  topup_100: { credits: 100, amount: 69,  type: "topup",        desc: "LexAI Pro — 100 credite" },
  starter:   { credits: 60,  amount: 49,  type: "subscription", desc: "LexAI Pro — Starter (60 credite/lună)" },
  pro:       { credits: 200, amount: 149, type: "subscription", desc: "LexAI Pro — Pro Business (200 credite/lună)" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const revolutKey   = process.env.REVOLUT_API_KEY;
  const supabaseUrl  = process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl       = process.env.APP_URL ?? "https://lexai.pro";
  const isSandbox    = process.env.REVOLUT_SANDBOX === "true";

  if (!revolutKey)  return res.status(500).json({ error: { message: "Revolut API key lipsă." } });
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: { message: "Configurație Supabase lipsă." } });

  // Autentificare user
  const token = (req.headers["authorization"] ?? "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: { message: "Autentificare necesară." } });

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  }).catch(() => null);
  if (!userRes?.ok) return res.status(401).json({ error: { message: "Sesiune invalidă." } });

  const { id: userId, email } = await userRes.json();

  const { packId } = req.body ?? {};
  const pack = PACKS[packId];
  if (!pack) return res.status(400).json({ error: { message: "Pachet invalid." } });

  const extRef = `lexai_${packId}_${userId}_${Date.now()}`;
  const revolutBase = isSandbox
    ? "https://sandbox-merchant.revolut.com/api/1.0"
    : "https://merchant.revolut.com/api/1.0";

  // Creează comanda Revolut
  const orderRes = await fetch(`${revolutBase}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${revolutKey}`,
    },
    body: JSON.stringify({
      amount: pack.amount * 100,      // Revolut vrea în bani (RON × 100)
      currency: "RON",
      capture_mode: "AUTOMATIC",
      merchant_order_ext_ref: extRef,
      customer_email: email,
      description: pack.desc,
      settlement_currency: "RON",
      redirect_url: `${appUrl}?payment=success&pack=${packId}`,
      cancel_url:   `${appUrl}?payment=cancelled`,
    }),
  }).catch(() => null);

  if (!orderRes?.ok) {
    const errBody = await orderRes?.json().catch(() => ({})) ?? {};
    console.error("Revolut order error:", errBody);
    return res.status(502).json({ error: { message: "Eroare la crearea plății Revolut." } });
  }

  const order = await orderRes.json();

  // Salvează tranzacția pending în DB (o procesăm la webhook)
  await fetch(`${supabaseUrl}/rest/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      type: pack.type,
      amount_ron: pack.amount,
      credits: pack.credits,
      status: "pending",
      revolut_order_id: order.id,
      description: pack.desc,
    }),
  });

  return res.status(200).json({ checkoutUrl: order.checkout_url });
}
