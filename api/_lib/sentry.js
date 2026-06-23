/**
 * Raportare erori opțională pentru funcțiile serverless, fără dependență
 * de SDK (evită overhead-ul de cold-start). Activă doar dacă SENTRY_DSN
 * e setat — trimite eroarea direct la endpoint-ul Sentry Envelope API.
 */
export async function reportError(error, context = {}) {
  console.error(context.tag ?? "error", error, context);

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    const match = dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(.+)$/);
    if (!match) return;
    const [, publicKey, host, projectId] = match;

    const envelopeHeader = JSON.stringify({ event_id: crypto.randomUUID(), sent_at: new Date().toISOString() });
    const eventHeader = JSON.stringify({ type: "event" });
    const event = JSON.stringify({
      level: "error",
      platform: "node",
      exception: { values: [{ type: error.name ?? "Error", value: error.message ?? String(error) }] },
      extra: context,
    });
    const body = `${envelopeHeader}\n${eventHeader}\n${event}`;

    await fetch(`https://${host}/api/${projectId}/envelope/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=lexai-pro-serverless/1.0`,
      },
      body,
    }).catch(() => null);
  } catch {
    /* nu lăsăm raportarea erorilor să producă alte erori */
  }
}
