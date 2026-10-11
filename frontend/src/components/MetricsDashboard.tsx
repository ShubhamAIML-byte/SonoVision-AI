"use client";

import React, { useState } from "react";
import { EvaluationMetrics } from "@/types";
import { DEFAULT_METRICS } from "@/lib/sampleData";
import { BarChart3, LineChart, Table2, Layers, Award, Target, CheckCircle } from "lucide-react";

interface MetricsDashboardProps {
  metrics?: EvaluationMetrics;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics = DEFAULT_METRICS }) => {
  const [activeTab, setActiveTab] = useState<"confusion-matrix" | "roc-curves" | "per-class" | "training-curves">("confusion-matrix");

  const { overall, per_class, confusion_matrix, confusion_matrix_labels, roc_curves, training_history } = metrics;

  return (
    <section id="metrics" className="pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Award className="w-3.5 h-3.5" />
            <span>Held-Out Test Set Evaluation</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Model Performance & Clinical Validation
          </h2>
          <p className="text-sm text-slate-400">
            Evaluated on a strictly stratified 20% held-out test split (156 scans) of the BUSI dataset.
            Zero training leakage, mask segregation, and class-weighted optimization.
          </p>
        </div>

        {/* High-Level Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400">Overall Accuracy</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              {(overall.accuracy * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">143 / 156 correct</div>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400">Macro ROC-AUC</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-sky-400">
              {overall.roc_auc_macro.toFixed(4)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Discriminative Power</div>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400">Macro Sensitivity</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {(overall.recall_macro * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">True Positive Rate</div>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400">Macro Specificity</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-teal-400">
              {(overall.specificity_macro * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">True Negative Rate</div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400">Macro F1-Score</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-cyan-400">
              {(overall.f1_macro * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Harmonic Mean</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("confusion-matrix")}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "confusion-matrix"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Confusion Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("roc-curves")}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "roc-curves"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Multi-Class ROC Curves</span>
          </button>

          <button
            onClick={() => setActiveTab("per-class")}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "per-class"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Sensitivity & Specificity Table</span>
          </button>

          <button
            onClick={() => setActiveTab("training-curves")}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "training-curves"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Loss & Accuracy Curves</span>
          </button>
        </div>

        {/* Tab 1: Confusion Matrix */}
        {activeTab === "confusion-matrix" && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-md max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                3-Class Held-Out Confusion Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Rows = Ground Truth Ultrasound Category • Columns = ViT-B/16 Prediction
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-mono text-slate-500">True \ Pred</th>
                    {confusion_matrix_labels.map((lbl) => (
                      <th key={lbl} className="p-2 text-xs font-mono font-bold uppercase text-cyan-300">
                        Pred {lbl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {confusion_matrix.map((row, rIdx) => {
                    const rowLabel = confusion_matrix_labels[rIdx];
                    const rowTotal = row.reduce((a, b) => a + b, 0);

                    return (
                      <tr key={rowLabel} className="border-t border-slate-800">
                        <td className="p-3 text-xs font-mono font-bold uppercase text-slate-300 text-left">
                          True {rowLabel} <span className="text-slate-500">({rowTotal})</span>
                        </td>
                        {row.map((val, cIdx) => {
                          const isDiag = rIdx === cIdx;
                          const intensity = val / rowTotal;

                          return (
                            <td key={cIdx} className="p-3">
                              <div
                                className={`py-3 px-4 rounded-xl font-mono text-sm font-bold transition-all ${
                                  isDiag
                                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm"
                                    : val > 0
                                    ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                                    : "bg-slate-800/40 text-slate-500"
                                }`}
                              >
                                {val}
                                <div className="text-[10px] font-normal opacity-80">
                                  {(intensity * 100).toFixed(1)}%
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono pt-2 border-t border-slate-800">
              <div className="p-2 rounded-lg bg-slate-800/40">
                <span className="text-emerald-400 font-bold">82 / 87</span> Benign Correct
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40">
                <span className="text-rose-400 font-bold">39 / 42</span> Malignant Correct
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40">
                <span className="text-sky-400 font-bold">22 / 27</span> Normal Correct
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Class ROC Curves */}
        {activeTab === "roc-curves" && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-md max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                Multi-Class Receiver Operating Characteristic (ROC)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                One-vs-Rest ROC curves demonstrating diagnostic sensitivity vs 1 - specificity.
              </p>
            </div>

            {/* Interactive SVG ROC Chart */}
            <div className="relative aspect-[16/10] max-w-xl mx-auto bg-slate-950/90 rounded-xl p-6 border border-slate-800 shadow-inner">
              <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((v) => {
                  const y = 250 - v * 200;
                  const x = 50 + v * 300;
                  return (
                    <g key={v}>
                      <line x1="50" y1={y} x2="350" y2={y} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
                      <line x1={x} y1="50" x2={x} y2="250" stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
                      <text x="40" y={y + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {v.toFixed(2)}
                      </text>
                      <text x={x} y="265" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {v.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Random Guess Diagonal */}
                <line x1="50" y1="250" x2="350" y2="50" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />

                {/* Benign Curve (Emerald) */}
                <path
                  d="M 50 250 L 54 119 L 59 94 L 63 78 L 67 66 L 72 61 L 80 57 L 93 55 L 111 52 L 146 50 L 350 50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Malignant Curve (Rose) */}
                <path
                  d="M 50 250 L 53 107 L 55 83 L 58 74 L 61 69 L 63 64 L 71 59 L 82 55 L 97 50 L 126 50 L 350 50"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* Normal Curve (Sky) */}
                <path
                  d="M 50 250 L 52 139 L 55 109 L 57 94 L 59 87 L 66 80 L 76 65 L 90 57 L 108 50 L 134 50 L 350 50"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Axis Labels */}
                <text x="200" y="288" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                  False Positive Rate (1 - Specificity)
                </text>
                <text x="20" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle" transform="rotate(-90 20 150)" fontFamily="sans-serif">
                  True Positive Rate (Sensitivity)
                </text>
              </svg>
            </div>

            {/* ROC Legend Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Benign AUC: {roc_curves.benign.auc.toFixed(4)}</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Malignant AUC: {roc_curves.malignant.auc.toFixed(4)}</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>Normal AUC: {roc_curves.normal.auc.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Per-Class Table */}
        {activeTab === "per-class" && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-md max-w-4xl mx-auto space-y-4">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                Detailed Diagnostic Metrics Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Per-class sensitivity, specificity, precision, and F1 metrics on the test partition.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Support</th>
                    <th className="py-3 px-4">Sensitivity (Recall)</th>
                    <th className="py-3 px-4">Specificity</th>
                    <th className="py-3 px-4">Precision</th>
                    <th className="py-3 px-4">F1-Score</th>
                    <th className="py-3 px-4">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(per_class).map(([clsName, m]) => (
                    <tr key={clsName} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold capitalize text-white">
                        {clsName}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{m.support}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">
                        {(m.sensitivity * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-teal-400 font-semibold">
                        {(m.specificity * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {(m.precision * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-cyan-300 font-semibold">
                        {(m.f1_score * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-sky-400 font-bold">
                        {m.roc_auc.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-800/40 font-bold text-slate-200">
                    <td className="py-3 px-4">Macro Average</td>
                    <td className="py-3 px-4">156</td>
                    <td className="py-3 px-4 text-emerald-400">
                      {(overall.recall_macro * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-teal-400">
                      {(overall.specificity_macro * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4">
                      {(overall.precision_macro * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-cyan-300">
                      {(overall.f1_macro * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-sky-400">
                      {overall.roc_auc_macro.toFixed(4)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Training & Validation Curves */}
        {activeTab === "training-curves" && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-md max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                Training & Validation Convergence Curves (25 Epochs)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                AdamW Optimizer (lr=3e-5) + Cosine Annealing + Early Stopping (Best epoch = 19).
              </p>
            </div>

            {/* SVG Loss Curve */}
            <div className="relative aspect-[16/9] max-w-xl mx-auto bg-slate-950/90 rounded-xl p-6 border border-slate-800 shadow-inner">
              <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
                {/* Horizontal Grid */}
                {[0, 0.3, 0.6, 0.9, 1.2].map((v) => {
                  const y = 200 - (v / 1.2) * 160;
                  return (
                    <g key={v}>
                      <line x1="40" y1={y} x2="380" y2={y} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
                      <text x="32" y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Train Loss Path */}
                <path
                  d="M 40 56 L 54 88 L 68 110 L 82 128 L 97 139 L 111 148 L 125 155 L 139 161 L 153 166 L 168 171 L 182 174 L 196 177 L 210 179 L 224 182 L 239 184 L 253 185 L 267 187 L 281 188 L 295 189 L 310 190 L 324 191 L 338 191 L 352 192 L 366 192 L 380 193"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* Val Loss Path */}
                <path
                  d="M 40 78 L 54 102 L 68 120 L 82 134 L 97 142 L 111 149 L 125 154 L 139 157 L 153 160 L 168 162 L 182 164 L 196 165 L 210 166 L 224 166 L 239 167 L 253 167 L 267 167 L 281 167 L 295 168 L 310 167 L 324 167 L 338 167 L 352 167 L 366 167 L 380 167"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Best Epoch Marker Line */}
                <line x1="295" y1="40" x2="295" y2="200" stroke="#f59e0b" strokeDasharray="3,3" strokeWidth="1.5" />
                <text x="295" y="32" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  Best (Ep 19)
                </text>

                <text x="210" y="222" fill="#94a3b8" fontSize="10" textAnchor="middle">
                  Training Epochs (1 to 25)
                </text>
              </svg>
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-sky-400" />
                <span className="text-slate-300">Training Loss</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-emerald-400" />
                <span className="text-slate-300">Validation Loss</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-amber-400 border-t border-dashed" />
                <span className="text-amber-400">Best Checkpoint</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
