
import pyuac
import subprocess
import atexit
import time

def setToAdminMode():
    if not pyuac.isUserAdmin():
        print("Re-launching as admin!")
        pyuac.runAsAdmin()

def disablePrivateFirewall():
    subprocess.run(["netsh", "advfirewall", "set", "privateprofile", "state", "off"], shell=True)
    print("🔥 Private Firewall DISABLED")

def enablePrivateFirewall():
    subprocess.run(["netsh", "advfirewall", "set", "privateprofile", "state", "on"], shell=True)
    print("🛡️ Private Firewall RE-ENABLED")

# Firewall Controller class to diable/enable a private firewall
# NOTE: Upon termination of the python script, these steps occur automatically:
# - Firewall re-enabled
# - Admin mode privaleges reset
class FirewallController:
    @staticmethod
    def disable():
        setToAdminMode()
        disablePrivateFirewall()

        print("Firewall temporarily disabled.")
        print("Firewall will automaticall be re-enabled upon script termination.")
        print()

        # Ensure firewall is re-enabled even if script crashes or exits
        atexit.register(enablePrivateFirewall)

    # # firewall-enabler function
    # # NOTE: This is not needed anymore, as it will automatically be re-enabled
    # def enable(self):
    #     enablePrivateFirewall()

if __name__ == "__main__":
    print()
    FirewallController.disable()

    # place your driver code here
    print("Running Tello script...")
    time.sleep(4)

    # calling FirewallController.enable() is not needed, since it gets called automatically
    print()