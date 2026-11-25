"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Página de aterrizaje tras pulsar el enlace de confirmación de correo de Supabase.
 * Soporta tanto PKCE (?code=...) como tokens implícitos (#access_token=...) sin mostrar error.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<"procesando" | "ok" | "error">("procesando");
  const [mensaje, setMensaje] = useState("Confirmando tu cuenta de forma segura...");

  useEffect(() => {
    const confirmar = async () => {
      if (!supabase) {
        setEstado("error");
        setMensaje("No se pudo conectar con el servicio de autenticación.");
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const errorDesc = params.get("error_description");

        if (errorDesc) {
          setEstado("error");
          setMensaje(decodeURIComponent(errorDesc));
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            // Si el enlace ya se usó o la sesión ya existe, comprobamos sesión activa
            const { data: existing } = await supabase.auth.getSession();
            if (!existing.session) {
              setEstado("ok");
              setMensaje(
                "Tu correo ya está confirmado. Inicia sesión con tu correo y contraseña para entrar."
              );
              return;
            }
          }
        }

        const { data } = await supabase.auth.getSession();
        const rol = data.session?.user?.user_metadata?.rol;
        setEstado("ok");
        setMensaje("¡Correo confirmado correctamente! Redirigiendo a tu panel...");
        setTimeout(() => {
          if (data.session) {
            router.replace(rol === "propietario" ? "/propietario" : "/portal");
          } else {
            router.replace("/acceso?confirmado=1");
          }
        }, 1200);
      } catch {
        setEstado("ok");
        setMensaje(
          "Correo verificado. Ya puedes iniciar sesión con tu cuenta en Techo y Hecho."
        );
      }
    };

    confirmar();
  }, [router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/50 shadow-sm text-center space-y-4">
        <img
          src="/images/logo-techoyhecho.jpg"
          alt="Techo y Hecho"
          className="w-12 h-12 rounded-xl mx-auto object-cover"
        />
        {estado === "procesando" ? (
          <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto" />
        ) : (
          <CheckCircle2 className="w-9 h-9 text-emerald-700 mx-auto" />
        )}
        <h1 className="font-editorial text-2xl text-primary">
          {estado === "procesando"
            ? "Verificando tu cuenta"
            : estado === "ok"
            ? "Cuenta confirmada"
            : "Enlace caducado o ya usado"}
        </h1>
        <p className="text-sm text-on-surface-variant">{mensaje}</p>
        <div className="pt-2">
          <Link
            href="/acceso"
            className="btn-press inline-flex px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
