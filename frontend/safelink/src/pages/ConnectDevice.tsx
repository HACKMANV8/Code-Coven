import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bluetooth, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { WaveHeader } from '@/components/WaveHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { NotificationBanner } from '@/components/NotificationBanner';

const mockDevices = [
  { id: 1, name: 'SafeLink Band Pro', status: 'Available', signal: 'Strong' },
  { id: 2, name: 'SafeLink Pendant', status: 'Available', signal: 'Medium' },
  { id: 3, name: 'SafeLink Watch', status: 'Connected', signal: 'Strong' },
];

export default function ConnectDevice() {
  const navigate = useNavigate();
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [connectedDevice, setConnectedDevice] = useState<number | null>(3);

  const handleConnect = (deviceId: number) => {
    setConnectedDevice(deviceId);
  };

  const handleDisconnect = () => {
    setConnectedDevice(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {!bluetoothOn && (
        <NotificationBanner message="⚠️ Please turn on Bluetooth to connect your device." />
      )}
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
            <Bluetooth size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Connect Device</h1>
            <p className="text-primary-foreground/90">
              Pair your safety devices via Bluetooth
            </p>
          </div>
        </div>
      </WaveHeader>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Bluetooth
                </h3>
                <p className="text-sm text-muted-foreground">
                  {bluetoothOn ? 'Scanning for devices...' : 'Turn on to find devices'}
                </p>
              </div>
              <Switch 
                checked={bluetoothOn}
                onCheckedChange={setBluetoothOn}
              />
            </div>
          </Card>
        </motion.div>

        {bluetoothOn && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Available Devices
            </h2>
            
            {mockDevices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-5 card-shadow hover:card-shadow-hover transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Bluetooth className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{device.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Signal: {device.signal}
                        </p>
                      </div>
                    </div>
                    
                    {connectedDevice === device.id ? (
                      <Button 
                        variant="outline"
                        onClick={handleDisconnect}
                        className="rounded-2xl"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleConnect(device.id)}
                        className="rounded-2xl"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
