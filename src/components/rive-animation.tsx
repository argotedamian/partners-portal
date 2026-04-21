'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';

interface RiveAnimationProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RiveGlobal = any;

// Tamanos predefinidos para diferentes breakpoints
const SIZES = {
  sm: { width: 280, height: 180 },
  md: { width: 400, height: 250 },
  lg: { width: 700, height: 400 },
};

export function RiveAnimation({
  name,
  size: initialSize = 'sm',
}: RiveAnimationProps) {
  // Responsive: cambia el tamano segun el ancho de ventana
  const [size, setSize] = useState(initialSize);

  useLayoutEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setSize('lg');
      } else if (w >= 768) {
        setSize('md');
      } else {
        setSize('sm');
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = SIZES[size];
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Try to load from CDN if not available
    const win = window as unknown as { Rive?: RiveGlobal; rive?: RiveGlobal };

    const init = async () => {
      if (!win.Rive && !win.rive) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/rive-js@0.7.33/dist/rive.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        // Wait for Rive to be available
        await new Promise(r => setTimeout(r, 500));
      }

      const R = (window as unknown as Record<string, RiveGlobal>).Rive || (window as unknown as Record<string, RiveGlobal>).rive;

      if (!R) {
        setStatus('error');
        return;
      }

      const RiveConstructor = R.Rive;
      if (!RiveConstructor) {
        setStatus('error');
        return;
      }

      try {
        const riv = new RiveConstructor({
          src: `/animations/rive/${name}.riv`,
          canvas: canvas,
          autoplay: true,
        });

        riv.on('load', () => {
          setStatus('playing');
        });

        riv.on('loaderror', () => {
          setStatus('error');
        });

      } catch {
        setStatus('error');
      }
    };

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;
    canvas.style.display = 'block';
    container.appendChild(canvas);

    init();

  }, [name, height, width, size]);

  return (
    <div ref={containerRef} style={{ width: '100%', height, background: '#EEF3FF', borderRadius: '8px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, right: 8, background: status === 'playing' ? '#28a745' : status === 'error' ? '#dc3545' : '#6c757d', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
        {status}
      </div>
    </div>
  );
}