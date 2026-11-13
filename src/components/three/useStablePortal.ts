import { useThree } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';

/**
 * Container for drei <Html transform>. Its default target (the canvas's direct parent) can be swapped
 * while the scene starts up, which leaves the HTML layer attached to a detached node and invisible.
 * The outer Canvas container stays put, so attach there.
 */
export function useStablePortal(): MutableRefObject<HTMLElement> {
  const { gl } = useThree();
  return useRef<HTMLElement>((gl.domElement.parentElement?.parentElement ?? gl.domElement.parentElement) as HTMLElement);
}
