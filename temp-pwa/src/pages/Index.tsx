import { useEffect } from "react";
import { Shield, Users, Clock, CheckCircle, Bluetooth, Zap, Smartphone } from "lucide-react";
import { EmergencyButton } from "@/components/EmergencyButton";
import { MotionEmergencyButton } from "@/components/MotionEmergencyButton";
import { PermissionsManager } from "@/components/PermissionsManager";
import { PushSubscriptionManager } from "@/components/PushSubscriptionManager";
import { HeartRateMonitor } from "@/components/HeartRateMonitor";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BluetoothManager } from "@/components/BluetoothManager";
import { Card } from "@/components/ui/card";
import { useLiveLocation } from "@/hooks/useLocation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  // Use the live location hook - updates every 5 minutes automatically
  // Emergency buttons handle instant location updates on their own
  useLiveLocation();

  const features = [
    {
      icon: Shield,
      title: "Instant Protection",
      description: "Double-tap to send emergency alerts with your location instantly",
      gradient: "from-primary/10 to-accent/10",
    },
    {
      icon: Bluetooth,
      title: "Wearable Support",
      description: "Connect smartwatches and panic buttons for hands-free alerts",
      gradient: "from-accent/10 to-primary/10",
    },
    {
      icon: Smartphone,
      title: "Motion Detection",
      description: "Shake your device to trigger emergency alerts when Bluetooth isn't available",
      gradient: "from-success/10 to-primary/10",
    },
    {
      icon: Clock,
      title: "Works Offline",
      description: "Alerts queue and send automatically when connection returns",
      gradient: "from-muted/50 to-muted/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-trust p-2.5 rounded-xl shadow-glow">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-trust bg-clip-text text-transparent">
                  SafeLink
                </h1>
                <p className="text-sm text-muted-foreground">Personal Safety Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-success/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* Permissions Section */}
          <div className="animate-fade-in">
            <PermissionsManager />
          </div>

          {/* Push Notifications Section - NO CREDENTIALS NEEDED! */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <PushSubscriptionManager />
          </div>

          {/* Heart Rate Monitor Section */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <HeartRateMonitor />
          </div>

          {/* Emergency Button Section */}
          <div className="text-center space-y-6 animate-slide-up">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                  Quick Response
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Emergency Alert
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                When you need help, use one of the methods below to send an emergency alert with your precise location.
              </p>
            </div>

            <Tabs defaultValue="double-tap" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="double-tap" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Double Tap
                </TabsTrigger>
                <TabsTrigger value="motion" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Motion Shake
                </TabsTrigger>
              </TabsList>
              <TabsContent value="double-tap">
                <EmergencyButton />
              </TabsContent>
              <TabsContent value="motion">
                <MotionEmergencyButton />
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-center gap-2 text-sm text-success bg-success/10 px-4 py-2 rounded-full inline-flex">
              <CheckCircle className="h-4 w-4" />
              <span>Protected by end-to-end encryption</span>
            </div>
          </div>

          {/* Bluetooth Section */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <BluetoothManager />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 shadow-soft hover:shadow-glow transition-all duration-300 border-primary/10 group hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-xl group-hover:shadow-elevated transition-all`}>
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="p-8 shadow-elevated bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-gradient-trust p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-xl">How It Works</h3>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3 items-start">
                <span className="font-bold text-lg text-primary min-w-[24px]">1</span>
                <div>
                  <strong className="text-foreground">Trigger emergency alert</strong>
                  <p className="text-muted-foreground mt-1">Double-tap the button or shake your device 3 times quickly</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-bold text-lg text-primary min-w-[24px]">2</span>
                <div>
                  <strong className="text-foreground">Automatic location capture</strong>
                  <p className="text-muted-foreground mt-1">High-precision GPS coordinates are recorded instantly</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-bold text-lg text-primary min-w-[24px]">3</span>
                <div>
                  <strong className="text-foreground">Instant notifications sent</strong>
                  <p className="text-muted-foreground mt-1">Emergency contacts receive push notifications with your location</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-bold text-lg text-primary min-w-[24px]">4</span>
                <div>
                  <strong className="text-foreground">Offline backup support</strong>
                  <p className="text-muted-foreground mt-1">Alerts queue locally and sync when connection returns</p>
                </div>
              </li>
            </ol>
          </Card>
        </div>
      </main>

      {/* Install Prompt */}
      <InstallPrompt />

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">SafeLink</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Your safety is our priority</p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-alert">Emergency services:</strong> Always call 911 for immediate danger
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;