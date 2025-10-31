import { useState, useEffect } from "react";
import { Bluetooth, BluetoothConnected, Battery, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BluetoothService, BluetoothDeviceInfo } from "@/services/bluetoothService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const BluetoothManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [device, setDevice] = useState<BluetoothDeviceInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>();
  const [bluetoothError, setBluetoothError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const supported = BluetoothService.isSupported();
    setIsSupported(supported);
    
    if (!supported) {
      setBluetoothError("Web Bluetooth API is not supported in your browser");
    }
    
    // Check if there's already a connected device
    const connectedDevice = BluetoothService.getConnectedDevice();
    if (connectedDevice) {
      setDevice(connectedDevice);
    }
  }, []);

  const handleConnectDevice = async () => {
    setIsConnecting(true);
    setBluetoothError(null);

    try {
      const deviceInfo = await BluetoothService.requestDevice();
      await BluetoothService.connect();
      
      setDevice({ ...deviceInfo, connected: true });

      // Try to get battery level
      const battery = await BluetoothService.getBatteryLevel();
      setBatteryLevel(battery);

      toast({
        title: "Device Connected",
        description: `Successfully connected to ${deviceInfo.name}`,
      });
    } catch (error) {
      console.error("Bluetooth connection error:", error);
      const errorMessage = (error as Error).message || "Could not connect to device";
      setBluetoothError(errorMessage);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await BluetoothService.disconnect();
      setDevice(null);
      setBatteryLevel(undefined);
      setBluetoothError(null);
      
      toast({
        title: "Device Disconnected",
        description: "Bluetooth device has been disconnected",
      });
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6 border-muted bg-muted/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Bluetooth Not Supported</h3>
            <p className="text-sm text-muted-foreground">
              Your browser doesn't support Web Bluetooth API. Try using Chrome, Edge, or Opera on desktop or Android.
            </p>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Try to open documentation or help page
                  window.open('https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API', '_blank');
                }}
              >
                <Info className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-soft border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-lg">
              {device?.connected ? (
                <BluetoothConnected className="h-5 w-5 text-primary" />
              ) : (
                <Bluetooth className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">Bluetooth Devices</h3>
              <p className="text-xs text-muted-foreground">
                {device?.connected 
                  ? "Wearable connected" 
                  : "Connect safety wearables"}
              </p>
            </div>
          </div>

          {device?.connected && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Connected
            </Badge>
          )}
        </div>

        {bluetoothError && (
          <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Connection Error</p>
                <p className="text-xs text-destructive/80">{bluetoothError}</p>
              </div>
            </div>
          </div>
        )}

        {device?.connected ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Bluetooth className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{device.name}</p>
                  <p className="text-xs text-muted-foreground">Active device</p>
                </div>
              </div>
              
              {batteryLevel !== undefined && (
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{batteryLevel}%</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>

            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Emergency trigger enabled:</strong> Your wearable device can now trigger emergency alerts automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Connect a Bluetooth wearable device (smartwatch, fitness tracker, or panic button) to enable automatic emergency alerts.
            </p>

            <Button 
              onClick={handleConnectDevice}
              disabled={isConnecting}
              className="w-full bg-gradient-trust hover:opacity-90"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching for devices...
                </>
              ) : (
                <>
                  <Bluetooth className="h-4 w-4 mr-2" />
                  Connect Bluetooth Device
                </>
              )}
            </Button>

            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Web Bluetooth requires Chrome, Edge, or Opera on desktop, or Chrome on Android. 
                Make sure Bluetooth is enabled on your device.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};