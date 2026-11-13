import { Float, Html, Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import LogoMesh from './LogoMesh';
import SceneShell from './SceneShell';
import Studio from './Studio';
import { useStablePortal } from './useStablePortal';
import { damp, useScrollProgress } from './useScrollProgress';

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`pointer-events-none w-[210px] select-none rounded-2xl border border-white/10 bg-[#16161b]/85 p-3.5 text-left text-white shadow-2xl backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

const ORBIT: { pos: [number, number, number]; speed: number; node: ReactNode }[] = [
  {
    pos: [-1.55, 1.75, 0.9],
    speed: 1.4,
    node: (
      <Card>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#a855f7] to-[#e53935]" />
          <div>
            <p className="text-[13px] font-bold leading-tight">Creator profile</p>
            <p className="text-[11px] text-[#a1a1aa]">Food &amp; travel</p>
          </div>
          <span className="ml-auto rounded-full bg-[#8b5cf6]/20 px-2 py-0.5 text-[10px] font-bold text-[#c4b5fd]">✓ Verified</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#a1a1aa]">
          <div className="rounded-lg bg-white/5 p-2">Identity<br /><b className="text-[12px] text-white">e-KYC done</b></div>
          <div className="rounded-lg bg-white/5 p-2">Audience<br /><b className="text-[12px] text-white">From channels</b></div>
        </div>
      </Card>
    ),
  },
  {
    pos: [1.75, 1.5, -0.2],
    speed: 1.1,
    node: (
      <Card>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa]">Brand campaign</p>
        <p className="mt-1 text-[13px] font-bold">Festive launch reel</p>
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
          {['Pitch', 'Script', 'Draft', 'Live'].map((s, i) => (
            <span key={s} className={`rounded-full px-2 py-0.5 ${i < 2 ? 'bg-[#00ba7c]/20 text-[#5eead4]' : 'bg-white/5 text-[#a1a1aa]'}`}>{s}</span>
          ))}
        </div>
      </Card>
    ),
  },
  {
    pos: [-1.6, -1.65, 0.6],
    speed: 1.6,
    node: (
      <Card className="w-[200px]">
        <p className="text-[11px] text-[#a1a1aa]">Comment: <span className="text-white">“LINK”</span></p>
        <div className="mt-2 rounded-xl rounded-tl-sm bg-gradient-to-r from-[#ff5722] to-[#e53935] px-3 py-2 text-[12px] font-medium">
          Here’s your link! 🔗
        </div>
        <p className="mt-1.5 text-[10px] text-[#a1a1aa]">Sent automatically by the console</p>
      </Card>
    ),
  },
  {
    pos: [1.5, -1.8, 1.0],
    speed: 1.25,
    node: (
      <Card className="w-[190px]">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold">New order</p>
          <span className="rounded-full bg-[#00ba7c]/20 px-2 py-0.5 text-[10px] font-bold text-[#5eead4]">Paid</span>
        </div>
        <p className="mt-1 text-[11px] text-[#a1a1aa]">Recipe e-book · via Razorpay</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#ff5722] to-[#e53935]" /></div>
      </Card>
    ),
  },
];

function Rig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { size, viewport } = useThree();
  const portal = useStablePortal();
  // Desktop: the scene spans the whole hero behind the text, so push the logo to the right half.
  const wide = size.width >= 1024;
  const offsetX = wide ? viewport.width * 0.24 : 0;
  // Phones: the scene sits below the text, so keep the spin small and pull the cards inside the frame.
  const spin = wide ? Math.PI * 1.2 : Math.PI * 0.2;
  const fit = wide ? 1 : Math.min(1, viewport.width / 4.6);
  const group = useRef<THREE.Group>(null);
  const logo = useRef<THREE.Group>(null);
  const cards = useRef<(THREE.Group | null)[]>([]);
  useFrame((state, dt) => {
    const p = progress.current;
    if (group.current) {
      group.current.rotation.y = damp(group.current.rotation.y, state.pointer.x * 0.35, 4, dt);
      group.current.rotation.x = damp(group.current.rotation.x, -state.pointer.y * 0.2, 4, dt);
    }
    if (logo.current) {
      logo.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25 + p * spin;
      logo.current.position.y = -p * 1.5;
    }
    cards.current.forEach((c, i) => {
      if (!c) return;
      const spread = (1 + p * (wide ? 0.9 : 0.15)) * fit;
      const [x, y, z] = ORBIT[i].pos;
      c.position.set(x * spread, y * spread + Math.sin(state.clock.elapsedTime * ORBIT[i].speed + i) * 0.12, z);
    });
  });
  return (
    <group ref={group} position-x={offsetX}>
      <group ref={logo}>
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6} scale={wide ? 1 : 0.8}>
          <LogoMesh width={3.3} />
        </Float>
      </group>
      {ORBIT.map((o, i) => (
        <group key={i} ref={(el) => { cards.current[i] = el; }} position={o.pos}>
          <Html transform portal={portal} distanceFactor={2.6} zIndexRange={[10, 0]}>{o.node}</Html>
        </group>
      ))}
      <Sparkles count={70} scale={[12, 6, 4]} size={2.2} speed={0.35} color="#ff8a4c" opacity={0.6} />
    </group>
  );
}

function Fallback() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(229,57,53,0.45),transparent_65%)] blur-2xl" />
      <img src="/brand/cc-icon-on-dark.svg" alt="" className="relative w-64 max-w-[70%] drop-shadow-[0_20px_50px_rgba(229,57,53,0.45)]" />
    </div>
  );
}

export default function HeroScene() {
  const target = useCallback(() => document.getElementById('hero'), []);
  const progress = useScrollProgress(target, 'exit');
  return (
    <SceneShell
      className="h-full w-full"
      label="The Creators Club logo in 3D, surrounded by a verified creator profile, a brand campaign, an automated Instagram DM and a paid order"
      camera={{ position: [0, 0, 9.5], fov: 38 }}
      fallback={<Fallback />}
    >
      <Studio />
      <Rig progress={progress} />
    </SceneShell>
  );
}
