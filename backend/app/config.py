import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "SonoVision AI"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = (
        "Production-grade Breast Ultrasound ViT-B/16 Diagnostic & Grad-CAM Explainability API."
    )
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    ARTIFACTS_DIR: Path = BASE_DIR.parent / "artifacts"
    MODEL_WEIGHTS_PATH: Path = ARTIFACTS_DIR / "best_vit_b16_busi.pth"
    METRICS_PATH: Path = ARTIFACTS_DIR / "metrics.json"
    CONFIG_PATH: Path = ARTIFACTS_DIR / "config.json"
    CLASS_MAPPING_PATH: Path = ARTIFACTS_DIR / "class_mapping.json"
    MODEL_DOWNLOAD_URL: str | None = None
    
    # Model Configuration
    IMAGE_SIZE: int = 224
    NUM_CLASSES: int = 3
    CLASS_NAMES: list[str] = ["benign", "malignant", "normal"]
    IMAGE_MEAN: list[float] = [0.485, 0.456, 0.406]
    IMAGE_STD: list[float] = [0.229, 0.224, 0.225]
    
    # Security & Server
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS: set[str] = {"jpg", "jpeg", "png", "bmp", "webp"}
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://sonovision-ai.vercel.app",
        "*"
    ]
    
    # Fallback to CPU if CUDA is not available
    FORCE_CPU: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
