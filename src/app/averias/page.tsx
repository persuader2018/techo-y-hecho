"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Plus,
  Scale,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import { subirImagenSeguro } from "@/lib/storage";

type SubTab = "activas" | "nueva" | "historico";

export default function AveriasPage() {
  const {
    usuario,
    viviendaActiva,
    crearIncidencia,
    darConformidadInquilino,
    simularVencimiento15Dias,
    aplicarDescuentoIncidencia,
  } = useApp();

  const [tab, setTab] = useState<SubTab>("activas");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [presupuestoEur, setPresupuestoEur] = useState("");
  const [notaPresupuesto, setNotaPresupuesto] = useState("");
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [analizando, setAnalizando] = useState(false);
  const [errorIa, setErrorIa] = useState<string | null>(null);
  const [facturas, setFacturas] = useState<Record<string, string>>({});

  if (usuario?.rol === "propietario") {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-editorial text-3xl text-primary">
            Gestión de averías para Propietarios
          </h1>
          <p className="text-sm text-on-surface-variant">
            Como propietario, aprueba presupuestos, envía técnicos o deniega
            expedientes desde tu panel de Expedientes.
          </p>
          <a
            href="/propietario"
            className="btn-press inline-flex px-6 py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold"
          >
            Ir a mis Expedientes
          </a>
        </div>
      </AppShell>
    );
  }

  if (!viviendaActiva) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-14 text-center space-y-4">
          <img
            src="/images/llaves-contrato.jpg"
            alt="Sin vivienda vinculada"
            className="w-48 h-32 rounded-2xl object-cover mx-auto border border-outline-variant/50"
          />
          <h1 className="font-editorial text-3xl text-primary">
            Vincula tu vivienda primero
          </h1>
          <p className="text-sm text-on-surface-variant">
            Cuando vincules el código del piso en Mi Piso podrás reportar
            averías con fotos y recibir el dictamen de la IA.
          </p>
        </div>
      </AppShell>
    );
  }

  const activas = viviendaActiva.incidencias.filter(
    (i) =>
      i.estado === "pendiente_aprobacion" ||
      i.estado === "aprobada_presupuesto" ||
      i.estado === "aprobada_tecnico"
  );
  const historico = viviendaActiva.incidencias.filter(
    (i) =>
      i.estado === "resuelta_conforme" ||
      i.estado === "denegada" ||
      i.estado === "descuento_aplicado"
  );

  const handleSubirFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const url = await subirImagenSeguro(
        file,
        "averias",
        Boolean(usuario?.esDemo)
      );
      setFotosPreview((prev) => [...prev, url]);
    }
  };

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
          contextoContrato: `Vivienda habitual en ${viviendaActiva.municipio}.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al consultar IA");

      crearIncidencia({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        urgencia: data.urgencia || "media",
        responsableIa: data.responsable || "revisar",
        articuloLau: data.articulo_lau || "Art. 21 LAU",
        dictamenIa: data.explicacion || "Pendiente de revisión.",
        guiaEmergencia:
          data.guia_emergencia || "Haz fotos con luz y evita manipular la instalación.",
        busquedaBricolaje: data.busqueda_bricolaje || undefined,
        fotos: fotosPreview,
        presupuestoInquilinoEur: presupuestoEur ? Number(presupuestoEur) : undefined,
        notaPresupuestoInquilino: notaPresupuesto.trim() || undefined,
      });

      setTitulo("");
      setDescripcion("");
      setPresupuestoEur("");
      setNotaPresupuesto("");
      setFotosPreview([]);
      setTab("activas");
    } catch (err) {
      setErrorIa(
        err instanceof Error ? err.message : "No se pudo analizar con IA."
      );
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6 animate-enter">
        {/* Cabecera + Submenú */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Averías y Mediación IA
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {viviendaActiva.alias} · Sube fotos, consulta la LAU y da tu
              conformidad al arreglar
            </p>
          </div>

          <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab("activas")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "activas"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Activas ({activas.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("nueva")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "nueva"
                  ? "bg-secondary text-on-secondary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Avería
            </button>
            <button
              type="button"
              onClick={() => setTab("historico")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "historico"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Histórico ({historico.length})
            </button>
          </div>
        </div>

        {/* Pestaña: NUEVA AVERÍA con subida de fotos y presupuesto opcional */}
        {tab === "nueva" && (
          <form
            onSubmit={handleReportar}
            className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5 animate-enter max-w-2xl"
          >
            <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Notificar avería y analizar responsabilidad (Art. 21 LAU)
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="titulo-averia"
                className="block text-xs font-semibold text-primary"
              >
                ¿Qué ha ocurrido?
              </label>
              <input
                id="titulo-averia"
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Goteo en grifo de cocina o caldera sin presión"
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="desc-averia"
                className="block text-xs font-semibold text-primary"
              >
                Detalles breves
              </label>
              <textarea
                id="desc-averia"
                rows={3}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cuenta desde cuándo pasa y si ha sido por desgaste normal..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
              />
            </div>

            {/* Subida de fotos */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-primary">
                Fotos de la avería (recomendado)
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-outline-variant hover:border-secondary bg-surface-container-low/60 cursor-pointer text-xs font-semibold text-primary transition-colors">
                <Camera className="w-4 h-4 text-secondary" />
                Seleccionar fotos desde móvil u ordenador
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubirFotos}
                  className="hidden"
                />
              </label>
              {fotosPreview.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {fotosPreview.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Foto avería ${idx + 1}`}
                      className="w-20 h-20 rounded-xl object-cover border border-outline-variant"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Presupuesto opcional del inquilino */}
            <div className="p-4 rounded-xl bg-surface-container-low space-y-3">
              <span className="block text-xs font-semibold text-primary">
                ¿Tienes ya un presupuesto para proponer al propietario? (Opcional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  step="0.01"
                  value={presupuestoEur}
                  onChange={(e) => setPresupuestoEur(e.target.value)}
                  placeholder="Importe (€)"
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary"
                />
                <input
                  type="text"
                  value={notaPresupuesto}
                  onChange={(e) => setNotaPresupuesto(e.target.value)}
                  placeholder="Ej. Fontanero del barrio, disponibilidad mañana"
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary"
                />
              </div>
            </div>

            {errorIa && (
              <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                {errorIa}
              </p>
            )}

            <button
              type="submit"
              disabled={analizando}
              className="btn-press w-full py-3.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container disabled:opacity-60"
            >
              {analizando
                ? "Analizando con Google Gemini Flash..."
                : "Analizar con IA y enviar expediente"}
            </button>
          </form>
        )}

        {/* Pestaña: ACTIVAS o HISTÓRICO */}
        {tab !== "nueva" && (
          <div className="space-y-4">
            {(tab === "activas" ? activas : historico).length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/40 text-sm text-on-surface-variant">
                No hay expedientes en esta sección.
              </div>
            ) : (
              (tab === "activas" ? activas : historico).map((inc) => {
                const plazoVencido =
                  inc.diasRestantesPlazo15 <= 0 &&
                  inc.estado === "pendiente_aprobacion" &&
                  inc.responsableIa === "propietario";
                const esperandoConformidad =
                  inc.estado === "aprobada_presupuesto" ||
                  inc.estado === "aprobada_tecnico";

                return (
                  <article
                    key={inc.id}
                    className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] font-bold uppercase text-primary">
                            IA: {inc.responsableIa}
                          </span>
                          <span className="text-xs text-outline">
                            {inc.fechaReporte}
                          </span>
                        </div>
                        <h2 className="font-editorial text-2xl text-primary">
                          {inc.titulo}
                        </h2>
                      </div>

                      {/* Badge estado claro */}
                      {inc.estado === "resuelta_conforme" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Conforme ({inc.conformidadInquilinoFecha})
                        </span>
                      )}
                      {inc.estado === "denegada" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          Denegada por casero
                        </span>
                      )}
                      {inc.estado === "pendiente_aprobacion" && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            plazoVencido
                              ? "bg-red-100 text-red-900"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {plazoVencido
                            ? "Plazo 15d vencido"
                            : `Pendiente · ${inc.diasRestantesPlazo15}d`}
                        </span>
                      )}
                      {esperandoConformidad && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold">
                          <Wrench className="w-3.5 h-3.5" />
                          Aprobada · Esperando tu conformidad
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-on-surface-variant">
                      {inc.descripcion}
                    </p>

                    {/* Galería de fotos adjuntas */}
                    {inc.fotos.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {inc.fotos.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Evidencia ${idx + 1}`}
                            className="w-24 h-20 rounded-xl object-cover border border-outline-variant/60"
                          />
                        ))}
                      </div>
                    )}

                    {/* Dictamen IA resumido */}
                    <div className="p-4 rounded-xl bg-surface-container-low text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-primary">
                        <Scale className="w-4 h-4 text-secondary" />
                        {inc.articuloLau}
                      </div>
                      <p className="text-on-surface-variant">{inc.dictamenIa}</p>
                      {inc.busquedaBricolaje && (
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                            inc.busquedaBricolaje
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-secondary font-semibold underline underline-offset-4 pt-1"
                        >
                          Ver tutorial rápido en YouTube
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Respuesta del propietario + botón CONFORMIDAD del inquilino */}
                    {inc.respuestaPropietario && (
                      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-3">
                        <p>
                          <strong>Decisión del propietario:</strong>{" "}
                          {inc.respuestaPropietario}
                        </p>
                        {esperandoConformidad && (
                          <button
                            type="button"
                            onClick={() => darConformidadInquilino(inc.id)}
                            className="btn-press px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-emerald-800"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Dar conformidad: reparación terminada
                          </button>
                        )}
                      </div>
                    )}

                    {inc.motivoDenegacion && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-950">
                        <strong>Motivo de denegación:</strong>{" "}
                        {inc.motivoDenegacion}
                      </div>
                    )}

                    {/* Simulación plazo 15 días */}
                    {inc.estado === "pendiente_aprobacion" &&
                      inc.responsableIa === "propietario" &&
                      !plazoVencido && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => simularVencimiento15Dias(inc.id)}
                            className="text-[11px] font-semibold text-outline hover:text-primary underline underline-offset-4"
                          >
                            Simular +15 días sin respuesta (demo)
                          </button>
                        </div>
                      )}

                    {plazoVencido && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                          <AlertTriangle className="w-4 h-4" />
                          Plazo de 15 días vencido: puedes descontar la factura
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={facturas[inc.id] ?? "145"}
                            onChange={(e) =>
                              setFacturas((prev) => ({
                                ...prev,
                                [inc.id]: e.target.value,
                              }))
                            }
                            className="flex-1 px-3 py-2 rounded-lg bg-white text-xs text-primary border border-red-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              aplicarDescuentoIncidencia(
                                inc.id,
                                Number(facturas[inc.id] ?? 145)
                              )
                            }
                            className="btn-press px-4 py-2 rounded-lg bg-error text-white text-xs font-bold"
                          >
                            Descontar de renta
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
