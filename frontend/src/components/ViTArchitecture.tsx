"use client";

import React from "react";
import { Cpu, Network, Sparkles, ArrowRight, Check, Compass, Layers } from "lucide-react";

export const ViTArchitecture: React.FC = () => {
  return (
    <section id="architecture" className="pt-12 pb-16 bg-navy-950/60 border-t border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-sky-500/30 text-xs font-mono text-sky-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Vision Transformer Architecture</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            ViT-B/16 & Patch-Token Grad-CAM Methodology
          </h2>
          <p className="text-sm text-slate-400">
            Moving beyond localized CNN receptive fields: global self-attention across 196 ultrasound patch tokens.
          </p>
        </div>

        {/* 4-Step Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm border border-cyan-500/20">
              01
            </div>
            <h4 className="text-base font-bold text-white">Patch Tokenization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ultrasound image (224×224×3) is linearly split into a grid of 14×14 non-overlapping patches
              of size 16×16 px. Each patch is linearly projected into a 768-dimensional token embedding.
            </p>
            <div className="text-[11px] font-mono text-cyan-300/80 bg-slate-950 p-2 rounded-lg border border-slate-800">
              196 Patches × 768 Dim
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-sky-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 font-mono font-bold flex items-center justify-center text-sm border border-sky-500/20">
              02
            </div>
            <h4 className="text-base font-bold text-white">[CLS] Token & Position</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A learnable classification token [CLS] is prepended to the sequence (total 197 tokens).
              Learnable 1D spatial position embeddings are added to preserve 2D ultrasound geometry.
            </p>
            <div className="text-[11px] font-mono text-sky-300/80 bg-slate-950 p-2 rounded-lg border border-slate-800">
              Seq Length = 1 + 196 = 197
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-teal-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 font-mono font-bold flex items-center justify-center text-sm border border-teal-500/20">
              03
            </div>
            <h4 className="text-base font-bold text-white">12-Layer Transformer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tokens traverse 12 Transformer Encoder blocks. Each block features Multi-Head Self-Attention
              (12 heads, 64 dim/head), LayerNorm, MLP expansion with GELU, and residual skip connections.
            </p>
            <div className="text-[11px] font-mono text-teal-300/80 bg-slate-950 p-2 rounded-lg border border-slate-800">
              12 Heads • 86M Parameters
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm border border-emerald-500/20">
              04
            </div>
            <h4 className="text-base font-bold text-white">Grad-CAM Spatial Reform</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gradients w.r.t the 12th LayerNorm are extracted. The [CLS] token is decoupled, leaving 196 patch
              vectors. Channel importance weights are computed and reshaped into a 14×14 grid for bilinear upsampling.
            </p>
            <div className="text-[11px] font-mono text-emerald-300/80 bg-slate-950 p-2 rounded-lg border border-slate-800">
              14×14 Grid → 224×224 Overlay
            </div>
          </div>
        </div>

        {/* Technical Deep Dive Comparison Box */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>Why Adapting Grad-CAM for Vision Transformers is Critical</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-mono text-rose-400 font-bold uppercase tracking-wider block">
                Standard CNN Grad-CAM (Incompatible)
              </span>
              <p>
                In standard CNNs (ResNet, VGG, DenseNet), activations at the final layer naturally retain
                2D spatial feature maps <code>(C, H, W)</code>. Applying CNN Grad-CAM naively to a Vision Transformer
                fails completely because ViT outputs an unordered 1D sequence of tokens <code>(Batch, 197, 768)</code>.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-cyan-500/30">
              <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                SonoVision ViT Patch-Token Solution
              </span>
              <p>
                Our implementation intercepts <code>encoder.layers[-1].ln_1</code>. We explicitly slice off
                the prepended <code>[CLS]</code> token at index 0, leaving exactly 196 patch tokens. We calculate
                channel weights across patches, compute weighted linear combinations, and fold the 196 tokens
                back into their topological 2D spatial arrangement of <code>14 × 14</code> before bilinear interpolation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
