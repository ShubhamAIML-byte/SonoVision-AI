"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw, CheckCircle2, Play } from "lucide-react";
import { SAMPLE_CASES, SampleCase } from "@/lib/sampleData";

interface ImageUploaderProps {
  onAnalyze: (file: File) => Promise<void>;
  isAnalyzing: boolean;
  selectedPreview: string | null;
  onClear: () => void;
  onSelectSample: (sample: SampleCase) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onAnalyze,
  isAnalyzing,
  selectedPreview,
  onClear,
  onSelectSample,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/bmp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Please upload a valid ultrasound image file (PNG, JPG, or JPEG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds maximum limit of 10 MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Parent preview is updated or local
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !selectedPreview) return;

    try {
      setAnalysisStep(1);
      const timer1 = setTimeout(() => setAnalysisStep(2), 500);
      const timer2 = setTimeout(() => setAnalysisStep(3), 1200);

      if (selectedFile) {
        await onAnalyze(selectedFile);
      } else if (selectedPreview) {
        // Fetch sample blob and convert to File
        const res = await fetch(selectedPreview);
        const blob = await res.blob();
        const file = new File([blob], "sample_scan.png", { type: "image/png" });
        await onAnalyze(file);
      }

      clearTimeout(timer1);
      clearTimeout(timer2);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze image.");
    } finally {
      setAnalysisStep(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
          dragActive
            ? "border-cyan-400 bg-cyan-950/20"
            : selectedPreview
            ? "border-slate-700 bg-slate-900/40"
            : "border-slate-800 bg-slate-900/30 hover:border-slate-700"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleChange}
          className="hidden"
        />

        {selectedPreview ? (
          <div className="p-6 flex flex-col items-center">
            {/* Image Preview with Ultrasound HUD Scanner */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black max-w-sm w-full aspect-square flex items-center justify-center shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreview}
                alt="Ultrasound Preview"
                className="w-full h-full object-contain"
              />

              {/* Scanning Laser Beam Line during Inference */}
              {isAnalyzing && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scan" />
              )}

              {/* Ultrasound Medical Metadata Watermark */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                BUSI 224×224 • RGB
              </div>
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                196 ViT Patches
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Scan...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run ViT Diagnostic Analysis</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  onClear();
                }}
                disabled={isAnalyzing}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium transition-colors text-sm disabled:opacity-50"
              >
                Change Scan
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Upload Breast Ultrasound Scan
            </h3>
            <p className="mt-1 text-sm text-slate-400 max-w-sm">
              Drag & drop your B-mode ultrasound image, or browse your device. Supported formats: PNG, JPG, JPEG (Max 10MB).
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-colors shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Browse Image File</span>
            </button>
          </div>
        )}
      </div>

      {/* Analysis Progress Stages */}
      {isAnalyzing && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
            <span>ViT-B/16 INFERENCE PIPELINE</span>
            <span>{analysisStep === 1 ? "30%" : analysisStep === 2 ? "70%" : "95%"}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-sky-400 h-full transition-all duration-500"
              style={{ width: analysisStep === 1 ? "30%" : analysisStep === 2 ? "70%" : "95%" }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {analysisStep === 1
              ? "Resizing to 224×224 and applying ImageNet pretrained normalization..."
              : analysisStep === 2
              ? "Executing 12 Transformer Encoder layers with 12-head Self-Attention..."
              : "Backpropagating class gradient to patch tokens & synthesizing 14×14 Grad-CAM..."}
          </p>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Analysis Error</p>
            <p className="text-xs text-rose-400/90 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 1-Click Sample Scans Gallery */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Or Test With Sample BUSI Ultrasound Scans:
          </span>
          <span className="text-[11px] text-cyan-400 font-mono">1-Click Test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_CASES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setErrorMsg(null);
                setSelectedFile(null);
                onSelectSample(sample);
              }}
              disabled={isAnalyzing}
              className="group text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center space-x-3 disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-slate-700 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.imageSrc}
                  alt={sample.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sample.category === "benign"
                        ? "bg-emerald-400"
                        : sample.category === "malignant"
                        ? "bg-rose-400"
                        : "bg-sky-400"
                    }`}
                  />
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {sample.label}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {sample.category.toUpperCase()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
