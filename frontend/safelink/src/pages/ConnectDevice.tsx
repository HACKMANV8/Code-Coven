import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bluetooth, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { WaveHeader } from "@/components/WaveHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NotificationBanner } from "@/components/NotificationBanner";
import { deviceAPI } from "@/lib/api";

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  macAddress?: string;
  isConnected: boolean;
  batteryLevel: number;
  lastConnected: string;
  signal?: string;
}

const mockAvailableDevices = [
  { id: "safelink-band-pro", name: "SafeLink Band Pro", signal: "Strong" },
  { id: "safelink-pendant", name: "SafeLink Pendant", signal: "Medium" },
  { id: "safelink-watch", name: "SafeLink Watch", signal: "Strong" },
];

export default function ConnectDevice() {
  const navigate = useNavigate();
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch connected device on component mount
  useEffect(() => {
    fetchConnectedDevice();
  }, []);

  const fetchConnectedDevice = async () => {
    try {
      setIsLoading(true);
      const device = await deviceAPI.getConnected();
      setConnectedDevice(device);
    } catch (error) {
      console.log("No device connected");
      setConnectedDevice(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ New: Actual Bluetooth scanning + backend integration
  const handleScanBluetooth = async () => {
    try {
      console.log("Scanning for devices...");
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service"],
      });

      console.log("Connected device:", device);
      alert(`Connected to ${device.name || "Unknown Device"}`);

      // Send device info to backend
      await deviceAPI.connect({
        deviceId: device.id,
        deviceName: device.name || "Unnamed Device",
        deviceType: "Bluetooth",
        macAddress: "N/A", // Browsers hide MACs for privacy
      });

      showNotification(`✅ Connected to ${device.name || "Unnamed Device"}`);
      fetchConnectedDevice();
    } catch (err) {
      console.error("Bluetooth scan failed:", err);
      alert("Failed to connect or scan: " + err);
    }
  };

  const handleConnect = async (deviceId: string, deviceName: string) => {
    setIsConnecting(true);

    try {
      // Generate random MAC-like string
      const macAddress = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
      )
        .join(":")
        .toUpperCase();

      const deviceData = {
        deviceId,
        deviceName,
        deviceType: "wearable",
        macAddress,
      };

      const response = await deviceAPI.connect(deviceData);

      if (response.device) {
        setConnectedDevice(response.device);
        showNotification("✅ Device connected successfully!");
      }
    } catch (error) {
      console.error("Connection error:", error);
      showNotification("❌ Failed to connect device");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedDevice) return;

    try {
      await deviceAPI.disconnect(connectedDevice.deviceId);
      setConnectedDevice(null);
      showNotification("Device disconnected");
    } catch (error) {
      console.error("Disconnect error:", error);
      showNotification("❌ Failed to disconnect device");
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const getSignalStrength = () => {
    if (!connectedDevice) return "N/A";
    const battery = connectedDevice.batteryLevel;
    if (battery > 70) return "Strong";
    if (battery > 30) return "Medium";
    return "Weak";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {!bluetoothOn && (
        <NotificationBanner message="⚠️ Please turn on Bluetooth to connect your device." />
      )}
      {notification && <NotificationBanner message={notification} />}

      <Navbar />

      <WaveHeader className="mt-16" contentClassName="pb-20 md:pb-24">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Bluetooth size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Connect Device
            </h1>
            <p className="text-primary-foreground/90">
              Pair your safety devices via Bluetooth
            </p>
          </div>
        </div>
      </WaveHeader>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Bluetooth
                </h3>
                <p className="text-sm text-muted-foreground">
                  {bluetoothOn
                    ? "Scanning for devices..."
                    : "Turn on to find devices"}
                </p>
              </div>
              <Switch checked={bluetoothOn} onCheckedChange={setBluetoothOn} />
            </div>
          </Card>
        </motion.div>

        {/* ✅ Added Bluetooth Scan Button */}
        <div className="text-center mb-6">
          <Button
            onClick={handleScanBluetooth}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all"
          >
            🔍 Scan for Bluetooth Devices
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Checking connected devices...
            </p>
          </div>
        ) : connectedDevice ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Connected Device
            </h2>
            <Card className="p-5 card-shadow mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-2xl">
                      <Bluetooth className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">
                        {connectedDevice.deviceName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Signal: {getSignalStrength()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-500/10 text-green-600 text-sm font-medium rounded-full">
                      Connected
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Battery Level
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {connectedDevice.batteryLevel}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Device Type
                    </p>
                    <p className="text-lg font-semibold text-foreground capitalize">
                      {connectedDevice.deviceType}
                    </p>
                  </div>
                </div>

                {connectedDevice.macAddress && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      MAC Address
                    </p>
                    <p className="text-sm font-mono text-foreground">
                      {connectedDevice.macAddress}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Last Connected
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(connectedDevice.lastConnected).toLocaleString()}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  className="w-full rounded-2xl mt-4"
                >
                  Disconnect Device
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          bluetoothOn && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Available Devices
              </h2>

              {mockAvailableDevices.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="p-5 card-shadow hover:card-shadow-hover transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                          <Bluetooth className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {device.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Signal: {device.signal}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleConnect(device.id, device.name)}
                        disabled={isConnecting}
                        className="rounded-2xl"
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}

              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 mt-6">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 <strong>Tip:</strong> Make sure your device is in pairing
                  mode and close to this device for best connection.
                </p>
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
}
