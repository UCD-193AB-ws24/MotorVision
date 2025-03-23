
import cv2
import time
import os
from datetime import datetime
from collections import deque
import threading


FPS = 10  # Frames per second
RECORDING_WINDOW_MINUTES = 2  # change this to your desired window size
MAX_FRAMES = RECORDING_WINDOW_MINUTES * 60 * FPS
OUTPUT_DIR = "C:/Ayush/2025-2021_UC_Davis_Undergraduate_FileHub/2025_SQ/ECS193B/2025_AyushBackendScripts/2025-03-15_ObjTracking/outputFiles/"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Global flag
recording = False

# Frame storage for sliding window
frame_buffer = deque(maxlen=MAX_FRAMES)

# Lock to prevent threading issues
buffer_lock = threading.Lock()

def drone_video_thread(self, stopEvent):
    global recording
    frame_reader = self.tello.get_frame_read()
    print("🎥 Video stream started (10 FPS)")

    while not stopEvent.is_set():
        frame = frame_reader.frame
        if frame is None:
            print("⚠️ Warning: Frame is None")
            break

        # If recording, append to deque
        if recording:
            with buffer_lock:
                frame_buffer.append(frame.copy())  # Store a copy to avoid mutation
            print("REC", end="\r")
            # Draw "REC" on the frame
            rec_frame = frame.copy()
            cv2.putText(rec_frame, "REC", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.imshow("Tello Video Feed", rec_frame)
        else:
            cv2.imshow("Tello Video Feed", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord(' '):
            # Toggle recording
            recording = not recording
            if recording:
                print("🔴 Recording started")
                with buffer_lock:
                    frame_buffer.clear()  # Clear previous frames
            else:
                print("🛑 Recording stopped. Saving video...")
                save_recording()

        time.sleep(1 / FPS)

    cv2.destroyAllWindows()
    frame_reader.stop()

def save_recording():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(OUTPUT_DIR, f"{timestamp}_droneVideoRecording.mp4")

    with buffer_lock:
        if not frame_buffer:
            print("⚠️ No frames to save!")
            return

        height, width, _ = frame_buffer[0].shape
        out = cv2.VideoWriter(filename, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (width, height))

        for f in frame_buffer:
            out.write(f)
        out.release()

    print(f"✅ Recording saved to {filename}")
