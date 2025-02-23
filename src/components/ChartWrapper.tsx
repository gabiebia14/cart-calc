
import React, { useEffect, useRef } from 'react';

export const ChartWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let resizeObserver: ResizeObserver | null = null;

    if (wrapperRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        // Cancel any existing animation frame
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        // Schedule a new update
        rafId = requestAnimationFrame(() => {
          if (!wrapperRef.current) return;
          // Trigger a reflow
          wrapperRef.current.style.display = 'none';
          wrapperRef.current.offsetHeight; // Force reflow
          wrapperRef.current.style.display = '';
        });
      });

      resizeObserver.observe(wrapperRef.current);
    }

    // Cleanup function
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (wrapperRef.current) {
        const observers = (window as any).__resizeObservers__ || [];
        observers.forEach((observer: any) => {
          if (observer.__elements?.has(wrapperRef.current)) {
            observer.unobserve(wrapperRef.current);
          }
        });
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      {children}
    </div>
  );
};
