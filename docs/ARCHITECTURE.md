# 🧠 SonoVision AI: Architecture & Mathematics

## 1. Vision Transformer (ViT-B/16) on Medical Ultrasound

Traditional Computer Vision in radiology relies heavily on Convolutional Neural Networks (CNNs), which apply local kernel convolutions to extract spatially constrained features. In breast ultrasound, malignant lesions often exhibit diffuse acoustic attenuation, irregular distal borders, and acoustic shadowing that span broad image regions. The **Vision Transformer (ViT-B/16)** replaces local inductive biases with **global Multi-Head Self-Attention**, allowing every patch of the ultrasound scan to attend to every other patch across 12 Transformer encoder layers.

### Mathematical Formulation

#### 1.1 Patch Tokenization & Linear Projection
Given a B-mode ultrasound image $X \in \mathbb{R}^{H \times W \times C}$ with input resolution $H = W = 224$ and channels $C = 3$:
- The image is partitioned into a sequence of non-overlapping patches $X_p \in \mathbb{R}^{N \times (P^2 \cdot C)}$, where patch size $P = 16$.
- Number of image patches:
  $$N = \frac{H \cdot W}{P^2} = \frac{224 \times 224}{16 \times 16} = 14 \times 14 = 196$$
- Each flattened patch $x_p^i \in \mathbb{R}^{P^2 \cdot C} = \mathbb{R}^{768}$ is projected to the hidden dimension $D = 768$ via a learnable linear projection matrix $E \in \mathbb{R}^{(P^2 C) \times D}$:
  $$z_0 = [x_{\text{class}}; x_p^1 E; x_p^2 E; \dots; x_p^N E] + E_{\text{pos}}$$
  where:
  - $x_{\text{class}} \in \mathbb{R}^D$ is the learnable Classification Token (`[CLS]`).
  - $E_{\text{pos}} \in \mathbb{R}^{(N + 1) \times D}$ represents 1D learnable positional embeddings preserving spatial relationships.
  - The sequence length into the Transformer is $1 + 196 = 197$.

#### 1.2 Transformer Encoder Blocks
The sequence passes through $L = 12$ identical Transformer Encoder blocks. Each block comprises:
1. **Multi-Head Self-Attention (MSA)** with $h = 12$ heads (head dimension $d_k = D / h = 64$):
   $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$
   $$z_\ell' = \text{MSA}(\text{LayerNorm}(z_{\ell - 1})) + z_{\ell - 1}$$
2. **Multi-Layer Perceptron (MLP)** with GELU activation and expansion ratio 4 ($4 \times 768 = 3072$):
   $$z_\ell = \text{MLP}(\text{LayerNorm}(z_\ell')) + z_\ell'$$

#### 1.3 Classification Head
The representation of the `[CLS]` token from the 12th encoder block is extracted and passed to LayerNorm followed by a linear layer projecting to 3 classes (Benign, Malignant, Normal):
$$y = W_{\text{head}} \cdot \text{LayerNorm}(z_L^0) + b_{\text{head}}, \quad y \in \mathbb{R}^3$$
$$\hat{p}_c = \frac{e^{y_c}}{\sum_{j=1}^3 e^{y_j}}$$

---

## 2. Vision Transformer Patch-Token Grad-CAM Explainability

### Why CNN Grad-CAM Fails on ViTs
Standard Grad-CAM was designed for CNN feature maps $A \in \mathbb{R}^{C \times H' \times W'}$. Applying it directly to ViT outputs fails because:
1. ViT features are 1D sequences of token embeddings without native 2D height and width dimensions.
2. The `[CLS]` token does not correspond to any spatial coordinate on the image and would corrupt spatial localization if included.

### SonoVision ViT Grad-CAM Implementation
We adapt gradient-based class activation mapping specifically for ViT patch tokens:

1. **Target Layer Hook**: We attach forward and backward hooks to the LayerNorm layer `model.encoder.layers[-1].ln_1` of the final (12th) Transformer encoder block.
2. **Token Extraction**:
   - Captured activations: $A \in \mathbb{R}^{1 \times 197 \times 768}$.
   - Backpropagated class gradients for target class $c$:
     $$G = \frac{\partial y_c}{\partial A} \in \mathbb{R}^{1 \times 197 \times 768}$$
3. **Decoupling `[CLS]`**:
   Token index 0 is stripped:
   $$A_{\text{patches}} = A[:, 1:197, :] \in \mathbb{R}^{1 \times 196 \times 768}$$
   $$G_{\text{patches}} = G[:, 1:197, :] \in \mathbb{R}^{1 \times 196 \times 768}$$
4. **Channel Importance Weights**:
   Compute channel-wise weights $\alpha_k^c$ via global average pooling across all 196 patches:
   $$\alpha_k^c = \frac{1}{196} \sum_{p=1}^{196} G_{\text{patches}}[0, p, k], \quad k \in \{1, \dots, 768\}$$
5. **Linear Combination & ReLU**:
   For each patch $p \in \{1, \dots, 196\}$:
   $$M_p^c = \text{ReLU}\left(\sum_{k=1}^{768} \alpha_k^c \cdot A_{\text{patches}}[0, p, k]\right)$$
6. **2D Topological Reshaping**:
   The 196 patch values are mapped back to their original 2D spatial coordinates:
   $$M_{\text{grid}}^c = \text{Reshape}(M^c, (14, 14))$$
7. **Bilinear Upsampling & Normalization**:
   $M_{\text{grid}}^c$ is bilinearly interpolated to the original image dimensions $224 \times 224$:
   $$L_{\text{Grad-CAM}}^c = \text{Interpolate}(M_{\text{grid}}^c, (224, 224))$$
   $$L_{\text{norm}}^c = \frac{L^c - \min(L^c)}{\max(L^c) - \min(L^c) + \epsilon}$$
8. **Thermal Color Blending**:
   The normalized heatmap is colorized via OpenCV `cv2.COLORMAP_JET` and alpha-blended with the original ultrasound:
   $$I_{\text{overlay}} = \alpha \cdot I_{\text{heatmap}} + (1 - \alpha) \cdot I_{\text{original}}$$
