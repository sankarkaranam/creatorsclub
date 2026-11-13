import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import SceneShell from './SceneShell';

function Field({ count = 1800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = ['#ff5722', '#e53935', '#ff8a4c', '#8b5cf6', '#f5f5f7'].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      // A slowly turning galaxy disc
      const r = 1.5 + Math.pow(Math.random(), 0.6) * 6;
      const arm = (i % 3) * ((Math.PI * 2) / 3);
      const a = arm + r * 0.55 + (Math.random() - 0.5) * 0.6;
      positions.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.7 * (8 - r) * 0.25, Math.sin(a) * r], i * 3);
      const c = palette[i % 9 === 0 ? 4 : i % palette.length];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    return { positions, colors };
  }, [count]);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.05;
    ref.current.rotation.x = 0.55 + state.pointer.y * 0.08;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function ParticleField() {
  return (
    <SceneShell
      className="h-full w-full"
      label="A slowly turning galaxy of crimson and violet particles"
      camera={{ position: [0, 0.5, 9], fov: 45 }}
      fallback={<div className="h-full w-full bg-[radial-gradient(circle_at_50%_60%,rgba(229,57,53,0.25),transparent_60%)]" />}
    >
      <Field />
    </SceneShell>
  );
}
