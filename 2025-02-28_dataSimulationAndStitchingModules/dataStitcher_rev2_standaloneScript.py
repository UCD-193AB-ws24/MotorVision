import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import splprep, splev

def get_smoothened_line_points(x, y):
    # Stack the coordinates for a parametric spline.
    points = np.vstack((x, y))
    # Compute the spline representation (s=0 forces interpolation through points).
    tck, u = splprep(points, s=0, per=False)  
    # Evaluate the spline at many points for a smooth curve.
    u_fine = np.linspace(0, 1, 1000)
    x_smooth, y_smooth = splev(u_fine, tck)
    return np.array(x_smooth), np.array(y_smooth)

def compute_headings(curve_x, curve_y):
    headings = np.empty_like(curve_x, dtype=float)
    for i in range(len(curve_x) - 1):
        dx = curve_x[i+1] - curve_x[i]
        dy = curve_y[i+1] - curve_x[i]  # (This line remains unchanged from your version)
        headings[i] = np.arctan2(curve_y[i+1] - curve_y[i], curve_x[i+1] - curve_x[i])
    headings[-1] = headings[-2]
    return headings

def plot_nearby_vehicle_trajectories(x_left, y_left, x_right, y_right):
    # plot the smoothened other vehicle trajectories
    x_left_smooth, y_left_smooth = get_smoothened_line_points(x_left, y_left)
    x_right_smooth, y_right_smooth = get_smoothened_line_points(x_right, y_right)
    plt.plot(x_left_smooth, y_left_smooth, '-', lw=2, label='Left Vehicle Trajectory', color="purple")
    plt.plot(x_right_smooth, y_right_smooth, '-', lw=2, label='Right Vehicle Trajectory', color="orange")

def plot_nearby_vehicle_proximity_arcs(x_left, y_left, x_right, y_right):
    # For each vehicle point, draw an arc that uses only the closer sensor’s distance.
    for i in range(len(x)):
        # Use the corresponding smooth trajectory point as the arc center.
        center = np.array([centers_x[i], centers_y[i]])
        
        # Compute the polar angles (from center) for both sensor endpoints.
        theta_left = np.arctan2(y_left[i] - center[1], x_left[i] - center[0])
        theta_right = np.arctan2(y_right[i] - center[1], x_right[i] - center[0])
        
        # Compute distances from center to each sensor endpoint.
        r_left = np.hypot(x_left[i] - center[0], y_left[i] - center[1])
        r_right = np.hypot(x_right[i] - center[0], y_right[i] - center[1])
        
        # Determine which sensor is closer.
        if r_left <= r_right:
            r_arc = r_left
            arc_start = theta_left
            # Reproject the farther sensor (right) onto the circle of radius r_arc.
            arc_end = theta_right  # Use true theta_right but later reproject it.
        else:
            r_arc = r_right
            arc_start = theta_right
            arc_end = theta_left

        # To ensure we take the shorter (and rearward) arc, compute the angular difference.
        dtheta = (arc_end - arc_start) % (2*np.pi)
        if dtheta > np.pi:
            dtheta = dtheta - 2*np.pi  # choose the shorter arc

        # We now generate the arc starting from the closer sensor's angle and ending at the far side (projected onto the circle of radius r_arc).
        theta_arc = np.linspace(arc_start, arc_start + dtheta, 50)
        arc_x = center[0] + r_arc * np.cos(theta_arc)
        arc_y = center[1] + r_arc * np.sin(theta_arc)
        
        # Plot the arc.
        plt.plot(arc_x, arc_y, '-', lw=1.5, color='gray', alpha=0.8)
        
        # Draw dashed lines from the vehicle coordinate (x[i], y[i]) to the true sensor endpoints.
        plt.plot([x[i], x_left[i]], [y[i], y_left[i]], '--', color='purple', alpha=0.6)
        plt.plot([x[i], x_right[i]], [y[i], y_right[i]], '--', color='orange', alpha=0.6)
        
        # Mark the true sensor endpoints.
        plt.plot(x_left[i], y_left[i], 'o', color='purple', ms=4)
        plt.plot(x_right[i], y_right[i], 'o', color='orange', ms=4)


df = pd.read_csv("sim0_noised.csv", index_col=None)
batchSize = 15
for i in range(0,len(df), batchSize):
    # --- Read Data ---
    sub_df = df[i:i+batchSize]
    x, y = sub_df['x'].values, sub_df['y'].values
    d_s1, d_s2 = sub_df["d_s1"].values, sub_df["d_s2"].values  # sensor distances

    # --- Compute Smooth Trajectory and its Headings ---
    x_smooth, y_smooth = get_smoothened_line_points(x, y)
    headings_smooth = compute_headings(x_smooth, y_smooth)

    # --- For each vehicle point, map to the closest point on the smooth trajectory ---
    smoothed_headings = np.empty_like(x, dtype=float)
    centers_x = np.empty_like(x, dtype=float)
    centers_y = np.empty_like(x, dtype=float)
    for i in range(len(x)):
        distances = (x_smooth - x[i])**2 + (y_smooth - y[i])**2
        closest_idx = np.argmin(distances)
        smoothed_headings[i] = headings_smooth[closest_idx]
        centers_x[i] = x_smooth[closest_idx]
        centers_y[i] = y_smooth[closest_idx]

    # --- Define Sensor Projection Angles Relative to Vehicle Heading ---
    # (Fixed offsets relative to the smoothed heading; these place the sensors in the rear.)
    angle_left = smoothed_headings + (0.9 * np.pi)   # e.g. rear-left
    angle_right = smoothed_headings + (1.1 * np.pi)  # e.g. rear-right

    # --- Compute Sensor Projection Endpoints (true proximity points) ---
    x_left = x + d_s1 * np.cos(angle_left)
    y_left = y + d_s1 * np.sin(angle_left)
    x_right = x + d_s2 * np.cos(angle_right)
    y_right = y + d_s2 * np.sin(angle_right)

    # --- Plotting ---
    plt.figure(figsize=(10, 8))
    # Plot the smooth motorcyclist trajectory.
    plt.plot(x_smooth, y_smooth, '-', lw=2, label='Motorcyclist Trajectory')
    plot_nearby_vehicle_trajectories(x_left, y_left, x_right, y_right)
    # Plot the vehicle positions.
    plt.scatter(x, y)#, 'ko-', ms=4, label='Vehicle Positions')
    # plot_nearby_vehicle_proximity_arcs(x_left, y_left, x_right, y_right)

    plt.xlabel('X Position')
    plt.ylabel('Y Position')
    plt.title('Vehicle Trajectory with Arcs from Closer Sensor to the Opposite Side')
    plt.legend()
    plt.grid(True)
    plt.axis('equal')
    plt.show()

    break