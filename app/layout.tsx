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
        <Loader />
        {children}
      </body>
    </html>
  );
}
