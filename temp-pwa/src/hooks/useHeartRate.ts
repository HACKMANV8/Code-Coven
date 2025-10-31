import { useState, useEffect, useRef } from "react";
import { HeartRateService, HeartRateData, getHeartRateStatusInfo } from "@/services/heartRateService";

export const useHeartRate = (monitor: boolean = false) => {
  const [heartRate, setHeartRate] = useState<HeartRateData | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsSupported(HeartRateService.isSupported());
    
    if (monitor) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [monitor]);

  const startMonitoring = async () => {
    if (isMonitoring) return;
    
    setError(null);
    
    // Try to get initial reading
    const initialReading = await HeartRateService.getCurrentHeartRate();
    if (initialReading) {
      setHeartRate(initialReading);
    }

    // Start continuous monitoring
    const success = await HeartRateService.startMonitoring((data: HeartRateData) => {
      setHeartRate(data);
      setError(null);
    });

    if (success) {
      setIsMonitoring(true);
    } else {
      // Fallback: Poll every 5 seconds if direct monitoring not available
      intervalRef.current = setInterval(async () => {
        const reading = await HeartRateService.getCurrentHeartRate();
        if (reading) {
          setHeartRate(reading);
        }
      }, 5000);
      setIsMonitoring(true);
    }
  };

  const stopMonitoring = () => {
    HeartRateService.stopMonitoring();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  };

  const getCurrentHeartRate = async () => {
    try {
      const reading = await HeartRateService.getCurrentHeartRate();
      if (reading) {
        setHeartRate(reading);
        return reading;
      }
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const statusInfo = heartRate ? getHeartRateStatusInfo(heartRate.status) : null;

  return {
    heartRate,
    isSupported,
    isMonitoring,
    error,
    statusInfo,
    getCurrentHeartRate,
    startMonitoring,
    stopMonitoring,
  };
};

