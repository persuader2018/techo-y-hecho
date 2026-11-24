"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Plus,
  Receipt,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import type { MovimientoDemo } from "@/lib/demo-data";

export default function PagosPage() {
  const {
    usuario,
    viviendaActiva,
    marcarMovimientoPagado,
    verificarMovimientoPropietario,
    crearMovimiento,
  } = useApp();

  const esPropietario = usuario?.rol === "propietario";

  // Nuevo recibo manual (Propietario)
  const [tipoRecibo, setTipoRecibo] = useState<MovimientoDemo["tipo"]>("luz");
  const [concepto, setConcepto] = useState("");
  const [periodo, setPeriodo] = useState("Noviembre 2026");
  const [importe, setImporte] = useState("");

  // Lector OCR IA de suministros
  const [textoFactura, setTextoFactura] = useState(
    "Iberdrola Clientes · Factura electricidad periodo 15/10/2026 - 14/11/2026 · Consumo 192 kWh · Total a pagar: 58,90 EUR"
  );
  const [analizandoIa, setAnalizandoIa] = useState(false);
  const [resultadoIa, setResultadoIa] = useState<{
    tipo: string;
    concepto: string;
    periodo_mes: string;
    importe_total_eur: number;
    recomendacion_ahorro?: string;
    modelo?: string;
  } | null>(null);
  const [errorIa, setErrorIa] = useState<string | null>(null);

  // Estado prueba Stripe (preparado pero inactivo)
  const [stripeInfo, setStripeInfo] = useState<string | null>(null);

  const handleCrearRecibo = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(importe);
    if (!concepto.trim() || !num) return;
    crearMovimiento({
      tipo: tipoRecibo,
      concepto: concepto.trim(),
      periodoMes: periodo,
      importeEur: num,
      fechaVencimiento: "05 Dic 2026",
    });
    setConcepto("");
    setImporte("");
  };

  const analizarFacturaConIA = async () => {
    setAnalizandoIa(true);
    setErrorIa(null);
    setResultadoIa(null);
    try {
      const res = await fetch("/api/ia/suministros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textoFactura }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al analizar factura");
      setResultadoIa(data);
    } catch (err) {
      setErrorIa(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setAnalizandoIa(false);
    }
  };

  const probarStripe = async (mov: MovimientoDemo) => {
    setStripeInfo(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concepto: mov.concepto,
        importeEur: mov.importeEur,
      }),
    });
    const data = await res.json();
    setStripeInfo(data.mensaje || "Stripe preparado correctamente.");
  };

  return (
    <AppShell>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 space-y-8 animate-enter">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
              Finanzas y Recibos Legales · {viviendaActiva.alias}
            </span>
            <h1 className="font-editorial text-4xl text-primary font-normal mt-1">
              Gestión de Pagos y Suministros
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Doble verificación transparente entre casero e inquilino y lectura
              automática de facturas con IA.
            </p>
          </div>
          <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant/40 text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-outline">
              Renta Contractual Base
            </span>
            <span className="font-editorial text-2xl text-primary">
              {viviendaActiva.rentaBaseEur.toFixed(2)} € / mes
            </span>
          </div>
        </section>

        {stripeInfo && (
          <div className="p-4 rounded-xl bg-secondary-container/60 text-on-secondary-container text-xs flex items-center justify-between gap-4">
            <span>{stripeInfo}</span>
            <button
              type="button"
              onClick={() => setStripeInfo(null)}
              className="font-semibold underline"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Listado de recibos y doble verificación */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl text-primary">
                Historial y Recibos Activos
              </h2>
              <span className="text-xs text-outline">
                Vista actual:{" "}
                <strong className="text-primary capitalize">
                  {usuario?.rol || "inquilino"}
                </strong>
              </span>
            </div>

            <div className="space-y-3">
              {viviendaActiva.movimientos.map((mov) => (
                <div
                  key={mov.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {mov.tipo}
                      </span>
                      <span className="text-xs text-outline">
                        {mov.periodoMes} · Vence: {mov.fechaVencimiento}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-primary">
                      {mov.concepto}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      {mov.estado === "verificado_propietario" && (
                        <span className="inline-flex items-center gap-1 text-secondary font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verificado por propietario ({mov.fechaPago || "Al día"})
                        </span>
                      )}
                      {mov.estado === "pagado_inquilino" && (
                        <span className="inline-flex items-center gap-1 text-on-tertiary-container font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          Pagado por inquilino · Pendiente de confirmar cobro
                        </span>
                      )}
                      {mov.estado === "pendiente" && (
                        <span className="inline-flex items-center gap-1 text-on-surface-variant">
                          <Receipt className="w-3.5 h-3.5" />
                          Pendiente de pago
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span
                      className={`font-editorial text-2xl tabular-nums ${
                        mov.importeEur < 0 ? "text-secondary" : "text-primary"
                      }`}
                    >
                      {mov.importeEur.toFixed(2)} €
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {!esPropietario && mov.estado === "pendiente" && (
                        <>
                          <button
                            type="button"
                            onClick={() => marcarMovimientoPagado(mov.id)}
                            className="btn-press px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
                          >
                            Marcar como pagado
                          </button>
                          <button
                            type="button"
                            onClick={() => probarStripe(mov)}
                            className="btn-press px-3 py-2 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high inline-flex items-center gap-1"
                            title="Pasarela Stripe preparada pero inactiva"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Stripe (Prep.)
                          </button>
                        </>
                      )}

                      {esPropietario && mov.estado === "pagado_inquilino" && (
                        <button
                          type="button"
                          onClick={() => verificarMovimientoPropietario(mov.id)}
                          className="btn-press px-3.5 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:opacity-95"
                        >
                          Confirmar cobro recibido
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha: Lector IA de Suministros + Emitir Recibo + Bloque Stripe */}
          <div className="lg:col-span-5 space-y-6">
            {/* Lector IA de facturas */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                Lector IA de Facturas (Google Gemini)
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pega el texto o resumen de una factura de luz, agua, gas o fibra
                y la IA extrae el importe exacto y lo deja listo para pasar al
                cuaderno de pagos.
              </p>
              <textarea
                rows={3}
                value={textoFactura}
                onChange={(e) => setTextoFactura(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-surface-container-low text-xs text-primary border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={analizarFacturaConIA}
                disabled={analizandoIa}
                className="btn-press w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-60"
              >
                {analizandoIa
                  ? "Analizando factura con Gemini Flash..."
                  : "Extraer datos de factura con IA"}
              </button>

              {errorIa && (
                <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                  {errorIa}
                </p>
              )}

              {resultadoIa && (
                <div className="p-4 rounded-xl bg-secondary-container/40 border border-secondary/30 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-primary">
                    <span>{resultadoIa.concepto}</span>
                    <span>{Number(resultadoIa.importe_total_eur).toFixed(2)} €</span>
                  </div>
                  <p className="text-on-surface-variant">
                    Tipo: <strong className="uppercase">{resultadoIa.tipo}</strong>{" "}
                    · Periodo: {resultadoIa.periodo_mes}
                  </p>
                  {resultadoIa.recomendacion_ahorro && (
                    <p className="text-secondary italic">
                      Consejo IA: {resultadoIa.recomendacion_ahorro}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      crearMovimiento({
                        tipo: (["luz", "agua", "gas", "internet", "comunidad"].includes(
                          resultadoIa.tipo
                        )
                          ? resultadoIa.tipo
                          : "luz") as MovimientoDemo["tipo"],
                        concepto: resultadoIa.concepto,
                        periodoMes: resultadoIa.periodo_mes || "Noviembre 2026",
                        importeEur: Number(resultadoIa.importe_total_eur) || 0,
                        fechaVencimiento: "05 Dic 2026",
                      });
                      setResultadoIa(null);
                    }}
                    className="btn-press mt-2 w-full py-2 rounded-lg bg-secondary text-on-secondary font-semibold"
                  >
                    Añadir recibo al listado
                  </button>
                </div>
              )}
            </div>

            {/* Emitir nuevo recibo manual */}
            <form
              onSubmit={handleCrearRecibo}
              className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/40 space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Plus className="w-4 h-4 text-secondary" />
                Pasar nuevo recibo al inquilino
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={tipoRecibo}
                  onChange={(e) =>
                    setTipoRecibo(e.target.value as MovimientoDemo["tipo"])
                  }
                  className="px-3 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary border border-outline-variant/40"
                >
                  <option value="renta">Mensualidad Alquiler</option>
                  <option value="luz">Recibo de Luz</option>
                  <option value="agua">Recibo de Agua</option>
                  <option value="gas">Recibo de Gas</option>
                  <option value="internet">Internet / Fibra</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                  placeholder="Importe (€)"
                  className="px-3 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary border border-outline-variant/40"
                />
              </div>
              <input
                type="text"
                required
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Concepto (ej. Factura luz noviembre)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary border border-outline-variant/40"
              />
              <input
                type="text"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="Mes / Periodo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-xs text-primary border border-outline-variant/40"
              />
              <button
                type="submit"
                className="btn-press w-full py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
              >
                Emitir recibo
              </button>
            </form>

            {/* Aviso Stripe preparado */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/50 text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-primary block mb-1">
                Pagos automáticos con Stripe (Preparado · Inactivo)
              </strong>
              La integración con Stripe SEPA y tarjeta ya está programada en{" "}
              <code className="text-primary">/api/stripe/checkout</code>. Solo
              tendrás que añadir tu clave en Vercel cuando decidas activar
              cobros online.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
