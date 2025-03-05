# import serial - get this with the real bluetooth connection
import threading # get this with the real bluetooth connection


class BluetoothReaderSimulation:

    # initiailizes the reader object - this we would still have to make as versatiole
    def __init__(self, port="/dev/rfcomm0", baud_rate=9600, timeout=1, filename):
        """
        Actual: Bluetooth reader constructor where serial_connection is a Serial object.
        Simulation: Port, baud_rate, timeout stay the same. Serial_connection and running are booleans that 
            are manually flipped as different bluetooth methods are called.
        """
        # bluetooth processing
        self.port = port
        self.baud_rate = baud_rate
        self.timeout = timeout
        self.serial_connection = False # this would be a serial object instead
        self.running = False
        
        # data values -> possibly make this another object (like a data something something)
        self.buffer = []
        self.last_recording = []
        self.ride_statistics = {"time": [], "speed": []}

        #simulation values
        self.csv_name = filename
        self.data = [] # data that csv file is sent to
        self.data_index = 0

 
    # change this so that it has pairing information (as shown by the bluetooth ready)
    def connect_sim(self):
        """
        Actual: Establishes a connection with the HC-05 module - uses a try catch block and proper error handling
            - Can return an error/exception.
        Simulation: Flip serial_connection bool and doesn't actually return an error.
            - Flips serial_connection boolean.
            - Prints a connect/disconnection message. 
- 
        """
        self.serial_connection = True

        # open csv and store into data list
        with open(file_path, newline=" ") as file:
            reader = csv.reader(filename)
            data = list(reader)

        # connection statements
        if (self.serial_connection == True):
            print(f"Connected to HC-05 on {self.port} at {self.baud_rate} baud.")
            return True
        else:
            print(f"Unable to connect to HC-05. Please try connecting again or connecting to a different device.")
            return False
    
    def process_buffer_endpoint(self, endpoint): # TODO

        # add to running totals
        print("Adding the endpoint of sliding window", endpoint)
        ride_statistics[endpoint] = "Done";            

    def process_ride_statistics(self):
        # do a check to see that the bluetooth indeed has not been disconnected

        if self.serial_connection or self.running:
            print("Need to disconnect first. Please click stop recording")
            return
        
        print("Sending ride_statistics to cloud", ride_statistics)

    # realisitically, this would be actually calling the serial connection
    def read_data_sim(self): # TODO
        """
        Actual: Continuously reads data from HC-05 and processes it.
        Simulation: Loops through an imported csv file through buffers of 8 rows at a time, and sends it to process data.

        """
        # check to see if connect has been called yet
        if not self.serial_connection:
            print("No serial connection. Call connect() first.")
            return

        # starting to go through the data list
        
        # only build if stop is not pressed and buffer is less than 30 (and haven't reached max of csv)
        while self.running and data_index < len(data) and len(buffer) <= 30: # 30 because its supposed to be 15 min * twice
            buffer.append(data[data_index])
            data_index += 1
        
        # basically this means that we have reach the buffer capacity, but we are
        # still recording
        while self.running and data_index < len(data):
            process_buffer_endpoint(buffer[-1]) # process the last value
            buffer.pop() # pop last value
            buffer.append(data[data_index]) # insert at beginnging
            data_index += 1
    

    def process_final_buffer(self):
        """
        Actual: Processes the received Bluetooth data.
        Simulation: Processes the 'received' Bluetooth data in buffers. Ideally make some kind of DB call.
            - Final buffer (partially populated if ride < 15 minutes) (fully populated if ride if >= 15 minutes)
            - This is the buffer used to develop the crash report
        """
        # do a check to see that the bluetooth indeed has not been disconnected
        if self.serial_connection or self.running:
            print("Need to disconnect first. Please click stop recording")
            return
    
        print(f"Likely send the last buffer to the cloud", buffer)
        # TODO: Add logic to process data (e.g., send to backend, save to DB, etc.)


    # start and stop connection

    # this would be with the start recording button - starts capturing button
    # all this does is starts the recording in a new thread
    def start_sim(self):
        """
        Actual: Starts the Bluetooth reading in a separate thread.
        Simulation: Same. Only read_data is changed for simulation.
            - Flips the boolean running.
            - Flips the boolean serial_connection.
            - Calls read data on another thread.

        """
        self.running = True
        if self.running:
            thread = threading.Thread(target=self.read_data_sim, daemon=True)
            thread.start()
            print("Bluetooth reader thread started.")

    # this would be with the stop recording button
    def stop_sim(self):
        """
        Actual: Stops the Bluetooth connection using Serial object.
        Simulation: 
            - Flips the boolean running.
            - Flips the boolean serial_connection.
            - Calls the process_data() function, which processes the 
                most recent buffer. If ride <= 15 min, then this is a
                partially filled buffer. If ride > 15 min, then the 
                sliding window functionality will have been implenented.

        """
        self.running = False

        if self.serial_connection:
            self.serial_connection = False
            print("Bluetooth connection closed.")
        
        process_final_buffer() # crash report
        process_ride_statistics() # user statistics


        """
        - database processing: go through each line 
        - extract the first 6 values of each row
        - go through each row 

        Statistics:
        - average distance (per trip)
        - total distance (across all trips)
        - average speed

        Crash Report:

        """