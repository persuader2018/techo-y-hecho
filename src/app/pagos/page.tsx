"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Droplets,
  Flame,
  Home,
  Plus,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/components/AppContext";
import type { MovimientoDemo } from "@/lib/demo-data";

type SubTab = "rentas" | "suministros" | "nuevo";

const CATEGORIAS_SUMINISTROS = [
  { key: "luz", label: "Luz", icon: Zap, color: "bg-amber-500" },
  { key: "agua", label: "Agua", icon: Droplets, color: "bg-sky-600" },
  { key: "gas", label: "Gas", icon: Flame, color: "bg-orange-500" },
  { key: "internet", label: "Internet", icon: Wifi, color: "bg-secondary" },
] as const;

export default function PagosPage() {
  const {
    usuario,
    viviendaActiva,
    marcarMovimientoPagado,
    verificarMovimientoPropietario,
    crearMovimiento,
  } = useApp();

  const esPropietario = usuario?.rol === "propietario";
  const [tab, setTab] = useState<SubTab>("rentas");

  // Nuevo recibo manual
  const [tipoRecibo, setTipoRecibo] = useState<MovimientoDemo["tipo"]>("luz");
  const [concepto, setConcepto] = useState("");
  const [periodo, setPeriodo] = useState("Noviembre 2026");
  const [importe, setImporte] = useState("");

  // Lector OCR IA
  const [textoFactura, setTextoFactura] = useState(
    "Iberdrola Clientes · Factura electricidad Noviembre 2026 · Consumo 192 kWh · Total a pagar: 58,90 EUR"
  );
  const [analizandoIa, setAnalizandoIa] = useState(false);
  const [resultadoIa, setResultadoIa] = useState<{
    tipo: string;
    concepto: string;
    periodo_mes: string;
    importe_total_eur: number;
    recomendacion_ahorro?: string;
  } | null>(null);
  const [errorIa, setErrorIa] = useState<string | null>(null);
  const [stripeInfo, setStripeInfo] = useState<string | null>(null);

  // Separación clara: Rentas vs Suministros
  const rentas = viviendaActiva.movimientos.filter(
    (m) => m.tipo === "renta" || m.tipo === "compensacion"
  );
  const suministros = viviendaActiva.movimientos.filter(
    (m) => m.tipo !== "renta" && m.tipo !== "compensacion"
  );

  const listaActual = tab === "rentas" ? rentas : suministros;

  const sumarEstado = (
    items: MovimientoDemo[],
    filtro: "pagado" | "pendiente"
  ) =>
    items
      .filter((m) =>
        filtro === "pagado"
          ? m.estado === "verificado_propietario" ||
            m.estado === "pagado_inquilino"
          : m.estado === "pendiente"
      )
      .reduce((acc, m) => acc + m.importeEur, 0);

  const totalPagadoActual = sumarEstado(listaActual, "pagado");
  const totalPendienteActual = sumarEstado(listaActual, "pendiente");

  // Agrupado de suministros por categoría
  const resumenCategorias = CATEGORIAS_SUMINISTROS.map((cat) => {
    const items = suministros.filter((s) => s.tipo === cat.key);
    const pagado = sumarEstado(items, "pagado");
    const pendiente = sumarEstado(items, "pendiente");
    return { ...cat, pagado, pendiente, total: pagado + pendiente };
  });
  const maxCategoria = Math.max(
    1,
    ...resumenCategorias.map((c) => c.total)
  );

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
    setTab(tipoRecibo === "renta" ? "rentas" : "suministros");
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
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concepto: mov.concepto,
        importeEur: mov.importeEur,
      }),
    });
    const data = await res.json();
    setStripeInfo(data.mensaje || "Stripe preparado en modo inactivo.");
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6 animate-enter">
        {/* Cabecera limpia */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-primary font-normal">
              Pagos y Facturas
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {viviendaActiva.alias} · Rentas separadas de suministros
            </p>
          </div>

          {/* Submenú de 3 pestañas claras */}
          <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab("rentas")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                tab === "rentas"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Rentas
            </button>
            <button
              type="button"
              onClick={() => setTab("suministros")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                tab === "suministros"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Suministros
            </button>
            <button
              type="button"
              onClick={() => setTab("nuevo")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                tab === "nuevo"
                  ? "bg-secondary text-on-secondary shadow-xs"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Subir / IA
            </button>
          </div>
        </div>

        {stripeInfo && (
          <div className="p-4 rounded-xl bg-secondary-container/70 text-on-secondary-container text-xs flex items-center justify-between gap-4">
            <span>{stripeInfo}</span>
            <button
              type="button"
              onClick={() => setStripeInfo(null)}
              className="font-semibold underline shrink-0"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Vista RENTAS o SUMINISTROS */}
        {tab !== "nuevo" && (
          <>
            {/* 2 Cajas grandes de alto contraste: PAGADO vs PENDIENTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 bg-emerald-50 border-2 border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    Ya Pagado ({tab === "rentas" ? "Rentas" : "Suministros"})
                  </span>
                  <p className="font-editorial text-3xl text-emerald-950 mt-1 tabular-nums">
                    {totalPagadoActual.toFixed(2)} €
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-xs font-bold">
                  Al día
                </span>
              </div>

              <div className="rounded-2xl p-5 bg-amber-50 border-2 border-amber-200 flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <Clock className="w-4 h-4" />
                    Pendiente de Pago
                  </span>
                  <p className="font-editorial text-3xl text-amber-950 mt-1 tabular-nums">
                    {totalPendienteActual.toFixed(2)} €
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold">
                  {listaActual.filter((m) => m.estado === "pendiente").length}{" "}
                  recibos
                </span>
              </div>
            </div>

            {/* Gráfico visual agrupado SOLO en pestaña Suministros */}
            {tab === "suministros" && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
                <h2 className="font-editorial text-xl text-primary">
                  Resumen por tipo de suministro
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {resumenCategorias.map((cat) => {
                    const Icon = cat.icon;
                    const ancho = Math.round((cat.total / maxCategoria) * 100);
                    return (
                      <div
                        key={cat.key}
                        className="p-4 rounded-xl bg-surface-container-low space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                            <Icon className="w-4 h-4 text-secondary" />
                            {cat.label}
                          </span>
                          <span className="font-semibold text-sm text-primary tabular-nums">
                            {cat.total.toFixed(2)} €
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color}`}
                            style={{ width: `${Math.max(8, ancho)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-emerald-800 font-semibold">
                            Pagado: {cat.pagado.toFixed(0)} €
                          </span>
                          <span className="text-amber-800 font-semibold">
                            Pend: {cat.pendiente.toFixed(0)} €
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Listado limpio y con alto contraste */}
            <div className="space-y-3">
              {listaActual.map((mov) => {
                const estaPagado = mov.estado === "verificado_propietario";
                const esperandoConfirm = mov.estado === "pagado_inquilino";

                return (
                  <div
                    key={mov.id}
                    className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      estaPagado
                        ? "bg-surface-container-lowest border-emerald-200"
                        : esperandoConfirm
                        ? "bg-surface-container-lowest border-sky-200"
                        : "bg-surface-container-lowest border-amber-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            estaPagado
                              ? "bg-emerald-100 text-emerald-900"
                              : esperandoConfirm
                              ? "bg-sky-100 text-sky-900"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {estaPagado
                            ? "Pagado y verificado"
                            : esperandoConfirm
                            ? "Pagado (falta confirmar casero)"
                            : "Pendiente"}
                        </span>
                        <span className="text-xs text-outline">
                          {mov.periodoMes} · Vence {mov.fechaVencimiento}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-primary">
                        {mov.concepto}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="font-editorial text-2xl text-primary tabular-nums whitespace-nowrap">
                        {mov.importeEur.toFixed(2)} €
                      </span>

                      {!esPropietario && mov.estado === "pendiente" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => marcarMovimientoPagado(mov.id)}
                            className="btn-press px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold"
                          >
                            Marcar pagado
                          </button>
                          <button
                            type="button"
                            onClick={() => probarStripe(mov)}
                            className="btn-press px-3 py-2 rounded-xl bg-surface-container text-primary text-xs font-semibold inline-flex items-center gap-1"
                            title="Stripe preparado pero inactivo"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Stripe
                          </button>
                        </div>
                      )}

                      {esPropietario && mov.estado === "pagado_inquilino" && (
                        <button
                          type="button"
                          onClick={() => verificarMovimientoPropietario(mov.id)}
                          className="btn-press px-3.5 py-2 rounded-xl bg-secondary text-on-secondary text-xs font-semibold"
                        >
                          Confirmar cobro
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pestaña 3: Subir recibo o leer factura con IA */}
        {tab === "nuevo" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 space-y-4">
              <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Lector Automático de Facturas IA
              </div>
              <textarea
                rows={4}
                value={textoFactura}
                onChange={(e) => setTextoFactura(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-surface-container-low text-xs text-primary border border-outline-variant/40"
              />
              <button
                type="button"
                onClick={analizarFacturaConIA}
                disabled={analizandoIa}
                className="btn-press w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold disabled:opacity-60"
              >
                {analizandoIa ? "Leyendo con Gemini Flash..." : "Leer factura con IA"}
              </button>

              {errorIa && (
                <p className="text-xs text-on-error-container bg-error-container p-3 rounded-xl">
                  {errorIa}
                </p>
              )}

              {resultadoIa && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-emerald-950">
                    <span>{resultadoIa.concepto}</span>
                    <span>{Number(resultadoIa.importe_total_eur).toFixed(2)} €</span>
                  </div>
                  {resultadoIa.recomendacion_ahorro && (
                    <p className="text-emerald-900">
                      {resultadoIa.recomendacion_ahorro}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const tipoValido = (
                        ["luz", "agua", "gas", "internet"].includes(resultadoIa.tipo)
                          ? resultadoIa.tipo
                          : "luz"
                      ) as MovimientoDemo["tipo"];
                      crearMovimiento({
                        tipo: tipoValido,
                        concepto: resultadoIa.concepto,
                        periodoMes: resultadoIa.periodo_mes || "Noviembre 2026",
                        importeEur: Number(resultadoIa.importe_total_eur) || 0,
                        fechaVencimiento: "05 Dic 2026",
                      });
                      setResultadoIa(null);
                      setTab("suministros");
                    }}
                    className="btn-press w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold"
                  >
                    Guardar en Suministros
                  </button>
                </div>
              )}
            </div>

            <form
              onSubmit={handleCrearRecibo}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 space-y-4"
            >
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4 text-secondary" />
                Añadir recibo manual
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={tipoRecibo}
                  onChange={(e) =>
                    setTipoRecibo(e.target.value as MovimientoDemo["tipo"])
                  }
                  className="px-3 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                >
                  <option value="renta">Renta mensual</option>
                  <option value="luz">Luz</option>
                  <option value="agua">Agua</option>
                  <option value="gas">Gas</option>
                  <option value="internet">Internet</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                  placeholder="Importe (€)"
                  className="px-3 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
                />
              </div>
              <input
                type="text"
                required
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Concepto (ej. Factura agua noviembre)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
              />
              <input
                type="text"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="Mes"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs text-primary"
              />
              <button
                type="submit"
                className="btn-press w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-semibold"
              >
                Guardar recibo
              </button>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
