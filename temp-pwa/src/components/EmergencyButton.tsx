import { useState, useEffect } from "react";
import { AlertCircle, MapPin, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { LocationService } from "@/services/locationService";
import { sendEmergencyAlert } from "@/services/alertService";
import { NotificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export const EmergencyButton = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const sendEmergencyAlertHandler = async () => {
    if (isSending) return;

    setIsSending(true);

    try {
      // Get current location with better error handling
      const location = await new Promise<{ latitude: number; longitude: number; accuracy: number }>(
        (resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Location request timed out. Please ensure location services are enabled."));
          }, 15000); // 15 second timeout

          navigator.geolocation.getCurrentPosition(
            (position) => {
              clearTimeout(timeoutId);
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
            },
            (error) => {
              clearTimeout(timeoutId);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0, // Always get fresh location for emergency alerts
            }
          );
        }
      );

      // Fetch nearby landmarks
      let landmark = null;
      let landmarkText = `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      try {
        const { GeocodingService } = await import("@/services/geocodingService");
        landmark = await GeocodingService.getNearbyLandmarks(
          location.latitude,
          location.longitude
        );
        if (landmark.fullAddress || landmark.displayName) {
          landmarkText = GeocodingService.formatLandmarkForAlert(landmark);
          console.log("🏛️ Emergency alert landmark:", landmarkText);
        }
      } catch (error) {
        console.warn("Could not fetch landmark for emergency, using coordinates:", error);
      }

      // Send alert to backend with location and landmark data
      await sendEmergencyAlert({
        latitude: location.latitude,
        longitude: location.longitude,
        landmark: landmark || undefined
      });

      // Show success notification with location and landmark
      const locationText = landmarkText;
      
      // Try to show notification with proper permission handling
      try {
        await NotificationService.showNotification("Emergency Alert Sent", {
          body: `Your emergency contacts have been notified. ${locationText}`,
          tag: "emergency-alert",
          requireInteraction: true,
        });
      } catch (notificationError) {
        console.warn("Could not show notification:", notificationError);
        // Fallback to toast notification with location
        toast({
          title: "Emergency Alert Sent",
          description: `Your emergency contacts have been notified. ${locationText}`,
          variant: "default",
        });
        return;
      }

      toast({
        title: "Emergency Alert Sent",
        description: `Your emergency contacts have been notified. ${locationText}`,
        variant: "default",
      });

    } catch (error) {
      console.error("Failed to send emergency alert:", error);
      
      // Handle different types of errors
      let errorMessage = "Unable to access GPS or send emergency alert.";
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions for this app.";
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your device's location settings.";
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = "Location request timed out. Please ensure location services are enabled and try again.";
            break;
          default:
            errorMessage = "Unable to access location. Please check your device's location settings.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: isOnline ? "Alert Failed" : "Stored for Later",
        description: isOnline
          ? errorMessage
          : "You're offline. Alert will be sent when connection is restored.",
        variant: isOnline ? "destructive" : "default",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDoubleTap = useDoubleTap({
    onDoubleTap: sendEmergencyAlertHandler,
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