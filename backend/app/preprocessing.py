import io
from typing import Tuple
from PIL import Image
import numpy as np
import torch
from torchvision import transforms
from fastapi import HTTPException, UploadFile, status

from app.config import settings

# Pretrained ViT-B/16 standard evaluation transformations
inference_transforms = transforms.Compose([
    transforms.Resize((settings.IMAGE_SIZE, settings.IMAGE_SIZE), interpolation=transforms.InterpolationMode.BILINEAR),
    transforms.ToTensor(),
    transforms.Normalize(mean=settings.IMAGE_MEAN, std=settings.IMAGE_STD)
])

def validate_image_file(file: UploadFile, contents: bytes) -> None:
    """
    Validate uploaded image file format and size limits.
    """
    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded file exceeds maximum allowed size of {max_mb} MB."
        )
    
    filename = file.filename or ""
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '.{ext}'. Supported formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

def preprocess_image(image_bytes: bytes) -> Tuple[torch.Tensor, np.ndarray, Image.Image]:
    """
    Load ultrasound image, convert to RGB, resize, and prepare:
    1. Normalized PyTorch tensor: (1, 3, 224, 224)
    2. RGB NumPy array (224, 224, 3) with values in [0, 255] for visual overlays
    3. PIL Image
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image file: could not decode image. Error: {str(exc)}"
        )
    
    # Resize PIL image for consistent display & Grad-CAM overlay
    resized_pil = pil_img.resize(
        (settings.IMAGE_SIZE, settings.IMAGE_SIZE),
        resample=Image.Resampling.BILINEAR
    )
    
    # Raw RGB numpy array for blending
    rgb_array = np.array(resized_pil, dtype=np.uint8)
    
    # Normalized tensor for model inference
    tensor = inference_transforms(resized_pil).unsqueeze(0)  # Shape: (1, 3, 224, 224)
    
    return tensor, rgb_array, resized_pil
