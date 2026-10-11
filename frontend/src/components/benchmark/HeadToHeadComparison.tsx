"use client";

import React, { useState, useMemo } from "react";
import { ModelBenchmarkItem } from "@/types/benchmark";
import { Scale, ArrowRight, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { ARCHITECTURE_COLORS } from "@/lib/pareto";

interface HeadToHeadComparisonProps {
  models: ModelBenchmarkItem[];
  primaryUnit: string;
}

export const HeadToHeadComparison: React.FC<HeadToHeadComparisonProps> = ({
  models,
  primaryUnit,
}) => {
  const [modelAId, setModelAId] = useState<string>(models[0]?.id || "");
  const [modelBId, setModelBId] = useState<string>(
    models[1]?.id || models[0]?.id || ""
  );

  const modelA = useMemo(() => models.find((m) => m.id === modelAId) || models[0], [models, modelAId]);
  const modelB = useMemo(() => models.find((m) => m.id === modelBId) || models[1] || models[0], [models, modelBId]);

  if (!modelA || !modelB) return null;

  // Compute differentials (A compared to B)
  const diffAcc = Number((modelA.top1Accuracy - modelB.top1Accuracy).toFixed(2));
  const diffLat = Number((modelA.latencyMs - modelB.latencyMs).toFixed(2));
  const diffParams = Number((modelA.paramsM - modelB.paramsM).toFixed(2));
  const diffFlops = Number((modelA.flopsG - modelB.flopsG).toFixed(2));

  // Speedup ratio
  const speedRatio = modelB.latencyMs > 0 ? (modelB.latencyMs / modelA.latencyMs).toFixed(2) : "1.0";
  const paramRatio = modelB.paramsM > 0 ? (modelB.paramsM / modelA.paramsM).toFixed(2) : "1.0";

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Differential Diagnostic Matchup</span>
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">
            Head-to-Head Architecture Matchup
          </h4>
          <p className="text-xs text-slate-400">
            Side-by-side trade-off analysis comparing two architectures.
          </p>
        </div>

        {/* Model Selectors */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <select
            value={modelAId}
            onChange={(e) => setModelAId(e.target.value)}
            className="bg-slate-950 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-xl focus:outline-none"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.name} ({m.family})
              </option>
            ))}
          </select>

          <span className="text-slate-500 font-bold">VS</span>

          <select
            value={modelBId}
            onChange={(e) => setModelBId(e.target.value)}
            className="bg-slate-950 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl focus:outline-none"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.name} ({m.family})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model A Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${ARCHITECTURE_COLORS[modelA.family] || "#06b6d4"}22`,
                color: ARCHITECTURE_COLORS[modelA.family] || "#06b6d4",
              }}
            >
              {modelA.family}
            </span>
            {modelA.isParetoOptimal && (
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                ⭐ Pareto Optimal
              </span>
            )}
          </div>
          <div>
            <h5 className="text-lg font-bold text-white">{modelA.name}</h5>
            <p className="text-xs text-slate-400 mt-0.5">{modelA.notes || "Evaluation candidate"}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 font-mono text-center">
            <div className="p-2 rounded-lg bg-slate-900/60">
              <div className="text-[10px] text-slate-400">Accuracy</div>
              <div className="text-base font-bold text-cyan-400">{modelA.top1Accuracy}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60">
              <div className="text-[10px] text-slate-400">Latency</div>
              <div className="text-base font-bold text-white">{modelA.latencyMs}ms</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60">
              <div className="text-[10px] text-slate-400">Params</div>
              <div className="text-base font-bold text-white">{modelA.paramsM}M</div>
            </div>
          </div>
        </div>

        {/* Model B Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${ARCHITECTURE_COLORS[modelB.family] || "#10b981"}22`,
                color: ARCHITECTURE_COLORS[modelB.family] || "#10b981",
              }}
            >
              {modelB.family}
            </span>
            {modelB.isParetoOptimal && (
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ⭐ Pareto Optimal
              </span>
            )}
          </div>
          <div>
            <h5 className="text-lg font-bold text-white">{modelB.name}</h5>
            <p className="text-xs text-slate-400 mt-0.5">{modelB.notes || "Evaluation baseline"}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 font-mono text-center">
            <div className="p-2 rounded-lg bg-slate-900/60">
              <div className="text-[10px] text-slate-400">Accuracy</div>
              <div className="text-base font-bold text-emerald-400">{modelB.top1Accuracy}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60">
              <div className="text-[10px] text-slate-400">Latency</div>
              <div className="text-base font-bold text-white">{modelB.latencyMs}ms</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60">
              <div className="text-[10px] text-slate-400">Params</div>
              <div className="text-base font-bold text-white">{modelB.paramsM}M</div>
            </div>
          </div>
        </div>
      </div>

      {/* Differential Delta Table */}
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/50">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
              <th className="py-2.5 px-4 text-left">Metric</th>
              <th className="py-2.5 px-4 text-center">{modelA.name}</th>
              <th className="py-2.5 px-4 text-center">{modelB.name}</th>
              <th className="py-2.5 px-4 text-right">Delta Difference (A vs B)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">Top-1 Accuracy</td>
              <td className="py-2.5 px-4 text-center font-bold text-cyan-400">{modelA.top1Accuracy}%</td>
              <td className="py-2.5 px-4 text-center font-bold text-emerald-400">{modelB.top1Accuracy}%</td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span className={diffAcc >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {diffAcc >= 0 ? `+${diffAcc}%` : `${diffAcc}%`}
                </span>
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">Inference Latency</td>
              <td className="py-2.5 px-4 text-center">{modelA.latencyMs} ms</td>
              <td className="py-2.5 px-4 text-center">{modelB.latencyMs} ms</td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span className={diffLat <= 0 ? "text-emerald-400" : "text-amber-400"}>
                  {diffLat <= 0 ? `${diffLat} ms (Faster)` : `+${diffLat} ms (Slower)`}
                </span>
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">Parameters</td>
              <td className="py-2.5 px-4 text-center">{modelA.paramsM} M</td>
              <td className="py-2.5 px-4 text-center">{modelB.paramsM} M</td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span className={diffParams <= 0 ? "text-emerald-400" : "text-slate-400"}>
                  {diffParams <= 0 ? `${diffParams} M (Leaner)` : `+${diffParams} M (Larger)`}
                </span>
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-4 font-semibold text-white">GFLOPs</td>
              <td className="py-2.5 px-4 text-center">{modelA.flopsG} G</td>
              <td className="py-2.5 px-4 text-center">{modelB.flopsG} G</td>
              <td className="py-2.5 px-4 text-right font-bold">
                <span className={diffFlops <= 0 ? "text-emerald-400" : "text-slate-400"}>
                  {diffFlops <= 0 ? `${diffFlops} G` : `+${diffFlops} G`}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Synthesis Takeaway */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-start space-x-2.5">
        <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Matchup Synthesis: </span>
          {diffAcc > 0 ? (
            <span>
              <strong>{modelA.name}</strong> achieves a <strong>+{diffAcc}% accuracy advantage</strong> over {modelB.name}.{" "}
              {diffLat > 0 ? (
                <span>However, {modelB.name} delivers {speedRatio}x faster inference, making it preferable if strict real-time SLAs (&lt;{modelA.latencyMs}ms) are required.</span>
              ) : (
                <span>Remarkably, {modelA.name} is also {Math.abs(diffLat)}ms faster, strictly dominating {modelB.name} on the Pareto frontier.</span>
              )}
            </span>
          ) : (
            <span>
              <strong>{modelB.name}</strong> leads by <strong>+{Math.abs(diffAcc)}% accuracy</strong>.{" "}
              {diffLat < 0 ? (
                <span>{modelA.name} offers a lightweight alternative running {Math.abs(diffLat)}ms faster.</span>
              ) : (
                <span>{modelB.name} remains the superior overall choice.</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
