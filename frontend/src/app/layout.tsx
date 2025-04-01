import React from "react";
import type { Metadata } from "next";
import { Signika_Negative } from "next/font/google";
import "./globals.css";
import ringRed from '@/assets/ring-red.svg'
import ringBlue from '@/assets/ring-azul.svg'
import Image from "next/image";

const signikaNegative = Signika_Negative({
  variable: "--font-signika-negative",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Padronizador de Imagens",
  description: "Padronizador de imagens para o site da Elo Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${signikaNegative.variable} antialiased w-full h-screen flex items-center overflow-hidden justify-center flex-col gap-6 relative font-signika`}
      >

      <Image src={ringBlue} alt={"Ring"} className={'w-96 h-auto absolute -top-1/5 -left-1/12'} />
      <Image src={ringRed} alt={"Ring"} className={'w-96 h-auto absolute -bottom-1/5 -right-1/12'} />
      {children}
      </body>
    </html>
  );
}
