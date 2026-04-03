import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TicketSwap — Resale Marketplace",
  description: "Buy and sell event tickets. MVP marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} flex min-h-dvh flex-col antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 px-5 pb-16 pt-10 sm:px-8 sm:pt-12">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
