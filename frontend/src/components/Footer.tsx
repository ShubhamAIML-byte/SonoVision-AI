"use client";

import React from "react";
import { Activity, Heart, Github, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-slate-900 py-12 text-slate-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-bold tracking-tight">SonoVision AI</span>
            <p className="text-[11px] text-slate-500">M.Tech AI/ML Project • BUSI ViT-B/16</p>
          </div>
        </div>

        <div className="text-center sm:text-right space-y-1">
          <p className="text-slate-400">
            PyTorch 2.x • Vision Transformer ViT-B/16 • Grad-CAM • FastAPI • Next.js 14
          </p>
          <p className="text-[11px] text-slate-500">
            Deployed on Vercel & Dedicated Inference Backend
          </p>
        </div>
      </div>
    </footer>
  );
};
