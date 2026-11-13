import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import SceneShell from './SceneShell';
import Studio from './Studio';
import { damp, useScrollProgress } from './useScrollProgress';

const COUNT = 90;
/** Filters "apply" as the section scrolls: each stage keeps fewer, better-matched creators. */
const STAGES = [
  { label: 'All creators', keep: 1 },
  { label: 'Category: Food', keep: 0.42 },
  { label: 'Identity verified', keep: 0.24 },
  { label: 'Audience ≥ 20K, real', keep: 0.11 },
];

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = phi * i;
    const jitter = 0.85 + ((i * 7919) % 100) / 400;
    pts.push(new THREE.Vector3(Math.cos(t) * rad * r * jitter, y * r * jitter, Math.sin(t) * rad * r * jitter));
  }
  return pts;
}

function Network({ progress, onStage }: { progress: React.MutableRefObject<number>; onStage: (s: number) => void }) {
  const { size } = useThree();
  const radius = size.width >= 900 ? 3.1 : 2.4;
  const points = useMemo(() => fibonacciSphere(COUNT, radius), [radius]);
  // Deterministic ranking so the same nodes stay matched as filters tighten.
  const rank = useMemo(() => points.map((_, i) => ((i * 2654435761) % 1000) / 1000), [points]);
  const group = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const stageRef = useRef(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const hot = useMemo(() => new THREE.Color('#ff7a45').multiplyScalar(1.6), []);
  const cold = useMemo(() => new THREE.Color('#3b3550'), []);
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 6), 3));
    return g;
  }, []);

  const applyStage = (s: number) => {
    const keep = STAGES[s].keep;
    const pos = lineGeo.attributes.position as THREE.BufferAttribute;
    let k = 0;
    points.forEach((p, i) => {
      const matched = rank[i] < keep;
      inst.current?.setColorAt(i, matched ? hot : cold);
      dummy.position.copy(p);
      dummy.scale.setScalar(matched && s > 0 ? 1.7 : matched ? 1 : 0.75);
      dummy.updateMatrix();
      inst.current?.setMatrixAt(i, dummy.matrix);
      if (matched && s > 0) {
        pos.setXYZ(k++, 0, 0, 0);
        pos.setXYZ(k++, p.x, p.y, p.z);
      }
    });
    lineGeo.setDrawRange(0, k);
    pos.needsUpdate = true;
    if (inst.current?.instanceColor) inst.current.instanceColor.needsUpdate = true;
    if (inst.current) inst.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    if (!inst.current) return;
    points.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      inst.current!.setMatrixAt(i, dummy.matrix);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    stageRef.current = -1;
  }, [points, dummy]);

  useFrame((state, dt) => {
    const p = progress.current;
    const s = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length * 0.999));
    if (s !== stageRef.current) {
      stageRef.current = s;
      applyStage(s);
      onStage(s);
    }
    if (group.current) {
      group.current.rotation.y += dt * 0.12;
      group.current.rotation.x = damp(group.current.rotation.x, -state.pointer.y * 0.25, 3, dt);
    }
    if (lines.current) {
      (lines.current.material as THREE.LineBasicMaterial).opacity = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.65, 2]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.35} roughness={0.15} clearcoat={1} emissive="#1d4ed8" emissiveIntensity={0.4} />
      </mesh>
      <Html center position={[0, -1.05, 0]} distanceFactor={7}>
        <span className="whitespace-nowrap rounded-full bg-[#3b82f6] px-3 py-1 text-[12px] font-bold text-white shadow-lg">Your brand</span>
      </Html>
      <instancedMesh ref={inst} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial roughness={0.35} metalness={0.1} toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={lines} geometry={lineGeo}>
        <lineBasicMaterial color="#ff8a4c" transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

export default function NetworkScene({ sectionId }: { sectionId: string }) {
  const target = useCallback(() => document.getElementById(sectionId), [sectionId]);
  const progress = useScrollProgress(target, 'pinned');
  const [stage, setStage] = useState(0);
  return (
    <div className="relative h-full w-full">
      <SceneShell
        className="h-full w-full"
        label="A brand at the centre of a network of creators; filters for category, verified identity and real audience leave a few strong matches connected"
        camera={{ position: [0, 0, 9], fov: 42 }}
        fallback={<div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.25),transparent_55%)]" />}
      >
        <Studio intensity={0.8} />
        <Network progress={progress} onStage={setStage} />
      </SceneShell>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-wrap justify-center gap-2 px-4">
        {STAGES.map((s, i) => (
          <span
            key={s.label}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-500 ${
              i <= stage ? 'border-crimson/60 bg-crimson/20 text-white' : 'border-white/10 bg-white/5 text-mute'
            }`}
          >
            {i > 0 && i <= stage ? '✓ ' : ''}{s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
