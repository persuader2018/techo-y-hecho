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
  FileCheck2,
  Scale,
  ShieldCheck,
  Sparkles,
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
      {/* Hero editorial (1 pantalla limpia) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-16 lg:pt-16 lg:pb-24 animate-enter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/60 text-on-secondary-container text-[11px] font-semibold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Adaptado a Ley 12/2023 y RDL 29/2026 · España
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] tracking-tight text-primary font-normal">
              Habitar con certeza,{" "}
              <span className="italic text-secondary">gestionar con calma.</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-xl">
              El espacio neutral para propietarios particulares e inquilinos
              durante todo el alquiler: recibos legales, mediación IA en averías
              (Art. 21 LAU), cálculo automático del tope del 2 % y tu{" "}
              <strong className="text-primary font-semibold">
                Pasaporte de Buen Inquilino y Buen Casero
              </strong>
              .
            </p>

            {/* Accesos inmediatos */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => abrirDemo("inquilino")}
                className="btn-press px-6 py-3.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container shadow-sm inline-flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Probar Demo Inquilino (1 clic)
              </button>
              <button
                type="button"
                onClick={() => abrirDemo("propietario")}
                className="btn-press px-6 py-3.5 rounded-xl bg-secondary text-on-secondary text-sm font-semibold hover:opacity-95 shadow-sm inline-flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Probar Demo Propietario (1 clic)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <strong>Gratis para siempre</strong> para 1 vivienda
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                Privacidad por contrato (RGPD)
              </span>
              <Link
                href="/acceso"
                className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4 hover:text-secondary"
              >
                Crear cuenta real
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Fotografía editorial + tarjeta de valor */}
          <div className="lg:col-span-6">
            <div className="editorial-photo-wrap relative rounded-2xl overflow-hidden shadow-xl border border-outline-variant/40 bg-surface-container-lowest">
              <img
                src="/images/vivienda-madrid.jpg"
                alt="Salón editorial de una vivienda en alquiler en Madrid"
                className="w-full h-[320px] sm:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-on-primary">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-secondary-fixed font-semibold">
                    Ejemplo real en plataforma
                  </span>
                  <p className="font-editorial text-2xl leading-tight mt-0.5">
                    C/ Fuencarral 42, 3ºB · Madrid
                  </p>
                </div>
                <div className="bg-surface/95 text-primary rounded-xl px-4 py-2.5 backdrop-blur-md shadow-md">
                  <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Historial verificado
                  </span>
                  <span className="text-sm font-bold text-secondary">
                    98/100 · 34 pagos puntuales
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilares de gestión */}
      <section className="border-t border-outline-variant/40 bg-surface-container-low/60 py-16 lg:py-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
              Todo lo que ocurre después de firmar
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Cuatro herramientas neutrales para eliminar discusiones.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/pagos"
              className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-secondary-container/60 text-secondary flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl text-primary">
                  Pagos, Recibos y Suministros IA
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Doble verificación sin comisiones, lectura automática de luz,
                  agua y gas con IA, y recibos legales para la Renta.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Abrir módulo <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/averias"
              className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-tertiary-fixed/70 text-tertiary flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl text-primary">
                  Árbitro de Averías IA y Plazo 15d
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Determina quién paga según el Art. 21 LAU, activa la cuenta
                  atrás legal y ofrece guías rápidas de emergencia y bricolaje.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Probar árbitro IA <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/contrato"
              className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl text-primary">
                  Contrato, Fianza y Tope 2 % RDL 29/2026
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Custodia del contrato y resguardo de fianza autonómico,
                  calculadora legal IRAV/2 % y Abogado IA actualizado.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Calcular subida legal <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/pasaporte"
              className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-secondary-container/70 text-secondary flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl text-primary">
                  Pasaporte de Buen Inquilino y Casero
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Cada mes cumplido suma reputación verificada para ambos,
                  conectada con InquiCheck para futuros contratos.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Ver certificado <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bloque Filosofía: Gratis 1 Piso + Puente con InquiCheck */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-primary text-on-primary rounded-2xl p-8 sm:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-secondary-fixed">
                <Sparkles className="w-3.5 h-3.5" />
                Modelo transparente sin barreras
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-normal">
                Gratis para siempre si tienes 1 vivienda.
              </h2>
              <p className="text-sm text-primary-fixed-dim leading-relaxed max-w-xl">
                No te quitamos un 5 % ni un 12 % de tu alquiler cada mes. Usa
                Techo y Hecho sin coste en tu vivienda particular y paga solo si
                gestionas una cartera de 2 o más pisos o solicitas informes
                certificados y servicios opcionales (seguro de impago, cambio de
                suministros o técnicos verificados).
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/acceso"
                className="btn-press px-5 py-3 rounded-xl bg-surface text-primary text-xs font-semibold hover:bg-surface-container-high"
              >
                Empezar gratis ahora
              </Link>
              <Link
                href="/propietario"
                className="btn-press px-5 py-3 rounded-xl bg-primary-container text-surface-bright text-xs font-semibold border border-outline/40 hover:bg-primary-container/80"
              >
                Ver panel de propietario
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-8 sm:p-10 border border-outline-variant/60 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-secondary">
                <FileCheck2 className="w-3.5 h-3.5" />
                Fase Pre-contrato · Ecosistema
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-primary font-normal">
                ¿Aún buscas inquilino solvente?
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Antes de firmar, utiliza nuestra rama pre-contrato{" "}
                <strong className="text-primary">InquiCheck</strong>: Pasaporte
                Oficial de Solvencia con validación CSV de la Seguridad Social y
                protocolo <em>Custodia Cero</em> (sin guardar DNI ni nóminas).
              </p>
            </div>
            <a
              href={inquicheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press w-full py-3.5 px-5 rounded-xl bg-secondary text-on-secondary text-xs font-semibold inline-flex items-center justify-center gap-2 hover:opacity-95"
            >
              Abrir InquiCheck (Pre-contrato)
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
