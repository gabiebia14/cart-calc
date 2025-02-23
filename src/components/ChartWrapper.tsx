
import React, { useEffect, useRef } from 'react';

export const ChartWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();

  useEffect(() => {
    if (!wrapperRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      // Cancelar qualquer frame de animação pendente
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Agendar nova atualização
      rafRef.current = requestAnimationFrame(() => {
        if (!wrapperRef.current) return;
        
        const entry = entries[0];
        if (entry && entry.contentRect) {
          // Atualizar dimensões sem forçar reflow
          wrapperRef.current.style.width = `${entry.contentRect.width}px`;
          wrapperRef.current.style.height = `${entry.contentRect.height}px`;
        }
      });
    };

    // Criar novo ResizeObserver
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(wrapperRef.current);

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      {children}
    </div>
  );
};
