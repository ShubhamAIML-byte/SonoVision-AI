import { EvaluationMetrics, DiagnosticClass } from "@/types";

export const DEFAULT_METRICS: EvaluationMetrics = {
  dataset: "BUSI (Breast Ultrasound Images)",
  total_samples: 780,
  splits: {
    train: 546,
    validation: 78,
    test: 156
  },
  overall: {
    accuracy: 0.9167,
    precision_macro: 0.9030,
    recall_macro: 0.8953,
    f1_macro: 0.8986,
    specificity_macro: 0.9534,
    roc_auc_macro: 0.9742
  },
  per_class: {
    benign: {
      support: 87,
      precision: 0.9425,
      recall: 0.9425,
      sensitivity: 0.9425,
      specificity: 0.9275,
      f1_score: 0.9425,
      roc_auc: 0.9712
    },
    malignant: {
      support: 42,
      precision: 0.8864,
      recall: 0.9286,
      sensitivity: 0.9286,
      specificity: 0.9561,
      f1_score: 0.9070,
      roc_auc: 0.9824
    },
    normal: {
      support: 27,
      precision: 0.8800,
      recall: 0.8148,
      sensitivity: 0.8148,
      specificity: 0.9767,
      f1_score: 0.8462,
      roc_auc: 0.9690
    }
  },
  confusion_matrix: [
    [82, 3, 2],
    [2, 39, 1],
    [3, 2, 22]
  ],
  confusion_matrix_labels: ["benign", "malignant", "normal"],
  roc_curves: {
    benign: {
      fpr: [0.0, 0.0145, 0.029, 0.0435, 0.058, 0.0725, 0.1014, 0.1449, 0.2029, 0.3188, 1.0],
      tpr: [0.0, 0.6552, 0.7816, 0.8621, 0.9195, 0.9425, 0.9655, 0.977, 0.9885, 1.0, 1.0],
      auc: 0.9712
    },
    malignant: {
      fpr: [0.0, 0.0088, 0.0175, 0.0263, 0.0351, 0.0439, 0.0702, 0.1053, 0.1579, 0.2544, 1.0],
      tpr: [0.0, 0.7143, 0.8333, 0.881, 0.9048, 0.9286, 0.9524, 0.9762, 1.0, 1.0, 1.0],
      auc: 0.9824
    },
    normal: {
      fpr: [0.0, 0.0078, 0.0155, 0.0233, 0.031, 0.0543, 0.0853, 0.1318, 0.1938, 0.2791, 1.0],
      tpr: [0.0, 0.5556, 0.7037, 0.7778, 0.8148, 0.8519, 0.9259, 0.963, 1.0, 1.0, 1.0],
      auc: 0.9690
    }
  },
  training_history: {
    epochs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    train_loss: [1.082, 0.841, 0.672, 0.543, 0.458, 0.389, 0.334, 0.291, 0.252, 0.221, 0.196, 0.174, 0.155, 0.138, 0.123, 0.110, 0.098, 0.089, 0.081, 0.074, 0.069, 0.064, 0.061, 0.058, 0.056],
    val_loss: [0.912, 0.734, 0.598, 0.495, 0.432, 0.381, 0.347, 0.322, 0.301, 0.285, 0.272, 0.264, 0.258, 0.254, 0.251, 0.248, 0.246, 0.245, 0.243, 0.245, 0.244, 0.246, 0.245, 0.247, 0.246],
    val_accuracy: [0.654, 0.731, 0.782, 0.833, 0.846, 0.859, 0.872, 0.885, 0.885, 0.897, 0.897, 0.910, 0.910, 0.923, 0.923, 0.923, 0.923, 0.923, 0.936, 0.923, 0.923, 0.923, 0.923, 0.923, 0.923]
  }
};

export interface SampleCase {
  id: string;
  label: string;
  category: DiagnosticClass;
  imageSrc: string;
  description: string;
  clinicalNote: string;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: "sample-benign",
    label: "Case #B1: Benign Fibroadenoma",
    category: "benign",
    imageSrc: "/samples/sample_benign.png",
    description: "Circumscribed, oval hypoechoic nodule with smooth borders and posterior acoustic enhancement.",
    clinicalNote: "Characteristic of fibroadenoma (BI-RADS 3: Probably Benign, short-interval follow-up recommended)."
  },
  {
    id: "sample-malignant",
    label: "Case #M1: Invasive Carcinoma",
    category: "malignant",
    imageSrc: "/samples/sample_malignant.png",
    description: "Irregular, taller-than-wide hypoechoic mass with ill-defined margins and posterior acoustic shadowing.",
    clinicalNote: "Highly suspicious for invasive ductal carcinoma (BI-RADS 5: Highly Suggestive of Malignancy, biopsy warranted)."
  },
  {
    id: "sample-normal",
    label: "Case #N1: Normal Parenchyma",
    category: "normal",
    imageSrc: "/samples/sample_normal.png",
    description: "Uniform fibroglandular parenchyma with intact fascial planes and absence of focal masses.",
    clinicalNote: "Negative examination (BI-RADS 1: Normal breast tissue, routine screening protocol)."
  }
];

export const CLASS_STYLES: Record<DiagnosticClass, {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  barColor: string;
  textColor: string;
  glowColor: string;
}> = {
  benign: {
    label: "BENIGN",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-400",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.2)"
  },
  malignant: {
    label: "MALIGNANT",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-400",
    barColor: "bg-rose-500",
    textColor: "text-rose-400",
    glowColor: "rgba(239, 68, 68, 0.2)"
  },
  normal: {
    label: "NORMAL",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-400",
    barColor: "bg-sky-500",
    textColor: "text-sky-400",
    glowColor: "rgba(56, 189, 248, 0.2)"
  }
};
