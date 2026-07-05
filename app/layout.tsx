import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calificación Financiera",
  description:
    "Evalúa tu salud financiera con un cuestionario interactivo y recibe recomendaciones personalizadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
