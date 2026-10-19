"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Destination Pin ────────────────────────────────────────────────────────
interface PinProps {
  lat: number;
  lng: number;
  label: string;
  color?: string;
}

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function DestinationPin({ lat, lng, color = "#06b6d4" }: PinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => latLngToVec3(lat, lng, 1.02), [lat, lng]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        1 + Math.sin(clock.getElapsedTime() * 2 + lat) * 0.2
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  );
}

// ─── Atmosphere Glow ────────────────────────────────────────────────────────
function AtmosphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[1.08, 64, 64]} />
      <meshStandardMaterial
        color="#1d4ed8"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        roughness={1}
      />
    </mesh>
  );
}

// ─── Globe Mesh ──────────────────────────────────────────────────────────────
function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  // Build a procedural texture for the globe: dark ocean + teal landmass hints
  const globeTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Deep ocean base
    const oceanGrad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    oceanGrad.addColorStop(0, "#0a1628");
    oceanGrad.addColorStop(1, "#020510");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, size, size);

    // Procedural continent blobs
    const continents = [
      { x: 0.22, y: 0.35, rx: 0.1, ry: 0.18 }, // Americas
      { x: 0.52, y: 0.3, rx: 0.1, ry: 0.2 }, // Europe/Africa
      { x: 0.72, y: 0.28, rx: 0.14, ry: 0.2 }, // Asia
      { x: 0.82, y: 0.62, rx: 0.07, ry: 0.08 }, // Australia
    ];

    continents.forEach(({ x, y, rx, ry }) => {
      const cx = x * size;
      const cy = y * size;
      const grad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.max(rx, ry) * size
      );
      grad.addColorStop(0, "rgba(30, 80, 120, 0.85)");
      grad.addColorStop(0.5, "rgba(20, 50, 90, 0.6)");
      grad.addColorStop(1, "rgba(10, 20, 50, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * size, ry * size, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Grid lines (latitude/longitude) — subtle
    ctx.strokeStyle = "rgba(59, 130, 246, 0.12)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo((i / 12) * size, 0);
      ctx.lineTo((i / 12) * size, size);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i / 6) * size);
      ctx.lineTo(size, (i / 6) * size);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
  });

  return (
    <>
      {/* Main globe sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={globeTexture}
          roughness={0.85}
          metalness={0.15}
          color="#1a3a6b"
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[1.001, 32, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>
    </>
  );
}

// ─── Orbit Ring ──────────────────────────────────────────────────────────────
function OrbitRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0.2, 0]}>
      <torusGeometry args={[1.35, 0.003, 8, 120]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.35} />
    </mesh>
  );
}

// ─── Floating Particle Field ─────────────────────────────────────────────────
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 400;

  const [positions] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.8 + Math.random() * 1.5;
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return [positions];
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#60a5fa"
        size={0.012}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Camera Setup ───────────────────────────────────────────────────────────
function CameraSetup() {
  const { camera } = useThree();
  camera.position.set(0, 0.3, 2.8);
  return null;
}

// ─── Destinations ────────────────────────────────────────────────────────────
const DESTINATIONS = [
  { lat: 36.3167, lng: 74.6667, label: "Hunza Valley", color: "#06b6d4" },
  { lat: 25.2048, lng: 55.2708, label: "Dubai", color: "#f59e0b" },
  { lat: 48.8566, lng: 2.3522, label: "Paris", color: "#ec4899" },
  { lat: 35.6762, lng: 139.6503, label: "Tokyo", color: "#8b5cf6" },
  { lat: 40.7128, lng: -74.006, label: "New York", color: "#10b981" },
  { lat: -33.8688, lng: 151.2093, label: "Sydney", color: "#f97316" },
  { lat: 1.3521, lng: 103.8198, label: "Singapore", color: "#06b6d4" },
];

// ─── Scene ───────────────────────────────────────────────────────────────────
function GlobeScene() {
  return (
    <>
      <CameraSetup />

      {/* Lights */}
      <ambientLight intensity={0.3} color="#1e40af" />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#60a5fa" />
      <pointLight position={[-5, -3, -5]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#06b6d4" />

      {/* Background stars */}
      <Stars
        radius={80}
        depth={40}
        count={2500}
        factor={3}
        saturation={0.2}
        fade
        speed={0.5}
      />

      {/* Globe elements */}
      <GlobeMesh />
      <AtmosphereGlow />
      <OrbitRing />
      <ParticleField />

      {/* Destination pins */}
      {DESTINATIONS.map((dest) => (
        <DestinationPin key={dest.label} {...dest} />
      ))}

      {/* Orbit controls — damped and limited */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        dampingFactor={0.05}
        enableDamping
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
      />
    </>
  );
}

// ─── 2D Fallback ─────────────────────────────────────────────────────────────
function GlobeFallback2D() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl scale-150 animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-2xl scale-125 animate-pulse-slow" />

        {/* SVG Globe */}
        <svg
          viewBox="0 0 300 300"
          width="340"
          height="340"
          className="relative z-10"
        >
          <defs>
            <radialGradient id="globeGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0d1b3e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020510" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Atmosphere */}
          <circle cx="150" cy="150" r="145" fill="url(#glowGrad)" />
          {/* Main globe */}
          <circle cx="150" cy="150" r="128" fill="url(#globeGrad)" />
          {/* Grid lines */}
          {[60, 80, 100, 120].map((r) => (
            <ellipse
              key={r}
              cx="150"
              cy="150"
              rx={r}
              ry="128"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.4"
              strokeOpacity="0.15"
            />
          ))}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = 150 + (lat / 90) * 128;
            const halfW = Math.sqrt(Math.max(0, 128 ** 2 - (y - 150) ** 2));
            return (
              <line
                key={lat}
                x1={150 - halfW}
                y1={y}
                x2={150 + halfW}
                y2={y}
                stroke="#3b82f6"
                strokeWidth="0.4"
                strokeOpacity="0.15"
              />
            );
          })}

          {/* Destination dots */}
          {[
            { cx: 100, cy: 120, color: "#06b6d4" },
            { cx: 175, cy: 105, color: "#f59e0b" },
            { cx: 155, cy: 95, color: "#ec4899" },
            { cx: 220, cy: 100, color: "#8b5cf6" },
            { cx: 75, cy: 108, color: "#10b981" },
          ].map((pin, i) => (
            <circle
              key={i}
              cx={pin.cx}
              cy={pin.cy}
              r="4"
              fill={pin.color}
              opacity="0.9"
            />
          ))}
          <circle cx="150" cy="150" r="128" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.3" />
        </svg>

        <p className="text-center text-xs text-blue-400/60 mt-2 font-medium tracking-widest uppercase">
          WebGL Unavailable · 2D Mode
        </p>
      </div>
    </div>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────
interface GlobeProps {
  hasWebGL: boolean;
}

export default function Globe({ hasWebGL }: GlobeProps) {
  if (!hasWebGL) return <GlobeFallback2D />;

  return (
    <div className="w-full h-full">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <GlobeScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
