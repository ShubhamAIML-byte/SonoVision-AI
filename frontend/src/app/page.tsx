"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ImageUploader } from "@/components/ImageUploader";
import { PredictionCard } from "@/components/PredictionCard";
import { GradCamViewer } from "@/components/GradCamViewer";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { ViTArchitecture } from "@/components/ViTArchitecture";
import { DatasetInfo } from "@/components/DatasetInfo";
import { ClinicalDisclaimer } from "@/components/ClinicalDisclaimer";
import { Footer } from "@/components/Footer";

import { ResearchStudio } from "@/components/benchmark/ResearchStudio";

import { PredictionResult, EvaluationMetrics, ModelInfo } from "@/types";
import { DEFAULT_METRICS, SampleCase } from "@/lib/sampleData";
import { predictUltrasound, getModelInfo } from "@/lib/api";
import { Activity, ShieldCheck, Sparkles, Layers, Cpu, ArrowRight, BarChart2 } from "lucide-react";

export default function HomePage() {
  const [activeView, setActiveView] = useState<"studio" | "clinical">("studio");

  // Clinical state
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [metrics, setMetrics] = useState<EvaluationMetrics>(DEFAULT_METRICS);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  useEffect(() => {
    getModelInfo().then((info) => {
      setModelInfo(info);
      if (info?.metrics) {
        setMetrics(info.metrics);
      }
    });
  }, []);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setPredictionResult(null);

    try {
      const result = await predictUltrasound(file);
      setPredictionResult(result);
    } catch (err: any) {
      console.error("Prediction error:", err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setSelectedPreview(previewUrl);
    setPredictionResult(null);
  };

  const handleSelectSample = async (sample: SampleCase) => {
    setSelectedFile(null);
    setSelectedPreview(sample.imageSrc);
    setPredictionResult(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setSelectedPreview(null);
    setPredictionResult(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100">
      {/* Top Navigation with Mode Switcher */}
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-grow">
        {/* MODE 1: Deep Learning Model Comparison Research Studio */}
        {activeView === "studio" && (
          <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            <ResearchStudio />
          </section>
        )}

        {/* MODE 2: Clinical Ultrasound ViT CADx */}
        {activeView === "clinical" && (
          <div className="animate-in fade-in duration-300">
            {/* Hero Section */}
            <HeroSection />

            {/* Diagnostic Analyzer Section */}
            <section id="analyzer" className="py-12 border-t border-slate-900 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Analyzer Heading */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
                  <div>
                    <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-2">
                      <Activity className="w-3.5 h-3.5 animate-pulse" />
                      <span>Interactive Clinical Inference</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Ultrasound Diagnostic Analysis
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Upload patient scan or select a BUSI sample case to trigger Vision Transformer attention and Grad-CAM localization.
                    </p>
                  </div>

                  {modelInfo && (
                    <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Cpu className="w-4 h-4 text-sky-400" />
                      <span>{modelInfo.architecture}</span>
                    </div>
                  )}
                </div>

                {/* Two-Column Grid: Left Upload, Right Prediction Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-6 space-y-6">
                    <ImageUploader
                      onAnalyze={handleAnalyze}
                      isAnalyzing={isAnalyzing}
                      selectedPreview={selectedPreview}
                      onClear={handleClear}
                      onSelectSample={handleSelectSample}
                      onFileSelect={handleFileSelect}
                    />
                  </div>

                  <div className="lg:col-span-6">
                    {predictionResult ? (
                      <PredictionCard result={predictionResult} />
                    ) : (
                      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
                          <Sparkles className="w-7 h-7 text-cyan-400/80" />
                        </div>
                        <div className="max-w-sm space-y-1">
                          <h3 className="text-base font-semibold text-white">
                            Awaiting Ultrasound Input
                          </h3>
                          <p className="text-xs text-slate-400">
                            Upload an ultrasound image or click one of the sample cases on the left to initiate Vision Transformer classification.
                          </p>
                        </div>

                        <div className="w-full max-w-xs pt-4 space-y-2 border-t border-slate-800/80 text-left text-xs font-mono text-slate-400">
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>Input Resolution: 224 × 224 × 3</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>Token Embeddings: 196 Patches</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>Explainability: LayerNorm Grad-CAM</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grad-CAM Viewer */}
                {predictionResult && (
                  <div className="pt-4 animate-in fade-in duration-500">
                    <GradCamViewer result={predictionResult} />
                  </div>
                )}
              </div>
            </section>

            {/* Held-Out Metrics Dashboard */}
            <MetricsDashboard metrics={metrics} />

            {/* ViT Architecture */}
            <ViTArchitecture />

            {/* BUSI Dataset */}
            <DatasetInfo />

            {/* Disclaimer */}
            <ClinicalDisclaimer />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
