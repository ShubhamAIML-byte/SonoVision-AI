from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_synthetic_ultrasound(category: str, size: int = 256) -> Image.Image:
    """
    Generate synthetic ultrasound scan with acoustic speckle noise
    and class-characteristic echogenicity:
    - Benign: Well-circumscribed, oval, hypoechoic mass with smooth boundaries
    - Malignant: Irregular, microlobulated/spiculated, non-uniform lesion with acoustic shadowing
    - Normal: Diffuse fibrous glandular parenchyma with layered horizontal fascial planes
    """
    np.random.seed(42 if category == "benign" else (101 if category == "malignant" else 202))
    
    # Base parenchymal background with ultrasound speckle (Rayleigh-like distribution)
    base_speckle = np.random.rayleigh(scale=45, size=(size, size)).clip(0, 255).astype(np.uint8)
    
    # Horizontal tissue strata (skin, subcutaneous fat, fibroglandular tissue, retro-mammary fascia)
    y_coords = np.linspace(0, 1, size).reshape(size, 1)
    strata = (np.sin(y_coords * 12.0) * 15 + 100).astype(np.uint8)
    background = ((base_speckle.astype(np.float32) * 0.7) + (strata.astype(np.float32) * 0.3)).clip(0, 255).astype(np.uint8)
    
    img = Image.fromarray(background).convert("L")
    draw = ImageDraw.Draw(img)
    
    center_x, center_y = size // 2, size // 2
    
    if category == "benign":
        # Smooth, circumscribed hypoechoic oval lesion
        rx, ry = 42, 28
        for r in range(rx, 0, -2):
            val = int(25 + (r / rx) * 35)
            draw.ellipse([center_x - r, center_y - int(r * ry / rx), center_x + r, center_y + int(r * ry / rx)], fill=val)
        # Posterior acoustic enhancement
        enhancement = Image.new("L", (size, size), 0)
        draw_e = ImageDraw.Draw(enhancement)
        draw_e.rectangle([center_x - rx + 5, center_y + ry, center_x + rx - 5, center_y + ry + 45], fill=50)
        enhancement = enhancement.filter(ImageFilter.GaussianBlur(radius=8))
        img = Image.fromarray(np.clip(np.array(img).astype(np.int16) + np.array(enhancement).astype(np.int16), 0, 255).astype(np.uint8))
        
    elif category == "malignant":
        # Irregular, taller-than-wide, micro-lobulated hypoechoic mass
        rx, ry = 32, 46
        # Draw irregular polygon
        angles = np.linspace(0, 2 * np.pi, 24, endpoint=False)
        radii = [rx * (1 + 0.35 * np.sin(3 * a) + 0.2 * np.cos(5 * a) + np.random.uniform(-0.1, 0.1)) for a in angles]
        points = [(center_x + r * np.cos(a), center_y + r * np.sin(a) * (ry / rx)) for a, r in zip(angles, radii)]
        draw.polygon(points, fill=18)
        
        # Dense acoustic shadow beneath the lesion
        shadow = Image.new("L", (size, size), 0)
        draw_s = ImageDraw.Draw(shadow)
        draw_s.polygon([
            (center_x - rx + 8, center_y + ry - 10),
            (center_x + rx - 8, center_y + ry - 10),
            (center_x + rx + 15, size - 10),
            (center_x - rx - 15, size - 10)
        ], fill=55)
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=10))
        img = Image.fromarray(np.clip(np.array(img).astype(np.int16) - np.array(shadow).astype(np.int16), 0, 255).astype(np.uint8))
        
    else:  # normal
        # Healthy glandular parenchyma with linear fascial reflections, no focal solid mass
        for y in range(40, size - 40, 22):
            draw.line([(20, y + np.random.randint(-4, 4)), (size - 20, y + np.random.randint(-4, 4))], fill=175, width=2)
            
    # Add clinical ultrasound frame metadata markings (depth scale markers, focal markers)
    draw = ImageDraw.Draw(img)
    for y in range(20, size - 20, 30):
        draw.line([(size - 12, y), (size - 6, y)], fill=210, width=1)
    
    # Slight blur to mimic medical ultrasound beam spread
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    return img.convert("RGB")

out_dir = Path("artifacts/samples")
out_dir.mkdir(parents=True, exist_ok=True)

for cat in ["benign", "malignant", "normal"]:
    sample_img = create_synthetic_ultrasound(cat)
    sample_img.save(out_dir / f"sample_{cat}.png")
    print(f"Generated sample: {out_dir / f'sample_{cat}.png'}")
