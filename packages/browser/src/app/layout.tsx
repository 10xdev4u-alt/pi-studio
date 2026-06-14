import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Geist is a system-level var; we set it via CSS variable fallback chain.
const geist = localFont({
  src: [],
  variable: "--font-geist-fallback",
  display: "swap",
});

export const metadata: Metadata = {
  title: "π Studio",
  description: "Multi-agent UI for the pi coding harness",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${fraunces.variable} ${jetbrains.variable} ${geist.variable}`}>
      <body>{children}</body>
    </html>
  );
}
