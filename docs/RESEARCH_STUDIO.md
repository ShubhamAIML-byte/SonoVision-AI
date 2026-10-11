# 🔬 DeepBench Studio: Multimodal Deep Learning Benchmark Extraction & Comparison

DeepBench Studio is an intelligent research suite integrated into the Vercel web application that allows researchers, engineers, and machine learning practitioners to upload **important images**—such as research paper benchmark tables, ROC curves, loss/accuracy plots, Pareto curves, or leaderboard screenshots—automatically extract structured comparison data using **Multimodal AI**, and render an interactive research dashboard.

---

## 🚀 Key Capabilities

### 1. Multimodal Image Ingestion & OCR
- **Supported Formats**: PNG, JPG, JPEG, WebP (up to 15MB).
- **Clipboard Paste**: Press `Ctrl+V` anywhere in the app to paste a screenshot directly from ArXiv, Twitter, or a PDF reader.
- **Image Inspector**: Click the "Inspect" button to open a high-resolution zoom modal of the original paper image.
- **Multimodal AI Vision**:
  - Connects to **Google Gemini 1.5 Flash / 2.0 Flash** via Next.js serverless route `/api/extract-benchmark`.
  - Zero-shot parses tabular columns, deep learning architectures, parameter scales, FLOPs, and accuracies.
- **Zero-Failure Fallback Engine**: If no API key is provided, the system seamlessly activates its built-in neural benchmark engine and offers 4 publication presets.

### 2. Built-in Research Presets (1-Click Instant Testing)
1. **Vision Transformers vs. Modern ConvNets on ImageNet-1K**:
   - `ViT-B/16`, `ViT-L/16`, `Swin-B`, `Swin-T`, `ConvNeXt-B`, `ConvNeXt-T`, `ResNet-50`, `ResNet-101`, `EfficientNet-B7`, `MobileViT-S`.
2. **Deep Learning CADx on BUSI Ultrasound**:
   - `SonoVision ViT-B/16`, `DenseNet-121`, `ResNet-50`, `EfficientNet-B0`, `VGG-16`, `MobileNet-V3`.
3. **Real-Time Object Detection on MS COCO**:
   - `YOLOv8x`, `RT-DETR-X`, `YOLOv8m`, `YOLOv8n`, `Faster R-CNN`, `Deformable DETR`.
4. **Frontier Foundation Models (LLMs) on MMLU & HumanEval**:
   - `Claude 3.5 Sonnet`, `GPT-4o`, `Llama 3 70B Instruct`, `Mistral Large 2`, `Gemma 2 27B IT`.

---

## 📊 Interactive Research Dashboard Modules

### 1. Multi-Objective Pareto Frontier Chart
- Dynamically calculates which models are **Pareto Optimal** ($\text{Model}_A$ is not strictly dominated on accuracy and latency/parameters).
- **Configurable Axes**:
  - **X-Axis**: Latency (ms), Parameters (M), or Compute (GFLOPs) — *Lower is better*.
  - **Y-Axis**: Top-1 Accuracy (%) or F1-Score (%) — *Higher is better*.
- Renders the dashed **Pareto Frontier Curve** with pulsating optimal indicators and custom tooltips.

### 2. Multi-Metric Radar (Spider) Chart
- Normalizes model metrics into a 0–100 efficiency scale across 5 dimensions:
  1. *Top-1 Accuracy*
  2. *Latency Efficiency* ($1/\text{latency}$)
  3. *Parameter Compactness* ($1/\text{params}$)
  4. *FLOP Efficiency* ($1/\text{FLOPs}$)
  5. *Task Robustness / F1-Score*
- Allows toggling up to 5 models simultaneously for holistic architectural comparison.

### 3. Leaderboard Ranking Bar Chart
- Ranks models horizontally by any selected metric:
  - Top-1 Accuracy, Top-5 Accuracy, Latency (ms), Parameters (M), FLOPs (G), or Throughput (img/s).
- Instant ascending/descending sorting toggle.
- Color-coded by architecture family (Transformers: Cyan, CNNs: Emerald, Hybrids: Purple, LLMs: Pink).

### 4. Head-to-Head Differential Matchup
- Select any two models ($A$ vs $B$).
- Displays side-by-side spec cards and a differential delta table ($\Delta\text{Accuracy}$, $\Delta\text{Latency}$, $\Delta\text{Params}$).
- Generates an automated peer-review synthesis explaining trade-offs (e.g. speedup ratio vs accuracy gains).

### 5. Extracted Data Table & Live Spreadsheet Editor
- Search by model name and filter by architecture family.
- **Inline Editing Mode**: Modify any metric cell directly in the browser.
- **Add Custom Model**: Add experimental runs from your own lab with custom accuracy, latency, and parameter values.
- **Export Suite**:
  - Export to CSV
  - Export to JSON
  - 1-Click Copy Markdown Table for ArXiv papers and GitHub READMEs

### 6. Architectural Trade-offs & Production Feasibility
- Analyzes inductive bias, quadratic self-attention bottlenecks, and memory bandwidth considerations.
- Categorizes models into Edge/Mobile (<20ms), Cloud Real-Time (<50ms), and High-Capacity/Offline screening.

---

## 🌐 Deploying to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
cd frontend
vercel
```

### Option 2: Vercel Web Dashboard (Git Push)
1. Push your repository to GitHub.
2. In [vercel.com](https://vercel.com), click **Add New Project** and select this repo.
3. Set **Root Directory** to `frontend` (or leave default if using the included root `vercel.json`).
4. (Optional) In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from Google AI Studio.
5. Click **Deploy**. Your app will be live with full multimodal extraction and interactive dashboard capabilities!
