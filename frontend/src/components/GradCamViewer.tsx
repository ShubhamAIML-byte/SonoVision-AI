"use client";

import React, { useState } from "react";
import { Download, Sliders, Layers, Eye, Info, Sparkles, ZoomIn } from "lucide-react";
import { PredictionResult } from "@/types";

interface GradCamViewerProps {
  result: PredictionResult;
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<"side-by-side" | "interactive-blend" | "raw-heatmap">("side-by-side");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.6);

  const handleDownloadGradCam = () => {
    const link = document.createElement("a");
    link.href = result.gradcam_base64;
    link.download = `sonovision_${result.predicted_class}_gradcam.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="explainability" className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Title & View Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400">
              Explainable AI (XAI)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              ViT Patch Grad-CAM
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Vision Transformer Spatial Attention Map
          </h3>
          <p className="text-xs text-slate-400">
            Gradient-weighted backpropagation through the 12th Transformer encoder layer (14×14 patch grid).
          </p>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === "side-by-side"
                ? "bg-slate-800 text-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode("interactive-blend")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === "interactive-blend"
                ? "bg-slate-800 text-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Interactive Blend
          </button>
          <button
            onClick={() => setViewMode("raw-heatmap")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === "raw-heatmap"
                ? "bg-slate-800 text-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Raw Heatmap
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      {viewMode === "side-by-side" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Ultrasound Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>ORIGINAL B-MODE ULTRASOUND</span>
              <span className="text-slate-400">224 × 224</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center shadow-lg group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.original_base64}
                alt="Original Ultrasound"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 backdrop-blur-sm">
                Preprocessed Input
              </div>
            </div>
          </div>

          {/* Grad-CAM Heatmap Overlay Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
              <span>ViT GRAD-CAM HEATMAP OVERLAY</span>
              <span className="text-cyan-400">LayerNorm Token Hook</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden border border-cyan-500/30 bg-black flex items-center justify-center shadow-lg shadow-cyan-500/10 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.gradcam_base64}
                alt="Grad-CAM Overlay"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 backdrop-blur-sm border border-cyan-500/20">
                Class: {result.predicted_class.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "interactive-blend" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              INTERACTIVE OPACITY BLEND: {Math.round(overlayOpacity * 100)}%
            </span>
            <div className="flex items-center space-x-3 w-48 sm:w-64">
              <span className="text-[10px] font-mono text-slate-400">Raw Scan</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] font-mono text-cyan-400">Heatmap</span>
            </div>
          </div>

          <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden border border-cyan-500/30 bg-black shadow-2xl">
            {/* Background: Original Ultrasound */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.original_base64}
              alt="Base Ultrasound"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Foreground: Raw Heatmap with variable opacity */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.heatmap_base64}
              alt="Heatmap Layer"
              style={{ opacity: overlayOpacity }}
              className="absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity"
            />
          </div>
        </div>
      )}

      {viewMode === "raw-heatmap" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
            <span>ISOLATED JET THERMAL GRAD-CAM MAP</span>
            <span className="text-slate-400">196 Patch Grid Bilinearly Scaled</span>
          </div>
          <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.heatmap_base64}
              alt="Raw Heatmap"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Heatmap Spectrum Legend Bar */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Gradient Importance Spectrum:</span>
          <span className="text-cyan-300">Min [0.0] → Max [1.0]</span>
        </div>

        {/* Jet Thermal Gradient Bar */}
        <div className="h-3 rounded-full w-full bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-red-600 shadow-inner" />

        <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-0.5">
          <span>Low Activation (Parenchyma)</span>
          <span>Moderate Focus</span>
          <span className="text-rose-400 font-semibold">Focal Diagnostic Region (Lesion)</span>
        </div>
      </div>

      {/* Interpretation & Download Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-start space-x-2 text-xs text-slate-400 max-w-xl">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p>
            The red/warm regions indicate the spatial image patches that contributed most heavily
            to the classification logit for <strong>{result.predicted_class.toUpperCase()}</strong>.
            In benign scans, attention centers on circumscribed boundaries; in malignant scans, attention
            highlights non-circumscribed micro-lobulated edges and acoustic shadowing.
          </p>
        </div>

        <button
          onClick={handleDownloadGradCam}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/30 text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Grad-CAM Overlay</span>
        </button>
      </div>
    </div>
  );
};
