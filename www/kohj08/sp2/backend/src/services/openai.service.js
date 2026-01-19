// backend/src/services/openai.service.js
// Minimal wrapper around OpenAI Responses API.

function extractText(json) {
    if (typeof json?.output_text === "string" && json.output_text.trim()) return json.output_text.trim();
  
    const out = Array.isArray(json?.output) ? json.output : [];
    const chunks = [];
  
    for (const item of out) {
      const content = Array.isArray(item?.content) ? item.content : [];
      for (const c of content) {
        if (typeof c?.text === "string") chunks.push(c.text);
      }
    }
  
    const joined = chunks.join("\n").trim();
    return joined || "";
  }
  
  export async function generateAiOverview({ model, input }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const e = new Error("AI disabled");
      e.status = 503;
      throw e;
    }
  
    const url = "https://api.openai.com/v1/responses";
  
    const instructions =
      "Napiš krátké shrnutí situace dopravy v Praze v češtině (max 6 vět). " +
      "Použij jen data z JSON (traffic.summary, traffic.top_delays a weather). " +
      "Zmiň: počet vozidel, průměr, p95 a max zpoždění a nejhorší linky. " +
      "Pokud je počasí dostupné, jednou větou zmiň, jestli může situaci zhoršovat. " +
      "Nevkládej JSON ani kód, nepiš žádné odrážky.";
  
    const payload = {
      model: model || "gpt-4.1-mini",
      instructions,
      input: [
        {
          role: "user",
          content: `Data (JSON):\n${JSON.stringify(input)}`
        }
      ]
    };
  
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
  
    if (!resp.ok) {
      let details = "";
      try {
        details = await resp.text();
      } catch {
        details = "";
      }
      const e = new Error(`OpenAI HTTP ${resp.status}${details ? " | " + details.slice(0, 400) : ""}`);
      e.status = resp.status;
      throw e;
    }
  
    const json = await resp.json();
    const text = extractText(json);
    return text || "AI: no text generated.";
  }