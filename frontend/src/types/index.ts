export type DiagnosticClass = "benign" | "malignant" | "normal";

export interface ClassProbability {
  label: string;
  probability: number;
  percentage: string;
}

export interface PredictionResult {
  predicted_class: DiagnosticClass;
  confidence: number;
  risk_level: string;
  probabilities: Record<DiagnosticClass, number>;
  ranked_probabilities: ClassProbability[];
  gradcam_base64: string;
  heatmap_base64: string;
  original_base64: string;
  inference_time_ms: number;
  patch_token_count: number;
  explanation: string;
  model_name: string;
}

export interface PerClassMetric {
  support: number;
  precision: number;
  recall: number;
  sensitivity: number;
  specificity: number;
  f1_score: number;
  roc_auc: number;
}

export interface RocCurveData {
  fpr: number[];
  tpr: number[];
  auc: number;
}

export interface TrainingHistory {
  epochs: number[];
  train_loss: number[];
  val_loss: number[];
  val_accuracy?: number[];
}

export interface EvaluationMetrics {
  dataset: string;
  total_samples: number;
  splits: {
    train: number;
    validation: number;
    test: number;
  };
  overall: {
    accuracy: number;
    precision_macro: number;
    recall_macro: number;
    f1_macro: number;
    specificity_macro: number;
    roc_auc_macro: number;
  };
  per_class: Record<DiagnosticClass, PerClassMetric>;
  confusion_matrix: number[][];
  confusion_matrix_labels: DiagnosticClass[];
  roc_curves: Record<DiagnosticClass, RocCurveData>;
  training_history: TrainingHistory;
}

export interface ModelInfo {
  model_name: string;
  architecture: string;
  num_classes: number;
  classes: DiagnosticClass[];
  image_size: number[];
  device: string;
  patch_size: number;
  total_patches: number;
  hidden_dimension: number;
  encoder_layers: number;
  attention_heads: number;
  metrics: EvaluationMetrics;
  explainability_method: string;
  status: string;
}
