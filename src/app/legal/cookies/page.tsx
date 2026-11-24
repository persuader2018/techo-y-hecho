import AppShell from "@/components/AppShell";

export default function CookiesPage() {
  return (
    <AppShell>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
          Guía AEPD y LSSI-CE (Art. 22.2)
        </span>
        <h1 className="font-editorial text-4xl text-primary font-normal">
          Política de Cookies
        </h1>
        <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <p>
            <strong className="text-primary">Techo y Hecho</strong> utiliza
            exclusivamente cookies técnicas y almacenamiento local necesario para
            mantener tu sesión iniciada de forma segura y recordar tu elección
            en el banner de privacidad.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-primary">Cookies técnicas esenciales:</strong>{" "}
              Necesarias para la autenticación en Supabase y la navegación entre
              secciones. Están exentas de consentimiento previo pero se informan
              por transparencia.
            </li>
            <li>
              <strong className="text-primary">Preferencia de consentimiento:</strong>{" "}
              Almacenada en <code>tyh_cookie_consent_v1</code> para no volver a
              mostrarte el aviso en cada visita.
            </li>
            <li>
              <strong className="text-primary">Sin rastreo publicitario:</strong>{" "}
              No instalamos cookies de publicidad comportamental de terceros.
            </li>
          </ul>
        </div>
      </article>
    </AppShell>
  );
}
