import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Estudio de Métricas | Melany Brito",
  description:
    "Tu espacio para medir engagement, organizar clientes y crear reportes de Instagram, TikTok y LinkedIn.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
