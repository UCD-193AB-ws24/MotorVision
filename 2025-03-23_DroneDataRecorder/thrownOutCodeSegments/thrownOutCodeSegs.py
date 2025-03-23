
#~~~~~~~~~~~~~
# draw vertical and horizontal lines around each segmentation mask

# for i in range(len(boxes)):
#     if scores[i] >= threshold:
#         box = boxes[i].cpu().numpy()
#         x1, y1, x2, y2 = box.astype(int)
#         color = [random.randint(0, 255) for _ in range(3)]

#         # Draw vertical bars (thicker)
#         overlay[y1:y2, x1-3:x1+3] = color  # Left side
#         overlay[y1:y2, x2-3:x2+3] = color  # Right side

#         # Draw horizontal bar (bottom)
#         overlay[y2-3:y2+3, x1:x2] = color  # Bottom edge

#         # Optional: draw slanted lines from corners
#         # You can define your own geometry or skip these
#         left_start = (x1, y2)
#         left_end = (x1, y1 + (y2 - y1) // 3)
#         right_start = (x2, y2)
#         right_end = (x2, y1 + (y2 - y1) // 3)

#         cv2.line(overlay, left_start, left_end, color, 1)
#         cv2.line(overlay, right_start, right_end, color, 1)


#~~~~~~~~~~~~~
#  3d point plotter from 2d camera points (not workng properly)

import matplotlib.pyplot as plt
# import numpy as np


# def project_3d_to_2d_screen(object_point, fov_x, fov_y, screen_width, screen_height):
#     """
#     Projects a 3D point onto a 2D camera screen assuming:
#     - The camera is at the origin (0,0,0).
#     - The camera is facing along the +X direction.
    
#     Parameters:
#     - object_point: Tuple (X, Y, Z) representing the world coordinates of the object.
#     - fov_x: Horizontal field of view in radians.
#     - fov_y: Vertical field of view in radians.
#     - screen_width: Width of the screen in pixels.
#     - screen_height: Height of the screen in pixels.

#     Returns:
#     - Tuple (u, v) representing the 2D screen coordinates of the object, or None if outside FOV.
#     """
#     X, Y, Z = object_point

#     # Check if the point is behind the camera
#     if X <= 0:
#         return None  # Not visible

#     # Compute perspective projection
#     x_max = np.tan(fov_x / 2)  # Maximum x' range
#     y_max = np.tan(fov_y / 2)  # Maximum y' range

#     u_n = (Y / X) / x_max  # Normalized X
#     v_n = (Z / X) / y_max  # Normalized Y

#     # Check if within the field of view
#     if abs(u_n) > 1 or abs(v_n) > 1:
#         return None  # Out of view

#     # Convert to screen coordinates
#     u = (u_n + 1) / 2 * screen_width
#     v = (1 - v_n) / 2 * screen_height  # Invert Y to match screen coordinates

#     return int(u), int(v)  # Return as pixel coordinates



# def plot_3d_and_2d_projection(object_points, fov_x, fov_y, screen_width, screen_height):
#     """
#     Plots the original 3D points and their 2D projections onto the camera screen.
#     Assumes the camera is at the origin and facing along the +X direction.
#     """
#     fig = plt.figure(figsize=(12, 6))

#     # --- 3D Plot: World Space ---
#     ax1 = fig.add_subplot(121, projection='3d')
#     ax1.scatter(*zip(*object_points), color='r', label="3D Objects")
    
#     # Draw camera position at origin
#     ax1.scatter(0, 0, 0, color='b', label="Camera", s=100)

#     # Draw camera viewing direction (+X axis)
#     ax1.quiver(0, 0, 0, 3, 0, 0, color='b', label="Camera Direction")

#     ax1.set_xlabel("X-axis")
#     ax1.set_ylabel("Y-axis")
#     ax1.set_zlabel("Z-axis")
#     ax1.set_title("3D World Space")
#     ax1.legend()

#     # --- 2D Plot: Projection on Screen ---
#     ax2 = fig.add_subplot(122)
#     ax2.set_xlim(0, screen_width)
#     ax2.set_ylim(0, screen_height)
#     ax2.invert_yaxis()  # Invert Y-axis to match screen coordinates
#     ax2.set_xlabel("Screen X")
#     ax2.set_ylabel("Screen Y")
#     ax2.set_title("Projected 2D Image")

#     for obj in object_points:
#         proj = project_3d_to_2d_screen(obj, fov_x, fov_y, screen_width, screen_height)
#         if proj:
#             ax2.scatter(*proj, color='r')

#     plt.show()


# # Define object points in front of the camera
# object_points = [(5, 2, 1), (10, -3, 2), (7, 4, -1), (6, 0, 3), (8, -2, -3)]
# object_points = [tuple(np.array(i)*3) for i in object_points]

# # Plot the 3D and 2D projection
# fov_x, fov_y, screen_width, screen_height = 40, 40, 200, 100
# plot_3d_and_2d_projection(object_points, fov_x, fov_y, screen_width, screen_height)

#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
#~~~~~~~~~~~~~
