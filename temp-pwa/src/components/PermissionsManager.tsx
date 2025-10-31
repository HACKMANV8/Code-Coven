import { useState, useEffect } from "react";
import { Bell, MapPin, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationService } from "@/services/locationService";
import { NotificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";

interface PermissionStatus {
  notifications: NotificationPermission | "unsupported";
  location: PermissionState | "unsupported";
}

export const PermissionsManager = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    notifications: "default",
    location: "prompt",
  });
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const notificationStatus = NotificationService.isSupported()
      ? NotificationService.getPermissionStatus()
      : "unsupported";

    const locationStatus = await LocationService.requestPermission();

    setPermissions({
      notifications: notificationStatus,
      location: locationStatus,
    });
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await NotificationService.requestPermission();
      
      if (permission === "granted") {
        // Subscribe to push notifications
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await NotificationService.subscribeToPush(registration);
        }

        toast({
          title: "Notifications Enabled",
          description: "You'll receive emergency alerts on this device.",
        });
      }

      await checkPermissions();
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Permission Failed",
        description: "Unable to enable notifications. Please check browser settings.",
        variant: "destructive",
      });
    }
  };

  const requestLocationPermission = async () => {
    try {
      await LocationService.getCurrentLocation();
      
      toast({
        title: "Location Access Granted",
        description: "Emergency alerts will include your precise location.",
      });

      await checkPermissions();
    } catch (error) {
      console.error("Error requesting location permission:", error);
      toast({
        title: "Location Access Denied",
        description: "Please enable location access in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: NotificationPermission | PermissionState | "unsupported") => {
    if (status === "granted") {
      return <Check className="h-4 w-4 text-success" />;
    } else if (status === "denied" || status === "unsupported") {
      return <X className="h-4 w-4 text-alert" />;
    }
    return null;
  };

  const allGranted =
    permissions.notifications === "granted" && permissions.location === "granted";

  if (allGranted) {
    return null; // Don't show if all permissions are granted
  }

  return (
    <Card className="p-6 shadow-soft border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Setup Required</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Grant permissions for the best emergency alert experience
      </p>

      <div className="space-y-3">
        {permissions.notifications !== "granted" && permissions.notifications !== "unsupported" && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive emergency alerts instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(permissions.notifications)}
              <Button
                size="sm"
                onClick={requestNotificationPermission}
                variant="outline"
              >
                Enable
              </Button>
            </div>
          </div>
        )}

        {permissions.location !== "granted" && permissions.location !== "unsupported" && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Location Access</p>
                <p className="text-xs text-muted-foreground">
                  Share precise location in alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(permissions.location)}
              <Button
                size="sm"
                onClick={requestLocationPermission}
                variant="outline"
              >
                Enable
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
