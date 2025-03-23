

import time
import threading
import pandas as pd
import keyboard
import cv2
import os
from datetime import datetime
from collections import deque
from djitellopy import Tello

class DroneDataRecorder:
    def __init__(self, outputDirectory):
        self.tello = Tello()
        self.tello.connect()
        print("Drone battery level:", self.tello.get_battery(), "%")
        self.outputDirectory = outputDirectory

    def runDataDisplayerRecorder(self, FPS_video=1, FPS_telemetry=4, recordingWindowInMinutes=2):

        self.tello.streamon()

        # event variables for thread synchronization
        DataFetchingThreadsEnabled = threading.Event()
        DataFetchingThreadsEnabled.set()
        CurrentlyRecording = threading.Event()
        CurrentlyRecording.clear()

        # initialize and run the two data-recording threads
        video_thread = threading.Thread(target=self.stream_video, args=(DataFetchingThreadsEnabled,CurrentlyRecording,FPS_video,recordingWindowInMinutes), daemon=True)
        telemetry_thread = threading.Thread(target=self.fetch_telemetry, args=(DataFetchingThreadsEnabled,CurrentlyRecording,FPS_telemetry,recordingWindowInMinutes), daemon=True)
        video_thread.start()
        telemetry_thread.start()
        
        try:
            while True:
                # Handle User-Control Events
                if keyboard.is_pressed('q') or keyboard.is_pressed('esc'):
                    DataFetchingThreadsEnabled.clear()
                    break
                if keyboard.is_pressed(' '):
                    if CurrentlyRecording.is_set():
                        CurrentlyRecording.clear()
                    else:
                        CurrentlyRecording.set()
                time.sleep(1)

        except KeyboardInterrupt:
            pass
        
        # synchronize and terminate all threads
        print("🛑 Program interrupted by user.\n")
        DataFetchingThreadsEnabled.clear()
        telemetry_thread.join()
        video_thread.join()

        # terminate the connection with Tello Drone
        self.tello.streamoff()
        self.tello.end()

    def stream_video(self, threadEnabled, currentlyRecording, FPS, recordingWindowInMinutes):
        
        def save_recording():
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = os.path.join(self.outputDirectory, f"{timestamp}_droneVideoRecording.mp4")

            if not frame_buffer:
                print("⚠️ No frames to save!")
                return

            height, width, _ = frame_buffer[0].shape
            out = cv2.VideoWriter(filename, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (width, height))

            for f in frame_buffer:
                out.write(f)
            out.release()


        maxRecordingFrames = recordingWindowInMinutes* 60 * FPS

        frame_buffer = deque(maxlen=maxRecordingFrames)
        frame_reader = self.tello.get_frame_read()

        print(f"🎥 Video stream started ({FPS} FPS)")
        while threadEnabled.is_set():
            frame = frame_reader.frame
            if frame is None:
                print("⚠️ Warning: Frame is None")
                break
                
            # If recording, append to deque
            if currentlyRecording.is_set():
                frame_buffer.append(frame.copy())  # Store a copy to avoid mutation
                print("REC", end="\r")
                # Draw "REC" on the frame
                rec_frame = frame.copy()
                cv2.putText(rec_frame, "REC", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                cv2.imshow("Tello Video Feed", rec_frame)
            else:
                if len(frame_buffer) > 0:
                    print("🛑 Recording stopped. Saving video...")
                    save_recording()
                    frame_buffer.clear()
                cv2.imshow("Tello Video Feed", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            time.sleep(1/FPS)

        cv2.destroyAllWindows()
        frame_reader.stop()

    def fetch_telemetry(self, threadEnabled, currentlyRecording, FPS, recordingWindowInMinutes):
        
        def save_recording():
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = os.path.join(self.outputDirectory, f"{timestamp}_droneTelemetryRecording.csv")
            # print(row_buffer)
            columns = [key.strip() for s in selected_keys for key in s.split(",")]
            df = pd.DataFrame(list(row_buffer), columns=columns)
            df.to_csv(filename, index=False)

        # recalibrate sensors (assuming we start at rest)
        self.tello.send_rc_control(0, 0, 0, 0)
        time.sleep(0.2)

        accConversionFactor = 1
        velConversionFactor = 1
        baseline_a = [self.tello.get_acceleration_x() * accConversionFactor,
                self.tello.get_acceleration_y() * accConversionFactor,
                self.tello.get_acceleration_z() * accConversionFactor]
        baseline_v = [self.tello.get_speed_x() * velConversionFactor,
                self.tello.get_speed_y() * velConversionFactor,
                self.tello.get_speed_z() * velConversionFactor]

        status_functions = {
            "time": lambda: time.time(),
            "battery": lambda: self.tello.get_battery(),
            "height": lambda: self.tello.get_height(),
            "ax,ay,az": lambda: (
                round(self.tello.get_acceleration_x() * velConversionFactor - baseline_a[0], 3),
                round(self.tello.get_acceleration_y() * velConversionFactor - baseline_a[1], 3),
                round(self.tello.get_acceleration_z() * velConversionFactor - baseline_a[2], 3)
            ),
            "vx,vy,vz": lambda: (
                round(self.tello.get_speed_x() * velConversionFactor - baseline_v[0], 3),
                round(self.tello.get_speed_y() * velConversionFactor - baseline_v[1], 3),
                round(self.tello.get_speed_z() * velConversionFactor - baseline_v[2], 3)
            ),
            "roll,pitch,yaw": lambda: (
                self.tello.get_roll(),
                self.tello.get_pitch(),
                self.tello.get_yaw()
            )
        }

        def select_status_functions(func_dict, keys):
            return [func_dict[key] for key in keys if key in func_dict]

        def get_status_line(selected_keys):
            def unravelValues(values):
                flattened = [x for item in values for x in (item if isinstance(item, tuple) else (item,))]
                return flattened
            
            funcs = select_status_functions(status_functions, selected_keys)
            values = [func() for func in funcs]
            return unravelValues(values)

        selected_keys = ["ax,ay,az", "time", "battery", "height", "roll,pitch,yaw", "vx,vy,vz"]

        maxRecordingRows = recordingWindowInMinutes* 60 * FPS
        row_buffer = deque(maxlen=maxRecordingRows)

        print(f"📡 Telemetry fetch started ({FPS} FPS)")
        while threadEnabled.is_set():
            if currentlyRecording.is_set():
                status_line = get_status_line(selected_keys)
                print(status_line)
                row_buffer.append(status_line)
            else:
                print(f"Battery: {self.tello.get_battery()}% | Height: {self.tello.get_height()}cm")
                if len(row_buffer) > 0:
                    print("🛑 Recording stopped. Saving dataframe...")
                    save_recording()
                    row_buffer.clear()

            time.sleep(1/FPS)


