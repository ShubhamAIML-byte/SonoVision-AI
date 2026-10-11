from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

class ClassProbability(BaseModel):
    label: str
    probability: float
    percentage: str

class PredictionResponse(BaseModel):
    predicted_class: str = Field(..., description="Predicted class: benign, malignant, or normal")
    confidence: float = Field(..., description="Prediction confidence score between 0 and 1")
    risk_level: str = Field(..., description="Clinical risk category: Low, High/Suspicious, or Normal")
    probabilities: Dict[str, float] = Field(..., description="Probabilities for each class")
    ranked_probabilities: List[ClassProbability] = Field(..., description="Ranked probabilities with formatted percentages")
    gradcam_base64: str = Field(..., description="Base64 encoded Grad-CAM overlay image")
    heatmap_base64: str = Field(..., description="Base64 encoded raw thermal heatmap")
    original_base64: str = Field(..., description="Base64 encoded normalized original image")
    inference_time_ms: float = Field(..., description="Total inference time in milliseconds")
    patch_token_count: int = Field(196, description="Number of ViT 16x16 patch tokens (14x14)")
    explanation: str = Field(..., description="Clinical interpretation of attention localization")
    model_name: str = Field("Vision Transformer (ViT-B/16)", description="Architecture name")

class MetricDetails(BaseModel):
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    roc_auc_macro: float
    per_class: Dict[str, Dict[str, float]]
    confusion_matrix: List[List[int]]

class ModelInfoResponse(BaseModel):
    model_name: str
    architecture: str
    num_classes: int
    classes: List[str]
    image_size: List[int]
    device: str
    patch_size: int
    total_patches: int
    hidden_dimension: int
    encoder_layers: int
    attention_heads: int
    metrics: Dict[str, Any]
    explainability_method: str
    status: str

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    model_loaded: bool
    device: str
    gpu_available: bool
