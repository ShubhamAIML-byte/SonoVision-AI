import { ModelBenchmarkItem, BenchmarkExtractionResult } from "@/types/benchmark";

/**
 * Computes Pareto-optimal models given objective X (to minimize: latency, params, flops)
 * and objective Y (to maximize: accuracy, F1, throughput).
 */
export function computeParetoOptimal(
  models: ModelBenchmarkItem[],
  metricX: "latencyMs" | "paramsM" | "flopsG",
  metricY: "top1Accuracy" | "f1Score"
): ModelBenchmarkItem[] {
  return models.map((m, _, arr) => {
    // A model is strictly dominated if another model is >= on Y and <= on X, with at least one strict inequality.
    const isDominated = arr.some((other) => {
      if (other.id === m.id) return false;
      const yOther = other[metricY] ?? 0;
      const yCurrent = m[metricY] ?? 0;
      const xOther = other[metricX] ?? 0;
      const xCurrent = m[metricX] ?? 0;

      const yBetterOrEqual = yOther >= yCurrent;
      const xBetterOrEqual = xOther <= xCurrent;
      const strictlyBetter = yOther > yCurrent || xOther < xCurrent;

      return yBetterOrEqual && xBetterOrEqual && strictlyBetter;
    });

    return {
      ...m,
      isParetoOptimal: !isDominated,
    };
  });
}

/**
 * Gets sorted Pareto frontier points for line visualization.
 */
export function getParetoFrontierPoints(
  models: ModelBenchmarkItem[],
  metricX: "latencyMs" | "paramsM" | "flopsG",
  metricY: "top1Accuracy" | "f1Score"
): { x: number; y: number; name: string }[] {
  const paretoModels = computeParetoOptimal(models, metricX, metricY).filter(
    (m) => m.isParetoOptimal
  );

  // Sort by X ascending
  return paretoModels
    .map((m) => ({
      x: m[metricX],
      y: m[metricY] ?? 0,
      name: m.name,
    }))
    .sort((a, b) => a.x - b.x);
}

/**
 * Normalizes metrics across 5 dimensions (0-100) for radar charts.
 */
export function computeRadarDimensions(models: ModelBenchmarkItem[]) {
  if (models.length === 0) return [];

  const minMax = (key: keyof ModelBenchmarkItem) => {
    const vals = models.map((m) => (m[key] as number) || 0);
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
    };
  };

  const accRange = minMax("top1Accuracy");
  const latRange = minMax("latencyMs");
  const paramRange = minMax("paramsM");
  const flopRange = minMax("flopsG");
  const f1Range = minMax("f1Score");

  const normalizeMax = (val: number, range: { min: number; max: number }) => {
    if (range.max === range.min) return 75;
    return Math.max(10, Math.min(100, Math.round(((val - range.min) / (range.max - range.min)) * 90 + 10)));
  };

  // For latency, params, flops: lower is better (inverted efficiency)
  const normalizeMin = (val: number, range: { min: number; max: number }) => {
    if (range.max === range.min) return 75;
    return Math.max(10, Math.min(100, Math.round(((range.max - val) / (range.max - range.min)) * 90 + 10)));
  };

  const dimensions = [
    { subject: "Top-1 Accuracy", key: "acc" },
    { subject: "Latency Efficiency", key: "latency" },
    { subject: "Param Efficiency", key: "params" },
    { subject: "Compute (FLOP) Efficiency", key: "flops" },
    { subject: "Task F1 / Robustness", key: "f1" },
  ];

  return dimensions.map((dim) => {
    const row: Record<string, any> = { dimension: dim.subject };
    models.forEach((m) => {
      if (dim.key === "acc") {
        row[m.id] = normalizeMax(m.top1Accuracy, accRange);
      } else if (dim.key === "latency") {
        row[m.id] = normalizeMin(m.latencyMs, latRange);
      } else if (dim.key === "params") {
        row[m.id] = normalizeMin(m.paramsM, paramRange);
      } else if (dim.key === "flops") {
        row[m.id] = normalizeMin(m.flopsG, flopRange);
      } else if (dim.key === "f1") {
        row[m.id] = normalizeMax(m.f1Score || m.top1Accuracy, f1Range.max > 0 ? f1Range : accRange);
      }
    });
    return row;
  });
}

/**
 * Color mapping for architecture families.
 */
export const ARCHITECTURE_COLORS: Record<string, string> = {
  Transformer: "#06b6d4", // Cyan
  CNN: "#10b981", // Emerald
  Hybrid: "#a855f7", // Purple
  "SSM/Mamba": "#f59e0b", // Amber
  "LLM/Decoder": "#ec4899", // Pink
  Other: "#64748b", // Slate
};

/**
 * Generate CSV export text.
 */
export function exportToCSV(benchmark: BenchmarkExtractionResult): string {
  const headers = [
    "Model Name",
    "Family",
    "Top-1 Accuracy (%)",
    "Top-5 Accuracy (%)",
    "F1 Score (%)",
    "Parameters (M)",
    "FLOPs (G)",
    "Latency (ms)",
    "Throughput (samples/s)",
    "Pareto Optimal",
    "Notes",
  ];

  const rows = benchmark.models.map((m) => [
    `"${m.name}"`,
    `"${m.family}"`,
    m.top1Accuracy,
    m.top5Accuracy ?? "",
    m.f1Score ?? "",
    m.paramsM,
    m.flopsG,
    m.latencyMs,
    m.throughput ?? "",
    m.isParetoOptimal ? "Yes" : "No",
    `"${m.notes ?? ""}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generate GitHub Markdown Table.
 */
export function exportToMarkdown(benchmark: BenchmarkExtractionResult): string {
  const lines = [
    `### 📊 Benchmark: ${benchmark.benchmarkTitle}`,
    `**Dataset:** ${benchmark.dataset} | **Hardware:** ${benchmark.hardwareTarget}`,
    "",
    "| Model | Family | Top-1 Acc (%) | Params (M) | FLOPs (G) | Latency (ms) | Pareto |",
    "| :--- | :--- | :---: | :---: | :---: | :---: | :---: |",
  ];

  benchmark.models.forEach((m) => {
    lines.push(
      `| **${m.name}** | \`${m.family}\` | ${m.top1Accuracy}% | ${m.paramsM}M | ${m.flopsG}G | ${m.latencyMs}ms | ${m.isParetoOptimal ? "⭐ Optimal" : "—"} |`
    );
  });

  lines.push("");
  lines.push(`> *Extracted via DeepBench Vision Extraction Engine*`);
  return lines.join("\n");
}
