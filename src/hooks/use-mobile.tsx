
import { useEffect, useState } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (not server-side)
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkIfMobile();

      // Add resize listener
      window.addEventListener('resize', checkIfMobile);

      // Clean up
      return () => {
        window.removeEventListener('resize', checkIfMobile);
      };
    }
  }, []);

  return { isMobile };
}

export function MobileProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
