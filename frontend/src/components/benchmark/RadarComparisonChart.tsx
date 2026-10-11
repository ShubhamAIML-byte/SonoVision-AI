"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { ModelBenchmarkItem } from "@/types/benchmark";
import { computeRadarDimensions, ARCHITECTURE_COLORS } from "@/lib/pareto";
import { Compass, Check } from "lucide-react";

interface RadarComparisonChartProps {
  models: ModelBenchmarkItem[];
}

export const RadarComparisonChart: React.FC<RadarComparisonChartProps> = ({ models }) => {
  // Select initial models (first 3-4 models)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return models.slice(0, 3).map((m) => m.id);
  });

  const toggleModel = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedModels = useMemo(() => {
    return models.filter((m) => selectedIds.includes(m.id));
  }, [models, selectedIds]);

  const radarData = useMemo(() => {
    return computeRadarDimensions(selectedModels);
  }, [selectedModels]);

  const COLOR_PALETTE = ["#06b6d4", "#10b981", "#a855f7", "#f59e0b", "#ec4899"];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Holistic Capability Profiler</span>
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">
            Multi-Metric Radar Comparison
          </h4>
          <p className="text-xs text-slate-400">
            Normalized 0–100 score across accuracy, latency efficiency, param size, FLOPs & robustness.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
          Comparing {selectedIds.length} models
        </span>
      </div>

      {/* Model Selection Chips */}
      <div className="flex flex-wrap gap-1.5">
        {models.map((m) => {
          const isSelected = selectedIds.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggleModel(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Radar Chart */}
      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey="dimension"
              stroke="#94a3b8"
              fontSize={11}
              fontFamily="monospace"
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#475569"
              fontSize={10}
              tick={false}
            />

            {selectedModels.map((m, idx) => {
              const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
              return (
                <Radar
                  key={m.id}
                  name={m.name}
                  dataKey={m.id}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              );
            })}

            <Legend
              wrapperStyle={{
                fontSize: "11px",
                fontFamily: "monospace",
                paddingTop: "10px",
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-mono">
                    <div className="font-bold text-white border-b border-slate-800 pb-1">
                      {payload[0]?.payload?.dimension}
                    </div>
                    {payload.map((entry: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between space-x-3 text-[11px]"
                      >
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="text-white font-bold">{entry.value} / 100</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
