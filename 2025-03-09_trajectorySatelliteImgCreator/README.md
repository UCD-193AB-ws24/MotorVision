

trajectoryImgGenerator.py

- inputs:
    - df: pd.DataFrame w/ columns Latitude, Longitude
        - option 1 for accessing dataframe:
            csv_file = "inputFiles/Motorcyclist_Trajectory.csv"
            df = pd.read_csv(csv_file)
        - option 2:
            df = simulate_motorcyclist_trajectory(duration_mins=15, spacing_secs=5)
    - output_html_file = ```<output html file path>```
    - output_png_file = ```<output png file path>```

- outputs:
    - html snapshot of motorcyclist trajectory
    - png snapshot of motorcyclist trajectory

