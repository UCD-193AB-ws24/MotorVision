

from helperModulesForDroneDataRecorder.FirewallController import FirewallController
from helperModulesForDroneDataRecorder.WifiController import WifiController
from helperModulesForDroneDataRecorder.DroneDataRecorder import DroneDataRecorder


def main():
    # switch to drone wifi network, disable firewall (temporarily)
    # NOTE: the wifi and firewall settings will be restored upon code termination
    WifiController.switchToDroneNetworkTemporarily(droneNetworkSSID="TELLO-940533")
    FirewallController.disable()

    outputDirectory = "C:/Ayush/2025-2021_UC_Davis_Undergraduate_FileHub/2025_SQ/ECS193B/2025_AyushBackendScripts/2025-03-23_DroneDataRecorder/outputFiles/"
    dataGetter = DroneDataRecorder(outputDirectory)
    dataGetter.runDataDisplayerRecorder()

if __name__ == "__main__":
    print()
    main()
    print()
