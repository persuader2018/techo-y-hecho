"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  Check,
  Copy,
  CreditCard,
  FileText,
  KeyRound,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

export default function PortalInquilinoPage() {
  const { usuario, viviendaActiva, vincularPorCodigo } = useApp();
  const [copiado, setCopiado] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");
  const [msgVinculo, setMsgVinculo] = useState<string | null>(null);

  const totalMensual =
    viviendaActiva.rentaBaseEur +
    viviendaActiva.gastosComunidadEur +
    viviendaActiva.tasaResiduosEur;

  const averiaActiva = viviendaActiva.incidencias.find(
    (i) => i.estado === "abierta" || i.estado === "en_proceso"
  );

  const progresoPct = Math.min(
    100,
    Math.round(
      (viviendaActiva.mesActualContrato / viviendaActiva.mesesTotalesContrato) *
        100
    )
  );

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(viviendaActiva.codigoVinculacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const handleVincular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoInput.trim()) return;
    const res = await vincularPorCodigo(codigoInput);
    setMsgVinculo(res.mensaje);
    if (res.ok) setCodigoInput("");
  };

  return (
    <AppShell>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 space-y-8 animate-enter">
        {/* Cabecera Editorial de Vivienda */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-secondary-container/70 text-on-secondary-container text-[11px] font-semibold uppercase tracking-widest">
                Vivienda Habitual · {viviendaActiva.esZonaTensionada ? "Zona Tensionada" : "Régimen LAU"}
              </span>
              <button
                type="button"
                onClick={copiarCodigo}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant bg-surface-container-low px-2.5 py-0.5 rounded-full hover:bg-surface-container"
              >
                <span>ID Contrato: {viviendaActiva.codigoVinculacion}</span>
                {copiado ? (
                  <Check className="w-3.5 h-3.5 text-secondary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl text-primary font-normal tracking-tight">
              Buenos días, {(usuario?.nombre || "Elena").split(" ")[0]}.
            </h1>

            <p className="font-editorial text-lg sm:text-xl text-on-surface-variant italic">
              {viviendaActiva.direccion}, {viviendaActiva.codigoPostal}{" "}
              {viviendaActiva.municipio}
            </p>
          </div>

          <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Protección Vigente
              </span>
              <span className="text-xs font-semibold text-primary">
                RDL 29/2026 (Tope 2 %) · Fianza depositada
              </span>
            </div>
          </div>
        </section>

        {/* Grid editorial 7 / 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna izquierda (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Tarjeta Financiera Mensual */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-xs border border-outline-variant/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">
                    Estado Arrendaticio · Noviembre 2026
                  </span>
                  <h2 className="font-editorial text-4xl text-primary font-normal tabular-nums">
                    {totalMensual.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-[11px] font-semibold uppercase">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Recibo emitido · Al día
                </div>
              </div>

              <div className="space-y-2.5 bg-surface-container-low/70 p-4 rounded-xl text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-on-surface-variant">
                    Renta base contractual (IRAV / Tope 2 %)
                  </span>
                  <span className="font-semibold text-primary tabular-nums whitespace-nowrap">
                    {viviendaActiva.rentaBaseEur.toFixed(2)} €
                  </span>
                </div>
                {viviendaActiva.gastosComunidadEur > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-on-surface-variant">
                      Gastos ordinarios de comunidad (pactados art. 20)
                    </span>
                    <span className="font-semibold text-primary tabular-nums whitespace-nowrap">
                      {viviendaActiva.gastosComunidadEur.toFixed(2)} €
                    </span>
                  </div>
                )}
                {viviendaActiva.tasaResiduosEur > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-on-surface-variant">
                      Tasa municipal de residuos
                    </span>
                    <span className="font-semibold text-primary tabular-nums whitespace-nowrap">
                      {viviendaActiva.tasaResiduosEur.toFixed(2)} €
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-outline-variant/40 flex justify-between text-[11px] uppercase tracking-wider text-outline font-semibold">
                  <span>Vencimiento sin recargo</span>
                  <span>05 Diciembre 2026</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="uppercase tracking-wider text-on-surface-variant font-semibold">
                    Puntualidad verificada:{" "}
                  </span>
                  <span className="text-secondary font-bold">
                    {viviendaActiva.certificadoInquilino.pagosPuntualesPct} % (
                    {viviendaActiva.certificadoInquilino.mesesVerificados} meses)
                  </span>
                </div>
                <svg
                  className="w-28 h-6 text-secondary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  viewBox="0 0 140 24"
                >
                  <path
                    d="M2 18 L28 13 L55 14 L80 8 L108 8 L136 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="136" cy="4" r="2.5" fill="currentColor" />
                </svg>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/pagos"
                  className="btn-press px-5 py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-container"
                >
                  <CreditCard className="w-4 h-4" />
                  Gestionar pagos y suministros
                </Link>
                <Link
                  href="/contrato"
                  className="btn-press px-5 py-3 rounded-xl bg-surface-container text-primary text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-surface-container-high"
                >
                  <FileText className="w-4 h-4" />
                  Ver contrato y calculadora 2 %
                </Link>
              </div>
            </div>

            {/* Tarjeta Visual + Longevidad del Contrato */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xs border border-outline-variant/40 flex flex-col md:flex-row editorial-photo-wrap">
              <div className="md:w-5/12 h-56 md:h-auto relative overflow-hidden">
                <img
                  src={viviendaActiva.imagenUrl}
                  alt={viviendaActiva.alias}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-surface/90 backdrop-blur text-primary text-xs font-semibold">
                  {viviendaActiva.superficieM2} m² ·{" "}
                  {viviendaActiva.exterior ? "Exterior" : "Interior"}
                </span>
              </div>
              <div className="p-6 md:w-7/12 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="uppercase tracking-wider font-semibold text-secondary">
                      Régimen Ordinario LAU
                    </span>
                    <span className="text-on-surface-variant font-medium">
                      Fianza: {viviendaActiva.fianzaEur} € (
                      {viviendaActiva.numeroDepositoFianza})
                    </span>
                  </div>
                  <h3 className="font-editorial text-2xl text-primary">
                    Mes {viviendaActiva.mesActualContrato} de{" "}
                    {viviendaActiva.mesesTotalesContrato} · Prórroga Legal
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Amparado bajo el Art. 9 LAU y el RDL 29/2026 (derecho a
                    prórroga extraordinaria de hasta 2 años adicionales al
                    corriente de pago).
                  </p>
                </div>

                <div className="space-y-2 bg-surface-container-low p-3.5 rounded-xl">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">
                      Próxima actualización legal:
                    </span>
                    <span className="font-semibold text-primary">
                      Tope 2,00 % (RDL 29/2026)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{ width: `${progresoPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-outline">
                    <span>Inicio: {viviendaActiva.fechaInicio}</span>
                    <span>Fin: {viviendaActiva.fechaFin}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Monitor Art. 21 LAU */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-on-tertiary-container">
                  Monitor Art. 21 LAU
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {viviendaActiva.incidencias.length} registros
                </span>
              </div>

              {averiaActiva ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-lg text-primary leading-snug">
                        {averiaActiva.titulo}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Dictamen IA:{" "}
                        <strong className="text-primary capitalize">
                          Corresponde al {averiaActiva.responsableIa}
                        </strong>{" "}
                        · Plazo legal restante:{" "}
                        <strong>{averiaActiva.diasRestantesPlazo15} días</strong>
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/averias"
                    className="btn-press w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    Abrir seguimiento y mediador IA
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Sin averías abiertas actualmente en la vivienda.
                </p>
              )}
            </div>

            {/* Pasaporte de Buen Inquilino (Idea 1) */}
            <div className="bg-primary text-on-primary rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-secondary-fixed">
                  <Award className="w-4 h-4" />
                  Pasaporte de Buen Inquilino
                </span>
                <span className="text-xs font-mono text-primary-fixed-dim">
                  {viviendaActiva.certificadoInquilino.codigo}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-4xl">
                  {viviendaActiva.certificadoInquilino.puntuacion}/100
                </span>
                <span className="text-xs text-secondary-fixed">
                  Conectado con InquiCheck ({viviendaActiva.idPasaporteInquicheck})
                </span>
              </div>
              <p className="text-xs text-primary-fixed-dim leading-relaxed">
                {viviendaActiva.certificadoInquilino.selloVerificacion}. Úsalo al
                cambiar de piso para demostrar historial real ante nuevos
                propietarios.
              </p>
              <Link
                href="/pasaporte"
                className="btn-press w-full py-2.5 px-4 rounded-xl bg-surface text-primary text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-surface-container-high"
              >
                Ver certificado bilateral completo
              </Link>
            </div>

            {/* Vincular otro piso por código */}
            <form
              onSubmit={handleVincular}
              className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/40 space-y-3"
            >
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-secondary" />
                Vincular vivienda por código
              </div>
              <p className="text-xs text-on-surface-variant">
                Introduce el código que te ha facilitado tu propietario (prueba{" "}
                <code className="font-semibold text-primary">MAD-2026-B</code> o{" "}
                <code className="font-semibold text-primary">VAL-2026-A</code>).
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  placeholder="Ej. VAL-2026-A"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs uppercase tracking-wider text-primary border border-outline-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="btn-press px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
                >
                  Vincular
                </button>
              </div>
              {msgVinculo && (
                <p className="text-xs text-secondary font-medium">{msgVinculo}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
