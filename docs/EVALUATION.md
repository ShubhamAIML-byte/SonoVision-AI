# 📊 SonoVision AI: Clinical Evaluation & Metrics Report

## 1. Dataset & Split Methodology
- **Dataset**: Breast Ultrasound Images (BUSI) dataset (Al-Dhabyani et al.).
- **Total Ultrasound Scans**: 780 original B-mode scans (excluding segmentation masks).
- **Class Breakdown**:
  - Benign: 437 scans (56.0%)
  - Malignant: 210 scans (26.9%)
  - Normal: 133 scans (17.1%)
- **Data Splitting**:
  - Stratified 70% Train (546 scans), 10% Validation (78 scans), 20% Held-Out Test (156 scans).
  - Seed fixed to `42` for strict reproducibility.
  - Zero cross-split leakage: scans from the same lesion or patient are segregated.

---

## 2. Held-Out Test Set Metrics Summary

| Metric | Score | Clinical Significance |
|---|---|---|
| **Overall Accuracy** | **91.67%** (143/156) | Overall multi-class diagnostic correctness |
| **Macro ROC-AUC** | **0.9742** | High class discrimination across all thresholds |
| **Macro Sensitivity (Recall)** | **89.53%** | Low false negative rate across classes |
| **Macro Specificity** | **95.34%** | Excellent true negative identification |
| **Macro Precision** | **90.30%** | High positive predictive value |
| **Macro F1-Score** | **89.86%** | Balanced precision and recall harmonic mean |

---

## 3. Per-Class Diagnostic Performance

| Diagnostic Class | Test Support | Precision | Sensitivity (Recall) | Specificity | F1-Score | ROC-AUC |
|---|---|---|---|---|---|---|
| **Benign** | 87 | 94.25% | 94.25% | 92.75% | 0.9425 | 0.9712 |
| **Malignant** | 42 | 88.64% | 92.86% | 95.61% | 0.9070 | 0.9824 |
| **Normal** | 27 | 88.00% | 81.48% | 97.67% | 0.8462 | 0.9690 |

### Key Clinical Insights:
1. **Malignant Sensitivity (92.86%)**: In oncology CAD systems, detecting malignancies (minimizing False Negatives) is paramount. The model missed only 3 malignant cases out of 42.
2. **Normal Specificity (97.67%)**: Normal scans are rarely misidentified as lesions, reducing unnecessary patient distress and biopsy recommendations.
3. **Malignant Specificity (95.61%)**: The model maintains high specificity against benign masqueraders (e.g. dense fibroadenomas).

---

## 4. 3-Class Confusion Matrix

$$\begin{pmatrix}
\text{True Benign (87)} & 82 & 3 & 2 \\
\text{True Malignant (42)} & 2 & 39 & 1 \\
\text{True Normal (27)} & 3 & 2 & 22
\end{pmatrix}$$

- **True Positives**:
  - Benign: 82 / 87
  - Malignant: 39 / 42
  - Normal: 22 / 27
- **Errors**:
  - 3 Benign predicted as Malignant (biopsy recommendation false alarms)
  - 2 Benign predicted as Normal
  - 2 Malignant predicted as Benign
  - 1 Malignant predicted as Normal
  - 3 Normal predicted as Benign
  - 2 Normal predicted as Malignant

---

## 5. Training Hyperparameters
- **Backbone**: `ViT-B/16` (ImageNet pretrained initialization)
- **Image Resolution**: $224 \times 224$ Bilinear
- **Optimizer**: `AdamW` (learning rate $= 3 \times 10^{-5}$, weight decay $= 0.01$)
- **Loss Function**: `CrossEntropyLoss` with label smoothing ($0.1$) and inverse class weights ($[0.89, 1.85, 2.87]$)
- **Learning Rate Schedule**: `CosineAnnealingLR` ($T_{\max}=25, \eta_{\min}=10^{-6}$)
- **Batch Size**: 16
- **Epochs**: 25 (best validation loss at epoch 19)
- **Early Stopping**: Patience $= 7$ epochs
