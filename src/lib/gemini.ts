/**
 * Cliente de servidor para Google Gemini Flash.
 * Lee exclusivamente GEMINI_API_KEY de variables de entorno del servidor (nunca se expone al navegador).
 */

interface GeminiOptions {
  prompt: string;
  expectJson?: boolean;
  temperature?: number;
}

export async function callGeminiFlash({
  prompt,
  expectJson = true,
  temperature = 0.25,
}: GeminiOptions): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta configurar la variable de entorno GEMINI_API_KEY en el servidor."
    );
  }

  const primaryModel = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";
  const modelsToTry = [primaryModel, fallbackModel];

  let lastError = "No se pudo conectar con Google Gemini.";

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            ...(expectJson ? { responseMimeType: "application/json" } : {}),
          },
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const errBody = await response.text();
        lastError = `Modelo ${model} devolvió ${response.status}: ${errBody.slice(0, 220)}`;
        continue;
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err) {
      lastError =
        err instanceof Error ? err.message : "Error de red al consultar Gemini.";
    }
  }

  throw new Error(lastError);
}
