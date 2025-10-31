import { useState, useEffect } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  subscribeToPushNotifications, 
  isPushNotificationSupported,
  getNotificationPermission 
} from "@/services/pushNotificationService";
import { getEmergencyContacts } from "@/services/alertService";

/**
 * Push Subscription Manager
 * Allows users to subscribe to receive emergency push notifications
 * NO CREDENTIALS NEEDED - Uses existing VAPID keys!
 */
export const PushSubscriptionManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSupport();
    checkPermission();
    loadContacts();
  }, []);

  const checkSupport = () => {
    setIsSupported(isPushNotificationSupported());
  };

  const checkPermission = () => {
    setPermission(getNotificationPermission());
  };

  const loadContacts = async () => {
    try {
      const contactList = await getEmergencyContacts();
      setContacts(contactList);
      // Check if any contact has a push subscription
      const hasSubscription = contactList.some((c: any) => c.pushSubscription);
      setIsSubscribed(hasSubscription);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    if (permission === 'denied') {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Subscribe this device (contactId is optional)
      // Each device subscribes independently - perfect for emergency contacts!
      const contactId = contacts.length > 0 ? contacts[0]._id : undefined;
      const success = await subscribeToPushNotifications(contactId);
      
      if (success) {
        setIsSubscribed(true);
        toast({
          title: "✅ Push Notifications Enabled",
          description: "You'll receive emergency alerts on this device!",
        });
        await loadContacts(); // Refresh to see subscription
      } else {
        toast({
          title: "Subscription Failed",
          description: "Could not subscribe to push notifications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to subscribe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  if (permission === 'granted' && isSubscribed) {
    return (
      <Card className="p-4 bg-success/10 border-success/20">
        <div className="flex items-center gap-3">
          <Check className="h-5 w-5 text-success" />
          <div>
            <p className="font-medium text-sm text-success">
              Push Notifications Active
            </p>
            <p className="text-xs text-muted-foreground">
              You'll receive emergency alerts instantly
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-soft border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-sm">Push Notifications</p>
            <p className="text-xs text-muted-foreground">
              Get instant emergency alerts (No SMS needed!)
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleSubscribe}
          disabled={loading || permission === 'denied'}
          variant={permission === 'denied' ? 'destructive' : 'default'}
        >
          {loading ? 'Subscribing...' : permission === 'denied' ? 'Enable in Settings' : 'Enable'}
        </Button>
      </div>
      {permission === 'denied' && (
        <p className="text-xs text-destructive mt-2">
          Notifications are blocked. Please enable them in browser settings.
        </p>
      )}
    </Card>
  );
};

