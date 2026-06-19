import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Loader from "./components/loader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roman Robert — Frontend Developer",
  description:
    "Frontend Developer building responsive, high-performance web interfaces with React, Next.js and modern CSS. Based in Cluj-Napoca, Romania.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        {/* Curtain reveal style — swap to compare live. Options:
            wipe-down · wipe-up · wipe-left · wipe-right · venetian · barn ·
            iris · iris-corner · lift · drop · slide-left · slide-right ·
            zoom · diagonal · split-v · split-h · blinds · two-tone */}
        <Loader curtain="split-h" />
        {children}
      </body>
    </html>
  );
}
