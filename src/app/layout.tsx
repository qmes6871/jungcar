import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jungcar | Premium Korean Used Cars Export",
    template: "%s | Jungcar",
  },
  description:
    "Your trusted partner for quality Korean used cars. We export premium Hyundai, Kia, and Genesis vehicles worldwide with guaranteed quality and competitive prices.",
  keywords: [
    "Korean used cars",
    "Hyundai export",
    "Kia export",
    "Genesis cars",
    "Korean car dealer",
    "used car export",
  ],
  openGraph: {
    title: "Jungcar | Premium Korean Used Cars Export",
    description:
      "Your trusted partner for quality Korean used cars export worldwide.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
