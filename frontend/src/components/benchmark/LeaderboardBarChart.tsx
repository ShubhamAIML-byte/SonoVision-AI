"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { ModelBenchmarkItem } from "@/types/benchmark";
import { ARCHITECTURE_COLORS } from "@/lib/pareto";
import { BarChart3, ArrowUpDown } from "lucide-react";

interface LeaderboardBarChartProps {
  models: ModelBenchmarkItem[];
  primaryUnit: string;
}

export const LeaderboardBarChart: React.FC<LeaderboardBarChartProps> = ({
  models,
  primaryUnit,
}) => {
  const [metricKey, setMetricKey] = useState<keyof ModelBenchmarkItem>("top1Accuracy");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const metricConfigs: Record<
    string,
    { label: string; unit: string; higherIsBetter: boolean }
  > = {
    top1Accuracy: {
      label: primaryUnit || "Top-1 Accuracy",
      unit: "%",
      higherIsBetter: true,
    },
    top5Accuracy: {
      label: "Top-5 Accuracy",
      unit: "%",
      higherIsBetter: true,
    },
    latencyMs: {
      label: "Inference Latency",
      unit: "ms",
      higherIsBetter: false,
    },
    paramsM: {
      label: "Parameters",
      unit: "M",
      higherIsBetter: false,
    },
    flopsG: {
      label: "Compute (FLOPs)",
      unit: "G",
      higherIsBetter: false,
    },
    throughput: {
      label: "Throughput",
      unit: "img/s",
      higherIsBetter: true,
    },
  };

  const currentConfig = metricConfigs[metricKey as string] || metricConfigs.top1Accuracy;

  const sortedData = useMemo(() => {
    return [...models]
      .filter((m) => m[metricKey] !== undefined)
      .sort((a, b) => {
        const valA = (a[metricKey] as number) || 0;
        const valB = (b[metricKey] as number) || 0;
        return sortOrder === "desc" ? valB - valA : valA - valB;
      });
  }, [models, metricKey, sortOrder]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Metric Leaderboard Ranking</span>
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">
            Model Leaderboard: {currentConfig.label}
          </h4>
          <p className="text-xs text-slate-400">
            Compare model performance ranked by absolute benchmark metric.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Metric Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">Metric:</span>
            <select
              value={metricKey as string}
              onChange={(e) => setMetricKey(e.target.value as any)}
              className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="top1Accuracy" className="bg-slate-900 text-white">Top-1 Accuracy</option>
              <option value="top5Accuracy" className="bg-slate-900 text-white">Top-5 Accuracy</option>
              <option value="latencyMs" className="bg-slate-900 text-white">Latency (ms)</option>
              <option value="paramsM" className="bg-slate-900 text-white">Params (M)</option>
              <option value="flopsG" className="bg-slate-900 text-white">FLOPs (G)</option>
              <option value="throughput" className="bg-slate-900 text-white">Throughput</option>
            </select>
          </div>

          {/* Sort Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono flex items-center space-x-1"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px]">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 10, right: 40, bottom: 10, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              unit={currentConfig.unit}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const m = payload[0].payload as ModelBenchmarkItem;
                const val = m[metricKey];
                return (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 font-mono">
                    <div className="font-bold text-white text-sm">{m.name}</div>
                    <div className="text-slate-400">
                      Family: <span className="text-cyan-400">{m.family}</span>
                    </div>
                    <div className="text-slate-400">
                      {currentConfig.label}:{" "}
                      <span className="text-emerald-400 font-bold">
                        {val} {currentConfig.unit}
                      </span>
                    </div>
                    {m.notes && <div className="text-slate-500 text-[10px] pt-1">{m.notes}</div>}
                  </div>
                );
              }}
            />
            <Bar
              dataKey={metricKey as string}
              radius={[0, 6, 6, 0]}
              animationDuration={800}
            >
              {sortedData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={ARCHITECTURE_COLORS[entry.family] || "#06b6d4"}
                  fillOpacity={0.85}
                />
              ))}
              <LabelList
                dataKey={metricKey as string}
                position="right"
                fill="#cbd5e1"
                fontSize={10}
                fontFamily="monospace"
                formatter={(val: any) => `${val}${currentConfig.unit}`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
