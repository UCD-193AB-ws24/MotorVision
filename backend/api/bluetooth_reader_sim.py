# import serial - get this with the real bluetooth connection
import threading # get this with the real bluetooth connection


class BluetoothReaderSimulation:

    # initiailizes the reader object - this we would still have to make as versatiole
    def __init__(self, port="/dev/rfcomm0", baud_rate=9600, timeout=1):
       
        self.port = port
        self.baud_rate = baud_rate
        self.timeout = timeout
        self.serial_connection = False # this would be a serial object instead
        self.running = False

    # establishes the connection with the module
    # TODO: add commands to ensure that we are connecting with the correct HC-05

    # change this so that it has pairing information (as shown by the bluetooth ready)
    def connect_sim(self):
        """Establishes a connection with the HC-05 module
        - currently serial.connection is a Boolean value
        - serial_connection should be a Serial object instead, where the connection
            is truly created
        - 
        """
        self.serial_connection = True
        if (self.serial_connection == True):
            print(f"Connected to HC-05 on {self.port} at {self.baud_rate} baud.")
            return True
        else:
            print(f"Unable to connect to HC-05. Please try connecting again or connecting to a different device.")
            return False

    # 
    def read_data_sim(self):
        """Continuously reads data from HC-05 and processes it."""
        if not self.serial_connection:
            print("No serial connection. Call connect() first.")
            return

        # checks to make sure that start is happening
        while self.running:
            # data = self.serial_connection.readline().decode("utf-8").strip() # does the data prettying
            # instead of reading from the serial connection, call from the data simulation script

            data = "Let's pretend that this is sim data"

            # swap this out with a try catch block
            if data: # checks not null
                self.process_data(data) # calls process data on this buffer
           

    def process_data_sim(self, data):
        """Processes the received Bluetooth data."""
        print(f"Received: {data}")
        # TODO: Add logic to process data (e.g., send to backend, save to DB, etc.)


    # start and stop connection

    # this would be with the start recording button
    def start_sim(self):
        """Starts the Bluetooth reading in a separate thread."""
        # self.connect() - do this with somethign else
        
        if self.running:
            thread = threading.Thread(target=self.read_data, daemon=True)
            thread.start()
            print("Bluetooth reader thread started.")

    # this would be with the stop recording button
    def stop_sim(self):
        """Stops the Bluetooth connection."""
        self.running = False
        if self.serial_connection:
            self.serial_connection = False
            print("Bluetooth connection closed.")