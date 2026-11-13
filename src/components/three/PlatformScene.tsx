import { Html, RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import SceneShell from './SceneShell';
import Studio from './Studio';
import { useStablePortal } from './useStablePortal';
import { damp, useScrollProgress } from './useScrollProgress';

function Device({ args, color, children, df, screenRef }: { args: [number, number, number]; color: string; children: ReactNode; df: number; screenRef: (el: HTMLDivElement | null) => void }) {
  const portal = useStablePortal();
  return (
    <group>
      <RoundedBox args={args} radius={0.22} smoothness={5}>
        <meshPhysicalMaterial color="#17171c" metalness={0.8} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <RoundedBox args={[args[0] + 0.08, args[1] + 0.08, args[2] * 0.6]} radius={0.24} smoothness={5} position-z={-0.06}>
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.3} />
      </RoundedBox>
      <Html transform portal={portal} ref={screenRef} position={[0, 0, args[2] / 2 + 0.01]} distanceFactor={df} zIndexRange={[10, 0]} style={{ transition: 'opacity .35s ease' }}>
        {children}
      </Html>
    </group>
  );
}

const AppScreen = () => (
  <div className="pointer-events-none h-[480px] w-[232px] select-none overflow-hidden rounded-[26px] bg-[#0b0b0e] p-3 text-white">
    <div className="flex gap-2 overflow-hidden pt-3">
      {['#a855f7', '#ff5722', '#3b82f6', '#00ba7c', '#e53935'].map((c) => (
        <div key={c} className="h-11 w-11 shrink-0 rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${c}, #e53935)` }}>
          <div className="h-full w-full rounded-full bg-[#1c1c21]" />
        </div>
      ))}
    </div>
    <div className="mt-3 rounded-2xl bg-white/5 p-3">
      <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#a855f7] to-[#e53935]" /><p className="text-[11px] font-bold">Verified creator <span className="text-[#c4b5fd]">✓</span></p></div>
      <div className="mt-2 h-28 rounded-xl bg-gradient-to-br from-[#ff5722]/40 to-[#a855f7]/30" />
    </div>
    <div className="mt-3 rounded-2xl border border-[#3b82f6]/40 bg-[#3b82f6]/10 p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa]">Campaign invite</p>
      <p className="mt-1 text-[12px] font-bold">Skincare launch · Reels</p>
      <p className="mt-1 text-[10px] text-[#a1a1aa]">Verified brand · Paid</p>
    </div>
  </div>
);

const ConsoleScreen = () => (
  <div className="pointer-events-none h-[300px] w-[470px] select-none overflow-hidden rounded-2xl bg-[#0b0b0e] p-4 text-white">
    <div className="flex items-center justify-between">
      <p className="text-[13px] font-bold">Instagram console</p>
      <span className="rounded-full bg-[#00ba7c]/20 px-2 py-0.5 text-[10px] font-bold text-[#5eead4]">● Live</span>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {[['Replies sent', 'Auto'], ['Leads', 'CSV'], ['Link clicks', 'Tracked']].map(([k, v]) => (
        <div key={k} className="rounded-xl bg-white/5 p-2.5"><p className="text-[10px] text-[#a1a1aa]">{k}</p><p className="text-[14px] font-bold">{v}</p></div>
      ))}
    </div>
    <div className="mt-3 flex h-28 items-end gap-1.5 rounded-xl bg-white/5 p-3">
      {[30, 45, 38, 60, 52, 72, 66, 84, 78, 92, 88, 100].map((h, i) => (
        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#e53935] to-[#ff8a4c]" style={{ height: `${h}%` }} />
      ))}
    </div>
    <p className="mt-2 text-[10px] text-[#71717a]">Keyword “LINK” → private DM with your link</p>
  </div>
);

const StoreScreen = () => (
  <div className="pointer-events-none h-[340px] w-[300px] select-none overflow-hidden rounded-2xl bg-[#0b0b0e] text-white">
    <div className="h-32 bg-gradient-to-br from-[#ff5722]/60 via-[#e53935]/40 to-[#a855f7]/40" />
    <div className="p-4">
      <p className="text-[14px] font-bold">Recipe e-book</p>
      <p className="text-[11px] text-[#a1a1aa]">By a verified creator</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[18px] font-black">₹199</p>
        <span className="rounded-full bg-gradient-to-r from-[#ff5722] to-[#e53935] px-4 py-1.5 text-[11px] font-bold">Pay with UPI</span>
      </div>
      <p className="mt-3 text-[10px] text-[#71717a]">Secure checkout by Razorpay · order tracking</p>
    </div>
  </div>
);

const ITEMS = [
  { key: 'app', color: '#a855f7', args: [2.3, 4.6, 0.25] as [number, number, number], df: 3.8, node: <AppScreen /> },
  { key: 'console', color: '#8b5cf6', args: [4.6, 3.0, 0.22] as [number, number, number], df: 3.8, node: <ConsoleScreen /> },
  { key: 'store', color: '#00ba7c', args: [3.0, 3.4, 0.22] as [number, number, number], df: 3.8, node: <StoreScreen /> },
];

function Carousel({ progress }: { progress: React.MutableRefObject<number> }) {
  const ring = useRef<THREE.Group>(null);
  const screens = useRef<(HTMLDivElement | null)[]>([]);
  const devices = useRef<(THREE.Group | null)[]>([]);
  const { size, viewport } = useThree();
  const r = size.width >= 900 ? 4.2 : 3.4;
  // Desktop: leave the left side for the product panel.
  const offsetX = size.width >= 1024 ? viewport.width * 0.14 : 0;
  useFrame((state, dt) => {
    if (!ring.current) return;
    // 0 → app facing camera, 0.5 → console, 1 → store. Dwell on each product, turn between them.
    const f = progress.current * (ITEMS.length - 1);
    const base = Math.min(ITEMS.length - 1, Math.floor(f));
    const t = Math.min(1, Math.max(0, (f - base - 0.3) / 0.4));
    const eased = base + t * t * (3 - 2 * t);
    const target = -eased * ((Math.PI * 2) / 3);
    ring.current.rotation.y = damp(ring.current.rotation.y, target + state.pointer.x * 0.15, 3.5, dt);
    // HTML screens have no back face: hide the ones turned away from the camera.
    ITEMS.forEach((_, i) => {
      const facing = Math.cos(ring.current!.rotation.y + (i * Math.PI * 2) / 3);
      const el = screens.current[i];
      if (el) el.style.opacity = facing > 0.55 ? '1' : '0';
      // Devices turned away shrink out of view, so only the active product is shown.
      const g = devices.current[i];
      if (g) g.scale.setScalar(damp(g.scale.x, facing > 0.2 ? 1 : 0.001, 6, dt));
    });
  });
  return (
    <group ref={ring} position={[offsetX, 0, -r]} scale={size.width >= 900 ? 0.84 : 0.66}>
      {ITEMS.map((it, i) => {
        const a = (i * Math.PI * 2) / 3;
        return (
          <group key={it.key} ref={(g) => { devices.current[i] = g; }} position={[Math.sin(a) * r, 0, Math.cos(a) * r]} rotation-y={a}>
            <Device args={it.args} color={it.color} df={it.df} screenRef={(el) => { screens.current[i] = el; }}>{it.node}</Device>
          </group>
        );
      })}
    </group>
  );
}

export default function PlatformScene({ sectionId }: { sectionId: string }) {
  const target = useCallback(() => document.getElementById(sectionId), [sectionId]);
  const progress = useScrollProgress(target, 'pinned');
  return (
    <SceneShell
      className="h-full w-full"
      label="A turntable showing the Creators Club app, the Instagram console dashboard and a store checkout"
      camera={{ position: [0, 0.4, 7.5], fov: 42 }}
      fallback={<div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(229,57,53,0.22),transparent_60%)]" />}
    >
      <Studio />
      <Carousel progress={progress} />
    </SceneShell>
  );
}
