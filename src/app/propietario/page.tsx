"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Flag,
  History,
  MessageCircle,
  Plus,
  TrendingUp,
  Wrench,
  XCircle,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import { calcularActualizacionRenta } from "@/lib/calculadora-renta-2026";
import { subirImagenSeguro } from "@/lib/storage";

type SubTab = "pendientes" | "historico" | "contrato" | "nuevo";

export default function PropietarioPage() {
  const {
    usuario,
    viviendas,
    viviendaActiva,
    seleccionarVivienda,
    aprobarPresupuestoInquilino,
    aprobarEnviarTecnico,
    denegarIncidenciaPropietario,
    actualizarRentaAnual,
    finalizarArrendamiento,
    crearNuevaVivienda,
  } = useApp();

  const [tab, setTab] = useState<SubTab>("pendientes");
  const [accionAbierta, setAccionAbierta] = useState<
    Record<string, "tecnico" | "denegar" | null>
  >({});
  const [textoTecnico, setTextoTecnico] = useState<Record<string, string>>({});
  const [textoDenegar, setTextoDenegar] = useState<Record<string, string>>({});
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);

  // Alta nueva vivienda (con foto + fecha inicio)
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("Madrid");
  const [renta, setRenta] = useState("950");
  const [fechaInicio, setFechaInicio] = useState("2026-11-25");
  const [hoyIso, setHoyIso] = useState("2026-11-25");

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    setFechaInicio(hoy);
    setHoyIso(hoy);
  }, []);
  const [fotoPisoUrl, setFotoPisoUrl] = useState<string>(
    "/images/apartamento-editorial.jpg"
  );
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [emailInq, setEmailInq] = useState("");
  const [tensionada, setTensionada] = useState(false);
  const [codigoCreado, setCodigoCreado] = useState<string | null>(null);

  // Cierre de contrato (Mejora C)
  const [fianzaCompleta, setFianzaCompleta] = useState(true);
  const [notaCierre, setNotaCierre] = useState(
    "Vivienda devuelta en buen estado, se devuelve el 100 % de la fianza."
  );
  const [autorizaTel, setAutorizaTel] = useState(false);
  const [telPropietario, setTelPropietario] = useState("");
  const [msgContrato, setMsgContrato] = useState<string | null>(null);

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

  const generarUrlInvitacion = (codigo: string) => {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://techo-y-hecho.vercel.app";
    return `${base}/acceso?modo=register&rol=inquilino&codigo=${encodeURIComponent(
      codigo
    )}`;
  };

  const generarWhatsappUrl = (codigo: string, aliasPiso: string) => {
    const link = generarUrlInvitacion(codigo);
    const texto = `Hola! Te invito a gestionar nuestro alquiler de ${aliasPiso} en Techo y Hecho. Entra en este enlace y ya te saldrá el registro preparado con el código del piso (${codigo}): ${link}`;
    return `https://wa.me/?text=${encodeURIComponent(texto)}`;
  };

  const handleFotoPiso = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const url = await subirImagenSeguro(
        file,
        "viviendas",
        Boolean(usuario?.esDemo)
      );
      setFotoPisoUrl(url);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleAltaVivienda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!direccion.trim()) return;
    const cod = await crearNuevaVivienda({
      direccion: direccion.trim(),
      municipio: municipio.trim() || "Madrid",
      rentaBaseEur: Number(renta) || 950,
      fechaInicio,
      imagenUrl: fotoPisoUrl,
      emailInquilino: emailInq.trim() || undefined,
      esZonaTensionada: tensionada,
    });
    setCodigoCreado(cod);
    setDireccion("");
    setEmailInq("");
  };

  // Cálculo de actualización anual para la vivienda activa
  const calcAnual = viviendaActiva
    ? calcularActualizacionRenta({
        rentaActualEur: viviendaActiva.rentaBaseEur,
        fechaFirmaContrato: viviendaActiva.fechaInicio,
        fechaRevision: hoyIso,
        tipoContrato: viviendaActiva.tipoContrato,
        esZonaTensionada: viviendaActiva.esZonaTensionada,
        iravVigentePct: 2.57,
        tieneClausulaActualizacion: true,
      })
    : null;

  const cumpleAnioContrato = viviendaActiva
    ? (new Date(hoyIso).getTime() -
        new Date(viviendaActiva.fechaInicio).getTime()) /
        (1000 * 60 * 60 * 24) >=
      330
    : false;

  const pendientes = viviendaActiva
    ? viviendaActiva.incidencias.filter(
        (i) => i.estado === "pendiente_aprobacion"
      )
    : [];
  const historico = viviendaActiva
    ? viviendaActiva.incidencias.filter(
        (i) => i.estado !== "pendiente_aprobacion"
      )
    : [];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6 animate-enter">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Panel del Propietario
            </h1>
            {viviendas.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {viviendas.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => seleccionarVivienda(v.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      v.id === viviendaActiva?.id
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {v.alias}
                    {v.estadoContrato === "finalizado" ? " (Finalizado)" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="inline-flex flex-wrap bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start md:self-auto">
            {viviendaActiva && (
              <>
                <button
                  type="button"
                  onClick={() => setTab("pendientes")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                    tab === "pendientes"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Expedientes ({pendientes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab("historico")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
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
                  onClick={() => setTab("contrato")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                    tab === "contrato"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Renta y Cierre
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setTab("nuevo")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
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

        {/* Estado vacío elegante si es un propietario nuevo sin pisos aún */}
        {!viviendaActiva && tab !== "nuevo" && (
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/40 shadow-sm grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5 h-56 md:h-auto">
              <img
                src="/images/llaves-contrato.jpg"
                alt="Añade tu primera vivienda"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-7 p-8 space-y-4 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Cuenta nueva · Gratis para 1 vivienda
              </span>
              <h2 className="font-editorial text-3xl text-primary font-normal">
                Añade tu primera vivienda en 1 minuto
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Sube una foto del piso, indica la renta y fecha de inicio del
                contrato y te generaremos un enlace de <strong>WhatsApp</strong>{" "}
                para que tu inquilino se vincule con el código ya rellenado.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => setTab("nuevo")}
                  className="btn-press px-6 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Dar de alta mi primera vivienda
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra destacada con Código + WhatsApp directo al inquilino */}
        {viviendaActiva && tab !== "nuevo" && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={viviendaActiva.imagenUrl}
                alt={viviendaActiva.alias}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-outline-variant/40"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary block">
                  Código del piso para tu inquilino
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold text-primary">
                    {viviendaActiva.codigoVinculacion}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    · {viviendaActiva.rentaBaseEur.toFixed(2)} €/mes · Inicio{" "}
                    {viviendaActiva.fechaInicio}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={generarWhatsappUrl(
                  viviendaActiva.codigoVinculacion,
                  viviendaActiva.alias
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    generarUrlInvitacion(viviendaActiva.codigoVinculacion)
                  );
                  setEnlaceCopiado(true);
                  setTimeout(() => setEnlaceCopiado(false), 2000);
                }}
                className="btn-press px-3.5 py-2.5 rounded-xl bg-surface-container text-primary text-xs font-semibold inline-flex items-center gap-1.5"
              >
                {enlaceCopiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-secondary" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar enlace
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SUBMENÚ 1: EXPEDIENTES PENDIENTES */}
        {viviendaActiva && tab === "pendientes" && (
          <div className="space-y-4">
            {pendientes.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/40 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-secondary mx-auto" />
                <p className="font-editorial text-2xl text-primary">
                  Sin expedientes pendientes en {viviendaActiva.alias}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Cuando tu inquilino reporte una avería aparecerá aquí para
                  aprobar presupuesto, mandar técnico o denegar.
                </p>
              </div>
            ) : (
              pendientes.map((inc) => (
                <article
                  key={inc.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 border-2 border-amber-200 shadow-xs space-y-5"
                >
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

                  {accionAbierta[inc.id] === "tecnico" && (
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row gap-2 animate-enter">
                      <input
                        type="text"
                        value={
                          textoTecnico[inc.id] ??
                          "Envío a mi técnico mañana entre 10:00 y 12:00."
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
                              "Envío a mi técnico mañana entre 10:00 y 12:00."
                          );
                          setAccionAbierta((prev) => ({ ...prev, [inc.id]: null }));
                        }}
                        className="btn-press px-4 py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold"
                      >
                        Confirmar técnico
                      </button>
                    </div>
                  )}

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

        {/* SUBMENÚ 2: HISTÓRICO */}
        {viviendaActiva && tab === "historico" && (
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

        {/* SUBMENÚ 3: ACTUALIZACIÓN ANUAL DE RENTA Y FINALIZAR ARRENDAMIENTO */}
        {viviendaActiva && tab === "contrato" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter">
            {/* Actualización anual del alquiler */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                <TrendingUp className="w-4 h-4" />
                Actualización anual del alquiler
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Fecha de firma:{" "}
                <strong className="text-primary">
                  {viviendaActiva.fechaInicio}
                </strong>
                .{" "}
                {cumpleAnioContrato
                  ? "Ya corresponde revisión anual según el aniversario del contrato."
                  : "Aún no ha pasado un año desde la firma, pero puedes consultar el importe máximo legal."}
              </p>

              {calcAnual && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-emerald-900">
                      Nueva renta máxima legal (RDL 29/2026)
                    </span>
                    <span className="font-editorial text-2xl text-emerald-950">
                      {calcAnual.rentaNuevaEur.toFixed(2)} €
                    </span>
                  </div>
                  <p className="text-emerald-800">
                    +{calcAnual.subidaPermitidaPct} % (+
                    {calcAnual.incrementoMensualEur.toFixed(2)} €/mes)
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={viviendaActiva.estadoContrato === "finalizado"}
                onClick={async () => {
                  if (!calcAnual) return;
                  await actualizarRentaAnual({
                    nuevaRentaEur: calcAnual.rentaNuevaEur,
                    porcentajeSubida: calcAnual.subidaPermitidaPct,
                    normaAplicada: calcAnual.normaAplicada,
                  });
                  setMsgContrato(
                    `Renta actualizada a ${calcAnual.rentaNuevaEur.toFixed(
                      2
                    )} €/mes según ${calcAnual.normaAplicada}.`
                  );
                }}
                className="btn-press w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
              >
                Aplicar actualización anual legal
              </button>
            </div>

            {/* Finalizar arrendamiento + Fianza + Permiso teléfono (Mejora C) */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-error">
                <Flag className="w-4 h-4" />
                Finalizar arrendamiento y cierre de fianza
              </div>

              {viviendaActiva.estadoContrato === "finalizado" ? (
                <div className="p-4 rounded-xl bg-surface-container-low text-xs space-y-1">
                  <strong className="text-primary block">
                    Contrato finalizado el {viviendaActiva.fechaFinalizacion}
                  </strong>
                  <p className="text-on-surface-variant">
                    {viviendaActiva.notaCierreFianza}
                  </p>
                  {viviendaActiva.autorizaCompartirTelefono && (
                    <p className="text-secondary font-semibold">
                      Teléfono de referencia autorizado en el Pasaporte del
                      inquilino.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-primary font-medium">
                    <input
                      type="checkbox"
                      checked={fianzaCompleta}
                      onChange={(e) => setFianzaCompleta(e.target.checked)}
                    />
                    Devolución íntegra de la fianza ({viviendaActiva.fianzaEur} €)
                  </label>

                  <input
                    type="text"
                    value={notaCierre}
                    onChange={(e) => setNotaCierre(e.target.value)}
                    placeholder="Nota breve de entrega de llaves y fianza"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                  />

                  <div className="p-3.5 rounded-xl bg-surface-container-low space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer text-primary font-semibold">
                      <input
                        type="checkbox"
                        checked={autorizaTel}
                        onChange={(e) => setAutorizaTel(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        Autorizo compartir mi teléfono en el Pasaporte del
                        inquilino como referencia positiva (RGPD)
                      </span>
                    </label>
                    {autorizaTel && (
                      <input
                        type="tel"
                        value={telPropietario}
                        onChange={(e) => setTelPropietario(e.target.value)}
                        placeholder="Tu teléfono de contacto (ej. 612 345 678)"
                        className="w-full px-3.5 py-2 rounded-lg bg-white text-xs text-primary border border-outline-variant/50"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await finalizarArrendamiento({
                        fianzaDevueltaCompleta: fianzaCompleta,
                        notaCierreFianza: notaCierre,
                        autorizaCompartirTelefono: autorizaTel,
                        telefonoPropietario: telPropietario,
                      });
                      setMsgContrato(
                        "Arrendamiento finalizado correctamente y guardado en el historial."
                      );
                    }}
                    className="btn-press w-full py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold"
                  >
                    Dar por finalizado el arrendamiento
                  </button>
                </div>
              )}
            </div>

            {msgContrato && (
              <div className="md:col-span-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-semibold">
                {msgContrato}
              </div>
            )}
          </div>
        )}

        {/* SUBMENÚ 4: NUEVO PISO (CON FOTO PERSONALIZADA + FECHA INICIO + WHATSAPP) */}
        {tab === "nuevo" && (
          <form
            onSubmit={handleAltaVivienda}
            className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xs space-y-5 max-w-2xl animate-enter"
          >
            <h2 className="font-editorial text-2xl text-primary">
              Añadir vivienda y generar invitación por WhatsApp
            </h2>

            {/* Foto personalizable del piso */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-surface-container-low">
              <img
                src={fotoPisoUrl}
                alt="Vista previa vivienda"
                className="w-32 h-24 rounded-xl object-cover border border-outline-variant"
              />
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-xs font-semibold text-primary">
                  Foto de la vivienda
                </p>
                <label className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-primary cursor-pointer">
                  <Camera className="w-4 h-4 text-secondary" />
                  {subiendoFoto ? "Subiendo foto..." : "Cambiar foto del piso"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoPiso}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-primary">
                Dirección de la vivienda
              </label>
              <input
                type="text"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. C/ Serrano 82, 2º Izq"
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Municipio
                </label>
                <input
                  type="text"
                  required
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary">
                  Renta mensual (€)
                </label>
                <input
                  type="number"
                  required
                  value={renta}
                  onChange={(e) => setRenta(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  Inicio contrato
                </label>
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>
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
              Vivienda en zona tensionada
            </label>

            <button
              type="submit"
              className="btn-press w-full py-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Crear vivienda y generar enlace para WhatsApp
            </button>

            {codigoCreado && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <p className="text-xs text-emerald-950">
                  ¡Vivienda creada! Código:{" "}
                  <strong className="font-mono text-sm">{codigoCreado}</strong>.
                  Envíaselo ahora a tu inquilino para que le abra el registro ya
                  preparado:
                </p>
                <a
                  href={generarWhatsappUrl(codigoCreado, direccion || municipio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  Mandar enlace y código por WhatsApp
                </a>
              </div>
            )}
          </form>
        )}
      </div>
    </AppShell>
  );
}
