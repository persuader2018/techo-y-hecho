"use client";

import { useState } from "react";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

export default function PasaportePage() {
  const { viviendaActiva } = useApp();
  const inquicheckUrl =
    process.env.NEXT_PUBLIC_INQUICHECK_URL || "https://inquicheck.vercel.app";

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
    apto_seguro_impago: boolean;
    dictamen_breve: string;
    ratioEsfuerzo: number;
    modelo?: string;
  } | null>(null);
  const [errorIa, setErrorIa] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(data.error || "Error al evaluar pasaporte");
      setResultado(data);
    } catch (err) {
      setErrorIa(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setEvaluando(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 space-y-10 animate-enter">
        <section className="max-w-3xl">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
            Reputación Bilateral Verificada · Conectado a InquiCheck
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-primary font-normal mt-1">
            Pasaporte de Buen Inquilino y Buen Casero
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
            InquiCheck demuestra tu solvencia <strong>antes</strong> de entrar.
            Techo y Hecho certifica tu comportamiento real{" "}
            <strong>durante</strong> el contrato para abrirte puertas en el
            futuro sin discusiones.
          </p>
        </section>

        {/* Tarjetas Bilaterales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certificado Inquilino */}
          <div className="bg-primary text-on-primary rounded-2xl p-8 space-y-5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary-fixed">
                <Award className="w-4 h-4" />
                Certificado de Buen Inquilino
              </span>
              <span className="font-mono text-xs text-primary-fixed-dim">
                {viviendaActiva.certificadoInquilino.codigo}
              </span>
            </div>

            <div>
              <h2 className="font-editorial text-3xl font-normal">
                {viviendaActiva.certificadoInquilino.titular}
              </h2>
              <p className="text-xs text-primary-fixed-dim mt-1">
                Inmueble actual: {viviendaActiva.alias} · Pasaporte InquiCheck{" "}
                {viviendaActiva.idPasaporteInquicheck}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-white/5 rounded-xl p-4 text-center">
              <div>
                <span className="block font-editorial text-2xl text-secondary-fixed">
                  {viviendaActiva.certificadoInquilino.puntuacion}/100
                </span>
                <span className="text-[10px] uppercase tracking-wider text-primary-fixed-dim">
                  Índice global
                </span>
              </div>
              <div>
                <span className="block font-editorial text-2xl">
                  {viviendaActiva.certificadoInquilino.pagosPuntualesPct} %
                </span>
                <span className="text-[10px] uppercase tracking-wider text-primary-fixed-dim">
                  Pagos puntuales
                </span>
              </div>
              <div>
                <span className="block font-editorial text-2xl">
                  {viviendaActiva.certificadoInquilino.mesesVerificados}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-primary-fixed-dim">
                  Meses avalados
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-secondary-fixed">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {viviendaActiva.certificadoInquilino.selloVerificacion}
            </div>
          </div>

          {/* Certificado Propietario */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                <ShieldCheck className="w-4 h-4" />
                Certificado de Buen Casero
              </span>
              <span className="font-mono text-xs text-outline">
                {viviendaActiva.certificadoCasero.codigo}
              </span>
            </div>

            <div>
              <h2 className="font-editorial text-3xl text-primary font-normal">
                {viviendaActiva.certificadoCasero.titular}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Fianza depositada en {viviendaActiva.organismoFianza}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-surface-container-low rounded-xl p-4 text-center">
              <div>
                <span className="block font-editorial text-2xl text-secondary">
                  {viviendaActiva.certificadoCasero.puntuacion}/100
                </span>
                <span className="text-[10px] uppercase tracking-wider text-outline">
                  Índice global
                </span>
              </div>
              <div>
                <span className="block font-editorial text-2xl text-primary">
                  &lt; {viviendaActiva.certificadoCasero.horasRespuestaMedia} h
                </span>
                <span className="text-[10px] uppercase tracking-wider text-outline">
                  Respuesta averías
                </span>
              </div>
              <div>
                <span className="block font-editorial text-2xl text-primary">
                  100 %
                </span>
                <span className="text-[10px] uppercase tracking-wider text-outline">
                  Fianza en regla
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-secondary font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {viviendaActiva.certificadoCasero.selloVerificacion}
            </div>
          </div>
        </div>

        {/* Simulador IA de Solvencia + Puente InquiCheck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={evaluarPasaporte}
            className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5"
          >
            <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              Evaluador IA de Solvencia + Historial Verificado
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Ingresos netos hogar (€/mes)
                </label>
                <input
                  type="number"
                  value={ingresos}
                  onChange={(e) => setIngresos(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Renta vivienda (€/mes)
                </label>
                <input
                  type="number"
                  value={renta}
                  onChange={(e) => setRenta(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Meses puntuales verificados
                </label>
                <input
                  type="number"
                  value={mesesPuntuales}
                  onChange={(e) => setMesesPuntuales(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Situación laboral
                </label>
                <select
                  value={contratoLaboral}
                  onChange={(e) => setContratoLaboral(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                >
                  <option value="Indefinido">Contrato Indefinido</option>
                  <option value="Funcionario">Funcionario / Sector Público</option>
                  <option value="Autónomo">Autónomo</option>
                  <option value="Temporal">Contrato Temporal</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={evaluando}
              className="btn-press w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-60"
            >
              {evaluando
                ? "Calculando dictamen con Gemini Flash..."
                : "Evaluar perfil combinado con IA"}
            </button>

            {errorIa && (
              <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                {errorIa}
              </p>
            )}

            {resultado && (
              <div className="p-5 rounded-xl bg-secondary-container/40 border border-secondary/30 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="font-editorial text-xl text-primary">
                    {resultado.nivel_solvencia}
                  </strong>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-bold">
                    Esfuerzo: {resultado.ratioEsfuerzo} % · Score{" "}
                    {resultado.puntuacion_estimada}/100
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  {resultado.dictamen_breve}
                </p>
                <p className="text-[10px] text-outline">
                  Motor IA: {resultado.modelo}
                </p>
              </div>
            )}
          </form>

          {/* Puente directo a InquiCheck */}
          <div className="lg:col-span-5 bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-outline-variant/50 space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
              Pre-contrato · Protocolo Custodia Cero
            </span>
            <h3 className="font-editorial text-2xl text-primary">
              Emite tu Pasaporte Oficial en InquiCheck
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Valida tu Vida Laboral oficial de la TGSS (código CSV) y nómina sin
              guardar tu DNI ni datos bancarios (lectura efímera en memoria RAM).
              Luego vincula tu ID aquí para sumar tu historial real de alquiler.
            </p>
            <a
              href={inquicheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press w-full py-3.5 px-5 rounded-xl bg-secondary text-on-secondary text-xs font-semibold inline-flex items-center justify-center gap-2 hover:opacity-95"
            >
              Abrir InquiCheck.vercel.app
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
