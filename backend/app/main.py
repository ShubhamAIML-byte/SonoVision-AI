import time
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.model import load_busi_model, get_device
from app.preprocessing import validate_image_file, preprocess_image
from app.gradcam import ViTGradCAM, create_gradcam_visualization
from app.schemas import (
    HealthResponse,
    ModelInfoResponse,
    PredictionResponse,
    ClassProbability,
)
from app.utils import (
    numpy_to_base64_png,
    generate_clinical_explanation,
    get_risk_level,
    load_metrics_data,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger("sonovision-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan: Warm up the Vision Transformer on startup
    """
    logger.info("Initializing SonoVision AI Backend...")
    try:
        load_busi_model()
        logger.info("ViT-B/16 model loaded and ready for inference.")
    except Exception as e:
        logger.error(f"Error during model initialization: {e}")
    yield
    logger.info("Shutting down SonoVision AI Backend.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
async def root():
    return {
        "project": "SonoVision AI",
        "description": "Production Breast Ultrasound Diagnostic & Explainability API using Vision Transformer (ViT-B/16)",
        "docs": "/docs",
        "health": "/health",
        "model_info": "/model-info",
        "predict": "/predict (POST)"
    }

@app.get("/health", response_model=HealthResponse, tags=["Diagnostics"])
async def health_check():
    import torch
    model, device = load_busi_model()
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        model_loaded=model is not None,
        device=str(device),
        gpu_available=torch.cuda.is_available()
    )

@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model Info"])
async def get_model_info():
    model, device = load_busi_model()
    metrics = load_metrics_data()
    return ModelInfoResponse(
        model_name="Vision Transformer ViT-B/16",
        architecture="ViT-B/16 (12 Transformer Encoder Blocks, 12 Attention Heads, 768 Hidden Dim)",
        num_classes=settings.NUM_CLASSES,
        classes=settings.CLASS_NAMES,
        image_size=[settings.IMAGE_SIZE, settings.IMAGE_SIZE],
        device=str(device),
        patch_size=16,
        total_patches=196,
        hidden_dimension=768,
        encoder_layers=12,
        attention_heads=12,
        metrics=metrics,
        explainability_method="ViT Patch-Token Gradient-Weighted Class Activation Mapping (Grad-CAM)",
        status="Operational"
    )

@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict_breast_ultrasound(file: UploadFile = File(...)):
    """
    Predict breast ultrasound diagnosis and generate Vision Transformer Grad-CAM explainability.
    
    Accepts: JPG, JPEG, PNG image.
    Returns:
    - Predicted class (benign, malignant, normal)
    - Confidence & class probabilities
    - Risk category
    - Base64 encoded Grad-CAM overlay, raw heatmap, and processed ultrasound
    - Clinical explanation
    - Latency in milliseconds
    """
    start_time = time.perf_counter()
    
    # 1. Read & Validate Upload
    contents = await file.read()
    validate_image_file(file, contents)
    
    # 2. Preprocess Image
    tensor, rgb_array, _ = preprocess_image(contents)
    
    model, device = load_busi_model()
    input_tensor = tensor.to(device)

    # 3. Vision Transformer Grad-CAM Generation
    gradcam = ViTGradCAM(model)
    try:
        cam_norm, target_class_idx, probabilities_tensor = gradcam.generate_cam(input_tensor)
    finally:
        gradcam.remove_hooks()
        
    probs = probabilities_tensor.cpu().numpy().tolist()
    class_names = settings.CLASS_NAMES
    pred_class = class_names[target_class_idx]
    confidence = float(probs[target_class_idx])

    prob_dict = {class_names[i]: float(probs[i]) for i in range(len(class_names))}
    
    # Ranked probabilities
    ranked = sorted(
        [
            ClassProbability(
                label=k.capitalize(),
                probability=round(v, 4),
                percentage=f"{v * 100:.1f}%"
            )
            for k, v in prob_dict.items()
        ],
        key=lambda x: x.probability,
        reverse=True
    )

    # 4. Generate Visualizations
    overlay_rgb, heatmap_rgb = create_gradcam_visualization(
        cam_norm=cam_norm,
        original_rgb=rgb_array,
        alpha=0.55
    )

    overlay_b64 = numpy_to_base64_png(overlay_rgb)
    heatmap_b64 = numpy_to_base64_png(heatmap_rgb)
    original_b64 = numpy_to_base64_png(rgb_array)

    # 5. Diagnostic Summary & Response
    inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    risk_level = get_risk_level(pred_class, confidence)
    explanation = generate_clinical_explanation(pred_class, confidence)

    return PredictionResponse(
        predicted_class=pred_class,
        confidence=round(confidence, 4),
        risk_level=risk_level,
        probabilities=prob_dict,
        ranked_probabilities=ranked,
        gradcam_base64=overlay_b64,
        heatmap_base64=heatmap_b64,
        original_base64=original_b64,
        inference_time_ms=inference_time_ms,
        patch_token_count=196,
        explanation=explanation,
        model_name="Vision Transformer (ViT-B/16)"
    )
