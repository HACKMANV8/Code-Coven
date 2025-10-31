import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { WaveHeader } from '@/components/WaveHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface LocationRecord {
  _id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface AlertRecord {
  id: number;
  timestamp: string;
  type: string;
  status: string;
  sentTo: string[];
}

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locationHistory, setLocationHistory] = useState<LocationRecord[]>([]);
  const [alertHistory] = useState<AlertRecord[]>([
    {
      id: 1,
      timestamp: '2025-10-31 14:23:12',
      type: 'SOS Alert',
      status: 'Delivered',
      sentTo: ['John Doe', 'Jane Smith', 'Emergency Services'],
    },
    {
      id: 2,
      timestamp: '2025-10-29 22:10:05',
      type: 'Check-in Alert',
      status: 'Delivered',
      sentTo: ['John Doe'],
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch location history from backend
  useEffect(() => {
    fetchLocationHistory();
  }, []);

  const fetchLocationHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/location');
      if (!response.ok) {
        throw new Error('Failed to fetch location history');
      }
      const data = await response.json();
      setLocationHistory(data);
    } catch (error) {
      console.error('Error fetching location history:', error);
      toast({
        title: "Error Loading History",
        description: "Failed to load location history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />

      <WaveHeader className="mt-16" contentClassName="pb-20 md:pb-24">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Clock size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Activity History</h1>
            <p className="text-primary-foreground/90">
              Track your location and alert records
            </p>
          </div>
        </div>
      </WaveHeader>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="locations">Location History</TabsTrigger>
            <TabsTrigger value="alerts">Alert Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading location history...</p>
              </div>
            ) : locationHistory.length === 0 ? (
              <Card className="p-12 text-center card-shadow">
                <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Location History Yet</h3>
                <p className="text-muted-foreground">
                  Your location history will appear here when you use the app
                </p>
              </Card>
            ) : (
              locationHistory.map((record, index) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-5 card-shadow hover:card-shadow-hover transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-lg mb-1">
                          Location Recorded
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {record.latitude.toFixed(6)}° N, {record.longitude.toFixed(6)}° W
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alertHistory.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 card-shadow hover:card-shadow-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground text-lg">
                          {record.type}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                          {record.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sent to: {record.sentTo.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.timestamp}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}