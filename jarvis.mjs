export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json" } });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY fehlt in den Netlify Environment variables." }), { status: 500, headers: { "content-type": "application/json" } });
  }
  try {
    const body = await request.json();
    const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const messages = history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content ?? "").slice(0, 12000) }));
    const now = String(body.now || new Date().toLocaleString("de-DE"));
    const system = `Du bist JARVIS, ein hilfreicher, freundlicher und leicht schlagfertiger Sprachassistent. Antworte auf Deutsch, klar und direkt. Bei normalen Fragen möglichst kurz, bei komplexen Fragen ausführlicher. Keine Behauptung, du könntest Geräte oder Apps steuern, wenn du es nicht tatsächlich kannst. Aktuelles Datum und Uhrzeit: ${now}.`;
    if (body.image && messages.length) {
      const last = messages[messages.length - 1];
      last.content = [
        { type: "text", text: last.content },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${String(body.image).slice(0, 5000000)}` } }
      ];
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: system }, ...messages], max_tokens: 600 })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const status = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
      return new Response(JSON.stringify({ error: status === 401 ? "OpenAI hat den API-Schlüssel abgelehnt. Prüfe OPENAI_API_KEY." : status === 429 ? "OpenAI-Limit oder API-Guthaben erreicht." : "OpenAI-Anfrage fehlgeschlagen. Prüfe die API-Einstellungen." }), { status, headers: { "content-type": "application/json" } });
    }
    const reply = result.choices?.[0]?.message?.content?.trim() || "Ich habe gerade keine Antwort.";
    return new Response(JSON.stringify({ reply }), { status: 200, headers: { "content-type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return new Response(JSON.stringify({ error: "Ungültige Anfrage an JARVIS." }), { status: 400, headers: { "content-type": "application/json" } });
  }
};
