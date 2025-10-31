import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bluetooth, Phone, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { WaveHeader } from '@/components/WaveHeader';
import { Card } from '@/components/ui/card';
import heroIllustration from '@/assets/hero-illustration.png';

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  delay 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  onClick: () => void;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.03, y: -5 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card 
      onClick={onClick}
      className="p-6 cursor-pointer card-shadow hover:card-shadow-hover transition-all duration-300 bg-card"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <WaveHeader className="mt-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hello, User 👋
            </h1>
            <p className="text-lg opacity-95">
              Welcome back to your personal safety hub
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex-1 max-w-md"
          >
            <img 
              src={heroIllustration} 
              alt="Safety illustration" 
              className="w-full h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </WaveHeader>

      <div className="container mx-auto px-4 py-12">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-semibold text-foreground mb-6"
        >
          Quick Actions
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl">
          <FeatureCard
            icon={Bluetooth}
            title="Connect Device"
            description="Pair your safety device via Bluetooth"
            onClick={() => navigate('/connect-device')}
            delay={0.7}
          />
          
          <FeatureCard
            icon={Phone}
            title="Emergency Contacts"
            description="Manage your emergency contact list"
            onClick={() => navigate('/emergency-contacts')}
            delay={0.8}
          />

          <FeatureCard
            icon={Clock}
            title="History"
            description="View location and alert activity logs"
            onClick={() => navigate('/history')}
            delay={0.9}
          />
        </div>
      </div>
    </div>
  );
}
