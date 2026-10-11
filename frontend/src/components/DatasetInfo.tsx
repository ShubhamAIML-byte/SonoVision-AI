"use client";

import React from "react";
import { Database, ShieldCheck, Filter, AlertTriangle, Layers, BookOpen } from "lucide-react";

export const DatasetInfo: React.FC = () => {
  return (
    <section id="dataset" className="pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-teal-500/30 text-xs font-mono text-teal-400">
            <Database className="w-3.5 h-3.5" />
            <span>Clinical Dataset Specifications</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            BUSI (Breast Ultrasound Images) Dataset
          </h2>
          <p className="text-sm text-slate-400">
            Comprehensive baseline ultrasound imaging repository collected from 600 female patients.
          </p>
        </div>

        {/* 3 Classes Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400">Class 0</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                56.0% of Dataset
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Benign Pathology</h3>
            <div className="text-3xl font-black text-emerald-400 font-mono">437 Scans</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Well-circumscribed lesions exhibiting uniform internal echogenicity, oval/round contours,
              and posterior acoustic enhancement. Common etiologies include fibroadenomas and cysts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-rose-400">Class 1</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">
                26.9% of Dataset
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Malignant Lesions</h3>
            <div className="text-3xl font-black text-rose-400 font-mono">210 Scans</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Invasive solid masses displaying microlobulated or spiculated margins, taller-than-wide geometry,
              hypoechoic acoustic architecture, and dense posterior acoustic shadowing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-sky-400">Class 2</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300">
                17.1% of Dataset
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Normal Parenchyma</h3>
            <div className="text-3xl font-black text-sky-400 font-mono">133 Scans</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Healthy fibroglandular breast tissue demonstrating continuous fascial planes, subcutaneous fat
              lobules, and absence of focal acoustic abnormalities or architectural distortion.
            </p>
          </div>
        </div>

        {/* Data Leakage Prevention Details */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 text-sm font-bold">
            <Filter className="w-4 h-4" />
            <span>Strict Data Leakage Prevention Protocol</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mask Exclusion Hygiene</span>
              </div>
              <p className="text-slate-400">
                The raw BUSI distribution contains ground-truth segmentation masks named with <code>_mask.png</code>.
                Our custom dataset loader strips all mask files during ingestion, guaranteeing the Vision Transformer
                learns solely from raw acoustic textures.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Stratified Splitting (70% / 10% / 20%)</span>
              </div>
              <p className="text-slate-400">
                Train (546), validation (78), and test (156) partitions are strictly stratified across all 3 classes.
                No multi-frame scans from the same lesion exist across distinct sets, ensuring zero test contamination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
