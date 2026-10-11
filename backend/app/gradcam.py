from typing import Optional, Tuple
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

class ViTGradCAM:
    """
    Gradient-weighted Class Activation Mapping (Grad-CAM) tailored for
    Vision Transformers (ViT).
    
    ViT processes images as sequences of patch tokens (e.g. 14x14 = 196 patches of 16x16 px)
    prepended with a [CLS] token. This implementation intercepts the final encoder layer tokens,
    extracts the patch-specific gradients and activations (excluding [CLS]), computes channel weights,
    reshapes the weighted patch tokens into a 2D spatial grid (14x14), and bilinearly interpolates
    to the original image resolution (224x224).
    """

    def __init__(self, model: nn.Module, target_layer: Optional[nn.Module] = None):
        self.model = model
        self.target_layer = target_layer
        
        # Default to the first LayerNorm of the final ViT encoder block if not specified
        if self.target_layer is None:
            if hasattr(model, "get_last_encoder_layer"):
                self.target_layer = model.get_last_encoder_layer()
            elif hasattr(model, "vit") and hasattr(model.vit, "encoder"):
                self.target_layer = model.vit.encoder.layers[-1].ln_1
            else:
                # Fallback: search for last LayerNorm or Linear layer in encoder
                for module in reversed(list(model.modules())):
                    if isinstance(module, nn.LayerNorm):
                        self.target_layer = module
                        break
        
        self.activations: Optional[torch.Tensor] = None
        self.gradients: Optional[torch.Tensor] = None
        self.hook_handles = []
        self._register_hooks()

    def _register_hooks(self):
        if self.target_layer is None:
            raise ValueError("Target layer for ViT Grad-CAM could not be found.")

        def forward_hook(module, input_tensor, output_tensor):
            # Output of ViT block or LayerNorm is shape (batch_size, 197, 768)
            self.activations = output_tensor.detach()

        def backward_hook(module, grad_input, grad_output):
            # Gradient w.r.t layer output is shape (batch_size, 197, 768)
            self.gradients = grad_output[0].detach()

        h_fwd = self.target_layer.register_forward_hook(forward_hook)
        h_bwd = self.target_layer.register_full_backward_hook(backward_hook)
        self.hook_handles.extend([h_fwd, h_bwd])

    def generate_cam(
        self,
        input_tensor: torch.Tensor,
        target_class: Optional[int] = None
    ) -> Tuple[np.ndarray, int, torch.Tensor]:
        """
        Compute Grad-CAM for the input tensor.
        
        Returns:
            cam_map: (224, 224) float numpy array in [0, 1]
            target_class: Integer index of the explained class
            probabilities: (num_classes,) float tensor of softmax probabilities
        """
        self.model.eval()
        input_tensor = input_tensor.clone().requires_grad_(True)
        self.model.zero_grad()

        # Forward pass
        logits = self.model(input_tensor)
        probabilities = F.softmax(logits, dim=-1)[0].detach()

        if target_class is None:
            target_class = int(logits.argmax(dim=-1).item())

        # Backward pass for the target class logit
        score = logits[0, target_class]
        score.backward(retain_graph=True)

        if self.activations is None or self.gradients is None:
            raise RuntimeError("Failed to capture activations or gradients from the target ViT layer.")

        # ViT token shape: (1, 197, 768)
        # Token 0 is [CLS]; tokens 1..196 are the 14x14 spatial image patches
        acts = self.activations
        grads = self.gradients

        if acts.dim() == 3 and acts.size(1) == 197:
            patch_acts = acts[:, 1:, :]   # (1, 196, 768)
            patch_grads = grads[:, 1:, :] # (1, 196, 768)
        elif acts.dim() == 3 and acts.size(1) == 196:
            patch_acts = acts
            patch_grads = grads
        else:
            # Handle general shape if different sequence length
            seq_len = acts.size(1)
            side = int(np.sqrt(seq_len - 1))
            if side * side == seq_len - 1:
                patch_acts = acts[:, 1:, :]
                patch_grads = grads[:, 1:, :]
            else:
                patch_acts = acts
                patch_grads = grads

        # Compute importance weights alpha_k by global average pooling gradients across patches
        alpha = patch_grads.mean(dim=1, keepdim=True)  # Shape: (1, 1, 768)

        # Weighted combination of patch activations
        cam = (patch_acts * alpha).sum(dim=-1)  # Shape: (1, 196)
        cam = F.relu(cam)

        # If ReLU zeroes out all patches, take magnitude to preserve informative contrast
        if cam.max() <= 1e-7:
            cam = (patch_acts * alpha).sum(dim=-1).abs()

        num_patches = cam.size(1)
        grid_dim = int(np.sqrt(num_patches))  # 14 for ViT-B/16
        
        # Reshape to 2D spatial grid (1, 1, 14, 14)
        cam_grid = cam.view(1, 1, grid_dim, grid_dim)

        # Upsample to full input resolution (224, 224)
        target_size = input_tensor.shape[-2:]  # (224, 224)
        cam_upsampled = F.interpolate(
            cam_grid,
            size=target_size,
            mode="bilinear",
            align_corners=False
        ).squeeze()

        cam_np = cam_upsampled.cpu().numpy()
        
        # Min-max normalization into [0, 1]
        denom = cam_np.max() - cam_np.min()
        if denom > 1e-8:
            cam_norm = (cam_np - cam_np.min()) / denom
        else:
            cam_norm = np.zeros_like(cam_np)

        return cam_norm, target_class, probabilities

    def remove_hooks(self):
        for handle in self.hook_handles:
            handle.remove()
        self.hook_handles = []

def create_gradcam_visualization(
    cam_norm: np.ndarray,
    original_rgb: np.ndarray,
    alpha: float = 0.65,
    threshold: float = 0.18,
    colormap: int = cv2.COLORMAP_JET
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Apply colormap to Grad-CAM heatmap and blend with original ultrasound image.
    Uses clinical-grade adaptive alpha transparency to preserve crisp background ultrasound anatomy.
    
    Args:
        cam_norm: (224, 224) float array in [0, 1]
        original_rgb: (224, 224, 3) uint8 RGB array
        alpha: Peak heatmap blend weight (0.0 to 1.0)
        threshold: Minimum attention cutoff below which background is kept 100% natural
        colormap: OpenCV colormap (default cv2.COLORMAP_JET)
        
    Returns:
        overlay_rgb: (224, 224, 3) uint8 blended image with clear background
        heatmap_rgb: (224, 224, 3) uint8 pure colormap image
    """
    # Scale CAM to 0..255 uint8
    heatmap_uint8 = np.uint8(255 * cam_norm)
    
    # Apply OpenCV colormap (outputs BGR)
    heatmap_bgr = cv2.applyColorMap(heatmap_uint8, colormap)
    heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)
    
    # Adaptive alpha transparency mask
    # Zero background fog: pixels with CAM < threshold keep alpha = 0 (crystal-clear ultrasound)
    # Active focus regions ramp smoothly up to alpha
    alpha_mask = np.clip((cam_norm - threshold) / (0.55 - threshold + 1e-6), 0.0, 1.0) * alpha
    alpha_mask_3d = alpha_mask[:, :, np.newaxis].astype(np.float32)
    
    overlay = (alpha_mask_3d * heatmap_rgb.astype(np.float32) + (1.0 - alpha_mask_3d) * original_rgb.astype(np.float32))
    overlay_rgb = np.clip(overlay, 0, 255).astype(np.uint8)
    
    return overlay_rgb, heatmap_rgb
