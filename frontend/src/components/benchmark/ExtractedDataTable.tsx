"use client";

import React, { useState, useMemo } from "react";
import {
  ModelBenchmarkItem,
  BenchmarkExtractionResult,
  ArchitectureFamily,
} from "@/types/benchmark";
import {
  Table,
  Search,
  Filter,
  Download,
  Copy,
  Plus,
  Trash2,
  Edit2,
  Check,
  FileSpreadsheet,
  FileCode,
  Sparkles,
} from "lucide-react";
import { exportToCSV, exportToMarkdown, ARCHITECTURE_COLORS } from "@/lib/pareto";

interface ExtractedDataTableProps {
  benchmark: BenchmarkExtractionResult;
  onUpdateModels: (updated: ModelBenchmarkItem[]) => void;
}

export const ExtractedDataTable: React.FC<ExtractedDataTableProps> = ({
  benchmark,
  onUpdateModels,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [familyFilter, setFamilyFilter] = useState<string>("All");
  const [isEditing, setIsEditing] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New model form state
  const [newModel, setNewModel] = useState<Partial<ModelBenchmarkItem>>({
    name: "",
    family: "Transformer",
    top1Accuracy: 85.0,
    top5Accuracy: 97.0,
    paramsM: 50.0,
    flopsG: 10.0,
    latencyMs: 12.0,
    notes: "",
  });

  const families = ["All", "Transformer", "CNN", "Hybrid", "SSM/Mamba", "LLM/Decoder"];

  const filteredModels = useMemo(() => {
    return benchmark.models.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFamily = familyFilter === "All" || m.family === familyFilter;
      return matchesSearch && matchesFamily;
    });
  }, [benchmark.models, searchTerm, familyFilter]);

  const handleCellChange = (id: string, field: keyof ModelBenchmarkItem, value: any) => {
    const updated = benchmark.models.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          [field]: typeof m[field] === "number" ? Number(value) : value,
        };
      }
      return m;
    });
    onUpdateModels(updated);
  };

  const handleDeleteModel = (id: string) => {
    if (confirm("Remove this model from the benchmark?")) {
      const updated = benchmark.models.filter((m) => m.id !== id);
      onUpdateModels(updated);
    }
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name) return;

    const added: ModelBenchmarkItem = {
      id: `custom-${Date.now()}`,
      name: newModel.name,
      family: (newModel.family as ArchitectureFamily) || "Transformer",
      top1Accuracy: Number(newModel.top1Accuracy) || 0,
      top5Accuracy: Number(newModel.top5Accuracy) || undefined,
      paramsM: Number(newModel.paramsM) || 1,
      flopsG: Number(newModel.flopsG) || 1,
      latencyMs: Number(newModel.latencyMs) || 10,
      notes: newModel.notes || "User custom model",
    };

    onUpdateModels([...benchmark.models, added]);
    setShowAddModal(false);
    setNewModel({
      name: "",
      family: "Transformer",
      top1Accuracy: 85.0,
      paramsM: 50.0,
      flopsG: 10.0,
      latencyMs: 12.0,
    });
  };

  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(benchmark);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${benchmark.benchmarkTitle.replace(/\s+/g, "_")}.csv`;
    link.click();
  };

  const handleDownloadJSON = () => {
    const jsonContent = JSON.stringify(benchmark, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${benchmark.benchmarkTitle.replace(/\s+/g, "_")}.json`;
    link.click();
  };

  const handleCopyMarkdown = () => {
    const md = exportToMarkdown(benchmark);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Table className="w-4 h-4 text-cyan-400" />
            <span>Extracted Benchmark Ledger</span>
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">
            Structured Model Parameters & Metrics
          </h4>
          <p className="text-xs text-slate-400">
            Interactive spreadsheet of extracted values. You can edit cells or add custom experimental runs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
              isEditing
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800"
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            <span>{isEditing ? "Finish Editing" : "Edit Values"}</span>
          </button>

          {/* Add Model */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Model</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCSV}
            className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Export JSON */}
          <button
            onClick={handleDownloadJSON}
            className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Download JSON"
          >
            <FileCode className="w-4 h-4 text-sky-400" />
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Copy Markdown Table"
          >
            {copiedMd ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search model name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Family Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {families.map((fam) => (
            <button
              key={fam}
              onClick={() => setFamilyFilter(fam)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                familyFilter === fam
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-900"
              }`}
            >
              {fam}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
              <th className="py-3 px-4">Model Name</th>
              <th className="py-3 px-4">Architecture</th>
              <th className="py-3 px-4 text-right">Top-1 Acc</th>
              <th className="py-3 px-4 text-right">Params</th>
              <th className="py-3 px-4 text-right">FLOPs</th>
              <th className="py-3 px-4 text-right">Latency</th>
              <th className="py-3 px-4 text-center">Pareto</th>
              <th className="py-3 px-4">Notes</th>
              {isEditing && <th className="py-3 px-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredModels.map((m) => (
              <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                {/* Name */}
                <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => handleCellChange(m.id, "name", e.target.value)}
                      className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-white text-xs w-32 focus:border-cyan-400"
                    />
                  ) : (
                    <span>{m.name}</span>
                  )}
                </td>

                {/* Family */}
                <td className="py-2.5 px-4 whitespace-nowrap">
                  {isEditing ? (
                    <select
                      value={m.family}
                      onChange={(e) => handleCellChange(m.id, "family", e.target.value)}
                      className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-xs text-white"
                    >
                      {families
                        .filter((f) => f !== "All")
                        .map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${ARCHITECTURE_COLORS[m.family] || "#64748b"}22`,
                        color: ARCHITECTURE_COLORS[m.family] || "#94a3b8",
                      }}
                    >
                      {m.family}
                    </span>
                  )}
                </td>

                {/* Top-1 Accuracy */}
                <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={m.top1Accuracy}
                      onChange={(e) => handleCellChange(m.id, "top1Accuracy", e.target.value)}
                      className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-emerald-400 text-xs w-16 text-right focus:border-cyan-400"
                    />
                  ) : (
                    `${m.top1Accuracy}%`
                  )}
                </td>

                {/* Params */}
                <td className="py-2.5 px-4 text-right text-slate-300">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={m.paramsM}
                      onChange={(e) => handleCellChange(m.id, "paramsM", e.target.value)}
                      className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-200 text-xs w-16 text-right focus:border-cyan-400"
                    />
                  ) : (
                    `${m.paramsM} M`
                  )}
                </td>

                {/* FLOPs */}
                <td className="py-2.5 px-4 text-right text-slate-300">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={m.flopsG}
                      onChange={(e) => handleCellChange(m.id, "flopsG", e.target.value)}
                      className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-200 text-xs w-16 text-right focus:border-cyan-400"
                    />
                  ) : (
                    `${m.flopsG} G`
                  )}
                </td>

                {/* Latency */}
                <td className="py-2.5 px-4 text-right font-bold text-cyan-400">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={m.latencyMs}
                      onChange={(e) => handleCellChange(m.id, "latencyMs", e.target.value)}
                      className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-cyan-400 text-xs w-16 text-right focus:border-cyan-400"
                    />
                  ) : (
                    `${m.latencyMs} ms`
                  )}
                </td>

                {/* Pareto Badge */}
                <td className="py-2.5 px-4 text-center">
                  {m.isParetoOptimal ? (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold border border-cyan-500/20">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      <span>Optimal</span>
                    </span>
                  ) : (
                    <span className="text-slate-600 text-[10px]">—</span>
                  )}
                </td>

                {/* Notes */}
                <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate">
                  {isEditing ? (
                    <input
                      type="text"
                      value={m.notes || ""}
                      onChange={(e) => handleCellChange(m.id, "notes", e.target.value)}
                      className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300 text-xs w-full focus:border-cyan-400"
                    />
                  ) : (
                    <span>{m.notes || "—"}</span>
                  )}
                </td>

                {/* Actions */}
                {isEditing && (
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => handleDeleteModel(m.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                      title="Delete Model"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <form
            onSubmit={handleAddModel}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Add Model to Benchmark</h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My-Custom-ViT-v1"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Architecture Family</label>
                  <select
                    value={newModel.family}
                    onChange={(e) => setNewModel({ ...newModel, family: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="Transformer">Transformer</option>
                    <option value="CNN">CNN</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="SSM/Mamba">SSM/Mamba</option>
                    <option value="LLM/Decoder">LLM/Decoder</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Top-1 Accuracy (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newModel.top1Accuracy}
                    onChange={(e) => setNewModel({ ...newModel, top1Accuracy: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Latency (ms)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newModel.latencyMs}
                    onChange={(e) => setNewModel({ ...newModel, latencyMs: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Params (M)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newModel.paramsM}
                    onChange={(e) => setNewModel({ ...newModel, paramsM: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">FLOPs (G)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newModel.flopsG}
                    onChange={(e) => setNewModel({ ...newModel, flopsG: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Notes / Quirks</label>
                <input
                  type="text"
                  placeholder="e.g. Trained with AdamW & Cosine Annealing"
                  value={newModel.notes}
                  onChange={(e) => setNewModel({ ...newModel, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold text-xs"
              >
                Add Row
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
