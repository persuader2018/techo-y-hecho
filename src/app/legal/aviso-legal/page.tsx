import AppShell from "@/components/AppShell";

export default function AvisoLegalPage() {
  return (
    <AppShell>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
          Cumplimiento LSSI-CE (Ley 34/2002)
        </span>
        <h1 className="font-editorial text-4xl text-primary font-normal">
          Aviso Legal
        </h1>
        <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio,
            de Servicios de la Sociedad de la Información y de Comercio
            Electrónico (LSSI-CE), se informa que la plataforma{" "}
            <strong className="text-primary">Techo y Hecho</strong> es una
            herramienta tecnológica de apoyo a la gestión de alquileres
            residenciales en España.
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            1. Identificación del titular
          </h2>
          <p>
            Titular del proyecto: Techo y Hecho (versión preliminar en fase de
            validación; completar con NIF/CIF y domicilio social antes del
            inicio de facturación comercial). Correo de contacto:{" "}
            <span className="text-primary font-medium">
              privacidad@techoyhecho.example
            </span>
            .
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            2. Objeto y carácter informativo
          </h2>
          <p>
            La plataforma facilita el registro documental de recibos,
            suministros, incidencias y cálculos orientativos basados en la Ley
            de Arrendamientos Urbanos (LAU), la Ley 12/2023 y el Real
            Decreto-ley 29/2026. No presta asesoramiento jurídico colegiado ni
            intermediación inmobiliaria regulada.
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            3. Propiedad intelectual
          </h2>
          <p>
            Los textos, logotipos, código y diseño editorial de Techo y Hecho
            están protegidos por la normativa de propiedad intelectual vigente
            en España y la Unión Europea.
          </p>
        </div>
      </article>
    </AppShell>
  );
}
