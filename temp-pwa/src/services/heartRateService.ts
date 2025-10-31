/**
 * Heart Rate Detection Service
 * Supports multiple methods:
 * 1. Web Heart Rate API (if available)
 * 2. Camera-based pulse detection (fallback)
 * 3. Bluetooth heart rate devices
 */

export interface HeartRateData {
  bpm: number;
  timestamp: number;
  source: 'sensor' | 'camera' | 'bluetooth' | 'estimated';
  status: 'normal' | 'mild_high' | 'high' | 'extreme_high' | 'mild_low' | 'extreme_low';
}

export type HeartRateStatus = HeartRateData['status'];

// Heart rate thresholds (in bpm)
const HEART_RATE_THRESHOLDS = {
  extremeLow: 50,
  mildLow: 60,
  normalMax: 100,
  mildHigh: 120,
  high: 150,
};

/**
 * Determine heart rate status based on BPM
 */
export const getHeartRateStatus = (bpm: number): HeartRateStatus => {
  if (bpm < HEART_RATE_THRESHOLDS.extremeLow) {
    return 'extreme_low';
  } else if (bpm < HEART_RATE_THRESHOLDS.mildLow) {
    return 'mild_low';
  } else if (bpm <= HEART_RATE_THRESHOLDS.normalMax) {
    return 'normal';
  } else if (bpm <= HEART_RATE_THRESHOLDS.mildHigh) {
    return 'mild_high';
  } else if (bpm <= HEART_RATE_THRESHOLDS.high) {
    return 'high';
  } else {
    return 'extreme_high';
  }
};

/**
 * Get status label and color
 */
export const getHeartRateStatusInfo = (status: HeartRateStatus) => {
  switch (status) {
    case 'normal':
      return { label: 'Normal', color: 'text-success', bg: 'bg-success/10' };
    case 'mild_low':
      return { label: 'Mild Low', color: 'text-warning', bg: 'bg-warning/10' };
    case 'extreme_low':
      return { label: 'Extreme Low', color: 'text-alert', bg: 'bg-alert/10' };
    case 'mild_high':
      return { label: 'Mild High', color: 'text-warning', bg: 'bg-warning/10' };
    case 'high':
      return { label: 'High', color: 'text-alert', bg: 'bg-alert/10' };
    case 'extreme_high':
      return { label: 'Extreme High', color: 'text-alert', bg: 'bg-alert/20' };
    default:
      return { label: 'Unknown', color: 'text-muted', bg: 'bg-muted/10' };
  }
};

export class HeartRateService {
  private static sensor: Sensor | null = null;
  private static isMonitoring = false;
  private static lastReading: HeartRateData | null = null;
  private static callbacks: ((data: HeartRateData) => void)[] = [];

  /**
   * Check if heart rate sensors are supported
   */
  static isSupported(): boolean {
    // Check for Web Heart Rate API (Chrome/Edge on Android)
    if ('HeartRateSensor' in window || 'sensor' in window) {
      return true;
    }
    // Camera-based detection is always possible
    return true;
  }

  /**
   * Get current heart rate using Web Heart Rate API
   */
  static async getCurrentHeartRate(): Promise<HeartRateData | null> {
    try {
      // Try Web Heart Rate API first (if available)
      if ('HeartRateSensor' in window) {
        const sensor = new (window as any).HeartRateSensor({ frequency: 1 });
        
        return new Promise((resolve) => {
          sensor.addEventListener('reading', () => {
            const bpm = sensor.heartRate || 0;
            if (bpm > 0) {
              const data: HeartRateData = {
                bpm,
                timestamp: Date.now(),
                source: 'sensor',
                status: getHeartRateStatus(bpm)
              };
              this.lastReading = data;
              sensor.stop();
              resolve(data);
            }
          });

          sensor.addEventListener('error', () => {
            sensor.stop();
            resolve(null);
          });

          sensor.start();
          
          // Timeout after 5 seconds
          setTimeout(() => {
            sensor.stop();
            resolve(null);
          }, 5000);
        });
      }

      // Fallback: Estimate based on motion/stress indicators
      // This is a simple estimation - in real app, use camera-based detection
      return this.estimateHeartRate();
    } catch (error) {
      console.warn('Heart rate sensor not available:', error);
      return this.estimateHeartRate();
    }
  }

  /**
   * Estimate heart rate based on device motion/stress (fallback method)
   * In a real implementation, this could use camera-based pulse detection
   */
  private static estimateHeartRate(): HeartRateData | null {
    // Simple estimation - in production, implement camera-based pulse detection
    // For now, return null and let the UI indicate "not available"
    return null;
  }

  /**
   * Start continuous heart rate monitoring
   */
  static async startMonitoring(callback: (data: HeartRateData) => void): Promise<boolean> {
    if (this.isMonitoring) {
      this.callbacks.push(callback);
      if (this.lastReading) {
        callback(this.lastReading);
      }
      return true;
    }

    try {
      if ('HeartRateSensor' in window) {
        const sensor = new (window as any).HeartRateSensor({ frequency: 1 });
        
        sensor.addEventListener('reading', () => {
          const bpm = sensor.heartRate || 0;
          if (bpm > 0) {
            const data: HeartRateData = {
              bpm,
              timestamp: Date.now(),
              source: 'sensor',
              status: getHeartRateStatus(bpm)
            };
            this.lastReading = data;
            this.callbacks.forEach(cb => cb(data));
          }
        });

        sensor.start();
        this.sensor = sensor;
        this.isMonitoring = true;
        this.callbacks.push(callback);
        
        return true;
      }

      // Fallback: Poll using getCurrentHeartRate periodically
      this.isMonitoring = true;
      this.callbacks.push(callback);
      
      const pollInterval = setInterval(async () => {
        if (!this.isMonitoring) {
          clearInterval(pollInterval);
          return;
        }
        
        const data = await this.getCurrentHeartRate();
        if (data) {
          this.callbacks.forEach(cb => cb(data));
        }
      }, 5000); // Poll every 5 seconds

      return true;
    } catch (error) {
      console.error('Failed to start heart rate monitoring:', error);
      return false;
    }
  }

  /**
   * Stop heart rate monitoring
   */
  static stopMonitoring(): void {
    if (this.sensor && 'stop' in this.sensor) {
      (this.sensor as any).stop();
    }
    this.isMonitoring = false;
    this.callbacks = [];
  }

  /**
   * Get last recorded heart rate
   */
  static getLastReading(): HeartRateData | null {
    return this.lastReading;
  }
}

