import { NextResponse } from "next/server";
import {
  hasRealDiscrepancyInText,
  sanitizePII,
} from "@/lib/inquicheck-engine";

const SYSTEM_PROMPT_MULTI_AUDITOR = `Eres un Auditor Forense de Riesgo Financiero e Inmobiliario en España sujeto al RGPD (Art. 5.1.c). Analiza los documentos PDF aportados para los titulares firmantes y devuelve EXCLUSIVAMENTE un objeto JSON válido.

REGLA 1 (ANTI-PII ESTRICTA): Prohibido incluir DNI, NIE, pasaporte, NAF, CIF ni nombres comerciales de empresas. Usa solo nombre de pila e inicial del primer apellido (ej. "Elena S.").
REGLA 2 (PROFESIÓN Y CATEGORÍA): Extrae de nómina y vida laboral (código contrato TGSS 100/200/400) la categoría ("Contrato Indefinido", "Funcionario / Sector Público", "Autónomo Consolidado" o "Temporal") y profesión genérica sin nombre de empresa. En members_breakdown usa: "Titular X (Nombre I.): [Categoría] - [Profesión] ([Años] años antigüedad)".
REGLA 3 (VERIFICACIÓN CRUZADA MULTI-TITULAR): Si hay 2 o más titulares es normal que tengan nombres distintos entre sí. Solo marca document_discrepancy_detected=true y solvency_score bajo (15-35) si DENTRO DE UN MISMO TITULAR su Vida Laboral y su Nómina son de personas distintas. Si es coherente, marca document_discrepancy_detected=false, verification_passed=true, fraud_risk_level="LOW" y evita la palabra "discrepancia" en auditor_notes.
REGLA 4 (SUMA DE INGRESOS): Suma el salario neto mensual ("Líquido a percibir") de todos los titulares y calcula max_safe_rent_35pct como el 35% entero de la suma conjunta.`;

interface PdfDocInput {
  titularIndex: number;
  tipo: "vida_laboral" | "nomina";
  base64: string;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const numApplicants = Number(body?.numApplicants ?? 1);
    const relationship = String(body?.relationship ?? "Individual");
    const searchZone = String(body?.searchZone ?? "España");
    const tamperingDetected = Boolean(body?.tamperingDetected);
    const docs: PdfDocInput[] = Array.isArray(body?.docs) ? body.docs : [];
    const ingresosManual = Number(body?.ingresosManual ?? 0);
    const situacionManual = String(body?.situacionManual ?? "Contrato Indefinido");
    const nombreUsuario = String(body?.nombreUsuario ?? "Titular");

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [
      {
        text: `Analiza la solvencia para ${numApplicants} titular(es), vínculo: ${relationship}, zona: ${searchZone}. ${
          docs.length === 0
            ? `El usuario no ha adjuntado PDFs en esta simulación rápida; usa sus datos declarados: nombre=${nombreUsuario}, ingresos netos=${ingresosManual} €/mes, situación=${situacionManual}.`
            : "Analiza los PDFs oficiales adjuntos en memoria volátil (Custodia Cero)."
        }

Devuelve EXCLUSIVAMENTE este JSON exacto:
{
  "alias_display": "Nombre I.",
  "verification_passed": true,
  "document_discrepancy_detected": false,
  "fraud_risk_level": "LOW" | "MEDIUM" | "HIGH",
  "csv_detected": true,
  "employment_category": "Contrato Indefinido",
  "members_breakdown": ["Titular 1 (Nombre I.): Contrato Indefinido - Profesión (3 años antigüedad)"],
  "contract_code_tgss": "100",
  "seniority_years": 3,
  "verified_net_income": 2500,
  "net_income_bracket_display": "2.400 € - 2.600 €/mes",
  "has_wage_garnishment": false,
  "max_safe_rent_35pct": 875,
  "solvency_score": 90,
  "auditor_notes": "Dictamen breve y claro en español de España sin PII."
}`,
      },
    ];

    for (const d of docs) {
      parts.push({
        text:
          d.tipo === "vida_laboral"
            ? `Informe Vida Laboral TGSS del Titular ${d.titularIndex}:`
            : `Última Nómina del Titular ${d.titularIndex}:`,
      });
      parts.push({
        inlineData: { mimeType: "application/pdf", data: d.base64 },
      });
    }

    const models = [
      process.env.GEMINI_MODEL || "gemini-3-flash-preview",
      process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash",
    ];

    let rawJsonText = "";
    let modelUsed = models[0];
    let lastErr = "Error llamando a Gemini.";

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT_MULTI_AUDITOR }] },
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.0,
            responseMimeType: "application/json",
          },
        }),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
        modelUsed = model;
        if (rawJsonText) break;
      } else {
        lastErr = await res.text();
      }
    }

    if (!rawJsonText) {
      return NextResponse.json({ error: lastErr.slice(0, 240) }, { status: 500 });
    }

    const parsed = JSON.parse(rawJsonText);

    // Post-procesado exacto de InquiCheck + cortafuegos PII
    const notesClean = sanitizePII(String(parsed.auditor_notes || ""));
    const textDiscrepancy = hasRealDiscrepancyInText(notesClean);
    let finalScore = Number(parsed.solvency_score ?? 80);
    const aiFlagged =
      (Boolean(parsed.document_discrepancy_detected) ||
        parsed.verification_passed === false ||
        parsed.fraud_risk_level === "HIGH") &&
      (finalScore < 65 || textDiscrepancy);

    const hasDiscrepancy = aiFlagged || tamperingDetected || textDiscrepancy;
    if (hasDiscrepancy) {
      finalScore = Math.min(finalScore, 35);
    }

    const verifiedIncome = Number(parsed.verified_net_income ?? ingresosManual ?? 0);

    return NextResponse.json({
      alias_display: sanitizePII(String(parsed.alias_display || nombreUsuario)),
      verification_passed: !hasDiscrepancy,
      document_discrepancy_detected: hasDiscrepancy,
      fraud_risk_level: hasDiscrepancy
        ? "HIGH"
        : parsed.fraud_risk_level || "LOW",
      csv_detected: Boolean(parsed.csv_detected),
      employment_category: sanitizePII(
        String(parsed.employment_category || situacionManual)
      ),
      members_breakdown: Array.isArray(parsed.members_breakdown)
        ? parsed.members_breakdown.map((m: string) => sanitizePII(String(m)))
        : [],
      contract_code_tgss: sanitizePII(String(parsed.contract_code_tgss || "100")),
      seniority_years: Number(parsed.seniority_years ?? 1),
      verified_net_income: verifiedIncome,
      net_income_bracket_display: sanitizePII(
        String(
          parsed.net_income_bracket_display ||
            `${Math.round(verifiedIncome)} €/mes`
        )
      ),
      has_wage_garnishment: Boolean(parsed.has_wage_garnishment),
      max_safe_rent_35pct: Math.round(
        Number(parsed.max_safe_rent_35pct ?? verifiedIncome * 0.35)
      ),
      solvency_score: Math.max(0, Math.min(100, Math.round(finalScore))),
      auditor_notes: tamperingDetected
        ? `ALERTA FORENSE: Se detectaron metadatos de edición externa en el PDF. ${notesClean}`
        : notesClean,
      tampering_detected: tamperingDetected,
      fecha_auditoria: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      num_titulares: numApplicants,
      vinculo: relationship,
      zona_busqueda: sanitizePII(searchZone),
      modelo: modelUsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error en la auditoría de solvencia.",
      },
      { status: 500 }
    );
  }
}
