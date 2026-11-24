"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  VIVIENDAS_DEMO,
  type IncidenciaDemo,
  type MovimientoDemo,
  type RolUsuario,
  type ViviendaContratoDemo,
} from "@/lib/demo-data";
import { supabase } from "@/lib/supabase";

interface UsuarioSesion {
  nombre: string;
  email: string;
  rol: RolUsuario;
  esDemo: boolean;
}

interface AppContextType {
  usuario: UsuarioSesion | null;
  viviendas: ViviendaContratoDemo[];
  viviendaActiva: ViviendaContratoDemo;
  seleccionarVivienda: (id: string) => void;
  cambiarRol: (rol: RolUsuario) => void;
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
  marcarMovimientoPagado: (movId: string) => void;
  verificarMovimientoPropietario: (movId: string) => void;
  crearMovimiento: (mov: Omit<MovimientoDemo, "id" | "estado">) => void;
  crearIncidencia: (inc: Omit<IncidenciaDemo, "id" | "fechaReporte" | "diasRestantesPlazo15" | "estado">) => void;
  responderIncidenciaPropietario: (incId: string, propuesta: string) => void;
  simularVencimiento15Dias: (incId: string) => void;
  aplicarDescuentoIncidencia: (incId: string, importeFactura: number) => void;
  crearNuevaVivienda: (datos: {
    direccion: string;
    municipio: string;
    rentaBaseEur: number;
    emailInquilino?: string;
    esZonaTensionada: boolean;
  }) => string;
  vincularPorCodigo: (codigo: string) => Promise<{ ok: boolean; mensaje: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>({
    nombre: "Elena Soler",
    email: "elena.soler@ejemplo.es",
    rol: "inquilino",
    esDemo: true,
  });
  const [viviendas, setViviendas] = useState<ViviendaContratoDemo[]>(VIVIENDAS_DEMO);
  const [viviendaActivaId, setViviendaActivaId] = useState<string>(VIVIENDAS_DEMO[0].id);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const meta = data.session.user.user_metadata || {};
        setUsuario({
          nombre: meta.nombre_completo || data.session.user.email?.split("@")[0] || "Usuario",
          email: data.session.user.email || "",
          rol: meta.rol === "propietario" ? "propietario" : "inquilino",
          esDemo: false,
        });
      }
    });
  }, []);

  const viviendaActiva =
    viviendas.find((v) => v.id === viviendaActivaId) ?? viviendas[0];

  const seleccionarVivienda = (id: string) => setViviendaActivaId(id);

  const cambiarRol = (rol: RolUsuario) => {
    setUsuario((prev) =>
      prev
        ? {
            ...prev,
            rol,
            nombre: prev.esDemo
              ? rol === "propietario"
                ? "Javier Mendoza"
                : "Elena Soler"
              : prev.nombre,
          }
        : {
            nombre: rol === "propietario" ? "Javier Mendoza" : "Elena Soler",
            email: rol === "propietario" ? "javier.mendoza@ejemplo.es" : "elena.soler@ejemplo.es",
            rol,
            esDemo: true,
          }
    );
  };

  const entrarDemo = (rol: RolUsuario) => {
    setUsuario({
      nombre: rol === "propietario" ? "Javier Mendoza" : "Elena Soler",
      email: rol === "propietario" ? "javier.mendoza@ejemplo.es" : "elena.soler@ejemplo.es",
      rol,
      esDemo: true,
    });
  };

  const iniciarSesionSupabase = async (
    email: string,
    password: string,
    rol: RolUsuario
  ) => {
    if (!supabase) {
      return { ok: false, error: "Supabase no está configurado en este entorno." };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    const meta = data.user?.user_metadata || {};
    setUsuario({
      nombre: meta.nombre_completo || email.split("@")[0],
      email,
      rol: meta.rol === "propietario" || rol === "propietario" ? "propietario" : "inquilino",
      esDemo: false,
    });
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
      return { ok: false, error: "Supabase no está configurado en este entorno." };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre_completo: nombre, rol },
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    if (data.session && codigoVinculacion?.trim()) {
      await supabase.rpc("vincular_contrato_por_codigo", {
        p_codigo: codigoVinculacion.trim(),
      });
    }
    setUsuario({
      nombre,
      email,
      rol,
      esDemo: false,
    });
    return {
      ok: true,
      mensaje: data.session
        ? "Cuenta creada y sesión iniciada correctamente en Supabase."
        : "Cuenta creada en Supabase. Revisa tu correo para confirmar el acceso (también puedes explorar el modo Demo mientras tanto).",
    };
  };

  const cerrarSesion = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUsuario(null);
  };

  const actualizarVivienda = (
    updater: (v: ViviendaContratoDemo) => ViviendaContratoDemo
  ) => {
    setViviendas((prev) =>
      prev.map((v) => (v.id === viviendaActiva.id ? updater(v) : v))
    );
  };

  const marcarMovimientoPagado = (movId: string) => {
    actualizarVivienda((v) => ({
      ...v,
      movimientos: v.movimientos.map((m) =>
        m.id === movId
          ? {
              ...m,
              estado: "pagado_inquilino",
              fechaPago: new Date().toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            }
          : m
      ),
    }));
  };

  const verificarMovimientoPropietario = (movId: string) => {
    actualizarVivienda((v) => ({
      ...v,
      movimientos: v.movimientos.map((m) =>
        m.id === movId ? { ...m, estado: "verificado_propietario" } : m
      ),
    }));
  };

  const crearMovimiento = (mov: Omit<MovimientoDemo, "id" | "estado">) => {
    const nuevo: MovimientoDemo = {
      ...mov,
      id: `mov-${Date.now()}`,
      estado: "pendiente",
    };
    actualizarVivienda((v) => ({
      ...v,
      movimientos: [nuevo, ...v.movimientos],
    }));
  };

  const crearIncidencia = (
    inc: Omit<IncidenciaDemo, "id" | "fechaReporte" | "diasRestantesPlazo15" | "estado">
  ) => {
    const nueva: IncidenciaDemo = {
      ...inc,
      id: `inc-${Date.now()}`,
      fechaReporte: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      diasRestantesPlazo15: 15,
      estado: "abierta",
    };
    actualizarVivienda((v) => ({
      ...v,
      incidencias: [nueva, ...v.incidencias],
    }));
  };

  const responderIncidenciaPropietario = (incId: string, propuesta: string) => {
    actualizarVivienda((v) => ({
      ...v,
      incidencias: v.incidencias.map((i) =>
        i.id === incId
          ? { ...i, propuestaPropietario: propuesta, estado: "en_proceso" }
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

  const aplicarDescuentoIncidencia = (incId: string, importeFactura: number) => {
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
          concepto: `Compensación Art. 21.1 LAU (reparación urgente tras plazo 15d)`,
          periodoMes: "Noviembre 2026",
          importeEur: -Math.abs(importeFactura),
          estado: "verificado_propietario",
          fechaVencimiento: "Aplicado en próxima renta",
        },
        ...v.movimientos,
      ],
    }));
  };

  const crearNuevaVivienda = ({
    direccion,
    municipio,
    rentaBaseEur,
    emailInquilino,
    esZonaTensionada,
  }: {
    direccion: string;
    municipio: string;
    rentaBaseEur: number;
    emailInquilino?: string;
    esZonaTensionada: boolean;
  }) => {
    const prefijo = municipio.slice(0, 3).toUpperCase() || "ESP";
    const codigo = `${prefijo}-2026-${Math.floor(100 + Math.random() * 899)}`;
    const nueva: ViviendaContratoDemo = {
      ...VIVIENDAS_DEMO[0],
      id: `viv-${Date.now()}`,
      codigoVinculacion: codigo,
      alias: direccion,
      direccion,
      municipio,
      imagenUrl: "/images/vivienda-valencia.jpg",
      esZonaTensionada,
      rentaBaseEur,
      gastosComunidadEur: 0,
      tasaResiduosEur: 0,
      fianzaEur: rentaBaseEur,
      inquilinoNombre: emailInquilino ? emailInquilino.split("@")[0] : "Pendiente de vincular",
      inquilinoEmail: emailInquilino || "pendiente@ejemplo.es",
      movimientos: [
        {
          id: `mov-init-${Date.now()}`,
          tipo: "renta",
          concepto: "Primera mensualidad contractual",
          periodoMes: "Diciembre 2026",
          importeEur: rentaBaseEur,
          estado: "pendiente",
          fechaVencimiento: "05 Dic 2026",
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
    const existente = viviendas.find(
      (v) => v.codigoVinculacion.toUpperCase() === limpio
    );
    if (existente) {
      setViviendaActivaId(existente.id);
      return {
        ok: true,
        mensaje: `Contrato ${existente.codigoVinculacion} (${existente.alias}) vinculado correctamente.`,
      };
    }
    if (supabase && usuario && !usuario.esDemo) {
      const { data } = await supabase.rpc("vincular_contrato_por_codigo", {
        p_codigo: limpio,
      });
      if (data?.ok) {
        return { ok: true, mensaje: `Contrato ${limpio} vinculado en Supabase.` };
      }
    }
    return {
      ok: false,
      mensaje: `No encontramos el código "${limpio}". Prueba con MAD-2026-B o VAL-2026-A.`,
    };
  };

  return (
    <AppContext.Provider
      value={{
        usuario,
        viviendas,
        viviendaActiva,
        seleccionarVivienda,
        cambiarRol,
        entrarDemo,
        iniciarSesionSupabase,
        registrarSupabase,
        cerrarSesion,
        marcarMovimientoPagado,
        verificarMovimientoPropietario,
        crearMovimiento,
        crearIncidencia,
        responderIncidenciaPropietario,
        simularVencimiento15Dias,
        aplicarDescuentoIncidencia,
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
