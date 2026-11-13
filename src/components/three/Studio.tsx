import { Environment, Lightformer } from '@react-three/drei';

/** Shared lighting: a dark studio with warm crimson/ember light panels. No network fetch (no HDR files). */
export default function Studio({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.25 * intensity} />
      <directionalLight position={[4, 6, 5]} intensity={1.4 * intensity} color="#fff3ec" />
      <pointLight position={[-5, -2, 3]} intensity={30 * intensity} color="#ff5722" distance={14} />
      <pointLight position={[5, 2, -2]} intensity={20 * intensity} color="#8b5cf6" distance={14} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, 6]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={4} color="#ff5722" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={3} color="#e53935" position={[6, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={2} color="#8b5cf6" position={[0, -4, -4]} scale={4} />
      </Environment>
    </>
  );
}
