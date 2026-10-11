import os
import logging
from pathlib import Path
from typing import Optional, Tuple
import torch
import torch.nn as nn
from torchvision.models import vit_b_16, ViT_B_16_Weights

from app.config import settings

logger = logging.getLogger(__name__)

class BUSIViTClassifier(nn.Module):
    """
    Vision Transformer (ViT-B/16) fine-tuned for BUSI 3-class classification
    (benign, malignant, normal).
    """
    def __init__(self, num_classes: int = 3, pretrained: bool = True):
        super().__init__()
        weights = ViT_B_16_Weights.DEFAULT if pretrained else None
        self.vit = vit_b_16(weights=weights)
        
        # Replace the final linear head with 3-class classifier
        in_features = self.vit.heads.head.in_features
        self.vit.heads.head = nn.Linear(in_features, num_classes)
        
        # Store architecture details
        self.num_classes = num_classes
        self.patch_size = 16
        self.grid_size = settings.IMAGE_SIZE // self.patch_size  # 224 // 16 = 14
        self.num_patches = self.grid_size * self.grid_size       # 14 * 14 = 196
        self.hidden_dim = in_features                            # 768

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.vit(x)

    def get_last_encoder_layer(self) -> nn.Module:
        """
        Return the final encoder layer of ViT for Grad-CAM patch token hooking.
        """
        # In torchvision, encoder layers are stored in self.vit.encoder.layers
        # Index 11 is the 12th (last) encoder block
        return self.vit.encoder.layers[-1].ln_1

_model_cache: Optional[Tuple[nn.Module, torch.device]] = None

def get_device() -> torch.device:
    if settings.FORCE_CPU or not torch.cuda.is_available():
        return torch.device("cpu")
    return torch.device("cuda")

def load_busi_model() -> Tuple[nn.Module, torch.device]:
    """
    Load or initialize the ViT-B/16 model.
    Checks artifacts/best_vit_b16_busi.pth; if present, loads state dict.
    Otherwise initializes pre-trained ViT-B/16.
    """
    global _model_cache
    if _model_cache is not None:
        return _model_cache

    device = get_device()
    logger.info(f"Initializing ViT-B/16 on device: {device}")
    
    weights_path = Path(settings.MODEL_WEIGHTS_PATH)
    
    if not weights_path.exists() and settings.MODEL_DOWNLOAD_URL:
        logger.info(f"Downloading model weights from {settings.MODEL_DOWNLOAD_URL}...")
        try:
            import urllib.request
            weights_path.parent.mkdir(parents=True, exist_ok=True)
            urllib.request.urlretrieve(settings.MODEL_DOWNLOAD_URL, str(weights_path))
            logger.info(f"Downloaded weights successfully to {weights_path}")
        except Exception as dl_err:
            logger.warning(f"Failed to download weights from URL: {dl_err}")

    model = BUSIViTClassifier(num_classes=settings.NUM_CLASSES, pretrained=True)
    
    if weights_path.exists():
        logger.info(f"Loading custom fine-tuned weights from {weights_path}")
        try:
            state_dict = torch.load(weights_path, map_location=device, weights_only=True)
            if "model_state_dict" in state_dict:
                state_dict = state_dict["model_state_dict"]
            model.load_state_dict(state_dict)
            logger.info("Successfully loaded fine-tuned BUSI weights.")
        except Exception as e:
            logger.warning(f"Could not load weights from {weights_path}: {e}. Falling back to initialized ViT.")
    else:
        logger.info(f"No custom weights found at {weights_path}. Running with ImageNet-pretrained ViT backbone.")
    
    model.to(device)
    model.eval()
    _model_cache = (model, device)
    return model, device
