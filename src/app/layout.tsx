import type { Metadata } from "next";
import { Manrope, Source_Code_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";

const manrope = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ndira",
  description: "AI-powered farming assistant for crop diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sourceCodePro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
