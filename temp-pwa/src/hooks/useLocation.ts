import { useEffect, useRef } from "react";
import { GeocodingService } from "@/services/geocodingService";

const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useLiveLocation() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const sendLocationToBackend = async (pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = pos.coords;
    console.log("📍 Location update:", latitude, longitude);

    try {
      // Fetch nearby landmarks
      let landmark = null;
      try {
        landmark = await GeocodingService.getNearbyLandmarks(latitude, longitude);
        console.log("🏛️ Nearby landmark:", landmark.displayName || landmark.fullAddress);
      } catch (geocodingError) {
        console.warn("Could not fetch landmarks, continuing without them:", geocodingError);
      }

      // Send to backend with landmark data
      const response = await fetch("http://localhost:5000/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          latitude, 
          longitude,
          accuracy,
          altitude: altitude || null,
          altitudeAccuracy: altitudeAccuracy || null,
          heading: heading || null,
          speed: speed || null,
          landmark: landmark || undefined
        }),
      });

      if (!response.ok) {
        console.error("Failed to send location to backend:", response.status);
        return;
      }

      const result = await response.json();
      console.log("✅ Location sent to backend:", result);
      lastUpdateRef.current = Date.now();
    } catch (err) {
      console.error("❌ Error sending location to backend:", err);
    }
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      return;
    }

    // Send initial location immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendLocationToBackend(pos);
      },
      (err) => console.error("Initial location error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    // Set up interval to update location every 5 minutes
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendLocationToBackend(pos);
        },
        (err) => console.error("Location update error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 } // Accept positions up to 5 minutes old
      );
    }, LOCATION_UPDATE_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Export function to trigger instant update (for emergency button)
  return {
    updateLocationInstantly: async () => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            sendLocationToBackend(pos);
            resolve(pos);
          },
          (err) => {
            console.error("Instant location update error:", err);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Always get fresh location for emergency
        );
      });
    }
  };
}