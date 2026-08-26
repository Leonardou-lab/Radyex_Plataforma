import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";

// Inter: tipografía de UI (texto de cuerpo, botones, formularios).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Lexend: tipografía de display (títulos, marca). Se usa con la
// utilidad de Tailwind `font-display` (ver app/globals.css).
const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "RADYEX",
  description: "Plataforma web para un centro de radiología dental",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${lexend.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
