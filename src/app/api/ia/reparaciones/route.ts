import { NextResponse } from "next/server";
import { callGeminiFlash } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const titulo = String(body?.titulo ?? "").trim();
    const descripcion = String(body?.descripcion ?? "").trim();
    const contextoContrato = String(
      body?.contextoContrato ?? "Vivienda habitual en España sujeta a la LAU y RDL 29/2026."
    ).trim();

    if (!titulo || !descripcion) {
      return NextResponse.json(
        { error: "Por favor, indica el título y una descripción breve de la avería." },
        { status: 400 }
      );
    }

    const prompt = `Eres un mediador imparcial experto en la Ley de Arrendamientos Urbanos (LAU) de España, especialmente el artículo 21 (conservación necesaria a cargo del arrendador frente a pequeñas reparaciones por desgaste ordinario o mal uso a cargo del arrendatario) y el RDL 29/2026.

Analiza esta avería en una vivienda en alquiler en España:
- Título: ${titulo}
- Descripción: ${descripcion}
- Contexto contractual: ${contextoContrato}

Responde ÚNICAMENTE con un objeto JSON válido con estas claves exactas:
{
  "responsable": "propietario" | "inquilino" | "revisar",
  "articulo_lau": "Ej. Art. 21.1 LAU o Art. 21.4 LAU",
  "urgencia": "baja" | "media" | "alta" | "urgente",
  "explicacion": "Explicación clara, neutral y sin tecnicismos en español de España (máximo 3 frases).",
  "guia_emergencia": "Consejo práctico inmediato para evitar daños mayores (1-2 frases).",
  "busqueda_bricolaje": "Término breve para buscar un tutorial en YouTube si es una pequeña reparación del inquilino, o cadena vacía si requiere técnico profesional.",
  "aviso_legal": "Dictamen orientativo generado por IA según el art. 21 de la LAU; no sustituye asesoramiento jurídico profesional."
}`;

    const { text, modelUsed } = await callGeminiFlash({
      prompt,
      expectJson: true,
      temperature: 0.2,
    });

    const parsed = JSON.parse(text);
    return NextResponse.json({ ...parsed, modelo: modelUsed });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al analizar la avería con IA.",
      },
      { status: 500 }
    );
  }
}
