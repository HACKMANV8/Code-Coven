import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface WaveHeaderProps {
  children?: ReactNode;
  className?: string;
  contentClassName?: string; // extra classes for inner container spacing
}

export function WaveHeader({ children, className = '', contentClassName = '' }: WaveHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative bg-primary text-primary-foreground ${className}`}
    >
      <div className={`relative z-10 container mx-auto px-4 py-12 ${contentClassName}`}>
        {children}
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
    </motion.div>
  );
}
