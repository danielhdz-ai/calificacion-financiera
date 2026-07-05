import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GSCAPITAL - Base de Datos Financiera",
  description:
    "Gestor de banca: asesoramiento, calculadoras de hipoteca y préstamo, base de clientes y colaboradores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
