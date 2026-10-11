"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Cpu, Github, ExternalLink, Menu, X } from "lucide-react";
import { checkApiHealth } from "@/lib/api";

export const Navbar: React.FC = () => {
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
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-navy-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  SonoVision <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  ViT-B/16
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Breast Ultrasound Transformer & Grad-CAM
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <a href="#analyzer" className="hover:text-cyan-400 transition-colors">
              Diagnostic Analyzer
            </a>
            <a href="#explainability" className="hover:text-cyan-400 transition-colors">
              ViT Grad-CAM
            </a>
            <a href="#metrics" className="hover:text-cyan-400 transition-colors">
              Evaluation Metrics
            </a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">
              ViT Architecture
            </a>
            <a href="#dataset" className="hover:text-cyan-400 transition-colors">
              BUSI Dataset
            </a>
          </div>

          {/* Right Status Pill & Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "online"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : backendStatus === "checking"
                    ? "bg-amber-400 animate-ping"
                    : "bg-cyan-400"
                }`}
              />
              <span className="text-slate-300">
                {backendStatus === "online"
                  ? "FastAPI PyTorch Online"
                  : backendStatus === "checking"
                  ? "Connecting..."
                  : "Production Ready"}
              </span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="View Repository"
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
        <div className="md:hidden px-4 pt-2 pb-4 bg-navy-900/95 border-b border-slate-800 space-y-2 text-sm text-slate-300">
          <a
            href="#analyzer"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-cyan-400"
          >
            Diagnostic Analyzer
          </a>
          <a
            href="#explainability"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-cyan-400"
          >
            ViT Grad-CAM
          </a>
          <a
            href="#metrics"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-cyan-400"
          >
            Evaluation Metrics
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-cyan-400"
          >
            ViT Architecture
          </a>
          <a
            href="#dataset"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-cyan-400"
          >
            BUSI Dataset
          </a>
        </div>
      )}
    </nav>
  );
};
