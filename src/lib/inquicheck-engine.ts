/**
 * Motor integrado de Solvencia y Custodia Cero (portado de InquiCheck v12/v16)
 * - Cortafuegos Anti-PII (RGPD Art. 5.1.c)
 * - Inspección forense de metadatos PDF en memoria del navegador (pdf-lib)
 * - Cálculo de esfuerzo al 35 % para seguro de impago
 */

export interface ResultadoSolvenciaIntegrada {
  alias_display: string;
  verification_passed: boolean;
  document_discrepancy_detected: boolean;
  fraud_risk_level: "LOW" | "MEDIUM" | "HIGH";
  csv_detected?: boolean;
  employment_category: string;
  members_breakdown: string[];
  contract_code_tgss?: string;
  seniority_years: number;
  verified_net_income: number;
  net_income_bracket_display: string;
  has_wage_garnishment: boolean;
  max_safe_rent_35pct: number;
  solvency_score: number;
  auditor_notes: string;
  tampering_detected?: boolean;
  fecha_auditoria: string;
  num_titulares: number;
  vinculo: string;
  zona_busqueda: string;
}

/** Cortafuegos PII: elimina DNI, NIE, IBAN, NAF, emails y teléfonos antes de mostrar o guardar */
export function sanitizePII(text: string): string {
  if (!text) return "";
  return text
    .replace(/\b\d{1,2}\.?\d{3}\.?\d{3}[-\s]?[A-Za-z]\b/g, "[DNI OCULTO RGPD]")
    .replace(/\b[XYZxyz][-\s.]?\d{7,8}[-\s]?[A-Za-z]\b/g, "[NIE OCULTO RGPD]")
    .replace(
      /\bES\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{2,4}[-\s]?\d{4,10}\b/gi,
      "[IBAN OCULTO RGPD]"
    )
    .replace(/\b\d{2}[-\s/]?\d{8}[-\s/]?\d{2}\b/g, "[NAF OCULTO RGPD]")
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      "[EMAIL OCULTO RGPD]"
    )
    .replace(/\b[6789]\d{2}[-\s.]?\d{3}[-\s.]?\d{3}\b/g, "[TELÉFONO OCULTO RGPD]")
    .replace(/\b\d{9,14}\b/g, "[ID OCULTO RGPD]");
}

export function hasRealDiscrepancyInText(notes: string): boolean {
  if (!notes) return false;
  const cleaned = notes
    .toLowerCase()
    .replace(/sin discrepancias?/g, "")
    .replace(/no existen discrepancias?/g, "")
    .replace(/ausencia de discrepancias?/g, "");
  return /(no coincid|discrepancia|distintas personas|diferente titular|incoherencia)/.test(
    cleaned
  );
}

const EDITORES_SOSPECHOSOS = ["canva", "photoshop", "ilovepdf", "sejda", "gimp"];

/** Inspección forense de metadatos PDF en memoria RAM (sin subir ni guardar el PDF) */
export async function inspectPdfMetadataForensic(
  file: File
): Promise<{ sospechoso: boolean; productor: string }> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const producer = (pdf.getProducer() || "").toLowerCase();
    const creator = (pdf.getCreator() || "").toLowerCase();
    const combinado = `${producer} ${creator}`.trim();
    const sospechoso = EDITORES_SOSPECHOSOS.some((tool) =>
      combinado.includes(tool)
    );
    return { sospechoso, productor: combinado || "Estándar PDF" };
  } catch {
    return { sospechoso: false, productor: "PDF protegido / estándar" };
  }
}

export function fileToBase64Pure(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Error leyendo el PDF en memoria"));
    reader.readAsDataURL(file);
  });
}

export function calcularEsfuerzoSeguro(rentaEur: number, ingresosNetosEur: number) {
  if (!ingresosNetosEur || ingresosNetosEur <= 0) {
    return {
      porcentaje: 0,
      estado: "no_verificado" as const,
      etiqueta: "No verificado",
      mensaje: "Ingresos no verificados o con discrepancias documentales.",
    };
  }
  const porcentaje = Number(((rentaEur / ingresosNetosEur) * 100).toFixed(1));
  if (porcentaje <= 30) {
    return {
      porcentaje,
      estado: "optimo" as const,
      etiqueta: `${porcentaje} % (Óptimo)`,
      mensaje: "Apto para seguro de impago: cumple holgadamente (< 35 %).",
    };
  }
  if (porcentaje <= 35) {
    return {
      porcentaje,
      estado: "viable" as const,
      etiqueta: `${porcentaje} % (Viable)`,
      mensaje: "Dentro de límite: aceptado por aseguradoras (máx. 35 %).",
    };
  }
  return {
    porcentaje,
    estado: "excesivo" as const,
    etiqueta: `${porcentaje} % (Excesivo)`,
    mensaje: "Riesgo alto: supera el 35 % de los ingresos netos conjuntos.",
  };
}
