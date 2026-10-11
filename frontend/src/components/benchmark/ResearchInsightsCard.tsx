"use client";

import React from "react";
import { BenchmarkExtractionResult } from "@/types/benchmark";
import {
  Lightbulb,
  Cpu,
  Smartphone,
  Cloud,
  Server,
  Zap,
  TrendingUp,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface ResearchInsightsCardProps {
  benchmark: BenchmarkExtractionResult;
}

export const ResearchInsightsCard: React.FC<ResearchInsightsCardProps> = ({
  benchmark,
}) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Peer-Review Synthesis & Executive Summary</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {benchmark.executiveSummary}
        </p>
      </div>

      {/* Grid of Architectural Trade-Offs & Deployment Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Key Architectural Trade-Offs (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Deep Learning Architectural Trade-Offs</span>
          </div>

          <div className="space-y-3">
            {benchmark.architecturalTradeoffs.map((tradeoff, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <h5 className="text-xs font-bold text-white">{tradeoff.title}</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-3.5">
                  {tradeoff.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deployment Recommendation Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Production Deployment Feasibility</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Edge */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono font-semibold">
                <Smartphone className="w-4 h-4" />
                <span>Edge & Mobile Devices (&lt;20ms SLA)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {benchmark.deploymentRecommendations.edge}
              </p>
            </div>

            {/* Cloud Real-Time */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono font-semibold">
                <Cloud className="w-4 h-4" />
                <span>Cloud Real-Time Inference</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {benchmark.deploymentRecommendations.cloudRealtime}
              </p>
            </div>

            {/* High Capacity */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-2 text-purple-400 font-mono font-semibold">
                <Server className="w-4 h-4" />
                <span>High-Capacity & Maximum Precision</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {benchmark.deploymentRecommendations.highCapacity}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
