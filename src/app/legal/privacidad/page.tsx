import AppShell from "@/components/AppShell";

export default function PrivacidadPage() {
  return (
    <AppShell>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
          RGPD (UE 2016/679) y LOPDGDD (LO 3/2018)
        </span>
        <h1 className="font-editorial text-4xl text-primary font-normal">
          Política de Privacidad
        </h1>
        <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <p>
            En <strong className="text-primary">Techo y Hecho</strong> aplicamos
            el principio de minimización de datos y{" "}
            <strong className="text-primary">privacidad por contrato</strong>:
            cada usuario solo puede acceder a sus propias viviendas, recibos e
            incidencias mediante políticas de seguridad por fila (Row Level
            Security) en servidores ubicados en la Unión Europea (región{" "}
            <code>eu-west-3</code>).
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            1. Finalidad y base legitimadora
          </h2>
          <p>
            Tratamos tu nombre, correo electrónico y los datos del contrato que
            decidas registrar con la única finalidad de prestarte el servicio de
            gestión del alquiler (ejecución del contrato, art. 6.1.b RGPD) y, en
            su caso, tu consentimiento expreso (art. 6.1.a RGPD).
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            2. Uso responsable de Inteligencia Artificial
          </h2>
          <p>
            Cuando utilizas el Árbitro de Reparaciones, el Asesor Legal o el
            Lector de Facturas, te recomendamos no introducir DNI, números de
            cuenta bancaria ni datos médicos. Los textos enviados se procesan
            únicamente para generar la respuesta solicitada.
          </p>
          <h2 className="font-editorial text-xl text-primary pt-2">
            3. Conservación y derechos (ARSOPOL)
          </h2>
          <p>
            Puedes ejercer en cualquier momento tus derechos de acceso,
            rectificación, supresión, oposición, portabilidad y limitación del
            tratamiento escribiendo a{" "}
            <span className="text-primary font-medium">
              privacidad@techoyhecho.example
            </span>{" "}
            o ante la Agencia Española de Protección de Datos (AEPD).
          </p>
        </div>
      </article>
    </AppShell>
  );
}
