import { NextResponse } from "next/server";
import { callGeminiFlash } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ingresosMensuales = Number(body?.ingresosMensuales ?? 0);
    const rentaDeseada = Number(body?.rentaDeseada ?? 0);
    const mesesPagosPuntuales = Number(body?.mesesPagosPuntuales ?? 12);
    const tipoContratoLaboral = String(body?.tipoContratoLaboral ?? "Indefinido");

    if (ingresosMensuales <= 0 || rentaDeseada <= 0) {
      return NextResponse.json(
        { error: "Introduce ingresos mensuales y renta estimada válidos." },
        { status: 400 }
      );
    }

    const ratioEsfuerzo = Number(((rentaDeseada / ingresosMensuales) * 100).toFixed(1));
    const aptoSeguroImpago = ratioEsfuerzo <= 35;

    const prompt = `Evalúa de forma breve y objetiva el perfil combinado de solvencia + historial verificado ("Pasaporte de Buen Inquilino" de Techo y Hecho conectado a InquiCheck) en España:
- Ingresos netos mensuales del hogar: ${ingresosMensuales} €
- Renta del piso: ${rentaDeseada} €
- Ratio de esfuerzo calculado: ${ratioEsfuerzo} % (el umbral estándar de seguros de impago en España es <= 35 %)
- Tipo de contrato laboral: ${tipoContratoLaboral}
- Meses de alquiler verificados con pagos puntuales en Techo y Hecho: ${mesesPagosPuntuales}

Responde ÚNICAMENTE en JSON válido en español de España:
{
  "nivel_solvencia": "Nivel A1 (Excelente)" | "Nivel A2 (Apto)" | "Nivel B (Revisar garantías)",
  "puntuacion_estimada": 0-100,
  "apto_seguro_impago": true | false,
  "dictamen_breve": "Explicación clara en 2 frases sobre la viabilidad del perfil y el valor de adjuntar su Pasaporte InquiCheck + Historial Techo y Hecho."
}`;

    const { text, modelUsed } = await callGeminiFlash({
      prompt,
      expectJson: true,
      temperature: 0.2,
    });

    const parsed = JSON.parse(text);
    return NextResponse.json({
      ...parsed,
      apto_seguro_impago: aptoSeguroImpago,
      ratioEsfuerzo,
      modelo: modelUsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al evaluar el pasaporte de solvencia.",
      },
      { status: 500 }
    );
  }
}
