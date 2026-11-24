"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Scale,
  UserCheck,
  Wrench,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

export default function HomePage() {
  const router = useRouter();
  const { entrarDemo } = useApp();
  const inquicheckUrl =
    process.env.NEXT_PUBLIC_INQUICHECK_URL || "https://inquicheck.vercel.app";

  const abrirDemo = (rol: "inquilino" | "propietario") => {
    entrarDemo(rol);
    router.push(rol === "propietario" ? "/propietario" : "/portal");
  };

  return (
    <AppShell>
      {/* Hero limpio y respirable */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 animate-enter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/70 text-on-secondary-container text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Gratis para siempre para 1 vivienda · Ley 12/2023 y RDL 29/2026
            </span>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[54px] leading-[1.1] text-primary font-normal">
              Tu alquiler en orden,{" "}
              <span className="italic text-secondary">sin discusiones.</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-lg">
              Rentas, suministros, averías con mediador IA y tu Pasaporte de
              Buen Inquilino en un espacio sencillo para casero e inquilino.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => abrirDemo("inquilino")}
                className="btn-press px-6 py-3.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container inline-flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Probar como Inquilino
              </button>
              <button
                type="button"
                onClick={() => abrirDemo("propietario")}
                className="btn-press px-6 py-3.5 rounded-xl bg-secondary text-on-secondary text-sm font-semibold hover:opacity-95 inline-flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Probar como Propietario
              </button>
            </div>

            <div className="pt-1">
              <Link
                href="/acceso"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4 hover:text-secondary"
              >
                Iniciar sesión o crear cuenta gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="editorial-photo-wrap rounded-2xl overflow-hidden shadow-lg border border-outline-variant/40 bg-surface-container-lowest">
              <img
                src="/images/vivienda-madrid.jpg"
                alt="Salón luminoso de vivienda en alquiler"
                className="w-full h-[300px] sm:h-[390px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 accesos esquemáticos (1 sola frase por tarjeta) */}
      <section className="bg-surface-container-low/70 border-y border-outline-variant/40 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                href: "/pagos",
                icon: CreditCard,
                titulo: "Rentas y Suministros",
                texto: "Ve de un vistazo qué está pagado y qué queda pendiente.",
                bg: "bg-secondary-container/60 text-secondary",
              },
              {
                href: "/averias",
                icon: Wrench,
                titulo: "Averías con Fotos e IA",
                texto: "Sube fotos, conoce quién paga y aprueba presupuestos.",
                bg: "bg-amber-100 text-amber-800",
              },
              {
                href: "/contrato",
                icon: Scale,
                titulo: "Asesor Legal y Fianza",
                texto: "Pregunta dudas de la Ley de Vivienda y guarda fotos iniciales.",
                bg: "bg-surface-container text-primary",
              },
              {
                href: "/pasaporte",
                icon: Award,
                titulo: "Pasaporte en PDF",
                texto: "Descarga tu historial verificado junto a InquiCheck.",
                bg: "bg-secondary-container/70 text-secondary",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 flex flex-col gap-4"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.bg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-xl text-primary">
                      {item.titulo}
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {item.texto}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Franja simple InquiCheck */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-primary text-on-primary rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary-fixed">
              Antes de firmar contrato
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal">
              ¿Necesitas verificar solvencia sin compartir tu DNI?
            </h2>
            <p className="text-sm text-primary-fixed-dim">
              Usa nuestra app hermana InquiCheck y luego adjunta tu certificado
              aquí.
            </p>
          </div>
          <a
            href={inquicheckUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press px-6 py-3.5 rounded-xl bg-surface text-primary text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0 hover:bg-surface-container-high"
          >
            Abrir InquiCheck
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>
    </AppShell>
  );
}
