"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
import { ModelBenchmarkItem } from "@/types/benchmark";
import { computeParetoOptimal, ARCHITECTURE_COLORS } from "@/lib/pareto";
import { TrendingUp, Layers, HelpCircle, Sparkles } from "lucide-react";

interface ParetoFrontierChartProps {
  models: ModelBenchmarkItem[];
  primaryUnit: string;
}

export const ParetoFrontierChart: React.FC<ParetoFrontierChartProps> = ({
  models,
  primaryUnit,
}) => {
  const [metricX, setMetricX] = useState<"latencyMs" | "paramsM" | "flopsG">("latencyMs");
  const [metricY, setMetricY] = useState<"top1Accuracy" | "f1Score">("top1Accuracy");

  const xLabels = {
    latencyMs: "Inference Latency (ms) — Lower is Better",
    paramsM: "Parameter Count (M) — Lower is Better",
    flopsG: "Computational Complexity (GFLOPs) — Lower is Better",
  };

  const yLabels = {
    top1Accuracy: `${primaryUnit || "Top-1 Accuracy (%)"} — Higher is Better`,
    f1Score: "F1-Score (%) — Higher is Better",
  };

  // Compute models with dynamic Pareto status based on chosen axes
  const evaluatedModels = useMemo(() => {
    return computeParetoOptimal(models, metricX, metricY);
  }, [models, metricX, metricY]);

  // Generate Pareto frontier line points sorted by X
  const frontierLineData = useMemo(() => {
    return evaluatedModels
      .filter((m) => m.isParetoOptimal)
      .map((m) => ({
        x: m[metricX],
        y: m[metricY] ?? 0,
        name: m.name,
      }))
      .sort((a, b) => a.x - b.x);
  }, [evaluatedModels, metricX, metricY]);

  // Group models for scatter points
  const scatterPoints = useMemo(() => {
    return evaluatedModels.map((m) => ({
      x: m[metricX],
      y: m[metricY] ?? 0,
      name: m.name,
      family: m.family,
      isPareto: m.isParetoOptimal,
      paramsM: m.paramsM,
      latencyMs: m.latencyMs,
      flopsG: m.flopsG,
      notes: m.notes,
      fill: ARCHITECTURE_COLORS[m.family] || "#38bdf8",
    }));
  }, [evaluatedModels, metricX, metricY]);

  const paretoCount = evaluatedModels.filter((m) => m.isParetoOptimal).length;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header & Axis Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Multi-Objective Efficiency Tradeoff</span>
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">
            Pareto Frontier: Accuracy vs. Computational Budget
          </h4>
          <p className="text-xs text-slate-400">
            Models residing on the frontier line represent state-of-the-art optimal efficiency.
          </p>
        </div>

        {/* Axis Controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* X Axis Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">X-Axis:</span>
            <select
              value={metricX}
              onChange={(e) => setMetricX(e.target.value as any)}
              className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="latencyMs" className="bg-slate-900 text-white">Latency (ms)</option>
              <option value="paramsM" className="bg-slate-900 text-white">Params (M)</option>
              <option value="flopsG" className="bg-slate-900 text-white">GFLOPs</option>
            </select>
          </div>

          {/* Y Axis Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">Y-Axis:</span>
            <select
              value={metricY}
              onChange={(e) => setMetricY(e.target.value as any)}
              className="bg-transparent text-emerald-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="top1Accuracy" className="bg-slate-900 text-white">Top-1 Accuracy</option>
              <option value="f1Score" className="bg-slate-900 text-white">F1 Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Quick Badges */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{paretoCount} Pareto-Optimal Models</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
          {Object.entries(ARCHITECTURE_COLORS).slice(0, 4).map(([fam, color]) => (
            <div key={fam} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span>{fam}</span>
            </div>
          ))}
          <div className="flex items-center space-x-1.5 text-amber-300">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block" />
            <span>Frontier Curve</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 sm:h-96 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="x"
              name={metricX}
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              label={{
                value: xLabels[metricX],
                position: "insideBottom",
                offset: -15,
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={metricY}
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              domain={["dataMin - 3", "dataMax + 2"]}
              label={{
                value: yLabels[metricY],
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 max-w-xs z-50">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-white text-sm">{data.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono"
                        style={{
                          backgroundColor: `${ARCHITECTURE_COLORS[data.family] || "#38bdf8"}22`,
                          color: ARCHITECTURE_COLORS[data.family] || "#38bdf8",
                        }}
                      >
                        {data.family}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] pt-1">
                      <div className="text-slate-400">
                        Accuracy: <span className="text-emerald-400 font-bold">{data.y}%</span>
                      </div>
                      <div className="text-slate-400">
                        Latency: <span className="text-cyan-400 font-bold">{data.latencyMs}ms</span>
                      </div>
                      <div className="text-slate-400">
                        Params: <span className="text-sky-300 font-bold">{data.paramsM}M</span>
                      </div>
                      <div className="text-slate-400">
                        FLOPs: <span className="text-amber-300 font-bold">{data.flopsG}G</span>
                      </div>
                    </div>

                    {data.isPareto ? (
                      <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-cyan-300 font-mono flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Pareto Optimal Backbone</span>
                      </div>
                    ) : (
                      <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                        Sub-optimal (Dominated by frontier models)
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Pareto Frontier Line */}
            <Line
              type="monotone"
              data={frontierLineData}
              dataKey="y"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />

            {/* Scatter Points */}
            <Scatter
              name="Models"
              data={scatterPoints}
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const isOptimal = payload.isPareto;
                return (
                  <g>
                    {isOptimal && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={11}
                        fill={payload.fill}
                        opacity={0.2}
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isOptimal ? 6.5 : 4.5}
                      fill={payload.fill}
                      stroke={isOptimal ? "#ffffff" : "#1e293b"}
                      strokeWidth={isOptimal ? 2 : 1}
                      style={{ filter: isOptimal ? "drop-shadow(0 0 4px rgba(6,182,212,0.8))" : "none" }}
                    />
                    {isOptimal && (
                      <text
                        x={cx + 9}
                        y={cy - 7}
                        fill="#f8fafc"
                        fontSize={10}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {payload.name}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
