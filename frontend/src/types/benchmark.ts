export type ArchitectureFamily =
  | "Transformer"
  | "CNN"
  | "Hybrid"
  | "SSM/Mamba"
  | "LLM/Decoder"
  | "Other";

export interface ModelBenchmarkItem {
  id: string;
  name: string;
  family: ArchitectureFamily;
  top1Accuracy: number; // e.g. 84.5 (%)
  top5Accuracy?: number; // e.g. 96.8 (%)
  f1Score?: number; // e.g. 84.1 (%)
  paramsM: number; // e.g. 86.6 (Million parameters)
  flopsG: number; // e.g. 17.6 (GFLOPs)
  latencyMs: number; // e.g. 14.2 (ms)
  throughput?: number; // e.g. 840 (img/s or tokens/s)
  memoryMB?: number; // e.g. 420 (MB)
  isParetoOptimal?: boolean;
  isBaseline?: boolean;
  notes?: string;
  color?: string;
}

export interface ResearchInsight {
  title: string;
  description: string;
  type: "tradeoff" | "efficiency" | "scaling" | "recommendation";
}

export interface DeploymentMatrix {
  edge: string;
  cloudRealtime: string;
  highCapacity: string;
}

export interface BenchmarkExtractionResult {
  benchmarkTitle: string;
  taskType: string;
  dataset: string;
  metricUnit: {
    primary: string;
    secondary?: string;
    efficiency: string;
    compute: string;
    size: string;
  };
  hardwareTarget: string;
  dateExtracted?: string;
  models: ModelBenchmarkItem[];
  executiveSummary: string;
  architecturalTradeoffs: ResearchInsight[];
  deploymentRecommendations: DeploymentMatrix;
  rawImagePreview?: string;
  sourceConfidence: number;
  extractionMethod: "gemini-vision" | "pattern-parser" | "preset-verified";
}

export interface ApiKeyConfig {
  geminiApiKey: string;
  model: string;
}
