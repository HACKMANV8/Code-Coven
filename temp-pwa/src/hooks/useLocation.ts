import { useEffect } from "react";

export function useLiveLocation() {
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = pos.coords;
          console.log("📍 Live location update:", latitude, longitude);

          try {
            // Send to backend
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
                speed: speed || null
              }),
            });

            if (!response.ok) {
              console.error("Failed to send location to backend:", response.status);
              return;
            }

            const result = await response.json();
            console.log("✅ Location sent to backend:", result);
          } catch (err) {
            console.error("❌ Error sending location to backend:", err);
          }
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation not supported");
    }
  }, []);
}