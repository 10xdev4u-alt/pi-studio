import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "π Studio",
  description: "Multi-agent UI for the pi coding harness",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
