import { useState } from "react";
import { AlertCircle, MapPin, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { LocationService } from "@/services/locationService";
import { AlertService } from "@/services/alertService";
import { NotificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export const EmergencyButton = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Update online status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  const sendEmergencyAlert = async () => {
    if (isSending) return;

    setIsSending(true);

    try {
      // Get current location
      const location = await LocationService.getCurrentLocation();

      // Send alert to backend
      await AlertService.sendEmergencyAlert({
        location,
        timestamp: Date.now(),
        alertType: "emergency",
        message: "Emergency alert triggered via double-tap",
      });

      // Show local notification
      await NotificationService.showNotification("Emergency Alert Sent", {
        body: `Your emergency contacts have been notified. Location: ${location.latitude.toFixed(
          6
        )}, ${location.longitude.toFixed(6)}`,
        tag: "emergency-alert",
        requireInteraction: true,
      });

      toast({
        title: "Emergency Alert Sent",
        description: "Your emergency contacts have been notified with your location.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to send emergency alert:", error);

      toast({
        title: isOnline ? "Alert Failed" : "Stored for Later",
        description: isOnline
          ? "Unable to send alert. Please try again."
          : "You're offline. Alert will be sent when connection is restored.",
        variant: isOnline ? "destructive" : "default",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDoubleTap = useDoubleTap({
    onDoubleTap: sendEmergencyAlert,
    delay: 300,
    tapCount: 2,
  });

  return (
    <Card className="p-6 shadow-elevated border-alert/20">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Button
              size="lg"
              onClick={handleDoubleTap}
              disabled={isSending}
              className="h-40 w-40 rounded-full bg-gradient-alert hover:opacity-90 transition-all duration-300 shadow-elevated text-lg font-semibold disabled:opacity-50"
            >
              {isSending ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="text-sm">Sending...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-12 w-12" />
                  <span>Double Tap</span>
                  <span className="text-xs opacity-90">for Emergency</span>
                </div>
              )}
            </Button>
            {!isOnline && (
              <div className="absolute -top-2 -right-2 bg-muted p-2 rounded-full shadow-soft">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Double-tap the button to send an emergency alert with your current location
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-success" />
                <span>Online - Ready to send alerts</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-alert" />
                <span>Offline - Alerts will queue for later</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Location tracking active</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
