import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SonoVision AI • Vision Transformer Breast Ultrasound Diagnostics & Grad-CAM",
  description:
    "Production-grade Breast Ultrasound CADx system using fine-tuned Vision Transformer (ViT-B/16), patch-token Grad-CAM explainability, and the BUSI dataset.",
  keywords: [
    "Breast Ultrasound",
    "BUSI Dataset",
    "Vision Transformer",
    "ViT-B/16",
    "Grad-CAM",
    "Deep Learning",
    "Medical AI",
    "PyTorch",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
