import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import type { Metadata } from "next";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Recruitment Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          <ThemeScript />
        </head>
        <body>{children}</body>
      </html>
    );
}
