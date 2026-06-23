/**
 * Rate limiting partajat pentru funcțiile serverless LexAI Pro.
 * Folosește RPC-ul Postgres `check_rate_limit()` (vezi supabase/rate_limits.sql)
 * — fereastră fixă, atomic, centralizat (funcționează corect peste mai multe
 * instanțe Vercel, spre diferență de un limiter în memorie).
 *
 * Întoarce `true` dacă cererea e permisă, `false` dacă limita a fost depășită.
 * În caz de eroare de rețea/DB, lasă cererea să treacă (fail-open) ca să nu
 * blocăm utilizatorii din cauza unei probleme tranzitorii de infrastructură.
 */
export async function checkRateLimit(supabaseUrl, serviceKey, bucketKey, maxRequests, windowSeconds) {
  const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/check_rate_limit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify({
      p_bucket_key: bucketKey,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    }),
  }).catch(() => null);

  if (!rpcRes || !rpcRes.ok) return true;
  const allowed = await rpcRes.json().catch(() => true);
  return allowed !== false;
}
