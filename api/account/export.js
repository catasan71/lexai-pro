/**
 * LexAI Pro — Export date personale (drept GDPR de portabilitate)
 * GET /api/account/export
 * Headers: Authorization: Bearer <supabase_jwt>
 *
 * Întoarce un JSON cu tot ce avem despre user: profil, documente generate,
 * jurnal de consum, tranzacții. Descărcabil direct din browser.
 */
import { checkRateLimit } from "../_lib/rateLimit.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: { message: "Configurație Supabase lipsă." } });
  }

  const token = (req.headers["authorization"] ?? "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: { message: "Autentificare necesară." } });

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  }).catch(() => null);
  if (!userRes?.ok) return res.status(401).json({ error: { message: "Sesiune invalidă." } });

  const user = await userRes.json();
  const userId = user.id;

  const allowed = await checkRateLimit(supabaseUrl, serviceKey, `export:${userId}`, 5, 60);
  if (!allowed) return res.status(429).json({ error: { message: "Prea multe cereri de export. Așteaptă puțin." } });

  const headers = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };

  const [profileRes, documentsRes, usageRes, transactionsRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/documents?user_id=eq.${userId}&select=*`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/usage_log?user_id=eq.${userId}&select=*`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/transactions?user_id=eq.${userId}&select=*`, { headers }),
  ]);

  const [profile, documents, usage_log, transactions] = await Promise.all([
    profileRes.json().catch(() => []),
    documentsRes.json().catch(() => []),
    usageRes.json().catch(() => []),
    transactionsRes.json().catch(() => []),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, created_at: user.created_at },
    profile: profile?.[0] ?? null,
    documents,
    usage_log,
    transactions,
  };

  res.setHeader("Content-Disposition", `attachment; filename="lexai-pro-date-${userId}.json"`);
  return res.status(200).json(exportData);
}
