import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-sentence",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ein Satz · Getzner",
  description: "Bühne für den Vocci-Ring. Ein gesprochener Satz, drei gemessene Zeiten.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#14120e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${outfit.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
