import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

/**
 * The Creators Club mark (two Cs + handshake) extruded from the brand SVG.
 * Gradient C → flame/crimson glass, dark C → light silver (for a dark scene), red details → crimson.
 */
export default function LogoMesh({ depth = 7, width = 4.2 }: { depth?: number; width?: number }) {
  const data = useLoader(SVGLoader, '/brand/cc-icon-on-light.svg');

  const { meshes, offset, scale } = useMemo(() => {
    const flame = new THREE.MeshPhysicalMaterial({
      color: '#ff4a1c', metalness: 0.2, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08,
      emissive: '#7a0d06', emissiveIntensity: 0.35,
    });
    const crimson = new THREE.MeshPhysicalMaterial({
      color: '#e53935', metalness: 0.25, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1,
      emissive: '#5a0705', emissiveIntensity: 0.3,
    });
    const silver = new THREE.MeshPhysicalMaterial({
      color: '#eceef3', metalness: 0.75, roughness: 0.22, clearcoat: 0.6,
    });

    const list: { geometry: THREE.ExtrudeGeometry; material: THREE.Material; z: number }[] = [];
    const box = new THREE.Box3();
    data.paths.forEach((path) => {
      const node = path.userData?.node as Element | undefined;
      if (!node || node.nodeName.toLowerCase() === 'rect') return; // skip the background rectangle
      const fill = String((path.userData?.style as { fill?: string } | undefined)?.fill ?? '').toLowerCase();
      const material = fill.startsWith('url') ? flame : fill.includes('1d1d1d') ? silver : crimson;
      const isDetail = material === crimson;
      SVGLoader.createShapes(path).forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: isDetail ? depth * 1.35 : depth,
          bevelEnabled: true,
          bevelThickness: 0.9,
          bevelSize: 0.6,
          bevelSegments: 4,
          curveSegments: 24,
        });
        geometry.computeBoundingBox();
        box.union(geometry.boundingBox!);
        list.push({ geometry, material, z: isDetail ? -depth * 0.18 : 0 });
      });
    });
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    return { meshes: list, offset: center, scale: width / Math.max(size.x, size.y) };
  }, [data, depth, width]);

  // SVG y points down: flip on Y, then centre.
  return (
    <group scale={[scale, -scale, scale]}>
      <group position={[-offset.x, -offset.y, -offset.z]}>
        {meshes.map((m, i) => (
          <mesh key={i} geometry={m.geometry} material={m.material} position-z={m.z} castShadow receiveShadow />
        ))}
      </group>
    </group>
  );
}
