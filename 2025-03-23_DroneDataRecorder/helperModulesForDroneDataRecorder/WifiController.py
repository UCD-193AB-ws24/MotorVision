
import subprocess
import time
import atexit


class WifiController:
    @staticmethod
    def _getCurrentWifiNetwork_SSID():
        result = subprocess.run('netsh wlan show interfaces', capture_output=True, text=True, shell=True)
        for line in result.stdout.splitlines():
            if "SSID" in line and "BSSID" not in line:
                return line.split(":")[1].strip()
        return None
    
    @staticmethod
    def _connectToWifiNetwork(ssid):
        print(f"Connecting to {ssid}...")
        subprocess.run(f'netsh wlan connect name="{ssid}"', shell=True)
        
        result = subprocess.run("netsh wlan show interfaces", capture_output=True, text=True, shell=True)
        time.sleep(5)
        
        print("❌ Failed to connect within timeout.")

    @staticmethod
    def switchToDroneNetworkTemporarily(droneNetworkSSID):
        # get current wifi network
        originalWifiNetwork = WifiController._getCurrentWifiNetwork_SSID()
        print(f"Currently connected to: {originalWifiNetwork}")

        # ensure automatic reconnection to original wifi network upon script termination
        if originalWifiNetwork:
            atexit.register(lambda: WifiController._connectToWifiNetwork(originalWifiNetwork))

        # switch to drone wifi network
        WifiController._connectToWifiNetwork(droneNetworkSSID)

