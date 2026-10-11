"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  BarChart2,
  Cpu,
  Github,
  Menu,
  X,
  Sparkles,
  Layers,
} from "lucide-react";
import { checkApiHealth } from "@/lib/api";

interface NavbarProps {
  activeView?: "studio" | "clinical";
  onViewChange?: (view: "studio" | "clinical") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView = "studio",
  onViewChange,
}) => {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkApiHealth()
      .then((res) => {
        setBackendStatus(res.status === "healthy" ? "online" : "offline");
      })
      .catch(() => setBackendStatus("offline"));
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-navy-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  DeepBench <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Research Vercel Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Multimodal Image Extraction & Deep Learning Model Comparison
              </p>
            </div>
          </div>

          {/* Center Mode Switcher Tabs */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onViewChange?.("studio")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeView === "studio"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-navy-950 shadow-md shadow-cyan-500/20 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Research Benchmark Studio</span>
            </button>
            <button
              onClick={() => onViewChange?.("clinical")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeView === "clinical"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-navy-950 shadow-md shadow-teal-500/20 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Ultrasound ViT CADx</span>
            </button>
          </div>

          {/* Right Status Pill & Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "online"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-cyan-400"
                }`}
              />
              <span className="text-slate-300">
                {backendStatus === "online" ? "FastAPI Online" : "Vercel Cloud Ready"}
              </span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="View Source"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-4 bg-navy-900/95 border-b border-slate-800 space-y-2 text-sm text-slate-300">
          <button
            onClick={() => {
              onViewChange?.("studio");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center space-x-2 ${
              activeView === "studio"
                ? "bg-cyan-500/20 text-cyan-300 font-bold"
                : "text-slate-300"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Research Benchmark Studio</span>
          </button>
          <button
            onClick={() => {
              onViewChange?.("clinical");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center space-x-2 ${
              activeView === "clinical"
                ? "bg-teal-500/20 text-teal-300 font-bold"
                : "text-slate-300"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Ultrasound ViT Diagnostics</span>
          </button>
        </div>
      )}
    </nav>
  );
};
