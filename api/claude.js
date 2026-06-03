/**
 * LexAI Pro — Proxy securizat pentru Anthropic API
 * Vercel Serverless Function: /api/claude
 *
 * API key-ul NU este expus în frontend.
 * Setat ca variabilă de mediu în Vercel Dashboard:
 *   ANTHROPIC_API_KEY = sk-ant-...
 */

export default async function handler(req, res) {
  // Permite doar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verifică că API key există
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set in environment variables");
    return res.status(500).json({
      error: { message: "Server configuration error: API key missing" }
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Transmite răspunsul către client
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: { message: "Proxy error: " + (error.message || "Unknown error") }
    });
  }
}
