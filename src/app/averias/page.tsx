"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Scale,
  Sparkles,
  Wrench,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

export default function AveriasPage() {
  const {
    viviendaActiva,
    crearIncidencia,
    simularVencimiento15Dias,
    aplicarDescuentoIncidencia,
  } = useApp();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [errorIa, setErrorIa] = useState<string | null>(null);
  const [ultimoModelo, setUltimoModelo] = useState<string | null>(null);
  const [facturas, setFacturas] = useState<Record<string, string>>({});

  const handleReportar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return;
    setAnalizando(true);
    setErrorIa(null);

    try {
      const res = await fetch("/api/ia/reparaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descripcion,
          contextoContrato: `Vivienda habitual en ${viviendaActiva.municipio}, contrato iniciado el ${viviendaActiva.fechaInicio}.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al consultar IA");

      setUltimoModelo(data.modelo || "Google Gemini Flash");
      crearIncidencia({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: "Triage Legal IA",
        urgencia: data.urgencia || "media",
        responsableIa: data.responsable || "revisar",
        articuloLau: data.articulo_lau || "Art. 21 LAU",
        dictamenIa: data.explicacion || "Pendiente de revisión.",
        guiaEmergencia:
          data.guia_emergencia ||
          "Documenta con fotos y evita manipular instalaciones eléctricas o de gas.",
        busquedaBricolaje: data.busqueda_bricolaje || undefined,
      });

      setTitulo("");
      setDescripcion("");
    } catch (err) {
      setErrorIa(
        err instanceof Error
          ? err.message
          : "No se pudo completar el análisis con IA."
      );
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 space-y-8 animate-enter">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-on-tertiary-container">
              Mediación Neutral Art. 21 LAU · {viviendaActiva.alias}
            </span>
            <h1 className="font-editorial text-4xl text-primary font-normal mt-1">
              Averías, Mediación IA y Plazo Legal
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              La IA analiza cada incidencia frente a la Ley de Arrendamientos
              Urbanos para evitar discusiones y controlar el plazo legal de 15
              días.
            </p>
          </div>
          {ultimoModelo && (
            <span className="px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-[11px] font-semibold">
              Último dictamen IA: {ultimoModelo}
            </span>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario de reporte con IA */}
          <form
            onSubmit={handleReportar}
            className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              Reportar Nueva Incidencia con Triage IA
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="titulo-averia"
                className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Resumen de la avería
              </label>
              <input
                id="titulo-averia"
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. La lavadora no centrifuga o gotea el fregadero"
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="desc-averia"
                className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Descripción detallada
              </label>
              <textarea
                id="desc-averia"
                rows={4}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Explica qué ocurre, desde cuándo y si ha habido uso normal o algún golpe..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {errorIa && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs">
                {errorIa}
              </div>
            )}

            <button
              type="submit"
              disabled={analizando}
              className="btn-press w-full py-3.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              {analizando
                ? "Analizando con Google Gemini Flash..."
                : "Analizar responsabilidad con IA y notificar"}
            </button>

            <p className="text-[11px] text-outline leading-relaxed">
              Aviso: El dictamen de la IA es orientativo según el art. 21 de la
              LAU y no sustituye el asesoramiento jurídico profesional.
            </p>
          </form>

          {/* Listado de averías y reloj 15 días */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-editorial text-2xl text-primary">
              Expedientes de la Vivienda ({viviendaActiva.incidencias.length})
            </h2>

            {viviendaActiva.incidencias.map((inc) => {
              const plazoVencido =
                inc.diasRestantesPlazo15 <= 0 &&
                inc.responsableIa === "propietario" &&
                inc.estado !== "resuelta" &&
                inc.estado !== "descuento_aplicado";

              return (
                <article
                  key={inc.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            inc.responsableIa === "propietario"
                              ? "bg-secondary-container/70 text-on-secondary-container"
                              : "bg-surface-container text-primary"
                          }`}
                        >
                          Dictamen IA: {inc.responsableIa}
                        </span>
                        <span className="text-xs text-outline">
                          {inc.fechaReporte} · Urgencia {inc.urgencia}
                        </span>
                      </div>
                      <h3 className="font-editorial text-xl text-primary">
                        {inc.titulo}
                      </h3>
                    </div>

                    {inc.estado === "resuelta" ||
                    inc.estado === "descuento_aplicado" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {inc.estado === "descuento_aplicado"
                          ? `Descontado (${inc.facturaDescuentoEur} €)`
                          : "Resuelta"}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          plazoVencido
                            ? "bg-error-container text-on-error-container"
                            : "bg-surface-container-low text-primary"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {plazoVencido
                          ? "Plazo 15d vencido"
                          : `Quedan ${inc.diasRestantesPlazo15} días (LAU)`}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {inc.descripcion}
                  </p>

                  {/* Bloque Dictamen Legal IA */}
                  <div className="p-4 rounded-xl bg-surface-container-low space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                      <Scale className="w-4 h-4 text-secondary" />
                      {inc.articuloLau}
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                      {inc.dictamenIa}
                    </p>
                    <p className="text-primary">
                      <strong>Guía rápida de prevención:</strong>{" "}
                      {inc.guiaEmergencia}
                    </p>
                    {inc.busquedaBricolaje && (
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          inc.busquedaBricolaje
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-secondary font-semibold underline underline-offset-4 pt-1"
                      >
                        Ver tutoriales de bricolaje en YouTube
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {inc.propuestaPropietario && (
                    <div className="p-3.5 rounded-xl bg-secondary-container/40 text-xs text-on-secondary-container">
                      <strong>Respuesta del propietario:</strong>{" "}
                      {inc.propuestaPropietario}
                    </div>
                  )}

                  {/* Demostración de protección plazo 15d (inspirado en ArrendaFácil) */}
                  {inc.responsableIa === "propietario" &&
                    inc.estado === "abierta" &&
                    !plazoVencido && (
                      <div className="pt-2 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-outline">
                          Si el propietario no responde en 15 días en averías de
                          habitabilidad, puedes reparar y descontar.
                        </span>
                        <button
                          type="button"
                          onClick={() => simularVencimiento15Dias(inc.id)}
                          className="btn-press px-3 py-1.5 rounded-lg bg-surface-container text-primary text-[11px] font-semibold hover:bg-surface-container-high"
                        >
                          Simular +15 días sin respuesta
                        </button>
                      </div>
                    )}

                  {plazoVencido && (
                    <div className="p-4 rounded-xl bg-error-container/60 border border-error/30 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-on-error-container">
                        <AlertTriangle className="w-4 h-4" />
                        Plazo legal vencido: habilitado descuento en mensualidad
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Importe factura técnico (€)"
                          value={facturas[inc.id] ?? "145"}
                          onChange={(e) =>
                            setFacturas((prev) => ({
                              ...prev,
                              [inc.id]: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-2 rounded-lg bg-surface-container-lowest text-xs text-primary"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            aplicarDescuentoIncidencia(
                              inc.id,
                              Number(facturas[inc.id] ?? 145)
                            )
                          }
                          className="btn-press px-4 py-2 rounded-lg bg-error text-white text-xs font-semibold"
                        >
                          Descontar de mensualidad
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
