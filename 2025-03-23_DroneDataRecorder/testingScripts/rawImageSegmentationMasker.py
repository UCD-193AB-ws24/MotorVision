import torch
from torchvision.models.detection import maskrcnn_resnet50_fpn
from torchvision.transforms import functional as F
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import random
import pandas as pd
import cv2

# Load image
image_path = r"C:\Ayush\2025-2021_UC_Davis_Undergraduate_FileHub\2025_SQ\ECS193B\2025_AyushBackendScripts\2025-03-15_ObjTracking\inputFiles\recklessMotorcyclist.png"
image = Image.open(image_path).convert("RGB")
image_tensor = F.to_tensor(image)

# Load pretrained Mask R-CNN
model = maskrcnn_resnet50_fpn(pretrained=True)
model.eval()

# Run inference
with torch.no_grad():
    predictions = model([image_tensor])[0]

# Filter out predictions with low confidence
threshold = 0.5
masks = predictions["masks"]
labels = predictions["labels"]
scores = predictions["scores"]
boxes = predictions["boxes"]

# Prepare image for display
img_np = np.array(image)
overlay = img_np.copy()

for i in range(len(masks)):
    if scores[i] >= threshold:
        mask = masks[i, 0].mul(255).byte().cpu().numpy()
        color = [random.randint(0, 255) for _ in range(3)]

        # Create a color overlay
        overlay[mask > 128] = overlay[mask > 128] * 0.5 + np.array(color) * 0.5


for i in range(len(masks)):
    if scores[i] >= threshold:
        mask = masks[i, 0].mul(255).byte().cpu().numpy()
        color = [random.randint(0, 255) for _ in range(3)]

        # Overlay the mask
        overlay[mask > 128] = overlay[mask > 128] * 0.5 + np.array(color) * 0.5

        # Get mask coordinates
        ys, xs = np.where(mask > 128)
        if len(xs) == 0 or len(ys) == 0:
            continue

        x_min, x_max = np.min(xs), np.max(xs)
        y_min, y_max = np.min(ys), np.max(ys)

        # Draw vertical lines
        for y in range(y_min, y_max + 1):
            overlay[y, x_min-3:x_min+3] = color
            overlay[y, x_max-3:x_max+3] = color

        # Draw horizontal line connecting verticals at bottom
        for x in range(x_min, x_max + 1):
            overlay[y_max-3:y_max+3, x] = color


# Plot shaded result
plt.figure(figsize=(10, 10))
plt.imshow(overlay.astype(np.uint8))
plt.axis("off")
plt.title("Shaded Instance Segmentation")
plt.show()
# plt.savefig()


