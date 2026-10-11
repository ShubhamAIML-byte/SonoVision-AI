import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "SonoVision AI"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data

def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "Vision Transformer ViT-B/16"
    assert data["num_classes"] == 3
    assert "metrics" in data
    assert "accuracy" in data["metrics"]

def test_predict_endpoint_valid_image():
    # Create a synthetic ultrasound-like image
    img = Image.new("RGB", (256, 256), color=(40, 40, 40))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    response = client.post(
        "/predict",
        files={"file": ("test_ultrasound.png", buf, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_class"] in ["benign", "malignant", "normal"]
    assert 0.0 <= data["confidence"] <= 1.0
    assert "gradcam_base64" in data
    assert data["gradcam_base64"].startswith("data:image/png;base64,")
    assert "heatmap_base64" in data
    assert "original_base64" in data
    assert "probabilities" in data
    assert len(data["probabilities"]) == 3
    assert "explanation" in data
    assert data["patch_token_count"] == 196

def test_predict_endpoint_invalid_file():
    txt_data = io.BytesIO(b"not an image")
    response = client.post(
        "/predict",
        files={"file": ("notes.txt", txt_data, "text/plain")}
    )
    assert response.status_code == 400
