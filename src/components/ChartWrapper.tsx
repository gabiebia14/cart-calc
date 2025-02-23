
import React, { useEffect, useRef } from 'react';

export const ChartWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disconnect any existing ResizeObserver when the component unmounts
    return () => {
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
