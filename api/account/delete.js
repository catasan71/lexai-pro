/**
 * LexAI Pro — Ștergere cont (drept GDPR de ștergere / "dreptul de a fi uitat")
 * POST /api/account/delete
 * Headers: Authorization: Bearer <supabase_jwt>
 *
 * Șterge userul din auth.users via Admin API. Toate tabelele (profiles,
 * documents, usage_log, subscriptions, transactions) au `on delete cascade`
 * pe user_id, deci datele asociate sunt eliminate automat.
 * Ireversibil — nu există confirmare suplimentară server-side, UI-ul trebuie
 * să confirme explicit cu userul înainte de a apela acest endpoint.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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

  const { id: userId } = await userRes.json();
  if (!userId) return res.status(401).json({ error: { message: "Token invalid." } });

  const deleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
  }).catch(() => null);

  if (!deleteRes?.ok) {
    console.error("Account delete error:", await deleteRes?.text().catch(() => ""));
    return res.status(500).json({ error: { message: "Eroare la ștergerea contului. Contactează suportul." } });
  }

  return res.status(200).json({ ok: true });
}
