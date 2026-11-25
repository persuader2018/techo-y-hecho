"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  FileUp,
  Link2,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import {
  calcularEsfuerzoSeguro,
  fileToBase64Pure,
  inspectPdfMetadataForensic,
  sanitizePII,
} from "@/lib/inquicheck-engine";

type SubTab = "pasaporte" | "solvencia";

export default function PasaportePage() {
  const {
    usuario,
    viviendas,
    guardarPresentacionInquilino,
    guardarSolvenciaIntegrada,
  } = useApp();

  const [tab, setTab] = useState<SubTab>("pasaporte");
  const [presentacion, setPresentacion] = useState(
    usuario?.presentacionInquilino || ""
  );
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);

  // Estado del módulo integrado de Solvencia (portado de InquiCheck v12)
  const [zona, setZona] = useState("Madrid / Área Metropolitana");
  const [numTitulares, setNumTitulares] = useState(1);
  const [vinculo, setVinculo] = useState("Individual");
  const [ingresosManual, setIngresosManual] = useState(2800);
  const [situacionManual, setSituacionManual] = useState("Contrato Indefinido");
  const [archivosPdf, setArchivosPdf] = useState<
    Record<string, { file: File; sospechoso: boolean; productor: string }>
  >({});
  const [consentimientoRgpd, setConsentimientoRgpd] = useState(true);
  const [auditando, setAuditando] = useState(false);
  const [errorAuditoria, setErrorAuditoria] = useState<string | null>(null);

  // Simulador interactivo de esfuerzo 35%
  const [rentaSimulada, setRentaSimulada] = useState(950);

  if (usuario?.rol === "propietario") {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-editorial text-3xl text-primary">
            Pasaporte exclusivo para Inquilinos
          </h1>
          <p className="text-sm text-on-surface-variant">
            Como propietario puedes consultar tus expedientes y pagos desde tu
            panel.
          </p>
          <a
            href="/propietario"
            className="btn-press inline-flex px-6 py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold"
          >
            Ir a mi Panel de Propietario
          </a>
        </div>
      </AppShell>
    );
  }

  // Cálculo REAL del histórico de pagos desde el registro (0 en cuentas nuevas)
  const todasLasRentas = viviendas.flatMap((v) =>
    v.movimientos.filter((m) => m.tipo === "renta")
  );
  const rentasPagadas = todasLasRentas.filter((m) => m.estado !== "pendiente");
  const puntualidadPct =
    todasLasRentas.length > 0
      ? Math.round((rentasPagadas.length / todasLasRentas.length) * 100)
      : null;

  // Referencia telefónica del anterior propietario SOLO si dio consentimiento explícito
  const referenciaCasero = viviendas.find(
    (v) => v.autorizaCompartirTelefono && v.propietarioTelefono
  );

  const solvencia = usuario?.solvenciaIntegrada || null;
  const esfuerzoSim = solvencia
    ? calcularEsfuerzoSeguro(rentaSimulada, solvencia.verified_net_income)
    : null;

  const codigoPasaporte = usuario?.codigoPasaporte || "TYH-INQ-NUEVO";

  const generarEnlacePublico = () => {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://techo-y-hecho.vercel.app";
    return `${base}/pasaporte/ver/${encodeURIComponent(codigoPasaporte)}`;
  };

  const handleSeleccionPdf = async (
    clave: string,
    file: File | undefined
  ) => {
    if (!file) return;
    const meta = await inspectPdfMetadataForensic(file);
    setArchivosPdf((prev) => ({
      ...prev,
      [clave]: { file, sospechoso: meta.sospechoso, productor: meta.productor },
    }));
  };

  const ejecutarAuditoriaSolvencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentimientoRgpd) {
      setErrorAuditoria("Debes aceptar el consentimiento RGPD (Art. 6.1.a).");
      return;
    }
    setAuditando(true);
    setErrorAuditoria(null);

    try {
      const docsPayload: Array<{
        titularIndex: number;
        tipo: "vida_laboral" | "nomina";
        base64: string;
      }> = [];
      let tampering = false;

      for (const [clave, item] of Object.entries(archivosPdf)) {
        if (item.sospechoso) tampering = true;
        const [tipoStr, idxStr] = clave.split("-");
        const base64 = await fileToBase64Pure(item.file);
        docsPayload.push({
          titularIndex: Number(idxStr),
          tipo: tipoStr === "vl" ? "vida_laboral" : "nomina",
          base64,
        });
      }

      const res = await fetch("/api/ia/auditoria-solvencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numApplicants: numTitulares,
          relationship: vinculo,
          searchZone: zona,
          tamperingDetected: tampering,
          docs: docsPayload,
          ingresosManual,
          situacionManual,
          nombreUsuario: usuario?.nombre || "Titular",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al auditar solvencia.");

      // Protocolo Custodia Cero: destruimos las referencias a los PDFs en memoria RAM
      setArchivosPdf({});
      await guardarSolvenciaIntegrada(data);
      setTab("pasaporte");
    } catch (err) {
      setErrorAuditoria(
        err instanceof Error ? err.message : "Error inesperado."
      );
    } finally {
      setAuditando(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6 animate-enter">
        {/* Cabecera + Submenú */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Pasaporte del Buen Inquilino y Solvencia
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Todo integrado en Techo y Hecho · Protocolo Custodia Cero RGPD
            </p>
          </div>

          <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab("pasaporte")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "pasaporte"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Mi Pasaporte (PDF)
            </button>
            <button
              type="button"
              onClick={() => setTab("solvencia")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "solvencia"
                  ? "bg-secondary text-on-secondary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Auditar Solvencia
            </button>
          </div>
        </div>

        {/* SUBMENÚ 1: CERTIFICADO REAL DEL INQUILINO + PDF + ENLACE PÚBLICO */}
        {tab === "pasaporte" && (
          <div className="space-y-6 animate-enter">
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-10 border-2 border-primary/15 shadow-sm space-y-6">
              {/* Cabecera del certificado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
                <div className="flex items-center gap-4">
                  <img
                    src="/images/escudo-confianza.jpg"
                    alt="Sello de confianza Techo y Hecho"
                    className="w-16 h-16 rounded-2xl object-cover border border-outline-variant/40"
                  />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
                      Pasaporte Oficial Techo y Hecho
                    </span>
                    <h2 className="font-editorial text-3xl text-primary">
                      {usuario?.nombre || "Usuario"}
                    </h2>
                    <p className="text-xs text-outline">
                      Registrado desde {usuario?.registradoDesde || "Nov 2026"} ·
                      Código <strong className="font-mono text-primary">{codigoPasaporte}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Métricas REALES desde el registro */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="block font-editorial text-3xl text-emerald-950">
                    {puntualidadPct !== null ? `${puntualidadPct} %` : "Nuevo"}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    Pagos puntuales ({rentasPagadas.length}/{todasLasRentas.length})
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low text-center">
                  <span className="block font-editorial text-3xl text-primary">
                    {solvencia ? `${solvencia.solvency_score}/100` : "Pendiente"}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Score de Solvencia (IA)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low text-center">
                  <span className="block font-editorial text-3xl text-secondary">
                    {solvencia ? `${solvencia.max_safe_rent_35pct} €` : "—"}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Renta segura máx. (35 %)
                  </span>
                </div>
              </div>

              {/* Presentación personal del inquilino */}
              {presentacion && (
                <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/40 text-sm text-primary">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                    Presentación del candidato
                  </span>
                  <p className="italic">“{sanitizePII(presentacion)}”</p>
                </div>
              )}

              {/* Teléfono del anterior propietario SOLO si dio consentimiento */}
              {referenciaCasero && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-950">
                  <Phone className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="block">
                      Referencia directa de anterior propietario autorizada (RGPD)
                    </strong>
                    <span>
                      Teléfono: <strong>{referenciaCasero.propietarioTelefono}</strong>{" "}
                      · Vivienda en {referenciaCasero.municipio}
                    </span>
                  </div>
                </div>
              )}

              {/* Resultado integrado del Pasaporte de Solvencia (InquiCheck engine) */}
              {solvencia ? (
                <div className="p-5 rounded-xl bg-secondary-container/30 border border-secondary/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                      <ShieldCheck className="w-4 h-4" />
                      Auditoría de Solvencia (Custodia Cero · {solvencia.fecha_auditoria})
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        solvencia.document_discrepancy_detected
                          ? "bg-red-100 text-red-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {solvencia.document_discrepancy_detected
                        ? "Discrepancia detectada"
                        : `${solvencia.employment_category} · Riesgo ${solvencia.fraud_risk_level}`}
                    </span>
                  </div>

                  <p className="text-xs text-primary leading-relaxed">
                    {solvencia.auditor_notes}
                  </p>

                  {solvencia.members_breakdown.length > 0 && (
                    <ul className="space-y-1 text-xs text-on-surface-variant">
                      {solvencia.members_breakdown.map((m, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Simulador interactivo de esfuerzo 35 % */}
                  {esfuerzoSim && (
                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2 no-print">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-primary">
                          Simulador de esfuerzo para seguro de impago:
                        </span>
                        <span className="font-bold text-secondary">
                          {esfuerzoSim.etiqueta}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={450}
                          max={2500}
                          step={25}
                          value={rentaSimulada}
                          onChange={(e) =>
                            setRentaSimulada(Number(e.target.value))
                          }
                          className="flex-1 accent-secondary"
                        />
                        <span className="font-mono text-xs font-bold text-primary w-20 text-right">
                          {rentaSimulada} €/mes
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {esfuerzoSim.mensaje}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                  <div className="text-xs space-y-1">
                    <strong className="text-primary block">
                      Aún no has completado tu Pasaporte de Solvencia
                    </strong>
                    <span className="text-on-surface-variant">
                      Sube tu Vida Laboral TGSS y nómina (lectura en memoria RAM,
                      sin guardar PDFs) para añadir tu score 0-100 a este certificado.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("solvencia")}
                    className="btn-press px-4 py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold shrink-0"
                  >
                    Auditar solvencia ahora
                  </button>
                </div>
              )}

              {/* Acciones PDF y Enlace público verificable */}
              <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row gap-3 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-press flex-1 py-3.5 px-5 rounded-xl bg-primary text-on-primary text-xs font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Descargar / Imprimir Pasaporte PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(generarEnlacePublico());
                    setEnlaceCopiado(true);
                    setTimeout(() => setEnlaceCopiado(false), 2200);
                  }}
                  className="btn-press flex-1 py-3.5 px-5 rounded-xl bg-secondary text-on-secondary text-xs font-semibold inline-flex items-center justify-center gap-2"
                >
                  {enlaceCopiado ? (
                    <>
                      <Check className="w-4 h-4" />
                      Enlace público copiado
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copiar enlace verificable para caseros
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editor de detalles / presentación personal del usuario */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 space-y-3 no-print">
              <label className="block text-xs font-bold text-primary">
                Detalles y presentación para futuros propietarios (opcional, sin DNI ni teléfonos)
              </label>
              <textarea
                rows={2}
                maxLength={240}
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                placeholder="Ej. Ingeniero con contrato indefinido, no fumador, sin mascotas, busco piso luminoso de larga estancia..."
                className="w-full p-3.5 rounded-xl bg-surface-container-lowest text-xs text-primary border border-outline-variant/50"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await guardarPresentacionInquilino(sanitizePII(presentacion));
                    setGuardadoOk(true);
                    setTimeout(() => setGuardadoOk(false), 2000);
                  }}
                  className="btn-press px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold"
                >
                  Guardar presentación en mi Pasaporte
                </button>
                {guardadoOk && (
                  <span className="text-xs font-semibold text-secondary">
                    ¡Guardado!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBMENÚ 2: AUDITORÍA DE SOLVENCIA INTEGRADA (CUSTODIA CERO — INQUICHECK ENGINE) */}
        {tab === "solvencia" && (
          <form
            onSubmit={ejecutarAuditoriaSolvencia}
            className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5 animate-enter"
          >
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block">
                  Protocolo Custodia Cero (RGPD Art. 5.1.c)
                </strong>
                <span>
                  Tus PDFs de Vida Laboral y Nómina se analizan en memoria
                  volátil y <strong>nunca se guardan</strong> en ningún servidor.
                  DNI, NIE, IBAN y empresas se enmascaran automáticamente.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Zona / Municipio donde buscas
                </label>
                <input
                  type="text"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Nº de titulares firmantes
                </label>
                <select
                  value={numTitulares}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setNumTitulares(n);
                    if (n === 1) setVinculo("Individual");
                    else if (vinculo === "Individual") setVinculo("Matrimonio / Pareja");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                >
                  <option value={1}>1 Titular</option>
                  <option value={2}>2 Titulares</option>
                  <option value={3}>3 Titulares</option>
                  <option value={4}>4 Titulares</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Vínculo
                </label>
                <select
                  value={vinculo}
                  onChange={(e) => setVinculo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                >
                  <option value="Individual">Individual</option>
                  <option value="Matrimonio / Pareja">Matrimonio / Pareja</option>
                  <option value="Amigos / Compañeros">Amigos / Compañeros</option>
                  <option value="Familiares">Familiares</option>
                </select>
              </div>
            </div>

            {/* Subida de PDFs por cada titular con escáner forense pdf-lib */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-primary">
                Documentación PDF por titular (análisis forense en memoria)
              </p>
              {Array.from({ length: numTitulares }, (_, i) => i + 1).map((idx) => {
                const vl = archivosPdf[`vl-${idx}`];
                const nom = archivosPdf[`nom-${idx}`];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-surface-container-low grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <label className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant cursor-pointer text-xs">
                      <span className="font-semibold text-primary inline-flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-secondary" />
                        Titular {idx}: Vida Laboral TGSS (PDF)
                      </span>
                      <span className="text-[11px] text-outline">
                        {vl ? vl.file.name : "Opcional para simulación · Recomendado para sello CSV"}
                      </span>
                      {vl?.sospechoso && (
                        <span className="text-[11px] font-bold text-error inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Alerta forense: PDF editado externamente
                        </span>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          handleSeleccionPdf(`vl-${idx}`, e.target.files?.[0])
                        }
                        className="hidden"
                      />
                    </label>

                    <label className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant cursor-pointer text-xs">
                      <span className="font-semibold text-primary inline-flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-secondary" />
                        Titular {idx}: Última Nómina (PDF)
                      </span>
                      <span className="text-[11px] text-outline">
                        {nom ? nom.file.name : "Sin guardar en servidor (Custodia Cero)"}
                      </span>
                      {nom?.sospechoso && (
                        <span className="text-[11px] font-bold text-error inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Alerta forense: PDF editado externamente
                        </span>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          handleSeleccionPdf(`nom-${idx}`, e.target.files?.[0])
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Datos de respaldo si no sube PDF en este momento */}
            {Object.keys(archivosPdf).length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-low/70">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-primary">
                    Ingresos netos mensuales conjuntos (€)
                  </label>
                  <input
                    type="number"
                    value={ingresosManual}
                    onChange={(e) => setIngresosManual(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest text-xs text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-primary">
                    Situación laboral principal
                  </label>
                  <select
                    value={situacionManual}
                    onChange={(e) => setSituacionManual(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest text-xs text-primary"
                  >
                    <option value="Contrato Indefinido">Contrato Indefinido</option>
                    <option value="Funcionario / Sector Público">Funcionario / Sector Público</option>
                    <option value="Autónomo Consolidado">Autónomo Consolidado</option>
                    <option value="Temporal">Temporal</option>
                  </select>
                </div>
              </div>
            )}

            <label className="flex items-start gap-2.5 text-xs text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={consentimientoRgpd}
                onChange={(e) => setConsentimientoRgpd(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Consiento expresamente el análisis automatizado efímero de mi
                solvencia bajo Protocolo Custodia Cero (Art. 6.1.a RGPD).
              </span>
            </label>

            {errorAuditoria && (
              <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                {errorAuditoria}
              </p>
            )}

            <button
              type="submit"
              disabled={auditando}
              className="btn-press w-full py-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              {auditando
                ? "Ejecutando auditoría forense con Gemini Flash..."
                : "Auditar solvencia e integrar en mi Pasaporte"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
