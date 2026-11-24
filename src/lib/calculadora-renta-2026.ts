/**
 * Calculadora legal de actualización anual de rentas en España
 * Normativa vigente a noviembre de 2026:
 * - Real Decreto-ley 29/2026 (convalidado 12/11/2026, BOE-A-2026-23755):
 *   Tope extraordinario del 2 % para revisiones entre el 8/10/2026 y el 31/12/2027
 *   en vivienda habitual (o 0 % en zona tensionada si supera el índice de referencia).
 * - Ley 12/2023: Índice IRAV del INE para contratos firmados desde el 26/05/2023 (2,57 % oct. 2026).
 */

export interface DatosActualizacionRenta {
  rentaActualEur: number;
  fechaFirmaContrato: string;
  fechaRevision: string;
  tipoContrato: "habitual" | "temporada" | "habitaciones";
  esZonaTensionada: boolean;
  superaIndiceReferenciaTensionada?: boolean;
  iravVigentePct: number;
  ipcVigentePct?: number;
  tieneClausulaActualizacion: boolean;
}

export interface ResultadoActualizacionRenta {
  subidaPermitidaPct: number;
  rentaNuevaEur: number;
  incrementoMensualEur: number;
  normaAplicada: string;
  explicacion: string;
}

const FECHA_LEY_VIVIENDA = "2023-05-26";
const FECHA_INICIO_TOPE_RDL_29_2026 = "2026-10-08";
const FECHA_FIN_TOPE_RDL_29_2026 = "2027-12-31";
const TOPE_EXTRAORDINARIO_PCT = 2.0;

export function calcularActualizacionRenta(
  datos: DatosActualizacionRenta
): ResultadoActualizacionRenta {
  if (!datos.tieneClausulaActualizacion) {
    return {
      subidaPermitidaPct: 0,
      rentaNuevaEur: datos.rentaActualEur,
      incrementoMensualEur: 0,
      normaAplicada: "Art. 18.1 LAU (sin cláusula expresa de actualización)",
      explicacion:
        "El contrato no incluye cláusula de actualización de renta, por lo que no corresponde subida anual.",
    };
  }

  if (datos.esZonaTensionada && datos.superaIndiceReferenciaTensionada) {
    return {
      subidaPermitidaPct: 0,
      rentaNuevaEur: datos.rentaActualEur,
      incrementoMensualEur: 0,
      normaAplicada: "RDL 29/2026 — Zona tensionada sobre índice",
      explicacion:
        "En zona tensionada con renta superior al índice oficial de referencia, la subida anual queda congelada al 0 %.",
    };
  }

  const enPeriodoTopeRdl29 =
    datos.fechaRevision >= FECHA_INICIO_TOPE_RDL_29_2026 &&
    datos.fechaRevision <= FECHA_FIN_TOPE_RDL_29_2026;

  const esContratoPostLeyVivienda = datos.fechaFirmaContrato >= FECHA_LEY_VIVIENDA;
  const indiceReferenciaPct = esContratoPostLeyVivienda
    ? datos.iravVigentePct
    : (datos.ipcVigentePct ?? datos.iravVigentePct);

  let subidaPermitidaPct = indiceReferenciaPct;
  let normaAplicada = esContratoPostLeyVivienda
    ? `IRAV del INE (${datos.iravVigentePct.toFixed(2)} %)`
    : `Índice pactado en contrato (${indiceReferenciaPct.toFixed(2)} %)`;

  if (datos.tipoContrato === "habitual" && enPeriodoTopeRdl29) {
    subidaPermitidaPct = Math.min(indiceReferenciaPct, TOPE_EXTRAORDINARIO_PCT);
    normaAplicada = `Tope extraordinario 2,00 % (RDL 29/2026 · ref. IRAV ${indiceReferenciaPct.toFixed(2)} %)`;
  }

  subidaPermitidaPct = Math.max(0, Number(subidaPermitidaPct.toFixed(2)));
  const rentaNuevaEur = Number(
    (datos.rentaActualEur * (1 + subidaPermitidaPct / 100)).toFixed(2)
  );
  const incrementoMensualEur = Number(
    (rentaNuevaEur - datos.rentaActualEur).toFixed(2)
  );

  return {
    subidaPermitidaPct,
    rentaNuevaEur,
    incrementoMensualEur,
    normaAplicada,
    explicacion: `Subida máxima permitida del ${subidaPermitidaPct.toFixed(2)} % (${normaAplicada}). La renta pasa de ${datos.rentaActualEur.toFixed(2)} € a ${rentaNuevaEur.toFixed(2)} €/mes (+${incrementoMensualEur.toFixed(2)} €).`,
  };
}
