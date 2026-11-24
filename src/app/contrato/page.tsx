"use client";

import { useState } from "react";
import {
  Calculator,
  CheckCircle2,
  FileText,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import { calcularActualizacionRenta } from "@/lib/calculadora-renta-2026";

export default function ContratoPage() {
  const { usuario, viviendaActiva } = useApp();

  // Calculadora RDL 29/2026 + IRAV
  const [rentaCalc, setRentaCalc] = useState(viviendaActiva.rentaBaseEur);
  const [fechaFirma, setFechaFirma] = useState(viviendaActiva.fechaInicio);
  const [zonaTensionada, setZonaTensionada] = useState(
    viviendaActiva.esZonaTensionada
  );
  const [superaIndice, setSuperaIndice] = useState(false);

  const resultadoCalc = calcularActualizacionRenta({
    rentaActualEur: Number(rentaCalc) || 0,
    fechaFirmaContrato: fechaFirma,
    fechaRevision: "2026-12-01",
    tipoContrato: viviendaActiva.tipoContrato,
    esZonaTensionada: zonaTensionada,
    superaIndiceReferenciaTensionada: superaIndice,
    iravVigentePct: 2.57, // INE octubre 2026
    tieneClausulaActualizacion: true,
  });

  // Abogado IA
  const [consulta, setConsulta] = useState(
    "¿Cuánto me pueden subir el alquiler en enero de 2027 con el nuevo decreto de vivienda?"
  );
  const [consultando, setConsultando] = useState(false);
  const [respuestaIa, setRespuestaIa] = useState<{
    resumen_corto: string;
    respuesta: string;
    normativa_citada?: string[];
    aviso_legal?: string;
    modelo?: string;
  } | null>(null);
  const [errorIa, setErrorIa] = useState<string | null>(null);

  const consultarAbogadoIa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consulta.trim()) return;
    setConsultando(true);
    setErrorIa(null);
    try {
      const res = await fetch("/api/ia/asesor-legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consulta,
          rol: usuario?.rol || "inquilino",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al consultar IA");
      setRespuestaIa(data);
    } catch (err) {
      setErrorIa(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setConsultando(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 space-y-8 animate-enter">
        <section>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
            Marco Normativo Noviembre 2026 · {viviendaActiva.alias}
          </span>
          <h1 className="font-editorial text-4xl text-primary font-normal mt-1">
            Documentación, Fianza Legal y RDL 29/2026
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Custodia compartida del contrato y el resguardo autonómico de fianza
            (Art. 36 LAU), calculadora oficial de subida de renta y consulta al
            asistente legal IA.
          </p>
        </section>

        {/* Tarjetas Documentación y Fianza */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-outline">
                    Documento Oficial
                  </span>
                  <h2 className="font-editorial text-xl text-primary">
                    Contrato de Arrendamiento LAU
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Código {viviendaActiva.codigoVinculacion} · Inicio{" "}
                    {viviendaActiva.fechaInicio}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-[11px] font-semibold">
                Vigente
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Propietario: <strong>{viviendaActiva.propietarioNombre}</strong> ·
              Inquilino: <strong>{viviendaActiva.inquilinoNombre}</strong>
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/60 flex items-center justify-center text-secondary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                    Resguardo Autonómico (Art. 36 LAU)
                  </span>
                  <h2 className="font-editorial text-xl text-primary">
                    Depósito de Fianza Legal ({viviendaActiva.fianzaEur} €)
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {viviendaActiva.organismoFianza} · Ref.{" "}
                    {viviendaActiva.numeroDepositoFianza}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/70 text-on-secondary-container text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verificado
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Plazo legal de devolución al entregar llaves: 30 días naturales.
            </p>
          </div>
        </div>

        {/* Calculadora RDL 29/2026 + Abogado IA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calculadora */}
          <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase tracking-widest">
              <Calculator className="w-4 h-4" />
              Calculadora Legal de Subida de Renta (RDL 29/2026)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="renta-calc"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  Renta actual (€/mes)
                </label>
                <input
                  id="renta-calc"
                  type="number"
                  value={rentaCalc}
                  onChange={(e) => setRentaCalc(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="fecha-firma"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  Fecha firma contrato
                </label>
                <input
                  id="fecha-firma"
                  type="date"
                  value={fechaFirma}
                  onChange={(e) => setFechaFirma(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zonaTensionada}
                  onChange={(e) => setZonaTensionada(e.target.checked)}
                />
                Vivienda en zona tensionada
              </label>
              {zonaTensionada && (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={superaIndice}
                    onChange={(e) => setSuperaIndice(e.target.checked)}
                  />
                  La renta actual ya supera el índice oficial
                </label>
              )}
            </div>

            <div className="p-5 rounded-xl bg-surface-container-low space-y-2 border border-outline-variant/40">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                  Nueva renta máxima legal
                </span>
                <span className="font-editorial text-3xl text-primary">
                  {resultadoCalc.rentaNuevaEur.toFixed(2)} €
                </span>
              </div>
              <p className="text-xs font-semibold text-secondary">
                Subida máxima: +{resultadoCalc.subidaPermitidaPct.toFixed(2)} % (+
                {resultadoCalc.incrementoMensualEur.toFixed(2)} €/mes)
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                {resultadoCalc.explicacion}
              </p>
            </div>
          </div>

          {/* Asistente Legal IA */}
          <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              Asesor Jurídico IA (Ley 12/2023 y RDL 29/2026)
            </div>

            <form onSubmit={consultarAbogadoIa} className="space-y-3">
              <textarea
                rows={3}
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Pregunta sobre tope del 2 %, IRAV, prórrogas, alquiler de temporada, habitaciones, fianza o gastos..."
                className="w-full p-3.5 rounded-xl bg-surface-container-low text-sm text-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={consultando}
                className="btn-press w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                <Scale className="w-4 h-4" />
                {consultando
                  ? "Consultando normativa vigente con Gemini..."
                  : "Consultar al Asesor IA"}
              </button>
            </form>

            {errorIa && (
              <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                {errorIa}
              </p>
            )}

            {respuestaIa && (
              <div className="p-5 rounded-xl bg-secondary-container/35 border border-secondary/30 space-y-3 text-xs">
                <h3 className="font-editorial text-lg text-primary">
                  {respuestaIa.resumen_corto}
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {respuestaIa.respuesta}
                </p>
                {respuestaIa.normativa_citada &&
                  respuestaIa.normativa_citada.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {respuestaIa.normativa_citada.map((norma, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-primary font-semibold text-[10px]"
                        >
                          {norma}
                        </span>
                      ))}
                    </div>
                  )}
                <p className="text-[10px] text-outline pt-1">
                  {respuestaIa.aviso_legal} · Motor: {respuestaIa.modelo}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
