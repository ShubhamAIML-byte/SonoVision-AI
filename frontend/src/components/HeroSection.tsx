"use client";

import React from "react";
import { Sparkles, ArrowDown, Shield, Eye, Cpu, Database } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-sky-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Academic / Project Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-6 shadow-sm shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>M.Tech Advanced AI/ML Project • Vision Transformer (ViT-B/16)</span>
        </div>

        {/* Primary Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Intelligent Breast Ultrasound Diagnostics with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-300">
            ViT Patch-Token Explainability
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Fine-tuned Vision Transformer (<code className="text-cyan-300 font-mono text-sm px-1.5 py-0.5 rounded bg-slate-800">ViT-B/16</code>)
          on the BUSI dataset with gradient-based class activation mapping (Grad-CAM) adapted specifically
          for 196 attention patch tokens, providing transparent visual localization for benign, malignant, and normal tissue.
        </p>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>BUSI Dataset (780 Scans)</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>ViT-B/16 (86M Params)</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>Patch-Token Grad-CAM (14×14 Grid)</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>91.67% Test Acc • 0.9742 ROC-AUC</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10 flex items-center justify-center space-x-4">
          <a
            href="#analyzer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Diagnostic Analyzer</span>
            <ArrowDown className="w-4 h-4" />
          </a>
          <a
            href="#metrics"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            <span>View Performance Metrics</span>
          </a>
        </div>
      </div>
    </section>
  );
};
