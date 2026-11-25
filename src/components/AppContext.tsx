"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  VIVIENDAS_DEMO,
  type FotoEstadoInicial,
  type IncidenciaDemo,
  type MovimientoDemo,
  type RolUsuario,
  type ViviendaContratoDemo,
} from "@/lib/demo-data";
import type { ResultadoSolvenciaIntegrada } from "@/lib/inquicheck-engine";
import { supabase } from "@/lib/supabase";

export interface UsuarioSesion {
  id?: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  esDemo: boolean;
  registradoDesde: string;
  codigoPasaporte: string;
  presentacionInquilino: string;
  solvenciaIntegrada: ResultadoSolvenciaIntegrada | null;
}

interface AppContextType {
  usuario: UsuarioSesion | null;
  cargandoDatos: boolean;
  viviendas: ViviendaContratoDemo[];
  viviendaActiva: ViviendaContratoDemo | null;
  seleccionarVivienda: (id: string) => void;
  entrarDemo: (rol: RolUsuario) => void;
  iniciarSesionSupabase: (
    email: string,
    password: string,
    rol: RolUsuario
  ) => Promise<{ ok: boolean; error?: string }>;
  registrarSupabase: (datos: {
    nombre: string;
    email: string;
    password: string;
    rol: RolUsuario;
    codigoVinculacion?: string;
  }) => Promise<{ ok: boolean; mensaje?: string; error?: string }>;
  cerrarSesion: () => Promise<void>;
  marcarMovimientoPagado: (movId: string) => Promise<void>;
  verificarMovimientoPropietario: (movId: string) => Promise<void>;
  crearMovimiento: (mov: Omit<MovimientoDemo, "id" | "estado">) => Promise<void>;
  crearIncidencia: (
    inc: Omit<IncidenciaDemo, "id" | "fechaReporte" | "diasRestantesPlazo15" | "estado">
  ) => Promise<void>;
  aprobarPresupuestoInquilino: (incId: string, nota?: string) => Promise<void>;
  aprobarEnviarTecnico: (incId: string, propuesta: string) => Promise<void>;
  denegarIncidenciaPropietario: (incId: string, motivo: string) => Promise<void>;
  darConformidadInquilino: (incId: string) => Promise<void>;
  simularVencimiento15Dias: (incId: string) => void;
  aplicarDescuentoIncidencia: (incId: string, importeFactura: number) => Promise<void>;
  agregarFotoEstadoInicial: (
    foto: Omit<FotoEstadoInicial, "id" | "fecha">
  ) => Promise<void>;
  guardarPresentacionInquilino: (texto: string) => Promise<void>;
  guardarSolvenciaIntegrada: (
    solvencia: ResultadoSolvenciaIntegrada
  ) => Promise<void>;
  actualizarRentaAnual: (datos: {
    nuevaRentaEur: number;
    porcentajeSubida: number;
    normaAplicada: string;
  }) => Promise<void>;
  finalizarArrendamiento: (datos: {
    fianzaDevueltaCompleta: boolean;
    notaCierreFianza: string;
    autorizaCompartirTelefono: boolean;
    telefonoPropietario?: string;
  }) => Promise<void>;
  crearNuevaVivienda: (datos: {
    direccion: string;
    municipio: string;
    rentaBaseEur: number;
    fechaInicio: string;
    imagenUrl?: string;
    emailInquilino?: string;
    esZonaTensionada: boolean;
  }) => Promise<string>;
  vincularPorCodigo: (
    codigo: string
  ) => Promise<{ ok: boolean; mensaje: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

function generarCodigoPasaporte(seed?: string) {
  const sufijo = (seed || Math.random().toString(36).slice(2, 6))
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  return `TYH-INQ-${sufijo || "2026"}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [viviendas, setViviendas] = useState<ViviendaContratoDemo[]>([]);
  const [viviendaActivaId, setViviendaActivaId] = useState<string>("");

  const cargarDatosRealesSupabase = useCallback(
    async (userId: string, email: string, meta: Record<string, unknown>) => {
      if (!supabase) return;
      setCargandoDatos(true);
      try {
        // 1. Perfil real
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        const codigoPas =
          perfil?.codigo_pasaporte || generarCodigoPasaporte(userId);
        if (perfil && !perfil.codigo_pasaporte) {
          await supabase
            .from("perfiles")
            .update({ codigo_pasaporte: codigoPas })
            .eq("id", userId);
        }

        const rolReal: RolUsuario =
          perfil?.rol === "propietario" || meta?.rol === "propietario"
            ? "propietario"
            : "inquilino";

        setUsuario({
          id: userId,
          nombre:
            perfil?.nombre_completo ||
            String(meta?.nombre_completo || email.split("@")[0]),
          email,
          rol: rolReal,
          esDemo: false,
          registradoDesde: perfil?.creado_en
            ? new Date(perfil.creado_en).toLocaleDateString("es-ES", {
                month: "short",
                year: "numeric",
              })
            : "Nov 2026",
          codigoPasaporte: codigoPas,
          presentacionInquilino: perfil?.presentacion_inquilino || "",
          solvenciaIntegrada:
            (perfil?.solvencia_integrada as ResultadoSolvenciaIntegrada) || null,
        });

        // 2. Contratos y viviendas reales (vacío si es usuario nuevo)
        const { data: contratos } = await supabase
          .from("contratos")
          .select("*, viviendas(*), incidencias(*), movimientos(*)")
          .or(`propietario_id.eq.${userId},inquilino_id.eq.${userId}`)
          .order("creado_en", { ascending: false });

        if (!contratos || contratos.length === 0) {
          setViviendas([]);
          setViviendaActivaId("");
          return;
        }

        const mapeadas: ViviendaContratoDemo[] = contratos.map((c) => {
          const v = c.viviendas || {};
          const movs: MovimientoDemo[] = (c.movimientos || []).map(
            (m: Record<string, unknown>) => ({
              id: String(m.id),
              tipo: (m.tipo as MovimientoDemo["tipo"]) || "renta",
              concepto: String(m.concepto || ""),
              periodoMes: String(m.periodo_mes || ""),
              importeEur: Number(m.importe_total_eur || 0),
              estado:
                (m.estado_pago as MovimientoDemo["estado"]) || "pendiente",
              fechaVencimiento: "Día 5",
              fechaPago: m.fecha_pago ? String(m.fecha_pago) : undefined,
            })
          );

          const incs: IncidenciaDemo[] = (c.incidencias || []).map(
            (i: Record<string, unknown>) => ({
              id: String(i.id),
              titulo: String(i.titulo || ""),
              descripcion: String(i.descripcion || ""),
              urgencia: (i.urgencia as IncidenciaDemo["urgencia"]) || "media",
              responsableIa:
                (i.dictamen_ia_responsable as IncidenciaDemo["responsableIa"]) ||
                "revisar",
              articuloLau: String(i.dictamen_ia_articulo || "Art. 21 LAU"),
              dictamenIa: String(i.dictamen_ia_explicacion || ""),
              guiaEmergencia: String(i.guia_emergencia || ""),
              busquedaBricolaje: i.busqueda_bricolaje
                ? String(i.busqueda_bricolaje)
                : undefined,
              fotos: Array.isArray(i.fotos) ? (i.fotos as string[]) : [],
              presupuestoInquilinoEur: i.presupuesto_inquilino_eur
                ? Number(i.presupuesto_inquilino_eur)
                : undefined,
              notaPresupuestoInquilino: i.nota_presupuesto_inquilino
                ? String(i.nota_presupuesto_inquilino)
                : undefined,
              diasRestantesPlazo15: 15,
              estado:
                i.estado === "resuelta"
                  ? "resuelta_conforme"
                  : i.estado === "en_proceso"
                  ? "aprobada_tecnico"
                  : i.estado === "descartada"
                  ? "denegada"
                  : "pendiente_aprobacion",
              respuestaPropietario: i.propuesta_propietario
                ? String(i.propuesta_propietario)
                : undefined,
              motivoDenegacion: i.motivo_denegacion
                ? String(i.motivo_denegacion)
                : undefined,
              fechaReporte: i.creado_en
                ? new Date(String(i.creado_en)).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Hoy",
            })
          );

          const rentasTot = movs.filter((m) => m.tipo === "renta");
          const rentasPag = rentasTot.filter((m) => m.estado !== "pendiente");
          const pct =
            rentasTot.length > 0
              ? Math.round((rentasPag.length / rentasTot.length) * 100)
              : 100;

          return {
            id: String(c.id),
            codigoVinculacion: String(c.codigo_vinculacion),
            alias: String(v.alias || v.direccion || "Mi vivienda"),
            direccion: String(v.direccion || ""),
            municipio: String(v.municipio || "España"),
            codigoPostal: String(v.codigo_postal || ""),
            superficieM2: Number(v.superficie_m2 || 80),
            exterior: true,
            imagenUrl: String(v.imagen_url || "/images/apartamento-editorial.jpg"),
            esZonaTensionada: Boolean(v.es_zona_tensionada),
            tipoContrato: (c.tipo_contrato || "habitual") as "habitual",
            fechaInicio: String(c.fecha_inicio),
            fechaFin: String(c.fecha_fin || ""),
            mesActualContrato: 1,
            mesesTotalesContrato: 60,
            rentaBaseEur: Number(c.renta_mensual_eur || 0),
            fianzaEur: Number(c.fianza_eur || 0),
            organismoFianza: String(
              c.organismo_fianza || "Organismo Autonómico de Fianzas"
            ),
            numeroDepositoFianza: "Pendiente de adjuntar",
            resguardoFianzaVerificado: Boolean(c.resguardo_fianza_verificado),
            propietarioNombre:
              rolReal === "propietario"
                ? perfil?.nombre_completo || "Propietario"
                : "Propietario",
            propietarioEmail: "",
            propietarioTelefono: c.telefono_propietario_ref || undefined,
            autorizaCompartirTelefono: Boolean(c.autoriza_compartir_telefono),
            estadoContrato: c.estado === "finalizado" ? "finalizado" : "activo",
            fechaFinalizacion: c.fecha_finalizacion || undefined,
            fianzaDevueltaCompleta: c.fianza_devuelta_completa ?? undefined,
            notaCierreFianza: c.nota_cierre_fianza || undefined,
            ultimaActualizacionRenta: c.ultima_actualizacion_renta || undefined,
            inquilinoNombre:
              rolReal === "inquilino"
                ? perfil?.nombre_completo || "Inquilino"
                : c.email_inquilino_invitado || "Pendiente de vincular",
            inquilinoEmail: c.email_inquilino_invitado || "",
            idPasaporteInquicheck: codigoPas,
            solvenciaInquicheckAdjunta: Boolean(perfil?.solvencia_integrada),
            fotosEstadoInicial: Array.isArray(c.fotos_estado_inicial)
              ? (c.fotos_estado_inicial as FotoEstadoInicial[])
              : [],
            movimientos: movs,
            incidencias: incs,
            certificadoInquilino: {
              codigo: codigoPas,
              titular: perfil?.nombre_completo || email.split("@")[0],
              rol: "Buen Inquilino",
              puntuacion: perfil?.indice_confianza || 100,
              pagosPuntualesPct: pct,
              horasRespuestaMedia: 12,
              mesesVerificados: rentasPag.length,
              enlaceInquicheck: "",
              selloVerificacion:
                rentasPag.length > 0
                  ? `${rentasPag.length} de ${rentasTot.length} mensualidades verificadas`
                  : "Cuenta nueva verificada · Historial en construcción",
            },
            certificadoCasero: {
              codigo: `TYH-PRO-${String(c.codigo_vinculacion).slice(0, 6)}`,
              titular: "Propietario",
              rol: "Buen Casero",
              puntuacion: 100,
              pagosPuntualesPct: 100,
              horasRespuestaMedia: 24,
              mesesVerificados: rentasPag.length,
              enlaceInquicheck: "",
              selloVerificacion: "Contrato gestionado en Techo y Hecho",
            },
          };
        });

        setViviendas(mapeadas);
        setViviendaActivaId(mapeadas[0]?.id || "");
      } finally {
        setCargandoDatos(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        cargarDatosRealesSupabase(
          data.session.user.id,
          data.session.user.email || "",
          data.session.user.user_metadata || {}
        );
      }
    });
  }, [cargarDatosRealesSupabase]);

  const viviendaActiva =
    viviendas.find((v) => v.id === viviendaActivaId) ?? viviendas[0] ?? null;

  const seleccionarVivienda = (id: string) => setViviendaActivaId(id);

  const entrarDemo = (rol: RolUsuario) => {
    setUsuario({
      nombre: rol === "propietario" ? "Javier Mendoza" : "Elena Soler",
      email:
        rol === "propietario"
          ? "javier.mendoza@ejemplo.es"
          : "elena.soler@ejemplo.es",
      rol,
      esDemo: true,
      registradoDesde: "Ene 2024",
      codigoPasaporte: "TYH-REP-INQ-942B",
      presentacionInquilino:
        "Arquitecta con contrato indefinido, no fumadora y sin mascotas. Busco vivienda tranquila de larga estancia.",
      solvenciaIntegrada: {
        alias_display: "Elena S.",
        verification_passed: true,
        document_discrepancy_detected: false,
        fraud_risk_level: "LOW",
        csv_detected: true,
        employment_category: "Contrato Indefinido",
        members_breakdown: [
          "Titular 1 (Elena S.): Contrato Indefinido - Arquitecta (4 años antigüedad)",
        ],
        contract_code_tgss: "100",
        seniority_years: 4,
        verified_net_income: 3400,
        net_income_bracket_display: "3.300 € - 3.500 €/mes",
        has_wage_garnishment: false,
        max_safe_rent_35pct: 1190,
        solvency_score: 94,
        auditor_notes:
          "Perfil financiero sólido con contrato indefinido y coherencia total entre Vida Laboral TGSS y nómina.",
        fecha_auditoria: "15 Nov 2026",
        num_titulares: 1,
        vinculo: "Individual",
        zona_busqueda: "Madrid Centro",
      },
    });
    setViviendas(VIVIENDAS_DEMO);
    setViviendaActivaId(VIVIENDAS_DEMO[0].id);
  };

  const iniciarSesionSupabase = async (
    email: string,
    password: string,
    rol: RolUsuario
  ) => {
    if (!supabase) {
      return { ok: false, error: "Supabase no está configurado." };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };
    if (data.user) {
      await cargarDatosRealesSupabase(data.user.id, email, {
        ...data.user.user_metadata,
        rol: data.user.user_metadata?.rol || rol,
      });
    }
    return { ok: true };
  };

  const registrarSupabase = async ({
    nombre,
    email,
    password,
    rol,
    codigoVinculacion,
  }: {
    nombre: string;
    email: string;
    password: string;
    rol: RolUsuario;
    codigoVinculacion?: string;
  }) => {
    if (!supabase) {
      return { ok: false, error: "Supabase no está configurado." };
    }
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "https://techo-y-hecho.vercel.app/auth/callback";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { nombre_completo: nombre, rol },
      },
    });
    if (error) return { ok: false, error: error.message };

    if (data.session && data.user) {
      if (codigoVinculacion?.trim()) {
        await supabase.rpc("vincular_contrato_por_codigo", {
          p_codigo: codigoVinculacion.trim(),
        });
      }
      await cargarDatosRealesSupabase(data.user.id, email, {
        nombre_completo: nombre,
        rol,
      });
      return { ok: true, mensaje: "Cuenta creada y lista para usar." };
    }

    return {
      ok: true,
      mensaje:
        "Cuenta creada en Supabase. Revisa tu correo y pulsa el enlace de confirmación para entrar (tu cuenta empezará totalmente limpia).",
    };
  };

  const cerrarSesion = async () => {
    if (supabase) await supabase.auth.signOut();
    setUsuario(null);
    setViviendas([]);
    setViviendaActivaId("");
  };

  const actualizarVivienda = (
    updater: (v: ViviendaContratoDemo) => ViviendaContratoDemo
  ) => {
    if (!viviendaActiva) return;
    setViviendas((prev) =>
      prev.map((v) => (v.id === viviendaActiva.id ? updater(v) : v))
    );
  };

  const marcarMovimientoPagado = async (movId: string) => {
    const fechaIso = new Date().toISOString().slice(0, 10);
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("movimientos")
        .update({ estado_pago: "pagado_inquilino", fecha_pago: fechaIso })
        .eq("id", movId);
    }
    actualizarVivienda((v) => ({
      ...v,
      movimientos: v.movimientos.map((m) =>
        m.id === movId
          ? { ...m, estado: "pagado_inquilino", fechaPago: fechaIso }
          : m
      ),
    }));
  };

  const verificarMovimientoPropietario = async (movId: string) => {
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("movimientos")
        .update({ estado_pago: "verificado_propietario" })
        .eq("id", movId);
    }
    actualizarVivienda((v) => ({
      ...v,
      movimientos: v.movimientos.map((m) =>
        m.id === movId ? { ...m, estado: "verificado_propietario" } : m
      ),
    }));
  };

  const crearMovimiento = async (mov: Omit<MovimientoDemo, "id" | "estado">) => {
    if (!viviendaActiva) return;
    let id = `mov-${Date.now()}`;
    if (usuario && !usuario.esDemo && supabase) {
      const { data } = await supabase
        .from("movimientos")
        .insert({
          contrato_id: viviendaActiva.id,
          tipo: mov.tipo,
          concepto: mov.concepto,
          periodo_mes: mov.periodoMes,
          importe_total_eur: mov.importeEur,
          estado_pago: "pendiente",
        })
        .select("id")
        .single();
      if (data?.id) id = data.id;
    }
    actualizarVivienda((v) => ({
      ...v,
      movimientos: [{ ...mov, id, estado: "pendiente" }, ...v.movimientos],
    }));
  };

  const crearIncidencia = async (
    inc: Omit<IncidenciaDemo, "id" | "fechaReporte" | "diasRestantesPlazo15" | "estado">
  ) => {
    if (!viviendaActiva) return;
    let id = `inc-${Date.now()}`;
    if (usuario && !usuario.esDemo && supabase && usuario.id) {
      const { data } = await supabase
        .from("incidencias")
        .insert({
          contrato_id: viviendaActiva.id,
          reportado_por: usuario.id,
          titulo: inc.titulo,
          descripcion: inc.descripcion,
          urgencia: inc.urgencia,
          dictamen_ia_responsable: inc.responsableIa,
          dictamen_ia_articulo: inc.articuloLau,
          dictamen_ia_explicacion: inc.dictamenIa,
          guia_emergencia: inc.guiaEmergencia,
          busqueda_bricolaje: inc.busquedaBricolaje || null,
          fotos: inc.fotos,
          presupuesto_inquilino_eur: inc.presupuestoInquilinoEur ?? null,
          nota_presupuesto_inquilino: inc.notaPresupuestoInquilino ?? null,
          estado: "abierta",
        })
        .select("id")
        .single();
      if (data?.id) id = data.id;
    }
    const nueva: IncidenciaDemo = {
      ...inc,
      id,
      fechaReporte: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      diasRestantesPlazo15: 15,
      estado: "pendiente_aprobacion",
    };
    actualizarVivienda((v) => ({
      ...v,
      incidencias: [nueva, ...v.incidencias],
    }));
  };

  const aprobarPresupuestoInquilino = async (incId: string, nota?: string) => {
    const inc = viviendaActiva?.incidencias.find((i) => i.id === incId);
    const msg =
      nota ||
      `Presupuesto de ${inc?.presupuestoInquilinoEur ?? "—"} € aprobado por el propietario.`;
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("incidencias")
        .update({ estado: "en_proceso", propuesta_propietario: msg })
        .eq("id", incId);
    }
    actualizarVivienda((v) => ({
      ...v,
      incidencias: v.incidencias.map((i) =>
        i.id === incId
          ? { ...i, estado: "aprobada_presupuesto", respuestaPropietario: msg }
          : i
      ),
    }));
  };

  const aprobarEnviarTecnico = async (incId: string, propuesta: string) => {
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("incidencias")
        .update({ estado: "en_proceso", propuesta_propietario: propuesta })
        .eq("id", incId);
    }
    actualizarVivienda((v) => ({
      ...v,
      incidencias: v.incidencias.map((i) =>
        i.id === incId
          ? { ...i, estado: "aprobada_tecnico", respuestaPropietario: propuesta }
          : i
      ),
    }));
  };

  const denegarIncidenciaPropietario = async (incId: string, motivo: string) => {
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("incidencias")
        .update({ estado: "descartada", motivo_denegacion: motivo })
        .eq("id", incId);
    }
    actualizarVivienda((v) => ({
      ...v,
      incidencias: v.incidencias.map((i) =>
        i.id === incId
          ? { ...i, estado: "denegada", motivoDenegacion: motivo }
          : i
      ),
    }));
  };

  const darConformidadInquilino = async (incId: string) => {
    const hoy = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("incidencias")
        .update({
          estado: "resuelta",
          conformidad_inquilino_en: new Date().toISOString(),
        })
        .eq("id", incId);
    }
    actualizarVivienda((v) => ({
      ...v,
      incidencias: v.incidencias.map((i) =>
        i.id === incId
          ? {
              ...i,
              estado: "resuelta_conforme",
              conformidadInquilinoFecha: hoy,
            }
          : i
      ),
    }));
  };

  const simularVencimiento15Dias = (incId: string) => {
    actualizarVivienda((v) => ({
      ...v,
      incidencias: v.incidencias.map((i) =>
        i.id === incId ? { ...i, diasRestantesPlazo15: 0 } : i
      ),
    }));
  };

  const aplicarDescuentoIncidencia = async (
    incId: string,
    importeFactura: number
  ) => {
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("incidencias")
        .update({
          estado: "descuento_aplicado",
          factura_descuento_eur: importeFactura,
        })
        .eq("id", incId);
    }
    actualizarVivienda((v) => ({
      ...v,
      incidencias: v.incidencias.map((i) =>
        i.id === incId
          ? {
              ...i,
              facturaDescuentoEur: importeFactura,
              estado: "descuento_aplicado",
            }
          : i
      ),
      movimientos: [
        {
          id: `comp-${Date.now()}`,
          tipo: "compensacion",
          concepto: "Compensación Art. 21.1 LAU (reparación urgente)",
          periodoMes: "Noviembre 2026",
          importeEur: -Math.abs(importeFactura),
          estado: "verificado_propietario",
          fechaVencimiento: "Descontado en próxima renta",
        },
        ...v.movimientos,
      ],
    }));
  };

  const agregarFotoEstadoInicial = async (
    foto: Omit<FotoEstadoInicial, "id" | "fecha">
  ) => {
    if (!viviendaActiva) return;
    const nueva: FotoEstadoInicial = {
      ...foto,
      id: `foto-${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    const lista = [nueva, ...viviendaActiva.fotosEstadoInicial];
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("contratos")
        .update({ fotos_estado_inicial: lista })
        .eq("id", viviendaActiva.id);
    }
    actualizarVivienda((v) => ({ ...v, fotosEstadoInicial: lista }));
  };

  const guardarPresentacionInquilino = async (texto: string) => {
    if (usuario && !usuario.esDemo && supabase && usuario.id) {
      await supabase
        .from("perfiles")
        .update({ presentacion_inquilino: texto })
        .eq("id", usuario.id);
    }
    setUsuario((prev) => (prev ? { ...prev, presentacionInquilino: texto } : prev));
  };

  const guardarSolvenciaIntegrada = async (
    solvencia: ResultadoSolvenciaIntegrada
  ) => {
    if (usuario && !usuario.esDemo && supabase && usuario.id) {
      await supabase
        .from("perfiles")
        .update({ solvencia_integrada: solvencia })
        .eq("id", usuario.id);
    }
    setUsuario((prev) =>
      prev ? { ...prev, solvenciaIntegrada: solvencia } : prev
    );
  };

  const actualizarRentaAnual = async ({
    nuevaRentaEur,
    porcentajeSubida,
    normaAplicada,
  }: {
    nuevaRentaEur: number;
    porcentajeSubida: number;
    normaAplicada: string;
  }) => {
    if (!viviendaActiva) return;
    const hoyIso = new Date().toISOString().slice(0, 10);
    if (usuario && !usuario.esDemo && supabase) {
      await supabase.from("actualizaciones_renta").insert({
        contrato_id: viviendaActiva.id,
        fecha_aplicacion: hoyIso,
        renta_anterior_eur: viviendaActiva.rentaBaseEur,
        indice_aplicado: normaAplicada,
        porcentaje_subida: porcentajeSubida,
        renta_nueva_eur: nuevaRentaEur,
      });
      await supabase
        .from("contratos")
        .update({
          renta_mensual_eur: nuevaRentaEur,
          ultima_actualizacion_renta: hoyIso,
        })
        .eq("id", viviendaActiva.id);
    }
    actualizarVivienda((v) => ({
      ...v,
      rentaBaseEur: nuevaRentaEur,
      ultimaActualizacionRenta: hoyIso,
    }));
  };

  const finalizarArrendamiento = async ({
    fianzaDevueltaCompleta,
    notaCierreFianza,
    autorizaCompartirTelefono,
    telefonoPropietario,
  }: {
    fianzaDevueltaCompleta: boolean;
    notaCierreFianza: string;
    autorizaCompartirTelefono: boolean;
    telefonoPropietario?: string;
  }) => {
    if (!viviendaActiva) return;
    const hoyIso = new Date().toISOString().slice(0, 10);
    if (usuario && !usuario.esDemo && supabase) {
      await supabase
        .from("contratos")
        .update({
          estado: "finalizado",
          fecha_finalizacion: hoyIso,
          fianza_devuelta_completa: fianzaDevueltaCompleta,
          nota_cierre_fianza: notaCierreFianza,
          autoriza_compartir_telefono: autorizaCompartirTelefono,
          telefono_propietario_ref: autorizaCompartirTelefono
            ? telefonoPropietario || null
            : null,
        })
        .eq("id", viviendaActiva.id);
    }
    actualizarVivienda((v) => ({
      ...v,
      estadoContrato: "finalizado",
      fechaFinalizacion: hoyIso,
      fianzaDevueltaCompleta,
      notaCierreFianza,
      autorizaCompartirTelefono,
      propietarioTelefono: autorizaCompartirTelefono
        ? telefonoPropietario
        : undefined,
    }));
  };

  const crearNuevaVivienda = async ({
    direccion,
    municipio,
    rentaBaseEur,
    fechaInicio,
    imagenUrl,
    emailInquilino,
    esZonaTensionada,
  }: {
    direccion: string;
    municipio: string;
    rentaBaseEur: number;
    fechaInicio: string;
    imagenUrl?: string;
    emailInquilino?: string;
    esZonaTensionada: boolean;
  }) => {
    const prefijo = municipio.slice(0, 3).toUpperCase() || "ESP";
    const codigo = `${prefijo}-${new Date().getFullYear()}-${Math.floor(
      100 + Math.random() * 899
    )}`;
    const fotoFinal = imagenUrl || "/images/apartamento-editorial.jpg";
    let contratoId = `viv-${Date.now()}`;

    if (usuario && !usuario.esDemo && supabase && usuario.id) {
      const { data: viv } = await supabase
        .from("viviendas")
        .insert({
          propietario_id: usuario.id,
          alias: direccion,
          direccion,
          municipio,
          es_zona_tensionada: esZonaTensionada,
          imagen_url: fotoFinal,
        })
        .select("id")
        .single();

      if (viv?.id) {
        const { data: cont } = await supabase
          .from("contratos")
          .insert({
            vivienda_id: viv.id,
            propietario_id: usuario.id,
            email_inquilino_invitado: emailInquilino || null,
            codigo_vinculacion: codigo,
            tipo_contrato: "habitual",
            fecha_inicio: fechaInicio,
            renta_mensual_eur: rentaBaseEur,
            fianza_eur: rentaBaseEur,
            estado: "activo",
          })
          .select("id")
          .single();
        if (cont?.id) contratoId = cont.id;
      }
    }

    const nueva: ViviendaContratoDemo = {
      ...VIVIENDAS_DEMO[0],
      id: contratoId,
      codigoVinculacion: codigo,
      alias: direccion,
      direccion,
      municipio,
      imagenUrl: fotoFinal,
      esZonaTensionada,
      fechaInicio,
      fechaFin: "",
      estadoContrato: "activo",
      rentaBaseEur,
      fianzaEur: rentaBaseEur,
      propietarioNombre: usuario?.nombre || "Propietario",
      inquilinoNombre: emailInquilino
        ? emailInquilino.split("@")[0]
        : "Pendiente de vincular",
      inquilinoEmail: emailInquilino || "",
      fotosEstadoInicial: [],
      movimientos: [
        {
          id: `mov-init-${Date.now()}`,
          tipo: "renta",
          concepto: "Primera mensualidad contractual",
          periodoMes: "Mes 1",
          importeEur: rentaBaseEur,
          estado: "pendiente",
          fechaVencimiento: "Día 5",
        },
      ],
      incidencias: [],
    };
    setViviendas((prev) => [nueva, ...prev]);
    setViviendaActivaId(nueva.id);
    return codigo;
  };

  const vincularPorCodigo = async (codigo: string) => {
    const limpio = codigo.trim().toUpperCase();
    if (usuario && !usuario.esDemo && supabase && usuario.id) {
      const { data } = await supabase.rpc("vincular_contrato_por_codigo", {
        p_codigo: limpio,
      });
      if (data?.ok) {
        await cargarDatosRealesSupabase(usuario.id, usuario.email, {
          nombre_completo: usuario.nombre,
          rol: usuario.rol,
        });
        return { ok: true, mensaje: `Vivienda ${limpio} vinculada correctamente.` };
      }
      return {
        ok: false,
        mensaje:
          data?.error ||
          `No encontramos ningún contrato disponible con el código "${limpio}".`,
      };
    }

    const existente = viviendas.find(
      (v) => v.codigoVinculacion.toUpperCase() === limpio
    );
    if (existente) {
      setViviendaActivaId(existente.id);
      return {
        ok: true,
        mensaje: `Contrato ${existente.codigoVinculacion} (${existente.alias}) vinculado.`,
      };
    }
    return {
      ok: false,
      mensaje: `Código "${limpio}" no encontrado.`,
    };
  };

  return (
    <AppContext.Provider
      value={{
        usuario,
        cargandoDatos,
        viviendas,
        viviendaActiva,
        seleccionarVivienda,
        entrarDemo,
        iniciarSesionSupabase,
        registrarSupabase,
        cerrarSesion,
        marcarMovimientoPagado,
        verificarMovimientoPropietario,
        crearMovimiento,
        crearIncidencia,
        aprobarPresupuestoInquilino,
        aprobarEnviarTecnico,
        denegarIncidenciaPropietario,
        darConformidadInquilino,
        simularVencimiento15Dias,
        aplicarDescuentoIncidencia,
        agregarFotoEstadoInicial,
        guardarPresentacionInquilino,
        guardarSolvenciaIntegrada,
        actualizarRentaAnual,
        finalizarArrendamiento,
        crearNuevaVivienda,
        vincularPorCodigo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe utilizarse dentro de AppProvider");
  return ctx;
}
