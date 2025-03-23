
# library imports

import os

# local imports
# NOTE: to run this script effectively, you must move it into project base folder

from helperFunctionsForFrameDataRetriever.Timer import Timer



# set video file path
filePath = r"C:\Ayush\2025-2021_UC_Davis_Undergraduate_FileHub\2025_SQ\ECS193B\2025_AyushBackendScripts\2025-03-15_ObjTracking\inputFiles\Reckless Motorcyclist.mp4"
Timer.s()


# time-test for cv2 reader
import cv2
Timer.e("imported cv2")
cap = cv2.VideoCapture(filePath)
i = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    i += 1
cap.release()
Timer.e("ran cv2")

# time-test for av reader
import av
Timer.e("imported av")
container = av.open(filePath)
i = 0
for frame in container.decode(video=0):
    img = frame.to_ndarray(format='rgb24')  # (H, W, 3) numpy array
    # print(f"Frame: {i}, Shape: {img.shape}")
    i += 1
Timer.e("ran av")



# # time-test for imageio reader
# import imageio
# Timer.e("imported imageio")
# reader = imageio.get_reader(filePath)
# i = 0
# for frame in reader:
#     i += 1
# reader.close()
# Timer.e("ran imageio")



