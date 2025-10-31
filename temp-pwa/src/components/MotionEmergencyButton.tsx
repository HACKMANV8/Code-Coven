import { useState } from "react";
import { Zap, Smartphone, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMotionDetection } from "@/hooks/useMotionDetection";
import { useToast } from "@/hooks/use-toast";

export const MotionEmergencyButton = () => {
  const { isMonitoring, motionCount, startMonitoring, stopMonitoring } = useMotionDetection();
  const [isOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
      toast({
        title: "Motion Detection Stopped",
        description: "Emergency trigger via motion detection has been disabled.",
      });
    } else {
      startMonitoring();
      toast({
        title: "Motion Detection Started",
        description: "Shake your device 3 times quickly to trigger emergency alert.",
      });
    }
  };

  return (
    <Card className="p-6 shadow-elevated border-alert/20">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Button
              size="lg"
              onClick={handleToggleMonitoring}
              className={`h-40 w-40 rounded-full transition-all duration-300 shadow-elevated text-lg font-semibold ${
                isMonitoring 
                  ? "bg-gradient-alert hover:opacity-90" 
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Zap className="h-12 w-12" />
                <span>{isMonitoring ? "Monitoring" : "Start"}</span>
                <span className="text-xs opacity-90">
                  {isMonitoring ? "Shake to Trigger" : "Motion Detection"}
                </span>
              </div>
            </Button>
            {!isOnline && (
              <div className="absolute -top-2 -right-2 bg-muted p-2 rounded-full shadow-soft">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {isMonitoring && (
          <div className="bg-primary/10 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Shake device {3 - motionCount} more time(s)
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isMonitoring
              ? "Shake your device 3 times quickly to send an emergency alert"
              : "Enable motion detection to trigger emergency alerts by shaking your device"}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-success" />
                <span>Online - Ready to send alerts</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-alert" />
                <span>Offline - Alerts will queue for later</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};