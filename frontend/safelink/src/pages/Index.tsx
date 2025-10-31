import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Heart, Smartphone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import heroIllustration from '@/assets/hero-illustration.png';

export default function Index() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-center md:text-left"
            >
              <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6">
                SAFElink
              </h1>
              <p className="text-xl md:text-2xl mb-4 opacity-95">
                A Stylish Way to Stay Safe
              </p>
              <p className="text-lg mb-8 opacity-90">
                Connect, Alert, and Protect
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToHowItWorks}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 max-w-md"
            >
              <img
                src={heroIllustration}
                alt="SafeLink safety illustration"
                className="w-full h-auto drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-[1px]">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 C240,80 480,20 720,50 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay connected and protected with three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Smartphone,
              title: 'Connect Device',
              description: 'Pair your safety device seamlessly via Bluetooth',
              delay: 0.2,
            },
            {
              icon: Heart,
              title: 'Add Contacts',
              description: 'Set up trusted emergency contacts who can help',
              delay: 0.4,
            },
            {
              icon: Shield,
              title: 'Stay Protected',
              description: 'Send instant alerts and share location when needed',
              delay: 0.6,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              viewport={{ once: true }}
            >
              <Card className="p-8 text-center card-shadow hover:card-shadow-hover transition-all duration-300">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button size="lg" onClick={() => navigate('/login')} className="shadow-lg">
            Get Started Now
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/30 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            SAFElink - Your Safety, Our Priority
          </p>
        </div>
      </footer>
    </div>
  );
}