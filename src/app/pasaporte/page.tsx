"use client";

import { useState } from "react";
import {
  Award,
  Check,
  CheckCircle2,
  ExternalLink,
  Link2,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

type SubTab = "certificado" | "evaluador";

export default function PasaportePage() {
  const { viviendaActiva, actualizarInquicheckPasaporte } = useApp();
  const inquicheckUrl =
    process.env.NEXT_PUBLIC_INQUICHECK_URL || "https://inquicheck.vercel.app";

  const [tab, setTab] = useState<SubTab>("certificado");
  const [idInquicheck, setIdInquicheck] = useState(
    viviendaActiva.idPasaporteInquicheck
  );
  const [adjuntarInquicheck, setAdjuntarInquicheck] = useState(
    viviendaActiva.solvenciaInquicheckAdjunta
  );
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);

  // Evaluador IA
  const [ingresos, setIngresos] = useState(3400);
  const [renta, setRenta] = useState(viviendaActiva.rentaBaseEur);
  const [mesesPuntuales, setMesesPuntuales] = useState(
    viviendaActiva.certificadoInquilino.mesesVerificados
  );
  const [contratoLaboral, setContratoLaboral] = useState("Indefinido");
  const [evaluando, setEvaluando] = useState(false);
  const [resultado, setResultado] = useState<{
    nivel_solvencia: string;
    puntuacion_estimada: number;
    dictamen_breve: string;
    ratioEsfuerzo: number;
  } | null>(null);
  const [errorIa, setErrorIa] = useState<string | null>(null);

  const generarEnlaceCompartible = () => {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://techoyhecho.es";
    const params = new URLSearchParams({
      cert: viviendaActiva.certificadoInquilino.codigo,
      score: String(viviendaActiva.certificadoInquilino.puntuacion),
      ...(adjuntarInquicheck && idInquicheck
        ? { inquicheck: idInquicheck.replace("#", "") }
        : {}),
    });
    return `${base}/pasaporte?${params.toString()}`;
  };

  const copiarEnlace = () => {
    navigator.clipboard?.writeText(generarEnlaceCompartible());
    setEnlaceCopiado(true);
    setTimeout(() => setEnlaceCopiado(false), 2200);
  };

  const descargarPdf = () => {
    if (typeof window !== "undefined") window.print();
  };

  const evaluarPasaporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluando(true);
    setErrorIa(null);
    try {
      const res = await fetch("/api/ia/pasaporte-solvencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingresosMensuales: ingresos,
          rentaDeseada: renta,
          mesesPagosPuntuales: mesesPuntuales,
          tipoContratoLaboral: contratoLaboral,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al evaluar");
      setResultado(data);
    } catch (err) {
      setErrorIa(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setEvaluando(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6 animate-enter">
        {/* Cabecera + Submenú */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Pasaporte de Buen Inquilino
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Descarga tu certificado en PDF o comparte el enlace junto a tu
              solvencia de InquiCheck
            </p>
          </div>

          <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab("certificado")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "certificado"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Mi Pasaporte y PDF
            </button>
            <button
              type="button"
              onClick={() => setTab("evaluador")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "evaluador"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Evaluar con IA
            </button>
          </div>
        </div>

        {/* SUBMENÚ 1: CERTIFICADO IMPRIMIBLE PDF + ENLACE + ADJUNTAR INQUICHECK */}
        {tab === "certificado" && (
          <div className="space-y-6 animate-enter">
            {/* Tarjeta Oficial Imprimible en PDF */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-10 border-2 border-primary/15 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/logo-techoyhecho.jpg"
                    alt="Techo y Hecho"
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
                      Certificado Oficial de Historial Verificado
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl text-primary">
                      {viviendaActiva.certificadoInquilino.titular}
                    </h2>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="block text-[11px] uppercase text-outline font-semibold">
                    Código verificable
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {viviendaActiva.certificadoInquilino.codigo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="block font-editorial text-3xl text-emerald-900">
                    {viviendaActiva.certificadoInquilino.puntuacion}/100
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    Índice Buen Inquilino
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low text-center">
                  <span className="block font-editorial text-3xl text-primary">
                    {viviendaActiva.certificadoInquilino.pagosPuntualesPct} %
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Pagos puntuales ({viviendaActiva.certificadoInquilino.mesesVerificados} meses)
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low text-center">
                  <span className="block font-editorial text-3xl text-secondary">
                    {resultado ? resultado.nivel_solvencia.split(" ")[1] : "A1"}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Apto seguro de impago
                  </span>
                </div>
              </div>

              {/* Bloque Solvencia InquiCheck integrada en el PDF */}
              {adjuntarInquicheck && (
                <div className="p-4 rounded-xl bg-secondary-container/40 border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-secondary shrink-0" />
                    <div className="text-xs">
                      <strong className="text-primary block">
                        Solvencia InquiCheck adjuntada ({idInquicheck || "#IC-E42GC2"})
                      </strong>
                      <span className="text-on-surface-variant">
                        Vida laboral TGSS verificada por CSV · Protocolo Custodia Cero
                      </span>
                    </div>
                  </div>
                  <a
                    href={inquicheckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-print text-xs font-bold text-secondary underline underline-offset-4 inline-flex items-center gap-1 shrink-0"
                  >
                    Ver en InquiCheck <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {viviendaActiva.certificadoInquilino.selloVerificacion}
              </div>

              {/* Botones de acción: PDF y Enlace compartible */}
              <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row gap-3 no-print">
                <button
                  type="button"
                  onClick={descargarPdf}
                  className="btn-press flex-1 py-3.5 px-5 rounded-xl bg-primary text-on-primary text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-container"
                >
                  <Printer className="w-4 h-4" />
                  Descargar / Imprimir Pasaporte en PDF
                </button>
                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="btn-press flex-1 py-3.5 px-5 rounded-xl bg-secondary text-on-secondary text-xs font-semibold inline-flex items-center justify-center gap-2 hover:opacity-95"
                >
                  {enlaceCopiado ? (
                    <>
                      <Check className="w-4 h-4" />
                      Enlace copiado para enviar
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copiar enlace compartible
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Configurar adjunto de InquiCheck */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 space-y-4 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-primary">
                    Adjuntar mi Pasaporte de Solvencia de InquiCheck
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Incluye tu código de InquiCheck dentro de este PDF y enlace
                    para futuros contratos.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adjuntarInquicheck}
                    onChange={(e) => {
                      setAdjuntarInquicheck(e.target.checked);
                      actualizarInquicheckPasaporte(idInquicheck, e.target.checked);
                    }}
                  />
                  Incluir en PDF y enlace
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={idInquicheck}
                  onChange={(e) => {
                    setIdInquicheck(e.target.value);
                    actualizarInquicheckPasaporte(e.target.value, adjuntarInquicheck);
                  }}
                  placeholder="Ej. #IC-E42GC2"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-xs font-mono text-primary border border-outline-variant/50"
                />
                <a
                  href={inquicheckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press px-4 py-2.5 rounded-xl bg-surface-container text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  Obtener mi ID en InquiCheck
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* SUBMENÚ 2: EVALUADOR IA */}
        {tab === "evaluador" && (
          <form
            onSubmit={evaluarPasaporte}
            className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5 max-w-2xl animate-enter"
          >
            <h2 className="font-editorial text-2xl text-primary">
              Simular resultado de solvencia + historial con IA
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Ingresos netos (€/mes)
                </label>
                <input
                  type="number"
                  value={ingresos}
                  onChange={(e) => setIngresos(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Renta objetivo (€/mes)
                </label>
                <input
                  type="number"
                  value={renta}
                  onChange={(e) => setRenta(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Meses puntuales verificados
                </label>
                <input
                  type="number"
                  value={mesesPuntuales}
                  onChange={(e) => setMesesPuntuales(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Situación laboral
                </label>
                <select
                  value={contratoLaboral}
                  onChange={(e) => setContratoLaboral(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                >
                  <option value="Indefinido">Indefinido</option>
                  <option value="Funcionario">Funcionario</option>
                  <option value="Autónomo">Autónomo</option>
                  <option value="Temporal">Temporal</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={evaluando}
              className="btn-press w-full py-3.5 rounded-xl bg-primary text-on-primary text-xs font-semibold disabled:opacity-60"
            >
              {evaluando ? "Evaluando con Gemini Flash..." : "Evaluar perfil"}
            </button>

            {errorIa && (
              <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                {errorIa}
              </p>
            )}

            {resultado && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="font-editorial text-xl text-emerald-950">
                    {resultado.nivel_solvencia}
                  </strong>
                  <span className="px-2.5 py-1 rounded-full bg-white text-emerald-900 font-bold">
                    Esfuerzo {resultado.ratioEsfuerzo} % · {resultado.puntuacion_estimada}/100
                  </span>
                </div>
                <p className="text-emerald-950">{resultado.dictamen_breve}</p>
              </div>
            )}
          </form>
        )}
      </div>
    </AppShell>
  );
}
