import pytest
import torch
from app.model import BUSIViTClassifier

def test_vit_classifier_forward():
    model = BUSIViTClassifier(num_classes=3, pretrained=False)
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    with torch.no_grad():
        output = model(dummy_input)
    
    assert output.shape == (1, 3), f"Expected shape (1, 3), got {output.shape}"

def test_vit_last_encoder_layer():
    model = BUSIViTClassifier(num_classes=3, pretrained=False)
    layer = model.get_last_encoder_layer()
    assert layer is not None
    assert isinstance(layer, torch.nn.LayerNorm)
