# Techo y Hecho — Gestión Serena del Alquiler Residencial en España

Portal web y aplicación PWA (preparada para Google Play) para propietarios particulares e inquilinos en España, adaptada a la **Ley 12/2023**, la **LAU** y el **Real Decreto-ley 29/2026** (tope del 2 % y regulación de alquileres).

- **Gratis para siempre para 1 vivienda.**
- **Conectado a [InquiCheck](https://inquicheck.vercel.app/)** para la fase pre-contrato (*Pasaporte Oficial de Solvencia* con protocolo Custodia Cero).
- **Pasaporte de Buen Inquilino y Buen Casero:** reputación bilateral verificada durante el contrato.

## Módulos incluidos
1. **Portal Inquilino (`/portal`) y Propietario (`/propietario`):** acceso real con **Supabase Auth** + Demos en 1 clic con viviendas reales de ejemplo (Madrid y Valencia) y vinculación por código (`MAD-2026-B`, `VAL-2026-A`).
2. **Pagos, Recibos Legales y Suministros (`/pagos`):** doble verificación sin comisiones, lector IA de facturas de luz/agua/gas y pasarela **Stripe preparada** (inactiva por defecto).
3. **Averías y Mediación IA (`/averias`):** triage legal Art. 21 LAU con Google Gemini Flash en servidor, reloj legal de 15 días, guía rápida de emergencia y tutoriales de bricolaje.
4. **Contrato, Fianza y Calculadora RDL 29/2026 (`/contrato`):** custodia de contrato y resguardo de fianza autonómico, calculadora automática del tope 2 % / IRAV y Asesor Jurídico IA.
5. **Pasaporte Bilateral (`/pasaporte`):** certificado de Buen Inquilino y Buen Casero + evaluador IA de solvencia combinado.
6. **Cumplimiento legal España (`/legal/*`):** Aviso Legal (LSSI-CE), Privacidad (RGPD/LOPDGDD), Política de Cookies con banner real y Términos de Uso.

## Variables de entorno
Copia `.env.example` a `.env.local` y rellena tus claves (nunca subas `.env.local` a GitHub):

```bash
cp .env.example .env.local
```

## Ejecución local
```bash
npm install
npm run dev
```
