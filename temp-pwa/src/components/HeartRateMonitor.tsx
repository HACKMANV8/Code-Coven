import { useState, useEffect } from "react";
import { Heart, Activity, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHeartRate } from "@/hooks/useHeartRate";
import { useToast } from "@/hooks/use-toast";

/**
 * Heart Rate Monitor Component
 * Displays current heart rate and status
 */
export const HeartRateMonitor = () => {
  const { 
    heartRate, 
    isSupported, 
    isMonitoring, 
    error,
    statusInfo,
    getCurrentHeartRate,
    startMonitoring,
    stopMonitoring 
  } = useHeartRate(false);

  const { toast } = useToast();

  const handleStartMonitoring = async () => {
    const success = await startMonitoring();
    if (success) {
      toast({
        title: "Heart Rate Monitoring Started",
        description: "Monitoring your heart rate...",
      });
    } else {
      toast({
        title: "Heart Rate Not Available",
        description: "Heart rate sensor not available on this device",
        variant: "destructive",
      });
    }
  };

  const handleGetReading = async () => {
    const reading = await getCurrentHeartRate();
    if (reading) {
      toast({
        title: "Heart Rate Measured",
        description: `${reading.bpm} bpm (${statusInfo?.label || 'Unknown'})`,
      });
    } else {
      toast({
        title: "Measurement Failed",
        description: "Could not measure heart rate. Make sure sensor is available.",
        variant: "destructive",
      });
    }
  };

  if (!isSupported && !heartRate) {
    return null; // Don't show if not supported and no reading
  }

  return (
    <Card className="p-6 shadow-soft border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Heart Rate Monitor</h3>
              <p className="text-xs text-muted-foreground">
                Detect heart rate during emergencies
              </p>
            </div>
          </div>
        </div>

        {heartRate && statusInfo ? (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border-2 ${statusInfo.bg} ${statusInfo.color.includes('alert') ? 'border-alert/50' : statusInfo.color.includes('warning') ? 'border-warning/50' : 'border-success/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Heart Rate</span>
                {statusInfo.color.includes('alert') && (
                  <AlertTriangle className="h-4 w-4 text-alert" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{heartRate.bpm}</span>
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
              <div className="mt-2">
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  Status: {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {isMonitoring ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopMonitoring}
                  className="flex-1"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartMonitoring}
                  className="flex-1"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Start Monitoring
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleGetReading}
              >
                Measure Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center py-4">
              Heart rate will be measured automatically during emergency alerts
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleGetReading}
                className="flex-1"
                disabled={!isSupported}
              >
                <Heart className="h-4 w-4 mr-2" />
                Test Heart Rate
              </Button>
              {isSupported && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartMonitoring}
                >
                  Start Monitoring
                </Button>
              )}
            </div>
            {!isSupported && (
              <p className="text-xs text-center text-muted-foreground">
                Heart rate sensor not available on this device
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-alert text-center">{error}</p>
        )}
      </div>
    </Card>
  );
};

