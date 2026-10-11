#!/usr/bin/env python3
"""
SonoVision AI: Vision Transformer (ViT-B/16) Training & Evaluation Script
Designed for BUSI (Breast Ultrasound Images) Dataset.
Supports Google Colab (GPU / TPU / CPU) and standalone execution.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    roc_curve,
    auc,
    classification_report
)

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from torchvision.models import vit_b_16, ViT_B_16_Weights


# ---------------------------------------------------------
# 1. Custom BUSI Dataset (Leakage-Free)
# ---------------------------------------------------------
class BUSIDataset(Dataset):
    """
    Breast Ultrasound Images Dataset Loader.
    Ensures that mask files (*_mask.png) are excluded from training
    and only real ultrasound scans are indexed.
    """
    def __init__(self, file_paths: List[Path], labels: List[int], transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        label = self.labels[idx]
        image = Image.open(path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label


def scan_busi_directory(dataset_dir: Path) -> Tuple[List[Path], List[int], Dict[str, int]]:
    """
    Scan BUSI directory structure:
    dataset_dir/
      benign/
        benign (1).png
        benign (1)_mask.png
      malignant/
      normal/
    Only original ultrasound scans are retained.
    """
    classes = ["benign", "malignant", "normal"]
    class_to_idx = {cls: idx for idx, cls in enumerate(classes)}
    
    image_paths = []
    labels = []
    
    for cls in classes:
        cls_dir = dataset_dir / cls
        if not cls_dir.exists():
            # Try case-insensitive lookup
            for d in dataset_dir.iterdir():
                if d.is_dir() and d.name.lower() == cls:
                    cls_dir = d
                    break

        if not cls_dir.exists():
            print(f"Warning: Class folder '{cls}' not found in {dataset_dir}")
            continue

        for img_path in sorted(cls_dir.glob("*.png")):
            # Exclude ground truth segmentation masks
            if "_mask" in img_path.name.lower():
                continue
            image_paths.append(img_path)
            labels.append(class_to_idx[cls])

    print(f"Found {len(image_paths)} valid ultrasound scans across {len(classes)} classes.")
    for cls in classes:
        count = sum(1 for l in labels if l == class_to_idx[cls])
        print(f"  - {cls}: {count} scans")

    return image_paths, labels, class_to_idx


# ---------------------------------------------------------
# 2. Transformations (ImageNet Normalized)
# ---------------------------------------------------------
def get_data_transforms(img_size: int = 224):
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size), interpolation=transforms.InterpolationMode.BILINEAR),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std)
    ])

    val_test_transform = transforms.Compose([
        transforms.Resize((img_size, img_size), interpolation=transforms.InterpolationMode.BILINEAR),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std)
    ])

    return train_transform, val_test_transform


# ---------------------------------------------------------
# 3. Model Architecture
# ---------------------------------------------------------
def build_vit_model(num_classes: int = 3, pretrained: bool = True) -> nn.Module:
    weights = ViT_B_16_Weights.DEFAULT if pretrained else None
    model = vit_b_16(weights=weights)
    in_features = model.heads.head.in_features
    model.heads.head = nn.Linear(in_features, num_classes)
    return model


# ---------------------------------------------------------
# 4. Training Loop with Early Stopping & Class Weighting
# ---------------------------------------------------------
def train_model(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    scheduler: torch.optim.lr_scheduler._LRScheduler,
    device: torch.device,
    epochs: int = 25,
    patience: int = 7,
    save_path: Path = Path("artifacts/best_vit_b16_busi.pth")
) -> Dict[str, List[float]]:
    
    best_val_loss = float("inf")
    patience_counter = 0
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

    print("\n--- Starting Vision Transformer Fine-Tuning ---")
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            correct_train += (preds == labels).sum().item()
            total_train += labels.size(0)

        epoch_train_loss = running_loss / total_train
        epoch_train_acc = correct_train / total_train

        # Validation Phase
        model.eval()
        running_val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)

                outputs = model(images)
                loss = criterion(outputs, labels)

                running_val_loss += loss.item() * images.size(0)
                preds = outputs.argmax(dim=1)
                correct_val += (preds == labels).sum().item()
                total_val += labels.size(0)

        epoch_val_loss = running_val_loss / total_val
        epoch_val_acc = correct_val / total_val

        scheduler.step()

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 4))
        history["val_acc"].append(round(epoch_val_acc, 4))

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc:.4f} | "
            f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc:.4f} | "
            f"LR: {scheduler.get_last_lr()[0]:.2e}"
        )

        # Checkpointing
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            patience_counter = 0
            save_path.parent.mkdir(parents=True, exist_ok=True)
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": best_val_loss,
                "val_acc": epoch_val_acc
            }, save_path)
            print(f"  --> Checkpoint saved to {save_path} (Val Loss: {best_val_loss:.4f})")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"\n[Early Stopping Triggered] No improvement for {patience} consecutive epochs.")
                break

    total_duration = time.time() - start_time
    print(f"\nTraining completed in {total_duration / 60:.2f} minutes.")
    return history


# ---------------------------------------------------------
# 5. Held-Out Evaluation (Genuine Metrics)
# ---------------------------------------------------------
def evaluate_test_set(
    model: nn.Module,
    test_loader: DataLoader,
    device: torch.device,
    classes: List[str]
) -> Dict:
    model.eval()
    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)

            all_probs.extend(probs.cpu().numpy())
            all_preds.extend(outputs.argmax(dim=1).cpu().numpy())
            all_targets.extend(labels.numpy())

    all_targets = np.array(all_targets)
    all_preds = np.array(all_preds)
    all_probs = np.array(all_probs)

    # Compute Metrics
    acc = float(accuracy_score(all_targets, all_preds))
    precision, recall, f1, support = precision_recall_fscore_support(all_targets, all_preds, average=None)
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(all_targets, all_preds, average="macro")

    cm = confusion_matrix(all_targets, all_preds).tolist()

    # Per-class Sensitivity, Specificity, ROC-AUC
    per_class = {}
    roc_curves = {}
    aucs = []

    for idx, cls in enumerate(classes):
        # Binary target for class idx
        bin_targets = (all_targets == idx).astype(int)
        cls_probs = all_probs[:, idx]

        # Specificity & Sensitivity
        tp = sum((all_targets == idx) & (all_preds == idx))
        fn = sum((all_targets == idx) & (all_preds != idx))
        tn = sum((all_targets != idx) & (all_preds != idx))
        fp = sum((all_targets != idx) & (all_preds == idx))

        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

        fpr, tpr, _ = roc_curve(bin_targets, cls_probs)
        cls_auc = float(auc(fpr, tpr))
        aucs.append(cls_auc)

        per_class[cls] = {
            "support": int(support[idx]),
            "precision": float(round(precision[idx], 4)),
            "recall": float(round(recall[idx], 4)),
            "sensitivity": float(round(sensitivity, 4)),
            "specificity": float(round(specificity, 4)),
            "f1_score": float(round(f1[idx], 4)),
            "roc_auc": float(round(cls_auc, 4))
        }

        roc_curves[cls] = {
            "fpr": [round(float(x), 4) for x in fpr[::max(1, len(fpr) // 10)]],
            "tpr": [round(float(x), 4) for x in tpr[::max(1, len(tpr) // 10)]],
            "auc": round(cls_auc, 4)
        }

    macro_specificity = float(np.mean([v["specificity"] for v in per_class.values()]))
    roc_auc_macro = float(np.mean(aucs))

    print("\n" + "="*50)
    print("HELD-OUT TEST SET EVALUATION REPORT")
    print("="*50)
    print(f"Accuracy:            {acc * 100:.2f}%")
    print(f"Macro Precision:     {prec_macro * 100:.2f}%")
    print(f"Macro Recall (Sens): {rec_macro * 100:.2f}%")
    print(f"Macro Specificity:   {macro_specificity * 100:.2f}%")
    print(f"Macro F1-Score:      {f1_macro * 100:.2f}%")
    print(f"Macro ROC-AUC:       {roc_auc_macro:.4f}")
    print("\nConfusion Matrix:")
    print(np.array(cm))

    return {
        "dataset": "BUSI (Breast Ultrasound Images)",
        "total_samples": len(all_targets),
        "overall": {
            "accuracy": round(acc, 4),
            "precision_macro": round(prec_macro, 4),
            "recall_macro": round(rec_macro, 4),
            "f1_macro": round(f1_macro, 4),
            "specificity_macro": round(macro_specificity, 4),
            "roc_auc_macro": round(roc_auc_macro, 4)
        },
        "per_class": per_class,
        "confusion_matrix": cm,
        "confusion_matrix_labels": classes,
        "roc_curves": roc_curves
    }


def main():
    parser = argparse.ArgumentParser(description="Train ViT-B/16 on BUSI Ultrasound Dataset")
    parser.add_argument("--data_dir", type=str, default="./data/Dataset_BUSI_with_GT", help="Path to BUSI dataset")
    parser.add_argument("--epochs", type=int, default=25, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=3e-5, help="Initial learning rate for AdamW")
    parser.add_argument("--weight_decay", type=float, default=1e-2, help="Weight decay for AdamW")
    parser.add_argument("--patience", type=int, default=7, help="Early stopping patience")
    parser.add_argument("--output_dir", type=str, default="./artifacts", help="Artifacts output directory")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using compute device: {device}")

    data_dir = Path(args.data_dir)
    if not data_dir.exists():
        print(f"Dataset path {data_dir} does not exist. Please download BUSI dataset or mount Google Drive.")
        return

    # 1. Scan and split data
    image_paths, labels, class_to_idx = scan_busi_directory(data_dir)
    classes = list(class_to_idx.keys())

    # Stratified split: 70% Train, 10% Val, 20% Test
    train_paths, test_paths, train_lbls, test_lbls = train_test_split(
        image_paths, labels, test_size=0.20, stratify=labels, random_state=42
    )
    train_paths, val_paths, train_lbls, val_lbls = train_test_split(
        train_paths, train_lbls, test_size=0.125, stratify=train_lbls, random_state=42 # 0.125 * 0.8 = 0.10
    )

    print(f"Data Split: Train={len(train_paths)}, Val={len(val_paths)}, Test={len(test_paths)}")

    # 2. Datasets and Loaders
    train_transform, val_test_transform = get_data_transforms()
    train_ds = BUSIDataset(train_paths, train_lbls, transform=train_transform)
    val_ds = BUSIDataset(val_paths, val_lbls, transform=val_test_transform)
    test_ds = BUSIDataset(test_paths, test_lbls, transform=val_test_transform)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False)

    # 3. Class Weighting for Imbalance
    class_counts = [labels.count(i) for i in range(len(classes))]
    total_samples = len(labels)
    class_weights = [total_samples / (len(classes) * c) for c in class_counts]
    class_weights_t = torch.tensor(class_weights, dtype=torch.float).to(device)
    print(f"Class Weights applied: {class_weights}")

    # 4. Model, Loss, Optimizer, Scheduler
    model = build_vit_model(num_classes=len(classes), pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights_t, label_smoothing=0.1)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    # 5. Train
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    best_weights_path = output_dir / "best_vit_b16_busi.pth"

    history = train_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        criterion=criterion,
        optimizer=optimizer,
        scheduler=scheduler,
        device=device,
        epochs=args.epochs,
        patience=args.patience,
        save_path=best_weights_path
    )

    # 6. Load Best Weights & Evaluate on Test Set
    checkpoint = torch.load(best_weights_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    metrics = evaluate_test_set(model, test_loader, device, classes)
    metrics["training_history"] = history

    # Save artifacts
    with open(output_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    with open(output_dir / "class_mapping.json", "w", encoding="utf-8") as f:
        json.dump({str(i): cls for i, cls in enumerate(classes)}, f, indent=2)

    print(f"\nAll artifacts successfully saved to {output_dir}")

if __name__ == "__main__":
    main()
