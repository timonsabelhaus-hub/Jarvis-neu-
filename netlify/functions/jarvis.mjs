

export default async (request) => {

  const headers = { "content-type": "application/json" };

  if (request.method !== "POST") {

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {

    return new Response(JSON.stringify({ error: "OPENAI_API_KEY fehlt in Netlify." }), { status: 500, headers });

  }

  try {

    const body = await request.json();

    const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];

    const messages = history.map((m) => ({

      role: m.role === "assistant" ? "assistant" : "user",

      content: String(m.content ?? "").slice(0, 12000)

    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {

      method: "POST",

      headers: {

        "Authorization": `Bearer ${apiKey}`,

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        model: "gpt-4o-mini",

        messages: [

          {

            role: "system",

            content: "Du bist JARVIS, ein hilfreicher, freundlicher und leicht schlagfertiger Sprachassistent. Antworte auf Deutsch, klar und direkt. Behaupte nicht, Geräte steuern zu können, wenn du es nicht tatsächlich kannst."

          },

          ...messages

        ],

        max_tokens: 600

      })

    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {

      const message = response.status === 401

        ? "Der API-Schlüssel wurde abgelehnt. Prüfe OPENAI_API_KEY."

        : response.status === 429

        ? "API-Limit oder Guthaben erreicht."

        : "Die OpenAI-Anfrage ist fehlgeschlagen. Prüfe die API-Einstellungen.";

      return new Response(JSON.stringify({ error: message }), {

        status: response.status === 401 ? 401 : response.status === 429 ? 429 : 502,

        headers

      });

    }

    const reply = result.choices?.[0]?.message?.content?.trim() || "Ich habe gerade keine Antwort.";

    return new Response(JSON.stringify({ reply }), {

      status: 200,

      headers: { ...headers, "Cache-Control": "no-store" }

    });

  } catch {

    return new Response(JSON.stringify({ error: "Ungültige Anfrage an JARVIS." }), { status: 400, headers });

  }

}
