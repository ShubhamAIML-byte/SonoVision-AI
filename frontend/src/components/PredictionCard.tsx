"use client";

import React from "react";
import { PredictionResult, DiagnosticClass } from "@/types";
import { CLASS_STYLES } from "@/lib/sampleData";
import { ShieldAlert, ShieldCheck, CheckCircle2, Clock, Cpu, FileText } from "lucide-react";

interface PredictionCardProps {
  result: PredictionResult;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ result }) => {
  const predClass = result.predicted_class as DiagnosticClass;
  const style = CLASS_STYLES[predClass] || CLASS_STYLES.benign;

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Header: Class Badge & Confidence */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Primary Diagnostic Output
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {result.model_name}
            </span>
          </div>

          <div className="mt-2 flex items-center space-x-3">
            <div
              className={`px-4 py-1.5 rounded-xl border text-xl sm:text-2xl font-black tracking-wide ${style.badgeBg} ${style.badgeBorder} ${style.badgeText} shadow-sm`}
            >
              {style.label}
            </div>

            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {(result.confidence * 100).toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider -mt-1 font-mono">
                Model Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="flex flex-col sm:items-end">
          <span className="text-xs text-slate-400 font-mono uppercase mb-1">
            Clinical Assessment
          </span>
          <div
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
              predClass === "malignant"
                ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                : predClass === "benign"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-sky-500/15 border-sky-500/40 text-sky-300"
            }`}
          >
            {predClass === "malignant" ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : predClass === "benign" ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{result.risk_level}</span>
          </div>
        </div>
      </div>

      {/* Probability Distribution Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span>Three-Class Probability Distribution</span>
          <span className="font-mono text-slate-400 text-[11px]">Softmax Sum = 100%</span>
        </div>

        <div className="space-y-2.5">
          {(["benign", "malignant", "normal"] as DiagnosticClass[]).map((clsKey) => {
            const prob = result.probabilities[clsKey] ?? 0;
            const pct = (prob * 100).toFixed(1);
            const isWinner = predClass === clsKey;
            const itemStyle = CLASS_STYLES[clsKey];

            return (
              <div key={clsKey} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span
                    className={`font-semibold capitalize flex items-center space-x-1.5 ${
                      isWinner ? itemStyle.textColor : "text-slate-400"
                    }`}
                  >
                    <span>{clsKey}</span>
                    {isWinner && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        Top Rank
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-slate-200 font-medium">
                    {pct}%
                  </span>
                </div>

                <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${itemStyle.barColor}`}
                    style={{ width: `${Math.max(2, prob * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Interpretation Box */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          <span>Diagnostic Synthesis & Attention Localization</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* Technical Metadata Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Latency: {result.inference_time_ms} ms</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>Patch Tokens: {result.patch_token_count} (14×14 grid)</span>
        </div>
      </div>
    </div>
  );
};
