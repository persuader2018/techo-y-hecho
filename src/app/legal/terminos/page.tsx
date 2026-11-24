import AppShell from "@/components/AppShell";

export default function TerminosPage() {
  return (
    <AppShell>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
          Condiciones Generales y Aviso IA
        </span>
        <h1 className="font-editorial text-4xl text-primary font-normal">
          Términos de Uso
        </h1>
        <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <p>
            El uso de <strong className="text-primary">Techo y Hecho</strong>{" "}
            implica la aceptación de estas condiciones:
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            1. Plan gratuito y servicios opcionales
          </h2>
          <p>
            La gestión de <strong>1 vivienda particular es gratuita</strong>.
            Los servicios adicionales opcionales (carteras de 2 o más viviendas,
            informes certificados, seguros de impago o cobros automáticos
            mediante Stripe cuando se activen) mostrarán siempre su coste claro
            antes de cualquier contratación.
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            2. Descargo sobre Inteligencia Artificial
          </h2>
          <p>
            Los dictámenes sobre averías (Art. 21 LAU), respuestas del Asesor
            Legal y cálculos de actualización de renta (RDL 29/2026 / IRAV) son{" "}
            <strong className="text-primary">meramente orientativos</strong>. En
            caso de conflicto judicial o duda compleja, consulta siempre a un
            abogado colegiado o servicio público de vivienda.
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            3. Enlace con InquiCheck
          </h2>
          <p>
            El acceso a InquiCheck para la verificación de solvencia
            pre-contrato se rige por su propia política de privacidad y
            protocolo de Custodia Cero.
          </p>
        </div>
      </article>
    </AppShell>
  );
}
