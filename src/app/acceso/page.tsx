"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import type { RolUsuario } from "@/lib/demo-data";

function AccesoFormContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entrarDemo, iniciarSesionSupabase, registrarSupabase } = useApp();

  const [modo, setModo] = useState<"login" | "register">("login");
  const [rol, setRol] = useState<RolUsuario>("inquilino");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigoVivienda, setCodigoVivienda] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  // Precarga automática desde el enlace de WhatsApp (?modo=register&rol=inquilino&codigo=XXX) o confirmación (?confirmado=1)
  useEffect(() => {
    const modoParam = searchParams.get("modo");
    const rolParam = searchParams.get("rol");
    const codigoParam = searchParams.get("codigo");
    const confirmado = searchParams.get("confirmado");

    if (modoParam === "register" || codigoParam) setModo("register");
    if (rolParam === "propietario" || rolParam === "inquilino") setRol(rolParam);
    if (codigoParam) setCodigoVivienda(codigoParam.toUpperCase());
    if (confirmado === "1") {
      setFeedback({
        tipo: "ok",
        texto:
          "¡Correo confirmado correctamente! Ya puedes iniciar sesión con tu cuenta.",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (modo === "register" && !aceptaPrivacidad) {
      setFeedback({
        tipo: "error",
        texto: "Debes aceptar la Política de Privacidad para crear tu cuenta.",
      });
      return;
    }

    setCargando(true);
    try {
      if (modo === "login") {
        const res = await iniciarSesionSupabase(email, password, rol);
        if (!res.ok) {
          setFeedback({
            tipo: "error",
            texto:
              res.error ||
              "No se pudo iniciar sesión. Revisa tu correo y contraseña.",
          });
        } else {
          router.push(rol === "propietario" ? "/propietario" : "/portal");
        }
      } else {
        const res = await registrarSupabase({
          nombre: nombre || email.split("@")[0],
          email,
          password,
          rol,
          codigoVinculacion: codigoVivienda,
        });
        if (!res.ok) {
          setFeedback({
            tipo: "error",
            texto: res.error || "No se pudo crear la cuenta.",
          });
        } else {
          setFeedback({
            tipo: "ok",
            texto: res.mensaje || "Cuenta creada correctamente.",
          });
        }
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 animate-enter">
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-xl bg-surface-container-lowest border border-outline-variant/40">
        {/* Panel Izquierdo Editorial */}
        <div className="lg:col-span-5 relative flex flex-col justify-between p-8 sm:p-12 bg-primary-container text-surface-bright min-h-[420px] lg:min-h-[680px]">
          <img
            src="/images/vivienda-madrid.jpg"
            alt="Interior arquitectónico luminoso en Madrid"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary-container/85 to-primary-container/60 pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest text-primary-fixed">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed" />
              Arrendamiento Sereno · Ed. 2026
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-surface-bright leading-tight font-normal pt-2">
              Habitar con certeza,
              <br />
              <span className="italic text-surface-container-high">
                gestionar con calma.
              </span>
            </h2>
          </div>

          <div className="relative z-10 space-y-6 pt-10">
            <div className="pl-4 border-l-2 border-secondary-fixed-dim">
              <p className="font-editorial text-lg italic text-surface-container-low">
                “La dignidad de un hogar empieza por la absoluta transparencia
                del acuerdo.”
              </p>
              <p className="text-xs text-primary-fixed-dim mt-2">
                Plataforma adaptada a la Ley 12/2023 y al Real Decreto-ley
                29/2026 de vivienda.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-secondary/30 text-secondary-fixed text-[11px] font-semibold uppercase">
                RDL 29/2026 · Tope 2 %
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-surface-container-high text-[11px] font-semibold">
                Custodia Cero RGPD
              </span>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-on-primary-container">
              <span>TechoYHecho.es</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
                Privacidad por contrato
              </span>
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {codigoVivienda && modo === "register" && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Invitación detectada: tu código de piso{" "}
                  <strong className="font-mono">{codigoVivienda}</strong> ya está
                  listo para vincularse al crear tu cuenta.
                </span>
              </div>
            )}

            <div className="flex bg-surface-container-low p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setModo("login");
                  setFeedback(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  modo === "login"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setModo("register");
                  setFeedback(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  modo === "register"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Crear Cuenta (Gratis)
              </button>
            </div>

            <div>
              <h1 className="font-editorial text-3xl text-primary font-normal">
                {modo === "login"
                  ? "Bienvenido de nuevo"
                  : "Crea tu cuaderno de alquiler"}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                {modo === "login"
                  ? "Accede con tu cuenta real de propietario o inquilino."
                  : "Empieza desde cero, gratis para siempre para 1 vivienda."}
              </p>
            </div>

            <div className="space-y-2">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Mi rol en la vivienda
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRol("inquilino")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
                    rol === "inquilino"
                      ? "bg-surface-container text-primary ring-1 ring-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Soy Inquilino
                </button>
                <button
                  type="button"
                  onClick={() => setRol("propietario")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
                    rol === "propietario"
                      ? "bg-secondary-container/70 text-on-secondary-container ring-1 ring-secondary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Soy Propietario
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modo === "register" && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="nombre"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
                  >
                    Nombre y apellidos
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Elena Soler García"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. tu-correo@ejemplo.es"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={verPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-surface-container-low text-sm text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                  >
                    {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {modo === "register" && rol === "inquilino" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label
                      htmlFor="codigo"
                      className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
                    >
                      Código de piso (opcional)
                    </label>
                    <span className="text-[11px] text-outline">
                      Facilitado por tu propietario
                    </span>
                  </div>
                  <input
                    id="codigo"
                    type="text"
                    value={codigoVivienda}
                    onChange={(e) => setCodigoVivienda(e.target.value.toUpperCase())}
                    placeholder="Ej. MAD-2026-412"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-sm font-mono uppercase tracking-wider text-primary"
                  />
                </div>
              )}

              {modo === "register" && (
                <label className="flex items-start gap-2.5 text-xs text-on-surface-variant cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={aceptaPrivacidad}
                    onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span>
                    Acepto los{" "}
                    <Link href="/legal/terminos" className="underline text-primary">
                      Términos de Uso
                    </Link>{" "}
                    y la{" "}
                    <Link href="/legal/privacidad" className="underline text-primary">
                      Política de Privacidad (RGPD)
                    </Link>
                    .
                  </span>
                </label>
              )}

              {feedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    feedback.tipo === "ok"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-950"
                      : "bg-error-container text-on-error-container"
                  }`}
                >
                  {feedback.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="btn-press w-full py-3.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container disabled:opacity-60"
              >
                {cargando
                  ? "Conectando..."
                  : modo === "login"
                  ? "Entrar a mis alquileres"
                  : "Crear cuenta gratis"}
              </button>
            </form>

            <div className="pt-4 border-t border-outline-variant/50 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-outline text-center">
                ¿Solo quieres ver cómo funciona? Prueba con datos de ejemplo
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    entrarDemo("inquilino");
                    router.push("/portal");
                  }}
                  className="btn-press py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-secondary" />
                  Demo Inquilino
                </button>
                <button
                  type="button"
                  onClick={() => {
                    entrarDemo("propietario");
                    router.push("/propietario");
                  }}
                  className="btn-press py-2.5 px-3 rounded-xl bg-secondary-container/60 hover:bg-secondary-container text-on-secondary-container text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  Demo Propietario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccesoPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-12 text-center text-sm text-outline">Cargando acceso...</div>}>
        <AccesoFormContenido />
      </Suspense>
    </AppShell>
  );
}
