"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 240;

function Motes() {
  const ref = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Initial positions + per-particle drift speed
  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6; // z
      speeds[i] = 0.06 + Math.random() * 0.14;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, phases };
  }, []);

  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const topY = viewport.height / 2 + 1;
    for (let i = 0; i < COUNT; i++) {
      // Drift slowly upward
      arr[i * 3 + 1] += speeds[i] * 0.016;
      // Gentle horizontal sway
      arr[i * 3] += Math.sin(t * 0.3 + phases[i]) * 0.0016;
      // Recycle to the bottom once past the top
      if (arr[i * 3 + 1] > topY) {
        arr[i * 3 + 1] = -topY;
        arr[i * 3] = (Math.random() - 0.5) * 16;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;

    // Subtle parallax toward the cursor
    pts.rotation.y = THREE.MathUtils.lerp(pts.rotation.y, state.pointer.x * 0.12, 0.04);
    pts.rotation.x = THREE.MathUtils.lerp(pts.rotation.x, -state.pointer.y * 0.08, 0.04);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#C9A878"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroParticles() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 6,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        style={{ background: "transparent" }}
      >
        <Motes />
      </Canvas>
    </div>
  );
}
