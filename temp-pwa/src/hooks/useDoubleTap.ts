import { useRef, useCallback } from "react";
import { sendEmergencyAlert } from "@/services/alertService";

interface DoubleTapOptions {
  onDoubleTap?: () => void;
  delay?: number;
  tapCount?: number;
}

export const useDoubleTap = ({
  onDoubleTap,
  delay = 300,
  tapCount = 2,
}: DoubleTapOptions) => {
  const tapCounter = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(async () => {
    tapCounter.current += 1;

    if (tapCounter.current === tapCount) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCounter.current = 0;

      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate([100, 100, 100]);

      console.log("Double tap detected — fetching location...");

      try {
        // Get current location with better error handling and timeout management
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error("Location request timed out. Please ensure location services are enabled."));
            }, 15000); // 15 second timeout

            navigator.geolocation.getCurrentPosition(
              (position) => {
                clearTimeout(timeoutId);
                resolve(position);
              },
              (error) => {
                clearTimeout(timeoutId);
                reject(error);
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000, // Accept positions up to 1 minute old
              }
            );
          }
        );

        const { latitude, longitude } = position.coords;
        console.log("📍 Location:", latitude, longitude);

        // Send emergency alert with location
        await sendEmergencyAlert({ latitude, longitude });

        console.log("🚨 Emergency alert sent successfully!");

        if (onDoubleTap) onDoubleTap();
      } catch (err) {
        console.error("❌ Failed to send emergency alert:", err);
        
        // Handle different types of errors
        let errorMessage = "Unable to access GPS or send emergency alert.";
        
        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
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
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        alert(errorMessage);
      }
    } else {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => {
        tapCounter.current = 0;
      }, delay);
    }
  }, [onDoubleTap, delay, tapCount]);

  return handleTap;
};