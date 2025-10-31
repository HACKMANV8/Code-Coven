import { useRef, useCallback } from "react";

interface DoubleTapOptions {
  onDoubleTap: () => void;
  delay?: number;
  tapCount?: number;
}

export const useDoubleTap = ({
  onDoubleTap,
  delay = 300,
  tapCount = 2,
}: DoubleTapOptions) => {
  const tapCounter = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    tapCounter.current += 1;

    if (tapCounter.current === tapCount) {
      // Double tap detected
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      tapCounter.current = 0;
      
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      
      onDoubleTap();
    } else {
      // Reset counter after delay
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      
      tapTimer.current = setTimeout(() => {
        tapCounter.current = 0;
      }, delay);
    }
  }, [onDoubleTap, delay, tapCount]);

  return handleTap;
};
