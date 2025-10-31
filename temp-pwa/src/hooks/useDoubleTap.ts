import { useRef, useCallback } from "react";

// ✅ Adjust the import path below if needed
import { alertAPI } from "@/lib/api"; // we’ll define this next

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
        // Get current location
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            })
        );

        const { latitude, longitude } = position.coords;
        console.log("📍 Location:", latitude, longitude);

        // Send to backend
        await alertAPI.sendAlert({
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
          trigger: "double_tap",
        });

        console.log("🚨 Alert sent to backend successfully!");

        if (onDoubleTap) onDoubleTap();
      } catch (err) {
        console.error("❌ Failed to send alert:", err);
        alert("Unable to access GPS or send alert.");
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
