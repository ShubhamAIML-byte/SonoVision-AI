# 🚀 SonoVision AI: Complete Deployment Guide (Vercel & 24/7 Inference Backend)

This guide provides end-to-end instructions for deploying:
1. **Next.js Frontend on Vercel**
2. **FastAPI + PyTorch Inference Backend on a Dedicated 24/7 Cloud Host**
3. **Large Model Weight Management (Avoiding GitHub 100MB limits)**

---

## ⚠️ Why Serverless Functions Cannot Run PyTorch ViT-B/16
Vercel is designed for serverless static frontends and lightweight Node/Python API handlers. Attempting to run a 327MB Vision Transformer (`ViT-B/16`) inside a Vercel serverless function will fail due to:
- **Package Size Limits**: AWS Lambda / Vercel serverless bundles are strictly capped at 250MB uncompressed (PyTorch + TorchVision alone exceed 800MB).
- **Execution Timeouts**: Serverless functions time out during heavy tensor computation.
- **Cold Boot Latencies**: Loading an 86M parameter Transformer on cold start adds 20–40 seconds.
- **Memory Consumption**: Vision Transformer attention matric computing on CPU requires > 1.5GB RAM.

**Solution**: Deploy the **Next.js frontend to Vercel** and the **FastAPI PyTorch backend to an always-on container service** (Render, Railway, Fly.io, Hugging Face Spaces, or AWS EC2).

---

## 1. Deploying Frontend to Vercel

### Step 1: Push Repository to GitHub
```bash
git add .
git commit -m "feat: complete SonoVision AI project"
git push origin main
```

### Step 2: Import into Vercel
1. Log into [vercel.com](https://vercel.com).
2. Click **Add New... > Project** and select your GitHub repository.
3. In **Root Directory**, click Edit and select: `frontend`.
4. Framework Preset: **Next.js** (automatically detected).
5. Build Command: `npm run build`
6. Output Directory: `.next`

### Step 3: Configure Environment Variables
Under **Environment Variables**, add:
- `NEXT_PUBLIC_API_URL`: Your live backend URL (e.g. `https://sonovision-backend.onrender.com`).
*(Leave empty or set to `http://localhost:8000` for local testing).*

Click **Deploy**. Your frontend will be live at `https://sonovision-ai.vercel.app`.

---

## 2. Deploying Backend on 24/7 Cloud Hosting

### Option A: Render (Recommended Always-On)
1. Log into [render.com](https://render.com).
2. Click **New + > Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Root Directory**: `.` (project root)
   - **Environment**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Instance Type**: **Starter** or higher (minimum 1GB RAM, recommended 2GB RAM).
   - *(Note: Use a paid always-on plan to ensure reliable 24/7 inference without spin-down).*
5. Set Environment Variables:
   - `PORT`: `8000`
   - `ALLOWED_ORIGINS`: `https://your-vercel-domain.vercel.app,http://localhost:3000`
   - `MODEL_DOWNLOAD_URL`: (URL to your hosted `.pth` file, see Section 3 below).
6. Click **Create Web Service**.

---

### Option B: Hugging Face Spaces (Free / Cheap Containerized PyTorch)
1. Create a new Space on [huggingface.co/spaces](https://huggingface.co/spaces).
2. Choose **Docker > Blank**.
3. Push the `backend/` and `artifacts/` folder with `backend/Dockerfile`.
4. Set hardware to CPU Basic (2 vCPU, 16GB RAM is free) or T4 GPU.

---

### Option C: AWS EC2 / DigitalOcean Droplet
1. Launch an Ubuntu 22.04 LTS instance (t3.medium or g4dn.xlarge for GPU).
2. Install Docker:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   ```
3. Clone repository and launch via Docker Compose:
   ```bash
   git clone <repo-url>
   cd "BUSI VIT"
   docker-compose -f backend/docker-compose.yml up -d --build
   ```

---

## 3. Managing Large Model Weights (`*.pth` ~327MB)

Git rejects file pushes larger than 100MB. To handle the 327MB `best_vit_b16_busi.pth` file:

### Method 1: Hugging Face Hub (Free Object Storage)
1. Create a model repository on Hugging Face: `huggingface.co/new-model`.
2. Upload `best_vit_b16_busi.pth`.
3. Copy the direct download link:
   `https://huggingface.co/<user>/<repo>/resolve/main/best_vit_b16_busi.pth`
4. Set this URL as `MODEL_DOWNLOAD_URL` in your backend environment variables.
   *The backend will automatically download and cache it on container initialization!*

### Method 2: GitHub Releases
1. In your GitHub repo, create a Release (e.g. `v1.0.0`).
2. Attach `best_vit_b16_busi.pth` to the release assets.
3. Copy the release asset download URL and set as `MODEL_DOWNLOAD_URL`.

---

## 4. Local Development Verification

### Start Backend:
```powershell
# From project root:
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Check health: `http://localhost:8000/health`
View docs: `http://localhost:8000/docs`

### Start Frontend:
```powershell
cd frontend
npm run dev
```
Open: `http://localhost:3000`
