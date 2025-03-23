

import numpy as np
from ultralytics import YOLO
from torchvision.models.detection import maskrcnn_resnet50_fpn
import cv2
import torch


class ImageResizer:
    
    def resize(self, image: np.ndarray, newSize: tuple):
        if not isinstance(image, np.ndarray):
            raise ValueError("Input must be a NumPy array")
        if not isinstance(newSize, tuple) or len(newSize) != 2:
            raise ValueError("newSize must be a (width, height) tuple")

        # Use INTER_AREA for downscaling, INTER_CUBIC for upscaling
        orig_h, orig_w = image.shape[:2]
        new_w, new_h = newSize

        if new_w < orig_w or new_h < orig_h:
            interpolation = cv2.INTER_AREA
        else:
            interpolation = cv2.INTER_CUBIC

        resized = cv2.resize(image, newSize, interpolation=interpolation)
        return resized


class FrameDataRetriever:
    def __init__(self, yoloModelType="yolov5s.pt", targetFrameShape=(1280, 720), maxObjectSegmentationShape=(70, 70)):
        self.yoloModel = YOLO("objectDetectionModels/" + yoloModelType)
        self.targetFrameShape = targetFrameShape
        self.maxObjectSegmentationShape = maxObjectSegmentationShape
        # Load pretrained Mask R-CNN
        self.segmenterModel = maskrcnn_resnet50_fpn(pretrained=True)
        self.segmenterModel.eval()      # set to evaluation/testing mode

    def getDataMatrix(self, frame):
        # Run YOLO model on the frame
        yoloModelResults = self.yoloModel(ImageResizer.resize(frame, self.targetFrameShape))

        def getboundingBoxDataRows(yoloModelResults) -> np.ndarray:
            detections = []
            for result in yoloModelResults:
                detected_objects = result.boxes.data.cpu().numpy()

                for det in detected_objects:
                    x_min, y_min, x_max, y_max, conf, class_id = det[:6]  # Extract bounding box and class
                    detections.append([x_min, y_min, x_max, y_max, conf, class_id])

            detections = np.array(detections)
            return detections
    
        boundingBoxDataRows = getboundingBoxDataRows(yoloModelResults)
        for boundingBoxDataRow in boundingBoxDataRows:
            [x_min, y_min, x_max, y_max, conf, class_id] = boundingBoxDataRow
            boundingBoxImage = frame[x_min:x_max, y_min:y_max].copy()
            boxArea = (y_max-y_min) * (x_max-x_min)
            if boxArea > self.maxObjectSegmentationShape:
                boundingBoxImage = ImageResizer.resize(boundingBoxImage, self.maxObjectSegmentationShape)

            # Image Segmentation
            # Convert to PyTorch tensor and change shape from HWC to CHW
            image_tensor = torch.from_numpy(boundingBoxImage).permute(2, 0, 1)  # [C, H, W]

            with torch.no_grad():
                segmenterModelPreds = self.segmenterModel([image_tensor])[0]

            # Filter out predictions with low confidence
            threshold = 0.5
            masks = segmenterModelPreds["masks"]
            labels = segmenterModelPreds["labels"]
            scores = segmenterModelPreds["scores"]
            boxes = segmenterModelPreds["boxes"]
                            


class RawVideoDatasetRetriever:
    def __init__(self):
        pass
