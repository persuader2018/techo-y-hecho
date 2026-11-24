"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Check,
  Copy,
  CreditCard,
  KeyRound,
  Scale,
  Wrench,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";

export default function PortalInquilinoPage() {
  const { usuario, viviendaActiva, vincularPorCodigo } = useApp();
  const [copiado, setCopiado] = useState(false);
  const [mostrarVincular, setMostrarVincular] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");
  const [msgVinculo, setMsgVinculo] = useState<string | null>(null);

  if (usuario?.rol === "propietario") {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-editorial text-3xl text-primary">
            Sección exclusiva para Inquilinos
          </h1>
          <p className="text-sm text-on-surface-variant">
            Has iniciado sesión como Propietario. Accede a tus expedientes y
            verificación de pagos desde tu panel.
          </p>
          <Link
            href="/propietario"
            className="btn-press inline-flex px-6 py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold"
          >
            Ir a mi Panel de Propietario
          </Link>
        </div>
      </AppShell>
    );
  }

  const rentasPendientes = viviendaActiva.movimientos.filter(
    (m) => m.tipo === "renta" && m.estado === "pendiente"
  );
  const suministrosPendientes = viviendaActiva.movimientos.filter(
    (m) => m.tipo !== "renta" && m.tipo !== "compensacion" && m.estado === "pendiente"
  );
  const averiasActivas = viviendaActiva.incidencias.filter(
    (i) => i.estado !== "resuelta_conforme" && i.estado !== "denegada" && i.estado !== "descuento_aplicado"
  );

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(viviendaActiva.codigoVinculacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const handleVincular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoInput.trim()) return;
    const res = await vincularPorCodigo(codigoInput);
    setMsgVinculo(res.mensaje);
    if (res.ok) setCodigoInput("");
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-enter">
        {/* Cabecera sencilla + Foto vivienda */}
        <section className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/40 shadow-xs grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-5 h-48 md:h-auto relative">
            <img
              src={viviendaActiva.imagenUrl}
              alt={viviendaActiva.alias}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface/95 text-primary text-xs font-semibold shadow-xs">
              {viviendaActiva.municipio}
            </span>
          </div>

          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copiarCodigo}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-xs font-semibold text-primary hover:bg-surface-container"
                >
                  Código: {viviendaActiva.codigoVinculacion}
                  {copiado ? (
                    <Check className="w-3.5 h-3.5 text-secondary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-outline" />
                  )}
                </button>
                <span className="px-3 py-1 rounded-full bg-secondary-container/70 text-on-secondary-container text-xs font-semibold">
                  Fianza depositada ({viviendaActiva.fianzaEur} €)
                </span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
                Hola, {(usuario?.nombre || "Elena").split(" ")[0]}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {viviendaActiva.direccion} · Renta oficial:{" "}
                <strong className="text-primary whitespace-nowrap">
                  {viviendaActiva.rentaBaseEur.toFixed(2)} €/mes
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMostrarVincular((v) => !v)}
                className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-primary"
              >
                <KeyRound className="w-3.5 h-3.5 text-secondary" />
                Cambiar o vincular otro piso
              </button>
            </div>
          </div>
        </section>

        {/* Formulario desplegable de vinculación (oculto hasta que se necesite) */}
        {mostrarVincular && (
          <form
            onSubmit={handleVincular}
            className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/50 flex flex-col sm:flex-row gap-3 items-center animate-enter"
          >
            <input
              type="text"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              placeholder="Introduce código (ej. MAD-2026-B o VAL-2026-A)"
              className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-sm uppercase tracking-wider text-primary border border-outline-variant/50"
            />
            <button
              type="submit"
              className="btn-press w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold"
            >
              Vincular piso
            </button>
            {msgVinculo && (
              <span className="text-xs font-semibold text-secondary">
                {msgVinculo}
              </span>
            )}
          </form>
        )}

        {/* 3 Tarjetas de acción directa con alto contraste */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/pagos"
            className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-5"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-secondary-container/70 text-secondary flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  rentasPendientes.length + suministrosPendientes.length > 0
                    ? "bg-amber-100 text-amber-900"
                    : "bg-emerald-100 text-emerald-900"
                }`}
              >
                {rentasPendientes.length + suministrosPendientes.length > 0
                  ? `${rentasPendientes.length + suministrosPendientes.length} pendientes`
                  : "Todo pagado"}
              </span>
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-primary">
                Pagos y Facturas
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Renta mensual separada de luz, agua, gas e internet.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
              Ver resumen <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/averias"
            className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-5"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  averiasActivas.length > 0
                    ? "bg-amber-100 text-amber-900"
                    : "bg-emerald-100 text-emerald-900"
                }`}
              >
                {averiasActivas.length} activas
              </span>
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-primary">
                Averías y Fotos
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Sube fotos, consulta quién paga y da tu conformidad al arreglar.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
              Gestionar averías <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/contrato"
            className="editorial-card bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-5"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full bg-secondary-container/70 text-on-secondary-container text-xs font-semibold">
                IA 24/7
              </span>
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-primary">
                Asesor Legal y Fianza
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Pregunta sobre la Ley de Vivienda, tope 2 % y fotos iniciales.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
              Preguntar a la IA <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </section>

        {/* Banner compacto del Pasaporte */}
        <Link
          href="/pasaporte"
          className="editorial-card bg-primary text-on-primary rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-secondary-fixed flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary-fixed">
                Pasaporte de Buen Inquilino · {viviendaActiva.certificadoInquilino.puntuacion}/100
              </span>
              <h3 className="font-editorial text-2xl font-normal">
                Descarga tu certificado PDF y enlace para futuros pisos
              </h3>
            </div>
          </div>
          <span className="px-4 py-2.5 rounded-xl bg-surface text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0">
            Abrir pasaporte <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </AppShell>
  );
}
