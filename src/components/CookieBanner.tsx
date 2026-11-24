"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const COOKIE_KEY = "tyh_cookie_consent_v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_KEY);
      if (!saved) setVisible(true);
    } catch {
      // Ignorar en entornos sin localStorage
    }
  }, []);

  const guardar = (tipo: "necesarias" | "todas") => {
    try {
      localStorage.setItem(
        COOKIE_KEY,
        JSON.stringify({ tipo, fecha: new Date().toISOString() })
      );
    } catch {
      // noop
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 z-50 max-w-md bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg p-5 animate-enter"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary-container/60 text-secondary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-2.5 text-sm">
          <p className="font-semibold text-primary">
            Privacidad y cookies (RGPD / LSSI-CE)
          </p>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            Usamos cookies técnicas imprescindibles para tu sesión segura y
            preferencias de vivienda. No vendemos tus datos ni usamos cookies
            publicitarias invasivas.{" "}
            <Link
              href="/legal/cookies"
              className="underline underline-offset-4 text-primary hover:text-secondary"
            >
              Ver Política de Cookies
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => guardar("necesarias")}
              className="btn-press px-3.5 py-2 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high"
            >
              Solo necesarias
            </button>
            <button
              type="button"
              onClick={() => guardar("todas")}
              className="btn-press px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
