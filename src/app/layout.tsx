import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import { AppProvider } from "@/components/AppContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Techo y Hecho | Gestión Serena del Alquiler en España",
  description:
    "Espacio neutral entre propietarios e inquilinos en España. Recibos legales, mediación IA en averías (Art. 21 LAU), calculadora RDL 29/2026 y Pasaporte de Buen Inquilino y Casero. Gratis para siempre para 1 vivienda.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo-techoyhecho.jpg",
    apple: "/images/logo-techoyhecho.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf9f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container">
        <AppProvider>
          {children}
          <CookieBanner />
        </AppProvider>
      </body>
    </html>
  );
}
