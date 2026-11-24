import { NextResponse } from "next/server";
import { callGeminiFlash } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const textoFactura = String(body?.textoFactura ?? "").trim();

    if (!textoFactura) {
      return NextResponse.json(
        { error: "Pega el texto o detalle de la factura para extraer los datos." },
        { status: 400 }
      );
    }

    const prompt = `Extrae los datos estructurados de este recibo o factura de suministro doméstico en España (luz, agua, gas o internet):
"${textoFactura}"

Responde ÚNICAMENTE en JSON válido:
{
  "tipo": "luz" | "agua" | "gas" | "internet" | "comunidad" | "otro",
  "concepto": "Descripción corta y clara del recibo",
  "periodo_mes": "Ej. Noviembre 2026",
  "importe_total_eur": 0.00,
  "recomendacion_ahorro": "Consejo breve en 1 frase si procede sobre la tarifa o consumo."
}`;

    const { text, modelUsed } = await callGeminiFlash({
      prompt,
      expectJson: true,
      temperature: 0.1,
    });

    const parsed = JSON.parse(text);
    return NextResponse.json({ ...parsed, modelo: modelUsed });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo analizar la factura con IA.",
      },
      { status: 500 }
    );
  }
}
