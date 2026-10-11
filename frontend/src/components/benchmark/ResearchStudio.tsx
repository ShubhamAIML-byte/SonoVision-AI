"use client";

import React, { useState } from "react";
import {
  BenchmarkExtractionResult,
  ModelBenchmarkItem,
} from "@/types/benchmark";
import { PRESET_BENCHMARKS } from "@/lib/benchmarkPresets";
import { ImageExtractor } from "./ImageExtractor";
import { ParetoFrontierChart } from "./ParetoFrontierChart";
import { RadarComparisonChart } from "./RadarComparisonChart";
import { LeaderboardBarChart } from "./LeaderboardBarChart";
import { HeadToHeadComparison } from "./HeadToHeadComparison";
import { ExtractedDataTable } from "./ExtractedDataTable";
import { ResearchInsightsCard } from "./ResearchInsightsCard";
import {
  Trophy,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  Compass,
  BarChart3,
  Scale,
  Database,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export const ResearchStudio: React.FC = () => {
  // Default to ImageNet Vision Transformer vs CNN benchmark
  const [benchmark, setBenchmark] = useState<BenchmarkExtractionResult>(
    PRESET_BENCHMARKS["imagenet-vit-vs-cnn"]
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "pareto" | "radar" | "leaderboard" | "matchup"
  >("pareto");

  const handleExtracted = (result: BenchmarkExtractionResult) => {
    setBenchmark(result);
  };

  const handleUpdateModels = (updatedModels: ModelBenchmarkItem[]) => {
    setBenchmark({
      ...benchmark,
      models: updatedModels,
    });
  };

  // Find top KPI models
  const highestAccModel = [...benchmark.models].sort(
    (a, b) => b.top1Accuracy - a.top1Accuracy
  )[0];

  const lowestLatModel = [...benchmark.models].sort(
    (a, b) => a.latencyMs - b.latencyMs
  )[0];

  const leanestModel = [...benchmark.models].sort(
    (a, b) => a.paramsM - b.paramsM
  )[0];

  const paretoOptimalCount = benchmark.models.filter(
    (m) => m.isParetoOptimal
  ).length;

  return (
    <div className="space-y-10">
      {/* Hero Intro Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multimodal Vision Benchmark Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Deep Learning{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300">
            Model Comparison
          </span>{" "}
          Studio
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Upload any screenshot or photo of an ArXiv / CVPR research paper table or benchmark plot.
          Our multimodal AI extracts the data and transforms it into publication-grade Pareto frontiers,
          multi-metric radar profiles, and comparative trade-off dashboards.
        </p>
      </div>

      {/* Step 1: Image Extractor Dropzone */}
      <ImageExtractor
        onExtracted={handleExtracted}
        isExtracting={isExtracting}
        setIsExtracting={setIsExtracting}
      />

      {/* Benchmark Header Info & KPI Cards */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono border border-cyan-500/20">
                {benchmark.taskType}
              </span>
              <span className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>{benchmark.dataset}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {benchmark.benchmarkTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
              <span className="flex items-center space-x-1 text-sky-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>Hardware: {benchmark.hardwareTarget}</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Extraction Confidence: {benchmark.sourceConfidence}%</span>
              </span>
              {benchmark.dateExtracted && (
                <span className="flex items-center space-x-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{benchmark.dateExtracted}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 flex-shrink-0">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>
              <strong>{benchmark.models.length}</strong> Deep Learning Models Analyzed
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
          {/* Highest Accuracy */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>SOTA Top-1 Acc</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {highestAccModel?.top1Accuracy}%
            </div>
            <div className="text-xs text-slate-300 font-semibold truncate mt-0.5">
              {highestAccModel?.name}
            </div>
          </div>

          {/* Lowest Latency */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Lowest Latency</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400">
              {lowestLatModel?.latencyMs} ms
            </div>
            <div className="text-xs text-slate-300 font-semibold truncate mt-0.5">
              {lowestLatModel?.name}
            </div>
          </div>

          {/* Leanest Parameters */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Most Compact</span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-400">
              {leanestModel?.paramsM} M
            </div>
            <div className="text-xs text-slate-300 font-semibold truncate mt-0.5">
              {leanestModel?.name}
            </div>
          </div>

          {/* Pareto Champions */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Pareto Frontier</span>
              <Sparkles className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-400">
              {paretoOptimalCount} Models
            </div>
            <div className="text-xs text-slate-300 font-semibold truncate mt-0.5">
              Optimal Tradeoff
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visualizations Section with Tabs */}
      <div className="space-y-5">
        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-800">
          {[
            { id: "pareto", label: "Pareto Frontier Curve", icon: TrendingUp },
            { id: "radar", label: "Multi-Metric Radar Profiler", icon: Compass },
            { id: "leaderboard", label: "Leaderboard Ranking", icon: BarChart3 },
            { id: "matchup", label: "Head-to-Head Differential", icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="transition-all duration-300">
          {activeTab === "pareto" && (
            <ParetoFrontierChart
              models={benchmark.models}
              primaryUnit={benchmark.metricUnit.primary}
            />
          )}

          {activeTab === "radar" && (
            <RadarComparisonChart models={benchmark.models} />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardBarChart
              models={benchmark.models}
              primaryUnit={benchmark.metricUnit.primary}
            />
          )}

          {activeTab === "matchup" && (
            <HeadToHeadComparison
              models={benchmark.models}
              primaryUnit={benchmark.metricUnit.primary}
            />
          )}
        </div>
      </div>

      {/* Extracted Ledger & Live Table Editor */}
      <ExtractedDataTable
        benchmark={benchmark}
        onUpdateModels={handleUpdateModels}
      />

      {/* Peer Review Insights & Deployment Feasibility */}
      <ResearchInsightsCard benchmark={benchmark} />
    </div>
  );
};
