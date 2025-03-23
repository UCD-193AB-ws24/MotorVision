import cv2
import numpy as np
import time
from ultralytics import YOLO
import os

# chdir

def chdir_to_local_script_dir():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
chdir_to_local_script_dir()


from sort.sort import Sort
tracker = Sort()

# === USER CONFIGURATION ===
# video_path = r'inputFiles/Riding My Motorcycle Through Central London [4K].mp4'
video_path = r'inputFiles/Reckless Motorcyclist.mp4'
output_path = "output.mp4"

target_width = 1280  # Define standard width
target_height = 720  # Define standard height
frames_per_time = 10  # Number of frames to process
time_interval = 1  # Seconds (process X frames every Y seconds)

# Load the pre-trained YOLOv5 model
modelType = "yolov5s.pt"
model = YOLO("objectDetectionModels/" + modelType)

# Open the video file
cap = cv2.VideoCapture(video_path)

# Get original video properties
fps = int(cap.get(cv2.CAP_PROP_FPS))
orig_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
orig_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
frame_jump = int(fps * 5)  # 5-second skip in frames

# Compute scaling factor based on the standard target size
scale_width = target_width / orig_width
scale_height = target_height / orig_height
scale_factor = min(scale_width, scale_height)  # Maintain aspect ratio

# Compute new dimensions while preserving aspect ratio
width = int(orig_width * scale_factor)
height = int(orig_height * scale_factor)

# Define codec and create a VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

# Top-down view window settings
top_view_size = 800  # Fixed size for the top-down visualization
scaling_factor = width / 2  # Adjust scale of objects in the top-down view

# Frame rate control variables
start_time = time.time()
frame_count = 0
priorDetections = np.empty((0, 5))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break  # Exit if the video ends

    # Resize frame to standard size while maintaining aspect ratio
    frame = cv2.resize(frame, (width, height))

    # Adaptive frame rate control
    frame_count += 1
    elapsed_time = time.time() - start_time

    if elapsed_time >= time_interval:
        if frame_count < frames_per_time:
            print(f"Warning: Processing {frame_count} frames in {time_interval} sec (Below target: {frames_per_time})")
        frame_count = 0
        start_time = time.time()

    # Run YOLO model on the frame
    results = model(frame)

    # Extract detections
    detections = []
    for result in results:
        frame_with_detections = result.plot()  # Draw detections on frame
        detected_objects = result.boxes.data.cpu().numpy()

        for det in detected_objects:
            x_min, y_min, x_max, y_max, conf, class_id = det[:6]  # Extract bounding box and class

            # Append detection format for SORT [x_min, y_min, x_max, y_max, confidence]
            detections.append([x_min, y_min, x_max, y_max, conf])

    # Convert to NumPy array
    detections = np.array(detections)
    
    # Ensure there is at least one valid detection before updating the tracker
    if detections.shape[0] == 0:
        detections = priorDetections
    else:
        priorDetections = detections

    # Update tracker
    tracked_objects = detections#tracker.update(detections)

    # Create an empty top-down view canvas
    top_down_view = np.zeros((top_view_size, top_view_size, 3), dtype=np.uint8)

    # Process tracked objects
    for track in tracked_objects:
        x_min, y_min, x_max, y_max, obj_id = track[:5]

        # Compute the center
        center_x = int((x_min + x_max) / 2)
        center_y = int((y_min + y_max) / 2)
        box_width = int(x_max - x_min)
        box_height = int(y_max - y_min)

        # Relative depth estimate (larger boxes = closer)
        relative_depth = 1 / (box_width * box_height) if box_width * box_height > 0 else 0

        # Map object position to top-down view
        top_x = int(top_view_size / 2 + (center_x - width / 2) * (top_view_size / width))
        top_y = int(top_view_size - (relative_depth * scaling_factor * 5000))  

        # Ensure bounding box stays within top-down view
        top_x = np.clip(top_x, 0, top_view_size - 1)
        top_y = np.clip(top_y, 0, top_view_size - 1)

        top_box_width = max(5, int(box_width * (top_view_size / width)))
        top_box_height = max(5, int(box_height * (top_view_size / height)))

        top_left_x = np.clip(top_x - top_box_width // 2, 0, top_view_size - 1)
        top_left_y = np.clip(top_y - top_box_height // 2, 0, top_view_size - 1)
        bottom_right_x = np.clip(top_x + top_box_width // 2, 0, top_view_size - 1)
        bottom_right_y = np.clip(top_y + top_box_height // 2, 0, top_view_size - 1)

        # Draw bounding box in top-down view
        cv2.rectangle(top_down_view, (top_left_x, top_left_y), (bottom_right_x, bottom_right_y), (255, 0, 0), 2)

    # Resize and display top-down view
    top_down_resized = cv2.resize(top_down_view, (width // 2, height))
    combined_view = np.hstack((frame_with_detections, top_down_resized))

    cv2.imshow("YOLO + SORT Tracking", combined_view)

    # Write the frame to the output video file
    out.write(frame_with_detections)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break
    elif key == ord('l'):  # Fast forward
        cap.set(cv2.CAP_PROP_POS_FRAMES, min(cap.get(cv2.CAP_PROP_POS_FRAMES) + frame_jump, total_frames - 1))
    elif key == ord('r'):  # Rewind
        cap.set(cv2.CAP_PROP_POS_FRAMES, max(cap.get(cv2.CAP_PROP_POS_FRAMES) - frame_jump, 0))

# Release resources
cap.release()
out.release()
cv2.destroyAllWindows()
