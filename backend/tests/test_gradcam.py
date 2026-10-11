import numpy as np
import torch
from app.model import BUSIViTClassifier
from app.gradcam import ViTGradCAM, create_gradcam_visualization

def test_vit_gradcam_generation():
    model = BUSIViTClassifier(num_classes=3, pretrained=False)
    gradcam = ViTGradCAM(model)
    
    dummy_input = torch.randn(1, 3, 224, 224)
    cam_norm, target_class, probs = gradcam.generate_cam(dummy_input)
    gradcam.remove_hooks()
    
    assert isinstance(cam_norm, np.ndarray)
    assert cam_norm.shape == (224, 224), f"Expected CAM shape (224, 224), got {cam_norm.shape}"
    assert cam_norm.min() >= 0.0 and cam_norm.max() <= 1.0 + 1e-6
    assert 0 <= target_class < 3
    assert probs.shape == (3,)

def test_gradcam_visualization():
    cam_norm = np.random.rand(224, 224).astype(np.float32)
    original_rgb = (np.random.rand(224, 224, 3) * 255).astype(np.uint8)
    
    overlay, heatmap = create_gradcam_visualization(cam_norm, original_rgb, alpha=0.5)
    
    assert overlay.shape == (224, 224, 3)
    assert heatmap.shape == (224, 224, 3)
    assert overlay.dtype == np.uint8
    assert heatmap.dtype == np.uint8
