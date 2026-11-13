import { Float, Html, RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import SceneShell from './SceneShell';
import Studio from './Studio';
import { useStablePortal } from './useStablePortal';
import { damp, useScrollProgress } from './useScrollProgress';

const STEPS = [
  { who: 'them', text: 'Love this recipe! LINK please 🙏', meta: '@meera.cooks commented' },
  { who: 'you', text: 'Here’s the full recipe e-book 👇', meta: 'Auto-reply · private DM' },
  { who: 'card', text: 'Recipe e-book · ₹199', meta: 'creatorsclub.co.in/p/…' },
  { who: 'lead', text: 'New lead saved', meta: '@meera.cooks · from “LINK”' },
];

function Screen() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v >= STEPS.length ? 1 : v + 1)), 1700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pointer-events-none flex h-[520px] w-[250px] select-none flex-col overflow-hidden rounded-[30px] bg-[#0b0b0e] text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 pb-3 pt-6">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#ff5722] to-[#e53935]" />
        <div>
          <p className="text-[12px] font-bold leading-tight">your.channel</p>
          <p className="text-[10px] text-[#a1a1aa]">Instagram · Creators Club console</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-3.5 py-4">
        {STEPS.slice(0, n).map((s, i) => (
          <div key={i} className="cc-fadein">
            {s.who === 'them' && (
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/8 px-3 py-2 text-[12px]">{s.text}</div>
            )}
            {s.who === 'you' && (
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#ff5722] to-[#e53935] px-3 py-2 text-[12px] font-medium">{s.text}</div>
            )}
            {s.who === 'card' && (
              <div className="ml-auto w-[80%] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="h-16 bg-gradient-to-br from-[#a855f7]/50 to-[#e53935]/50" />
                <p className="px-3 pt-2 text-[12px] font-bold">{s.text}</p>
                <p className="px-3 pb-2 text-[10px] text-[#a1a1aa]">Tap to buy · Razorpay</p>
              </div>
            )}
            {s.who === 'lead' && (
              <div className="flex items-center gap-2 rounded-xl border border-[#00ba7c]/30 bg-[#00ba7c]/10 px-3 py-2 text-[11px] text-[#5eead4]">
                <span className="text-base">✓</span>{s.text}
              </div>
            )}
            <p className={`mt-1 text-[9px] text-[#71717a] ${s.who === 'you' || s.who === 'card' ? 'text-right' : ''}`}>{s.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Phone({ progress }: { progress: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const { size } = useThree();
  const wide = size.width >= 900;
  const portal = useStablePortal();
  useFrame((state, dt) => {
    if (!g.current) return;
    const p = progress.current;
    g.current.rotation.y = damp(g.current.rotation.y, -0.45 + p * 0.9 + state.pointer.x * 0.2, 3, dt);
    g.current.rotation.x = damp(g.current.rotation.x, 0.08 - state.pointer.y * 0.1, 3, dt);
  });
  return (
    <group ref={g} scale={wide ? 1 : 0.85}>
      <RoundedBox args={[2.55, 5.15, 0.28]} radius={0.32} smoothness={6}>
        <meshPhysicalMaterial color="#1b1b20" metalness={0.85} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <RoundedBox args={[2.62, 5.22, 0.2]} radius={0.34} smoothness={6} position-z={-0.05}>
        <meshPhysicalMaterial color="#e53935" metalness={0.6} roughness={0.3} />
      </RoundedBox>
      <group position={[0, 0, 0.15]}>
        <Html transform portal={portal} distanceFactor={3.8} zIndexRange={[10, 0]}>
          <Screen />
        </Html>
      </group>
      <Float speed={2} floatIntensity={1.2} rotationIntensity={0.6}>
        <group position={[1.75, 1.9, 0.6]}>
          <mesh>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshPhysicalMaterial color="#8b5cf6" metalness={0.4} roughness={0.15} clearcoat={1} flatShading />
          </mesh>
          <Html center position={[0, -0.75, 0]} distanceFactor={6}>
            <span className="whitespace-nowrap rounded-full bg-[#8b5cf6] px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">✓ Verified</span>
          </Html>
        </group>
      </Float>
      <Float speed={1.6} floatIntensity={1} rotationIntensity={0.8}>
        <mesh position={[-1.9, -1.6, 0.4]}>
          <torusGeometry args={[0.36, 0.13, 24, 48]} />
          <meshPhysicalMaterial color="#ff5722" metalness={0.3} roughness={0.2} clearcoat={1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function PhoneScene({ sectionId }: { sectionId: string }) {
  const target = useCallback(() => document.getElementById(sectionId), [sectionId]);
  const progress = useScrollProgress(target);
  return (
    <SceneShell
      className="h-full w-full"
      label="A phone showing an Instagram comment answered automatically with a private DM, a product card and a saved lead"
      camera={{ position: [0, 0, 8.2], fov: 40 }}
      fallback={
        <div className="grid h-full place-items-center">
          <div className="h-[420px] w-[210px] rounded-[30px] border-4 border-crimson/60 bg-ink-2 shadow-[0_30px_80px_-20px_rgba(229,57,53,0.5)]" />
        </div>
      }
    >
      <Studio />
      <Phone progress={progress} />
    </SceneShell>
  );
}
