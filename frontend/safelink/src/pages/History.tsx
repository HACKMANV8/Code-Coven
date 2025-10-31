import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { WaveHeader } from '@/components/WaveHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LocationRecord {
  id: number;
  timestamp: string;
  location: string;
  coords: string;
}

interface AlertRecord {
  id: number;
  timestamp: string;
  type: string;
  status: string;
  sentTo: string[];
}

const mockLocationHistory: LocationRecord[] = [
  {
    id: 1,
    timestamp: '2025-10-31 14:23:00',
    location: 'Downtown Mall, 5th Avenue',
    coords: '40.7589° N, 73.9851° W',
  },
  {
    id: 2,
    timestamp: '2025-10-31 12:15:00',
    location: 'Central Park West',
    coords: '40.7812° N, 73.9665° W',
  },
  {
    id: 3,
    timestamp: '2025-10-30 18:45:00',
    location: 'Home - Brooklyn Heights',
    coords: '40.6946° N, 73.9941° W',
  },
];

const mockAlertHistory: AlertRecord[] = [
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
];

export default function History() {
  const navigate = useNavigate();
  const [locationHistory] = useState<LocationRecord[]>(mockLocationHistory);
  const [alertHistory] = useState<AlertRecord[]>(mockAlertHistory);

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
            {locationHistory.map((record, index) => (
              <motion.div
                key={record.id}
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
                        {record.location}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {record.coords}
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
