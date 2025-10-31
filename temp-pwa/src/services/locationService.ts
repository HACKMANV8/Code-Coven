export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export class LocationService {
  static async requestPermission(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    } catch (error) {
      console.error("Error checking location permission:", error);
      return "prompt";
    }
  }

  static async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

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
            timestamp: position.timestamp,
          });
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
    });
  }

  static async watchLocation(
    callback: (location: LocationData) => void
  ): Promise<number> {
    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error("Error watching location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept positions up to 1 minute old
      }
    );
  }

  static clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}