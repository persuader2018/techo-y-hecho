"use client";

import { useState } from "react";
import {
  Calculator,
  Camera,
  CheckCircle2,
  FileText,
  MessageSquare,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import { calcularActualizacionRenta } from "@/lib/calculadora-renta-2026";
import { subirImagenSeguro } from "@/lib/storage";

type SubTab = "asesor" | "fianza" | "subida";

const PREGUNTAS_RAPIDAS = [
  "¿Cuánto me pueden subir el alquiler en 2027 con el nuevo decreto?",
  "¿Es legal que me cobren gastos de comunidad o de inmobiliaria?",
  "¿Cuántos días tiene el casero para devolver la fianza?",
  "¿Qué pasa si me hacen un contrato de temporada pero vivo todo el año?",
];

export default function ContratoPage() {
  const { usuario, viviendaActiva, agregarFotoEstadoInicial } = useApp();
  const [tab, setTab] = useState<SubTab>("asesor");

  // Asesor IA
  const [consulta, setConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [respuestaIa, setRespuestaIa] = useState<{
    resumen_corto: string;
    respuesta: string;
    normativa_citada?: string[];
    aviso_legal?: string;
  } | null>(null);
  const [errorIa, setErrorIa] = useState<string | null>(null);

  // Fotos estado inicial (Fianza)
  const [estancia, setEstancia] = useState("");
  const [notaFoto, setNotaFoto] = useState("");
  const [fotoUrlTemp, setFotoUrlTemp] = useState<string | null>(null);

  // Calculadora RDL 29/2026
  const [rentaCalc, setRentaCalc] = useState(viviendaActiva?.rentaBaseEur ?? 1000);
  const [fechaFirma, setFechaFirma] = useState(
    viviendaActiva?.fechaInicio ?? "2025-01-15"
  );
  const [zonaTensionada, setZonaTensionada] = useState(
    viviendaActiva?.esZonaTensionada ?? false
  );
  const [superaIndice, setSuperaIndice] = useState(false);

  const resultadoCalc = calcularActualizacionRenta({
    rentaActualEur: Number(rentaCalc) || 0,
    fechaFirmaContrato: fechaFirma,
    fechaRevision: "2026-12-01",
    tipoContrato: viviendaActiva?.tipoContrato ?? "habitual",
    esZonaTensionada: zonaTensionada,
    superaIndiceReferenciaTensionada: superaIndice,
    iravVigentePct: 2.57,
    tieneClausulaActualizacion: true,
  });

  const preguntarAbaogadoIa = async (texto: string) => {
    if (!texto.trim()) return;
    setConsulta(texto);
    setConsultando(true);
    setErrorIa(null);
    try {
      const res = await fetch("/api/ia/asesor-legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consulta: texto,
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

  const handleArchivoFotoFianza = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await subirImagenSeguro(
      file,
      "fianza",
      Boolean(usuario?.esDemo)
    );
    setFotoUrlTemp(url);
  };

  const handleGuardarFotoFianza = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estancia.trim() || !fotoUrlTemp) return;
    agregarFotoEstadoInicial({
      estancia: estancia.trim(),
      url: fotoUrlTemp,
      nota: notaFoto.trim() || "Estado inicial verificado al inicio del alquiler.",
    });
    setEstancia("");
    setNotaFoto("");
    setFotoUrlTemp(null);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6 animate-enter">
        {/* Cabecera + Submenú limpio */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Asesor Legal, Contrato y Fianza
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {viviendaActiva?.alias || "Asistente normativo"} · Ley 12/2023 y RDL 29/2026
            </p>
          </div>

          <div className="inline-flex flex-wrap bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab("asesor")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "asesor"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Asesor IA
            </button>
            {viviendaActiva && (
              <button
                type="button"
                onClick={() => setTab("fianza")}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                  tab === "fianza"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Fianza y Fotos ({viviendaActiva.fotosEstadoInicial.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setTab("subida")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "subida"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Subida 2 %
            </button>
          </div>
        </div>

        {/* SUBMENÚ 1: ASESOR LEGAL IA PROTAGONISTA */}
        {tab === "asesor" && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-6 animate-enter">
            <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Pregunta cualquier duda de la Ley de Vivienda (RDL 29/2026)
            </div>

            {/* Preguntas rápidas en 1 clic */}
            <div className="space-y-2">
              <span className="text-xs text-outline font-semibold">
                Preguntas frecuentes (pulsa para consultar al instante):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PREGUNTAS_RAPIDAS.map((preg) => (
                  <button
                    key={preg}
                    type="button"
                    onClick={() => preguntarAbaogadoIa(preg)}
                    className="btn-press text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-secondary-container/40 text-xs font-medium text-primary border border-outline-variant/40 transition-colors"
                  >
                    {preg}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                preguntarAbaogadoIa(consulta);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Escribe tu duda aquí con tus propias palabras..."
                className="flex-1 px-4 py-3.5 rounded-xl bg-surface-container-low text-sm text-primary border border-outline-variant/40"
              />
              <button
                type="submit"
                disabled={consultando}
                className="btn-press px-6 py-3.5 rounded-xl bg-primary text-on-primary text-xs font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Scale className="w-4 h-4" />
                {consultando ? "Consultando IA..." : "Preguntar"}
              </button>
            </form>

            {errorIa && (
              <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                {errorIa}
              </p>
            )}

            {respuestaIa && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-enter">
                <h2 className="font-editorial text-2xl text-emerald-950">
                  {respuestaIa.resumen_corto}
                </h2>
                <p className="text-sm text-emerald-950/90 leading-relaxed">
                  {respuestaIa.respuesta}
                </p>
                {respuestaIa.normativa_citada && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {respuestaIa.normativa_citada.map((n, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-white text-emerald-900 text-[11px] font-bold border border-emerald-200"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-emerald-800/80 pt-1">
                  {respuestaIa.aviso_legal}
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUBMENÚ 2: CONTRATO, FIANZA Y FOTOS DEL ESTADO INICIAL */}
        {tab === "fianza" && viviendaActiva && (
          <div className="space-y-6 animate-enter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-xl text-primary">
                      Contrato LAU
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Código {viviendaActiva.codigoVinculacion} · Inicio{" "}
                      {viviendaActiva.fechaInicio}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                  Activo
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/70 flex items-center justify-center text-secondary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-xl text-primary">
                      Fianza: {viviendaActiva.fianzaEur} €
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      {viviendaActiva.organismoFianza}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Depositada
                </span>
              </div>
            </div>

            {/* Fotos del estado inicial del piso para proteger la fianza */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 space-y-6">
              <div>
                <h2 className="font-editorial text-2xl text-primary">
                  Fotos del Estado Inicial del Piso (Protección de Fianza)
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Sube fotos al entrar para dejar constancia del estado real de
                  cada habitación y evitar discusiones al devolver la fianza.
                </p>
              </div>

              <form
                onSubmit={handleGuardarFotoFianza}
                className="p-5 rounded-xl bg-surface-container-low grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
              >
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-semibold text-primary">
                    Estancia
                  </label>
                  <input
                    type="text"
                    required
                    value={estancia}
                    onChange={(e) => setEstancia(e.target.value)}
                    placeholder="Ej. Cocina y electrodomésticos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary"
                  />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-semibold text-primary">
                    Nota de estado
                  </label>
                  <input
                    type="text"
                    value={notaFoto}
                    onChange={(e) => setNotaFoto(e.target.value)}
                    placeholder="Ej. Encimera impecable, horno nuevo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary"
                  />
                </div>
                <div className="md:col-span-4 flex gap-2">
                  <label className="flex-1 btn-press px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-primary inline-flex items-center justify-center gap-1.5 cursor-pointer">
                    <Camera className="w-4 h-4 text-secondary" />
                    {fotoUrlTemp ? "Foto lista" : "Elegir foto"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArchivoFotoFianza}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!fotoUrlTemp}
                    className="btn-press px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {viviendaActiva.fotosEstadoInicial.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-low/50"
                  >
                    <img
                      src={f.url}
                      alt={f.estancia}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-primary">{f.estancia}</strong>
                        <span className="text-[11px] text-outline">
                          {f.fecha}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {f.nota}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBMENÚ 3: CALCULADORA LEGAL SUBIDA 2 % */}
        {tab === "subida" && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5 max-w-2xl animate-enter">
            <h2 className="font-editorial text-2xl text-primary">
              Calculadora de Subida Legal (Tope 2 % RDL 29/2026)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary">
                  Renta actual (€/mes)
                </label>
                <input
                  type="number"
                  value={rentaCalc}
                  onChange={(e) => setRentaCalc(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary">
                  Fecha firma contrato
                </label>
                <input
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
                Zona tensionada
              </label>
              {zonaTensionada && (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={superaIndice}
                    onChange={(e) => setSuperaIndice(e.target.checked)}
                  />
                  Supera ya el índice oficial
                </label>
              )}
            </div>

            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase text-emerald-800">
                  Máximo legal permitido
                </span>
                <span className="font-editorial text-3xl text-emerald-950">
                  {resultadoCalc.rentaNuevaEur.toFixed(2)} €
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-800">
                +{resultadoCalc.subidaPermitidaPct.toFixed(2)} % (+
                {resultadoCalc.incrementoMensualEur.toFixed(2)} €/mes)
              </p>
              <p className="text-xs text-emerald-900 pt-1">
                {resultadoCalc.explicacion}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
