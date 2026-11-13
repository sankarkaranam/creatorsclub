import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

type Mode = 'pending' | '3d' | 'static';

function canRender3D(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 2) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

interface Props {
  children: ReactNode;
  /** Shown before the scene loads and instead of it when 3D is not appropriate. */
  fallback: ReactNode;
  className?: string;
  camera?: CanvasProps['camera'];
  label: string;
}

/**
 * Renders a react-three-fiber Canvas only when the device can (WebGL, no reduced motion, no data saver),
 * and stops rendering while the scene is off-screen.
 */
export default function SceneShell({ children, fallback, className, camera, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('pending');
  const [visible, setVisible] = useState(true);

  useEffect(() => setMode(canRender3D() ? '3d' : 'static'), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      {mode === '3d' ? (
        <Suspense fallback={fallback}>
          <Canvas
            dpr={[1, 2]}
            frameloop={visible ? 'always' : 'never'}
            camera={camera ?? { position: [0, 0, 8], fov: 40 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            {children}
          </Canvas>
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
