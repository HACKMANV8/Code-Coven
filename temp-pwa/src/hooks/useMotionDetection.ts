import { useState, useEffect } from "react";
import { sendEmergencyAlert } from "@/services/alertService";
import { NotificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";

export const useMotionDetection = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [motionCount, setMotionCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastUpdate = 0;
    let shakeCount = 0;

    const handleMotionEvent = (event: DeviceMotionEvent) => {
      if (!isMonitoring) return;

      const currentTime = new Date().getTime();
      if ((currentTime - lastUpdate) > 100) {
        const diffTime = (currentTime - lastUpdate);
        lastUpdate = currentTime;

        const x = event.accelerationIncludingGravity?.x || 0;
        const y = event.accelerationIncludingGravity?.y || 0;
        const z = event.accelerationIncludingGravity?.z || 0;

        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > 15) { // Threshold for shake detection
          shakeCount++;
          setMotionCount(shakeCount);
          
          // If device is shaken 3 times in quick succession, trigger emergency
          if (shakeCount >= 3) {
            handleEmergencyTrigger();
            shakeCount = 0;
          }
          
          // Reset count after 2 seconds of no shaking
          setTimeout(() => {
            if (shakeCount > 0 && shakeCount < 3) {
              setMotionCount(0);
              shakeCount = 0;
            }
          }, 2000);
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    const handleEmergencyTrigger = async () => {
      try {
        // Get current location with better error handling
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
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
        });

        const { latitude, longitude } = position.coords;
        
        // Send emergency alert
        await sendEmergencyAlert({ latitude, longitude });
        
        // Show success notification with location
        const locationText = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        // Try to show notification with proper permission handling
        try {
          await NotificationService.showNotification("Emergency Alert Sent", {
            body: `Your emergency contacts have been notified. ${locationText}`,
            tag: "emergency-alert",
            requireInteraction: true,
          });
        } catch (notificationError) {
          console.warn("Could not show notification:", notificationError);
          // Fallback to local notification with location
          NotificationService.showLocalNotification(
            "Emergency Alert Sent",
            `Your emergency contacts have been notified. ${locationText}`
          );
          // Also show toast notification
          toast({
            title: "Emergency Alert Sent",
            description: `Your emergency contacts have been notified. ${locationText}`,
          });
          return;
        }
        
        toast({
          title: "Emergency Alert Sent",
          description: `Your emergency contacts have been notified. ${locationText}`,
        });

      } catch (error) {
        console.error("Failed to send emergency alert:", error);
        
        // Handle different types of errors
        let errorMessage = "Unable to access GPS or send emergency alert.";
        
        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
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
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Alert Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    if (isMonitoring && typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotionEvent);
    }

    return () => {
      if (typeof DeviceMotionEvent !== 'undefined') {
        window.removeEventListener('devicemotion', handleMotionEvent);
      }
    };
  }, [isMonitoring, toast]);

  const startMonitoring = () => {
    if (typeof DeviceMotionEvent !== 'undefined') {
      setIsMonitoring(true);
      setMotionCount(0);
    } else {
      toast({
        title: "Motion Detection Not Supported",
        description: "Your device does not support motion detection.",
        variant: "destructive",
      });
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setMotionCount(0);
  };

  return {
    isMonitoring,
    motionCount,
    startMonitoring,
    stopMonitoring
  };
};