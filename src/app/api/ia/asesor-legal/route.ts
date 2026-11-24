import { NextResponse } from "next/server";
import { callGeminiFlash } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const consulta = String(body?.consulta ?? "").trim();
    const rol = String(body?.rol ?? "inquilino");

    if (!consulta) {
      return NextResponse.json(
        { error: "Escribe tu duda legal sobre el alquiler para consultarla." },
        { status: 400 }
      );
    }

    const prompt = `Eres el asistente informativo jurídico de "Techo y Hecho", especializado en alquiler residencial en España a noviembre de 2026.

Marco normativo vigente que DEBES respetar:
1. Real Decreto-ley 29/2026 (convalidado el 12 de noviembre de 2026, BOE-A-2026-23755):
   - Tope extraordinario del 2 % a las actualizaciones anuales de renta en vivienda habitual hasta el 31/12/2027 (o 0 % en zona tensionada si la renta ya supera el índice de referencia).
   - Alquiler de temporada integrado en la LAU: exige causa real y acreditable (máx. 12 meses). Encadenar contratos lo convierte en vivienda habitual.
   - Alquiler por habitaciones: la suma no puede superar el precio de la vivienda completa.
   - Prórroga extraordinaria de hasta 2 años a solicitud del inquilino al corriente de pago.
   - Prohibición expresa de cobrar gastos de gestión inmobiliaria o formalización al inquilino en vivienda habitual.
2. El Real Decreto-ley 28/2026 (que pretendía prórrogas indefinidas e indemnizaciones de 12 meses) FUE DEROGADO por el Congreso el 12/11/2026 y NO está en vigor.
3. Ley 12/2023 e índice IRAV del INE (2,57 % en octubre de 2026) como referencia estructural para contratos desde el 26/05/2023.
4. LAU: Art. 21 (reparaciones), Art. 36 (fianza 1 mes, devolución 30 días), Art. 20 (gastos).

Consulta del usuario (rol: ${rol}):
"${consulta}"

Responde ÚNICAMENTE en JSON válido en español de España, tono claro y sin tecnicismos innecesarios:
{
  "resumen_corto": "Titular directo con la respuesta en 1 frase.",
  "respuesta": "Explicación clara en 3-5 frases con pasos prácticos.",
  "normativa_citada": ["Lista de artículos o leyes aplicables"],
  "aviso_legal": "Información orientativa actualizada a noviembre de 2026; no constituye asesoramiento legal vinculante."
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
            : "No se pudo consultar el asistente legal IA.",
      },
      { status: 500 }
    );
  }
}
