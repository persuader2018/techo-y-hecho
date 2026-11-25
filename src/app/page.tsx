"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  CreditCard,
  Scale,
  UserCheck,
  Wrench,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

export default function HomePage() {
  const router = useRouter();
  const { entrarDemo } = useApp();

  const abrirDemo = (rol: "inquilino" | "propietario") => {
    entrarDemo(rol);
    router.push(rol === "propietario" ? "/propietario" : "/portal");
  };

  return (
    <AppShell>
      {/* Hero editorial vistoso */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20 animate-enter">
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
              Rentas, suministros, averías con fotos e IA y tu Pasaporte de Buen
              Inquilino y Solvencia en una sola plataforma sencilla.
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
                Crear cuenta gratis (empieza desde cero)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Collage visual editorial (2 fotos reales) */}
          <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-end">
            <div className="col-span-12 editorial-photo-wrap rounded-2xl overflow-hidden shadow-lg border border-outline-variant/40">
              <img
                src="/images/vivienda-madrid.jpg"
                alt="Salón luminoso de vivienda en alquiler"
                className="w-full h-[260px] sm:h-[320px] object-cover"
              />
            </div>
            <div className="col-span-7 editorial-photo-wrap rounded-2xl overflow-hidden shadow-md border border-outline-variant/40">
              <img
                src="/images/llaves-contrato.jpg"
                alt="Llaves de vivienda sobre mesa de roble"
                className="w-full h-[130px] object-cover"
              />
            </div>
            <div className="col-span-5 editorial-photo-wrap rounded-2xl overflow-hidden shadow-md border border-outline-variant/40">
              <img
                src="/images/apartamento-editorial.jpg"
                alt="Cocina abierta moderna en apartamento español"
                className="w-full h-[130px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 accesos visuales */}
      <section className="bg-surface-container-low/70 border-y border-outline-variant/40 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                href: "/pagos",
                icon: CreditCard,
                titulo: "Rentas y Suministros",
                texto: "Ve al instante qué está pagado y qué queda pendiente.",
                bg: "bg-secondary-container/60 text-secondary",
              },
              {
                href: "/averias",
                icon: Wrench,
                titulo: "Averías con Fotos e IA",
                texto: "Sube fotos, aprueba presupuestos y da conformidad.",
                bg: "bg-amber-100 text-amber-800",
              },
              {
                href: "/contrato",
                icon: Scale,
                titulo: "Asesor Legal y Fianza",
                texto: "Dudas sobre la Ley de Vivienda, tope 2 % y fotos iniciales.",
                bg: "bg-surface-container text-primary",
              },
              {
                href: "/pasaporte",
                icon: Award,
                titulo: "Pasaporte y Solvencia",
                texto: "Historial real + auditoría Custodia Cero en PDF y enlace.",
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

      {/* Bloque visual Pasaporte integrado */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-primary text-on-primary rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5 max-w-2xl">
            <img
              src="/images/escudo-confianza.jpg"
              alt="Emblema de confianza Techo y Hecho"
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/20"
            />
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary-fixed">
                Todo integrado · Protocolo Custodia Cero
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-normal">
                Pasaporte de Buen Inquilino + Solvencia en un solo documento
              </h2>
              <p className="text-sm text-primary-fixed-dim">
                Combina tu historial real de pagos verificados con la auditoría
                de Vida Laboral y Nómina sin almacenar DNI ni datos bancarios.
              </p>
            </div>
          </div>
          <Link
            href="/pasaporte"
            className="btn-press px-6 py-3.5 rounded-xl bg-surface text-primary text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0 hover:bg-surface-container-high"
          >
            Abrir Pasaporte
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
