"use client";

import React from "react";
import { AlertTriangle, Stethoscope, ShieldAlert } from "lucide-react";

export const ClinicalDisclaimer: React.FC = () => {
  return (
    <section className="py-10 bg-slate-950/90 border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs font-mono">
              Academic Research Prototype & Regulatory Notice
            </h4>
            <p>
              <strong>SonoVision AI</strong> is developed as an M.Tech academic AI/ML project exploring
              Vision Transformer transfer learning and gradient-based class activation explainability
              on breast ultrasound imaging.
            </p>
            <p className="text-slate-400 text-xs">
              This software is <strong>not FDA-cleared, CE-marked, or clinically certified</strong> for primary
              diagnostic screening, triage, or clinical decision-making. Model predictions and Grad-CAM heatmaps
              are computational approximations and must not replace professional clinical radiological evaluation,
              biopsy histology, or consultation with a certified healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
