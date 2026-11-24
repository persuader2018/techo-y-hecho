"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  History,
  Plus,
  Wrench,
  XCircle,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

type SubTab = "pendientes" | "historico" | "nuevo";

export default function PropietarioPage() {
  const {
    usuario,
    viviendas,
    viviendaActiva,
    seleccionarVivienda,
    aprobarPresupuestoInquilino,
    aprobarEnviarTecnico,
    denegarIncidenciaPropietario,
    crearNuevaVivienda,
  } = useApp();

  const [tab, setTab] = useState<SubTab>("pendientes");
  const [accionAbierta, setAccionAbierta] = useState<
    Record<string, "tecnico" | "denegar" | null>
  >({});
  const [textoTecnico, setTextoTecnico] = useState<Record<string, string>>({});
  const [textoDenegar, setTextoDenegar] = useState<Record<string, string>>({});

  // Alta nueva vivienda
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("Madrid");
  const [renta, setRenta] = useState("950");
  const [emailInq, setEmailInq] = useState("");
  const [tensionada, setTensionada] = useState(false);
  const [codigoCreado, setCodigoCreado] = useState<string | null>(null);

  if (usuario && usuario.rol !== "propietario") {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-editorial text-3xl text-primary">
            Sección exclusiva para Propietarios
          </h1>
          <p className="text-sm text-on-surface-variant">
            Has iniciado sesión como Inquilino. Para entrar como propietario,
            cierra sesión y accede con tu perfil de propietario.
          </p>
          <a
            href="/portal"
            className="btn-press inline-flex px-6 py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold"
          >
            Volver a Mi Piso
          </a>
        </div>
      </AppShell>
    );
  }

  const pendientes = viviendaActiva.incidencias.filter(
    (i) => i.estado === "pendiente_aprobacion"
  );
  const historico = viviendaActiva.incidencias.filter(
    (i) => i.estado !== "pendiente_aprobacion"
  );

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6 animate-enter">
        {/* Cabecera limpia: selector de vivienda + submenú */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Expedientes del Propietario
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {viviendas.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => seleccionarVivienda(v.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    v.id === viviendaActiva.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {v.alias} ({v.municipio})
                </button>
              ))}
            </div>
          </div>

          <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setTab("pendientes")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "pendientes"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Por aprobar ({pendientes.length})
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
            <button
              type="button"
              onClick={() => setTab("nuevo")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                tab === "nuevo"
                  ? "bg-secondary text-on-secondary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Piso
            </button>
          </div>
        </div>

        {/* SUBMENÚ 1: EXPEDIENTES PENDIENTES DE APROBAR O DENEGAR */}
        {tab === "pendientes" && (
          <div className="space-y-4">
            {pendientes.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/40 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-secondary mx-auto" />
                <p className="font-editorial text-2xl text-primary">
                  Todo al día en {viviendaActiva.alias}
                </p>
                <p className="text-xs text-on-surface-variant">
                  No tienes expedientes de reparación pendientes de decisión.
                </p>
              </div>
            ) : (
              pendientes.map((inc) => (
                <article
                  key={inc.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 border-2 border-amber-200 shadow-xs space-y-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase">
                        {inc.articuloLau} · Quedan {inc.diasRestantesPlazo15} días
                      </span>
                      <h2 className="font-editorial text-2xl text-primary mt-1.5">
                        {inc.titulo}
                      </h2>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {inc.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Fotos adjuntas por el inquilino */}
                  {inc.fotos.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {inc.fotos.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Foto ${idx + 1}`}
                          className="w-28 h-20 rounded-xl object-cover border border-outline-variant"
                        />
                      ))}
                    </div>
                  )}

                  {/* Presupuesto propuesto por el inquilino si existe */}
                  {inc.presupuestoInquilinoEur && (
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <strong className="text-primary block">
                          Presupuesto propuesto por el inquilino:
                        </strong>
                        <span className="text-on-surface-variant">
                          {inc.notaPresupuestoInquilino || "Presupuesto adjunto"}
                        </span>
                      </div>
                      <span className="font-editorial text-2xl text-primary whitespace-nowrap">
                        {inc.presupuestoInquilinoEur.toFixed(2)} €
                      </span>
                    </div>
                  )}

                  {/* 3 Botones claros: Aceptar presupuesto | Enviar técnico | Denegar */}
                  <div className="flex flex-wrap gap-2.5 pt-2 border-t border-outline-variant/40">
                    {inc.presupuestoInquilinoEur && (
                      <button
                        type="button"
                        onClick={() => aprobarPresupuestoInquilino(inc.id)}
                        className="btn-press px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-emerald-800"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprobar presupuesto ({inc.presupuestoInquilinoEur} €)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setAccionAbierta((prev) => ({
                          ...prev,
                          [inc.id]: prev[inc.id] === "tecnico" ? null : "tecnico",
                        }))
                      }
                      className="btn-press px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Wrench className="w-4 h-4" />
                      Aprobar y mandar técnico propio
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAccionAbierta((prev) => ({
                          ...prev,
                          [inc.id]: prev[inc.id] === "denegar" ? null : "denegar",
                        }))
                      }
                      className="btn-press px-4 py-2.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-red-100"
                    >
                      <XCircle className="w-4 h-4" />
                      Denegar
                    </button>
                  </div>

                  {/* Desplegable: Enviar técnico propio */}
                  {accionAbierta[inc.id] === "tecnico" && (
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row gap-2 animate-enter">
                      <input
                        type="text"
                        value={
                          textoTecnico[inc.id] ??
                          "Envío a mi técnico de confianza mañana entre 10:00 y 12:00."
                        }
                        onChange={(e) =>
                          setTextoTecnico((prev) => ({
                            ...prev,
                            [inc.id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          aprobarEnviarTecnico(
                            inc.id,
                            textoTecnico[inc.id] ??
                              "Envío a mi técnico de confianza mañana entre 10:00 y 12:00."
                          );
                          setAccionAbierta((prev) => ({ ...prev, [inc.id]: null }));
                        }}
                        className="btn-press px-4 py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold"
                      >
                        Confirmar técnico
                      </button>
                    </div>
                  )}

                  {/* Desplegable: Denegar */}
                  {accionAbierta[inc.id] === "denegar" && (
                    <div className="p-4 rounded-xl bg-red-50 flex flex-col sm:flex-row gap-2 animate-enter">
                      <input
                        type="text"
                        value={
                          textoDenegar[inc.id] ??
                          "Pequeña reparación por desgaste ordinario (Art. 21.4 LAU)."
                        }
                        onChange={(e) =>
                          setTextoDenegar((prev) => ({
                            ...prev,
                            [inc.id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white text-xs text-primary border border-red-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          denegarIncidenciaPropietario(
                            inc.id,
                            textoDenegar[inc.id] ??
                              "Pequeña reparación por desgaste ordinario (Art. 21.4 LAU)."
                          );
                          setAccionAbierta((prev) => ({ ...prev, [inc.id]: null }));
                        }}
                        className="btn-press px-4 py-2.5 rounded-xl bg-error text-white text-xs font-bold"
                      >
                        Confirmar denegación
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* SUBMENÚ 2: HISTÓRICO DE EXPEDIENTES */}
        {tab === "historico" && (
          <div className="space-y-3">
            {historico.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/40 text-sm text-on-surface-variant">
                Aún no hay expedientes en el histórico de esta vivienda.
              </div>
            ) : (
              historico.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h3 className="font-editorial text-xl text-primary">
                      {inc.titulo}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {inc.respuestaPropietario ||
                        inc.motivoDenegacion ||
                        inc.dictamenIa}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {inc.estado === "resuelta_conforme" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conformidad inquilino ({inc.conformidadInquilinoFecha})
                      </span>
                    )}
                    {(inc.estado === "aprobada_presupuesto" ||
                      inc.estado === "aprobada_tecnico") && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Esperando conformidad del inquilino
                      </span>
                    )}
                    {inc.estado === "denegada" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        Denegada
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUBMENÚ 3: DAR DE ALTA NUEVO PISO */}
        {tab === "nuevo" && (
          <form
            onSubmit={handleAltaVivienda}
            className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-4 max-w-xl animate-enter"
          >
            <h2 className="font-editorial text-2xl text-primary">
              Añadir vivienda y generar código
            </h2>
            <input
              type="text"
              required
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección (ej. C/ Serrano 82, 2º Izq)"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                placeholder="Municipio"
                className="px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
              />
              <input
                type="number"
                required
                value={renta}
                onChange={(e) => setRenta(e.target.value)}
                placeholder="Renta mensual (€)"
                className="px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
              />
            </div>
            <input
              type="email"
              value={emailInq}
              onChange={(e) => setEmailInq(e.target.value)}
              placeholder="Email del inquilino (opcional)"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
            />
            <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={tensionada}
                onChange={(e) => setTensionada(e.target.checked)}
              />
              Zona tensionada
            </label>
            <button
              type="submit"
              className="btn-press w-full py-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Crear vivienda y código de vinculación
            </button>
            {codigoCreado && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                Código creado: <strong className="font-mono">{codigoCreado}</strong>
              </div>
            )}
          </form>
        )}
      </div>
    </AppShell>
  );
}
