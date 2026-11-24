"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

export default function PropietarioPage() {
  const {
    viviendas,
    viviendaActiva,
    seleccionarVivienda,
    responderIncidenciaPropietario,
    crearNuevaVivienda,
  } = useApp();

  const inquicheckUrl =
    process.env.NEXT_PUBLIC_INQUICHECK_URL || "https://inquicheck.vercel.app";

  // Alta nueva vivienda
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("Madrid");
  const [renta, setRenta] = useState("950");
  const [emailInq, setEmailInq] = useState("");
  const [tensionada, setTensionada] = useState(false);
  const [codigoCreado, setCodigoCreado] = useState<string | null>(null);

  // Propuestas en averías
  const [propuestas, setPropuestas] = useState<Record<string, string>>({});

  const handleAltaVivienda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!direccion.trim()) return;
    const cod = crearNuevaVivienda({
      direccion: direccion.trim(),
      municipio: municipio.trim() || "Madrid",
      rentaBaseEur: Number(renta) || 950,
      emailInquilino: emailInq.trim() || undefined,
      esZonaTensionada: tensionada,
    });
    setCodigoCreado(cod);
    setDireccion("");
    setEmailInq("");
  };

  return (
    <AppShell>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 space-y-8 animate-enter">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
              Portal del Propietario · Gestión Serena
            </span>
            <h1 className="font-editorial text-4xl text-primary font-normal mt-1">
              Mis Viviendas y Averías Activas
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Plan actual:{" "}
              <strong className="text-primary">
                Gratis para siempre en tu 1.ª vivienda
              </strong>{" "}
              · Cartera demo con {viviendas.length} inmuebles activos.
            </p>
          </div>
          <a
            href={inquicheckUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press px-4 py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-semibold inline-flex items-center gap-2 self-start lg:self-auto"
          >
            Buscar inquilino verificado en InquiCheck
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* Selector visual de viviendas del propietario */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {viviendas.map((v) => {
            const activa = v.id === viviendaActiva.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => seleccionarVivienda(v.id)}
                className={`text-left editorial-card rounded-2xl overflow-hidden border transition-all bg-surface-container-lowest ${
                  activa
                    ? "border-secondary ring-2 ring-secondary/30 shadow-md"
                    : "border-outline-variant/40 shadow-xs"
                }`}
              >
                <div className="h-36 overflow-hidden relative">
                  <img
                    src={v.imagenUrl}
                    alt={v.alias}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-surface/95 text-primary text-[10px] font-semibold">
                    {v.codigoVinculacion}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <h2 className="font-editorial text-lg text-primary">
                    {v.alias}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Inquilino: {v.inquilinoNombre} · {v.rentaBaseEur} €/mes
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-secondary font-semibold">
                      {v.incidencias.filter((i) => i.estado === "abierta").length}{" "}
                      averías pendientes
                    </span>
                    <span className="text-outline">{v.municipio}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gestión de averías de la vivienda seleccionada */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-editorial text-2xl text-primary">
              Incidencias en {viviendaActiva.alias}
            </h2>

            {viviendaActiva.incidencias.length === 0 ? (
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-sm text-on-surface-variant">
                No hay incidencias registradas en esta vivienda.
              </div>
            ) : (
              viviendaActiva.incidencias.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                        {inc.articuloLau} · Dictamen IA: {inc.responsableIa}
                      </span>
                      <h3 className="font-editorial text-xl text-primary mt-0.5">
                        {inc.titulo}
                      </h3>
                    </div>
                    {inc.estado === "resuelta" || inc.estado === "descuento_aplicado" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/60 text-xs font-semibold text-on-secondary-container">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {inc.estado === "descuento_aplicado" ? "Descuento aplicado" : "Resuelta"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-xs font-semibold text-primary">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        {inc.diasRestantesPlazo15}d restantes
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {inc.dictamenIa}
                  </p>

                  {inc.estado === "resuelta" || inc.estado === "descuento_aplicado" ? (
                    <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                      <span>Expediente cerrado y archivado en el historial legal.</span>
                    </div>
                  ) : inc.propuestaPropietario ? (
                    <div className="p-3.5 rounded-xl bg-secondary-container/40 text-xs text-on-secondary-container flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Intervención enviada:</strong>{" "}
                        {inc.propuestaPropietario}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={
                          propuestas[inc.id] ??
                          "Técnico oficial avisado para mañana entre 10:00 y 12:00."
                        }
                        onChange={(e) =>
                          setPropuestas((prev) => ({
                            ...prev,
                            [inc.id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          responderIncidenciaPropietario(
                            inc.id,
                            propuestas[inc.id] ??
                              "Técnico oficial avisado para mañana entre 10:00 y 12:00."
                          )
                        }
                        className="btn-press px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Aceptar y enviar técnico
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Formulario Alta de Nueva Vivienda + Servicios Ecosistema (Idea 3) */}
          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={handleAltaVivienda}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                <Plus className="w-4 h-4" />
                Dar de alta nuevo alquiler
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Dirección de la vivienda
                </label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. C/ Serrano 82, 2º Izq"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Municipio
                  </label>
                  <input
                    type="text"
                    required
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Renta mensual (€)
                  </label>
                  <input
                    type="number"
                    required
                    value={renta}
                    onChange={(e) => setRenta(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Email del inquilino (opcional)
                </label>
                <input
                  type="email"
                  value={emailInq}
                  onChange={(e) => setEmailInq(e.target.value)}
                  placeholder="inquilino@ejemplo.es"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={tensionada}
                  onChange={(e) => setTensionada(e.target.checked)}
                />
                Está en zona de mercado residencial tensionado
              </label>

              <button
                type="submit"
                className="btn-press w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container inline-flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Crear contrato y generar código
              </button>

              {codigoCreado && (
                <div className="p-3.5 rounded-xl bg-secondary-container/60 text-on-secondary-container text-xs">
                  Vivienda creada. Comparte el código{" "}
                  <strong className="font-mono">{codigoCreado}</strong> con tu
                  inquilino para vincularlo.
                </div>
              )}
            </form>

            {/* Ecosistema de servicios opcionales (Idea 3) */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 space-y-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-secondary">
                <Sparkles className="w-4 h-4" />
                Servicios opcionales del ecosistema
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Tu primera vivienda es <strong>gratis para siempre</strong>.
                Activa servicios solo cuando los necesites:
              </p>
              <ul className="space-y-2 text-primary">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                  Seguro de impago compatible con Pasaporte InquiCheck
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                  Informe certificado de subida legal RDL 29/2026
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                  Plan Multiarrendador (2+ viviendas con Stripe y OCR ilimitado)
                </li>
              </ul>
              <Link
                href="/contrato"
                className="inline-block pt-1 font-semibold text-secondary underline underline-offset-4"
              >
                Ir a Calculadora RDL 29/2026
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
