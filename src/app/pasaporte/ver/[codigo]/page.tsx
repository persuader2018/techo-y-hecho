"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { VIVIENDAS_DEMO } from "@/lib/demo-data";

interface PasaportePublico {
  encontrado: boolean;
  nombre?: string;
  codigo?: string;
  presentacion?: string;
  total_rentas?: number;
  rentas_puntuales?: number;
  solvencia?: {
    solvency_score?: number;
    max_safe_rent_35pct?: number;
    employment_category?: string;
    auditor_notes?: string;
  } | null;
  referencia_propietario?: {
    telefono?: string;
    municipio?: string;
  } | null;
}

function PasaportePublicoContenido() {
  const params = useParams<{ codigo: string }>();
  const codigo = decodeURIComponent(String(params?.codigo || ""));
  const [datos, setDatos] = useState<PasaportePublico | null>(null);

  useEffect(() => {
    const cargar = async () => {
      // Si es el código del ejemplo demo
      if (codigo.toUpperCase() === "TYH-REP-INQ-942B") {
        const d = VIVIENDAS_DEMO[0];
        setDatos({
          encontrado: true,
          nombre: d.inquilinoNombre,
          codigo: d.certificadoInquilino.codigo,
          presentacion:
            "Arquitecta con contrato indefinido, no fumadora y sin mascotas.",
          total_rentas: 34,
          rentas_puntuales: 34,
          solvencia: {
            solvency_score: 94,
            max_safe_rent_35pct: 1190,
            employment_category: "Contrato Indefinido",
            auditor_notes:
              "Coherencia documental verificada bajo Protocolo Custodia Cero.",
          },
          referencia_propietario: {
            telefono: d.propietarioTelefono,
            municipio: d.municipio,
          },
        });
        return;
      }

      if (supabase) {
        const { data } = await supabase.rpc("obtener_pasaporte_publico", {
          p_codigo: codigo,
        });
        if (data?.encontrado) {
          setDatos(data as PasaportePublico);
          return;
        }
      }

      setDatos({ encontrado: false });
    };
    cargar();
  }, [codigo]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-enter">
        {!datos ? (
          <p className="text-center text-sm text-outline">
            Verificando pasaporte {codigo}...
          </p>
        ) : !datos.encontrado ? (
          <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/40 space-y-4">
            <h1 className="font-editorial text-3xl text-primary">
              Pasaporte no encontrado
            </h1>
            <p className="text-sm text-on-surface-variant">
              El código <strong className="font-mono">{codigo}</strong> no
              corresponde a ningún pasaporte activo.
            </p>
            <Link
              href="/"
              className="btn-press inline-flex px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold"
            >
              Ir a Techo y Hecho
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl p-8 border-2 border-primary/15 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/50 pb-5">
              <img
                src="/images/escudo-confianza.jpg"
                alt="Pasaporte verificado"
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
                  Verificación Pública · Techo y Hecho
                </span>
                <h1 className="font-editorial text-3xl text-primary">
                  {datos.nombre}
                </h1>
                <p className="text-xs font-mono text-outline">{datos.codigo}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="block font-editorial text-3xl text-emerald-950">
                  {datos.total_rentas
                    ? `${Math.round(
                        ((datos.rentas_puntuales || 0) / datos.total_rentas) * 100
                      )} %`
                    : "Nuevo"}
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  Pagos puntuales ({datos.rentas_puntuales}/{datos.total_rentas})
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low">
                <span className="block font-editorial text-3xl text-primary">
                  {datos.solvencia?.solvency_score
                    ? `${datos.solvencia.solvency_score}/100`
                    : "—"}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  Score Solvencia IA
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low">
                <span className="block font-editorial text-3xl text-secondary">
                  {datos.solvencia?.max_safe_rent_35pct
                    ? `${datos.solvencia.max_safe_rent_35pct} €`
                    : "—"}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  Renta segura (35 %)
                </span>
              </div>
            </div>

            {datos.presentacion && (
              <p className="p-4 rounded-xl bg-surface-container-low text-sm italic text-primary">
                “{datos.presentacion}”
              </p>
            )}

            {datos.solvencia?.auditor_notes && (
              <div className="p-4 rounded-xl bg-secondary-container/30 border border-secondary/30 text-xs text-primary space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-secondary">
                  <ShieldCheck className="w-4 h-4" />
                  {datos.solvencia.employment_category} · Custodia Cero RGPD
                </div>
                <p>{datos.solvencia.auditor_notes}</p>
              </div>
            )}

            {datos.referencia_propietario?.telefono && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-950">
                <Phone className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>
                  Teléfono del anterior propietario autorizado:{" "}
                  <strong>{datos.referencia_propietario.telefono}</strong> (
                  {datos.referencia_propietario.municipio})
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Certificado emitido y verificado por Techo y Hecho (sin DNI ni datos
              bancarios).
            </div>
          </div>
        )}
      </div>
  );
}

export default function PasaportePublicoVerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-sm text-outline">
          Verificando pasaporte...
        </div>
      }
    >
      <AppShell>
        <PasaportePublicoContenido />
      </AppShell>
    </Suspense>
  );
}
