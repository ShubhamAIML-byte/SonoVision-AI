import { PredictionResult, ModelInfo } from "@/types";
import { DEFAULT_METRICS } from "./sampleData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkApiHealth(): Promise<{ status: string; device: string; model_loaded: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return {
      status: "offline",
      device: "client-fallback",
      model_loaded: false,
    };
  }
}

export async function getModelInfo(): Promise<ModelInfo> {
  try {
    const res = await fetch(`${API_BASE_URL}/model-info`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Return baseline if API is down
  }

  return {
    model_name: "Vision Transformer ViT-B/16",
    architecture: "ViT-B/16 (12 Transformer Encoder Blocks, 12 Attention Heads, 768 Hidden Dim)",
    num_classes: 3,
    classes: ["benign", "malignant", "normal"],
    image_size: [224, 224],
    device: "PyTorch 2.x",
    patch_size: 16,
    total_patches: 196,
    hidden_dimension: 768,
    encoder_layers: 12,
    attention_heads: 12,
    metrics: DEFAULT_METRICS,
    explainability_method: "ViT Patch-Token Gradient-Weighted Class Activation Mapping (Grad-CAM)",
    status: "Operational"
  };
}

export async function predictUltrasound(file: File | Blob): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file, (file as File).name || "scan.png");

  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson.detail || `Inference error: HTTP ${res.status}`;
      throw new Error(msg);
    }

    return await res.json();
  } catch (error: any) {
    // If backend is unreachable, throw or provide helpful network message
    if (error.message && error.message.includes("Failed to fetch")) {
      throw new Error(
        `Could not connect to SonoVision AI backend at ${API_BASE_URL}. Ensure the FastAPI server is running (port 8000).`
      );
    }
    throw error;
  }
}
