import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface NotificationBannerProps {
  message: string;
  type?: 'warning' | 'error' | 'info';
  onDismiss?: () => void;
}

export function NotificationBanner({ 
  message, 
  type = 'warning',
  onDismiss 
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const bgColor = {
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    error: 'bg-destructive/10 border-destructive/30',
    info: 'bg-primary/10 border-primary/30',
  }[type];

  const textColor = {
    warning: 'text-yellow-700 dark:text-yellow-400',
    error: 'text-destructive',
    info: 'text-primary',
  }[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 ${bgColor} border-b backdrop-blur-sm`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${textColor}`} />
                <p className={`text-sm font-medium ${textColor}`}>{message}</p>
              </div>
              <button
                onClick={handleDismiss}
                className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${textColor}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
