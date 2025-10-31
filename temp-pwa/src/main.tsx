import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Ask for location permission when app starts
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = pos.coords;
      console.log("Initial location:", latitude, longitude);
      
      // Send initial location to backend
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
          speed: speed || null
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