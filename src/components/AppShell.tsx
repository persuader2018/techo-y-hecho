"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Building2,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  LogIn,
  LogOut,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useApp } from "./AppContext";

const NAV_INQUILINO = [
  { href: "/portal", label: "Mi Piso", mobileLabel: "Piso", icon: Home },
  { href: "/pagos", label: "Pagos", mobileLabel: "Pagos", icon: CreditCard },
  { href: "/averias", label: "Averías", mobileLabel: "Averías", icon: Wrench },
  { href: "/contrato", label: "Legal y Fianza", mobileLabel: "Legal", icon: FileText },
  { href: "/pasaporte", label: "Pasaporte", mobileLabel: "Pasaporte", icon: Award },
];

const NAV_PROPIETARIO = [
  { href: "/propietario", label: "Expedientes", mobileLabel: "Expedientes", icon: Building2 },
  { href: "/pagos", label: "Verificar Pagos", mobileLabel: "Pagos", icon: CreditCard },
  { href: "/contrato", label: "Legal y Fianza", mobileLabel: "Legal", icon: FileText },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, viviendas, viviendaActiva, seleccionarVivienda, cerrarSesion } =
    useApp();

  const inquicheckUrl =
    process.env.NEXT_PUBLIC_INQUICHECK_URL || "https://inquicheck.vercel.app";

  const esPublica = pathname === "/" || pathname === "/acceso" || pathname.startsWith("/legal");
  const navItems =
    usuario?.rol === "propietario" ? NAV_PROPIETARIO : NAV_INQUILINO;

  const handleSalir = async () => {
    await cerrarSesion();
    router.push("/acceso");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Cabecera editorial fija */}
      <header className="sticky top-0 z-40 bg-surface/92 backdrop-blur-xl border-b border-outline-variant/40">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link
              href={
                !usuario
                  ? "/"
                  : usuario.rol === "propietario"
                  ? "/propietario"
                  : "/portal"
              }
              className="flex items-center gap-2.5 group shrink-0 whitespace-nowrap"
            >
              <img
                src="/images/logo-techoyhecho.jpg"
                alt="Logo Techo y Hecho"
                className="w-9 h-9 rounded-lg object-cover border border-outline-variant/50 shadow-xs"
              />
              <div className="flex items-baseline gap-0.5">
                <span className="font-editorial text-xl sm:text-2xl tracking-tight text-primary font-medium">
                  Techo y Hecho
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
                  .es
                </span>
              </div>
            </Link>

            {/* Selector de vivienda solo si es propietario con varios pisos */}
            {usuario?.rol === "propietario" && !esPublica && viviendas.length > 1 && (
              <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Vivienda:
                </span>
                <select
                  aria-label="Seleccionar vivienda activa"
                  value={viviendaActiva?.id || ""}
                  onChange={(e) => seleccionarVivienda(e.target.value)}
                  className="bg-transparent text-xs font-medium text-primary focus:outline-none cursor-pointer pr-1"
                >
                  {viviendas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.alias} ({v.municipio})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navegación Desktop estricta según el rol con el que entraste */}
          {usuario && !esPublica && (
            <nav className="hidden lg:flex items-center gap-5 whitespace-nowrap">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[13px] font-semibold tracking-wide transition-colors pb-1 whitespace-nowrap ${
                      active
                        ? "text-primary border-b-2 border-primary"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Indicador fijo de rol (sin botón de cambio de rol) + Salir/Acceder */}
          <div className="flex items-center gap-2.5">
            {usuario && !esPublica ? (
              <>
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    usuario.rol === "propietario"
                      ? "bg-secondary-container/70 text-on-secondary-container"
                      : "bg-surface-container text-primary"
                  }`}
                >
                  {usuario.rol === "propietario" ? "Propietario" : "Inquilino"} ·{" "}
                  {usuario.nombre.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleSalir}
                  className="btn-press inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary text-xs font-semibold"
                  title="Cerrar sesión o entrar con otro perfil"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <Link
                href="/acceso"
                className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 w-full pb-24 lg:pb-12">{children}</main>

      {/* Footer editorial */}
      <footer className="border-t border-outline-variant/50 bg-surface-container-low/70 pb-24 lg:pb-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/logo-techoyhecho.jpg"
                alt="Techo y Hecho"
                className="w-7 h-7 rounded-md object-cover"
              />
              <span className="font-editorial text-lg text-primary font-medium">
                Techo y Hecho
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-md">
              Gestión transparente del alquiler residencial en España. Ley
              12/2023, LAU y RDL 29/2026.{" "}
              <strong>Gratis para siempre para 1 vivienda.</strong>
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-secondary">
              <ShieldCheck className="w-4 h-4" />
              Privacidad por contrato · RGPD UE 2016/679 y LOPDGDD 3/2018
            </div>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
              Pasaporte de Solvencia Integrado (Custodia Cero)
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Audita tu solvencia laboral y tu historial de pagos dentro de
              Techo y Hecho sin guardar DNI ni nóminas.
            </p>
            <Link
              href="/pasaporte"
              className="btn-press inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary underline underline-offset-4"
            >
              Crear o consultar mi Pasaporte
            </Link>
          </div>

          <div className="md:col-span-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
              Marco Legal (España)
            </p>
            <ul className="space-y-1.5 text-xs text-on-surface-variant">
              <li>
                <Link href="/legal/aviso-legal" className="hover:text-primary">
                  Aviso Legal (LSSI-CE)
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="hover:text-primary">
                  Política de Privacidad (RGPD)
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-primary">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/terminos" className="hover:text-primary">
                  Términos de Uso y Aviso IA
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Barra inferior móvil adaptada al rol exacto */}
      {usuario && !esPublica && (
        <nav
          aria-label="Navegación móvil"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/50 px-2 py-2"
        >
          <div
            className={`grid gap-1 ${
              navItems.length === 3 ? "grid-cols-3" : "grid-cols-5"
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    active ? "text-primary bg-surface-container-low" : "text-outline"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-0.5 ${active ? "text-secondary" : ""}`}
                  />
                  <span className="truncate max-w-full px-0.5">
                    {item.mobileLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
