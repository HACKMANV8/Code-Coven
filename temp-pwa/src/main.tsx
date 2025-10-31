import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Ask for location permission when app starts
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = pos.coords;
      console.log("Initial location:", latitude, longitude);
      
      // Fetch nearby landmarks for initial location
      let landmark = null;
      try {
        const { GeocodingService } = await import("./services/geocodingService");
        landmark = await GeocodingService.getNearbyLandmarks(latitude, longitude);
        console.log("🏛️ Initial location landmark:", landmark.displayName || landmark.fullAddress);
      } catch (error) {
        console.warn("Could not fetch landmark for initial location:", error);
      }
      
      // Send initial location to backend with landmark data
      fetch("http://localhost:5000/api/location", {
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
      }).catch(err => console.error("Failed to send initial location:", err));
    },
    (err) => {
      console.warn("Location permission denied or unavailable:", err.message);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
} else {
  console.warn("Geolocation not supported in this browser.");
}

// ✅ Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ Service Worker registered successfully:", registration);
      })
      .catch((error) => {
        console.error("❌ Service Worker registration failed:", error);
      });
  });
}

// ✅ Mount the React App
createRoot(document.getElementById("root")!).render(<App />);