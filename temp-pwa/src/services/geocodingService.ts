export interface LandmarkData {
  address?: string;
  displayName?: string;
  building?: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  fullAddress?: string;
}

/**
 * Get nearby landmarks and address information using reverse geocoding
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export class GeocodingService {
  /**
   * Reverse geocode coordinates to get address and landmarks
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Promise with landmark/address data
   */
  static async getNearbyLandmarks(
    latitude: number,
    longitude: number
  ): Promise<LandmarkData> {
    try {
      // Use OpenStreetMap Nominatim for reverse geocoding
      // Rate limit: 1 request per second (we'll add a small delay if needed)
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SafeLink-PWA/1.0', // Required by Nominatim
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || !data.address) {
        return {
          displayName: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        };
      }

      const address = data.address;
      
      // Build full address string
      const addressParts: string[] = [];
      
      if (address.building) addressParts.push(address.building);
      if (address.road) addressParts.push(address.road);
      if (address.house_number) addressParts.unshift(address.house_number);
      if (address.suburb || address.neighbourhood) {
        addressParts.push(address.suburb || address.neighbourhood);
      }
      if (address.city || address.town || address.village) {
        addressParts.push(address.city || address.town || address.village);
      }
      if (address.state) addressParts.push(address.state);
      if (address.postcode) addressParts.push(address.postcode);
      if (address.country) addressParts.push(address.country);
      
      const fullAddress = addressParts.length > 0 
        ? addressParts.join(', ')
        : data.display_name || `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      // Prioritize building name or notable landmark
      const displayName = address.building || 
                         address.amenity || 
                         address.leisure || 
                         address.tourism ||
                         address.road ||
                         address.suburb ||
                         address.neighbourhood ||
                         data.display_name?.split(',')[0] ||
                         'Current Location';

      return {
        address: data.display_name || fullAddress,
        displayName,
        building: address.building || undefined,
        road: address.road || undefined,
        suburb: address.suburb || address.neighbourhood || undefined,
        city: address.city || address.town || address.village || undefined,
        state: address.state || undefined,
        country: address.country || undefined,
        postcode: address.postcode || undefined,
        fullAddress,
      };
    } catch (error) {
      console.error("Error fetching landmarks:", error);
      // Return fallback data on error
      return {
        displayName: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        fullAddress: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    }
  }

  /**
   * Format landmark data into a readable string for notifications/SMS
   */
  static formatLandmarkForAlert(landmark: LandmarkData): string {
    if (landmark.fullAddress) {
      return landmark.fullAddress;
    }
    if (landmark.displayName && landmark.road) {
      return `${landmark.displayName}, ${landmark.road}`;
    }
    return landmark.displayName || 'Current Location';
  }
}

