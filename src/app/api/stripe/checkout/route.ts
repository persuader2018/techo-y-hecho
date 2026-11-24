import { NextResponse } from "next/server";
import { getStripeClient, isStripeEnabled } from "@/lib/stripe";

/**
 * Endpoint de pagos preparado para Stripe (SEPA / Tarjeta).
 * Permanece INACTIVO hasta que el administrador configure STRIPE_SECRET_KEY
 * y active NEXT_PUBLIC_STRIPE_ENABLED=true en las variables de entorno.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const concepto = String(body?.concepto ?? "Mensualidad de alquiler");
  const importeEur = Number(body?.importeEur ?? 0);

  if (!isStripeEnabled) {
    return NextResponse.json(
      {
        activo: false,
        mensaje:
          "La pasarela de Stripe está preparada en el servidor pero desactivada temporalmente. Puedes usar la doble verificación manual de recibos sin comisiones mientras decides activarla.",
        concepto,
        importeEur,
      },
      { status: 200 }
    );
  }

  const stripe = getStripeClient();
  if (!stripe || importeEur <= 0) {
    return NextResponse.json(
      { error: "Configuración de Stripe incompleta o importe no válido." },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: concepto },
          unit_amount: Math.round(importeEur * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pagos?estado=ok`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pagos?estado=cancelado`,
  });

  return NextResponse.json({ activo: true, url: session.url });
}
