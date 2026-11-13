import { useEffect, useRef } from 'react';

/**
 * Progress (0..1) of a DOM element scrolling through the viewport, kept in a ref so useFrame can read it
 * every frame without React re-renders. 0 = element top at the bottom of the viewport, 1 = element bottom
 * at the top of the viewport. 'pinned': 0 = element top at viewport top, 1 = element bottom at
 * viewport bottom (for tall sticky sections). 'exit': 0 at the page top, 1 once the element has scrolled
 * fully out (for heroes).
 */
export function useScrollProgress(target: () => HTMLElement | null, mode: 'through' | 'pinned' | 'exit' = 'through') {
  const pinned = mode === 'pinned';
  const progress = useRef(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = target();
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p =
        mode === 'exit' ? -r.top / Math.max(1, r.height)
        : pinned ? -r.top / Math.max(1, r.height - vh)
        : (vh - r.top) / (vh + r.height);
      progress.current = Math.min(1, Math.max(0, p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, mode, pinned]);
  return progress;
}

/** Smoothly move `current` toward `target` (frame-rate independent). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
