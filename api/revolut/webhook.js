/**
 * LexAI Pro — Webhook Revolut Merchant
 * POST /api/revolut/webhook
 *
 * Revolut apelează acest endpoint la fiecare eveniment de plată.
 * Configurare: Revolut Dashboard → Merchant → Webhooks → Add endpoint
 *   URL: https://lexai.pro/api/revolut/webhook
 *   Events: ORDER_COMPLETED, ORDER_PAYMENT_DECLINED
 *
 * Variabile de mediu:
 *   REVOLUT_WEBHOOK_SECRET    — secretul de semnătură din Revolut Dashboard
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import crypto from "crypto";
import { reportError } from "../_lib/sentry.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Configurație lipsă." });
  }

  // Verificare semnătură Revolut (dacă secretul e configurat)
  if (webhookSecret) {
    const signature  = req.headers["revolut-signature"] ?? "";
    const rawBody    = JSON.stringify(req.body);
    const expected   = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    if (!valid) {
      console.warn("Webhook: semnătură invalidă");
      return res.status(401).json({ error: "Invalid signature." });
    }
  }

  const { event, order } = req.body ?? {};

  if (event === "ORDER_COMPLETED" && order?.id) {
    const paymentId = order.payments?.[0]?.id ?? null;

    // Apelează complete_payment() — atomically credits the user
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/complete_payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        p_revolut_order_id:   order.id,
        p_revolut_payment_id: paymentId,
      }),
    });

    if (!rpcRes.ok) {
      const body = await rpcRes.json().catch(() => ({}));
      const msg  = body?.message ?? "";
      // Idempotent: dacă e deja procesat, ignorăm
      if (msg.includes("TRANSACTION_NOT_FOUND")) {
        return res.status(200).json({ ok: true, note: "already processed" });
      }
      await reportError(new Error("complete_payment failed"), { tag: "revolut-webhook", orderId: order.id, body });
      return res.status(500).json({ error: "Eroare la procesarea plății." });
    }

    console.log(`Payment completed: order ${order.id}, payment ${paymentId}`);
  }

  if (event === "ORDER_PAYMENT_DECLINED" && order?.id) {
    // Marchează tranzacția ca eșuată
    await fetch(`${supabaseUrl}/rest/v1/transactions?revolut_order_id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ status: "failed", updated_at: new Date().toISOString() }),
    });
  }

  return res.status(200).json({ ok: true });
}
