"use client";

import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Destination Pins Data ───────────────────────────────────────────────────
interface PinData {
  lat: number;
  lng: number;
  label: string;
  color: string;
}

const DESTINATIONS: PinData[] = [
  { lat: 36.3167, lng: 74.6667, label: "Hunza Valley", color: "#38bdf8" },
  { lat: 25.2048, lng: 55.2708, label: "Dubai", color: "#f59e0b" },
  { lat: 48.8566, lng: 2.3522, label: "Paris", color: "#ec4899" },
  { lat: 35.6762, lng: 139.6503, label: "Tokyo", color: "#a855f7" },
  { lat: 40.7128, lng: -74.006, label: "New York", color: "#10b981" },
  { lat: -8.4095, lng: 115.1889, label: "Bali", color: "#06b6d4" },
  { lat: 51.5074, lng: -0.1278, label: "London", color: "#60a5fa" },
];

// Helper: Convert Lat/Lng to Vector3
function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── Destination Pin with Pulse Beacon ─────────────────────────────────────────
function DestinationPin({ lat, lng, color }: PinData) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const pos = useMemo(() => latLngToVec3(lat, lng, 1.015), [lat, lng]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.5 + lat;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(t) * 0.25);
    }
    if (ringRef.current) {
      const scale = 1 + (Math.sin(t) * 0.5 + 0.5) * 1.8;
      ringRef.current.scale.set(scale, scale, scale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.7 - (scale - 1) * 0.35);
      }
    }
  });

  return (
    <group position={pos}>
      {/* Beacon head */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>

      {/* Ripple ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, 0.045, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Atmosphere Glow Shell ────────────────────────────────────────────────────
function AtmosphereGlow() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[1.08, 48, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          roughness={1}
          metalness={0}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.025, 36, 36]} />
        <meshStandardMaterial
          color="#60a5fa"
          transparent
          opacity={0.08}
          roughness={0.5}
        />
      </mesh>
    </>
  );
}

// ─── Procedural Vibrant Earth Texture ─────────────────────────────────────────
function createEarthCanvasTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 1. Rich Deep Ocean Base Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#08214d");
  oceanGrad.addColorStop(0.3, "#0d3268");
  oceanGrad.addColorStop(0.5, "#133f7e");
  oceanGrad.addColorStop(0.7, "#0d3268");
  oceanGrad.addColorStop(1, "#071c42");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  const drawContinentBlob = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rot: number,
    color: string,
    shelfColor: string
  ) => {
    ctx.save();
    ctx.translate(cx * width, cy * height);
    ctx.rotate(rot);
    const shelfGrad = ctx.createRadialGradient(0, 0, rx * width * 0.4, 0, 0, rx * width * 1.35);
    shelfGrad.addColorStop(0, shelfColor);
    shelfGrad.addColorStop(0.65, "rgba(14, 165, 233, 0.35)");
    shelfGrad.addColorStop(1, "rgba(2, 132, 199, 0)");
    ctx.fillStyle = shelfGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * width * 1.35, ry * height * 1.35, 0, 0, Math.PI * 2);
    ctx.fill();

    const landGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * width);
    landGrad.addColorStop(0, color);
    landGrad.addColorStop(0.7, color);
    landGrad.addColorStop(0.95, "#15803d");
    landGrad.addColorStop(1, "#0ea5e9");
    ctx.fillStyle = landGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * width, ry * height, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(125, 211, 252, 0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  };

  // World Landmass Clusters
  drawContinentBlob(0.24, 0.32, 0.11, 0.15, -0.15, "#22c55e", "rgba(56, 189, 248, 0.5)");
  drawContinentBlob(0.18, 0.22, 0.08, 0.09, -0.1, "#15803d", "rgba(56, 189, 248, 0.4)");
  drawContinentBlob(0.34, 0.14, 0.05, 0.06, 0.1, "#e2e8f0", "rgba(186, 230, 253, 0.6)");
  drawContinentBlob(0.32, 0.65, 0.075, 0.18, 0.25, "#16a34a", "rgba(56, 189, 248, 0.5)");
  drawContinentBlob(0.29, 0.55, 0.06, 0.09, 0.1, "#15803d", "rgba(56, 189, 248, 0.45)");
  drawContinentBlob(0.53, 0.27, 0.065, 0.08, 0.05, "#16a34a", "rgba(56, 189, 248, 0.5)");
  drawContinentBlob(0.48, 0.24, 0.028, 0.045, -0.2, "#22c55e", "rgba(56, 189, 248, 0.4)");
  drawContinentBlob(0.53, 0.48, 0.09, 0.16, 0.1, "#ca8a04", "rgba(56, 189, 248, 0.45)");
  drawContinentBlob(0.54, 0.62, 0.07, 0.12, 0.05, "#15803d", "rgba(56, 189, 248, 0.45)");
  drawContinentBlob(0.63, 0.66, 0.018, 0.05, 0.3, "#22c55e", "rgba(56, 189, 248, 0.35)");
  drawContinentBlob(0.72, 0.28, 0.16, 0.14, -0.05, "#22c55e", "rgba(56, 189, 248, 0.55)");
  drawContinentBlob(0.66, 0.38, 0.075, 0.08, 0.2, "#eab308", "rgba(56, 189, 248, 0.45)");
  drawContinentBlob(0.60, 0.38, 0.05, 0.06, -0.1, "#d97706", "rgba(56, 189, 248, 0.4)");
  drawContinentBlob(0.83, 0.35, 0.02, 0.08, -0.4, "#16a34a", "rgba(56, 189, 248, 0.5)");
  drawContinentBlob(0.76, 0.52, 0.045, 0.06, 0.3, "#15803d", "rgba(56, 189, 248, 0.5)");
  drawContinentBlob(0.81, 0.56, 0.06, 0.035, -0.1, "#16a34a", "rgba(56, 189, 248, 0.45)");
  drawContinentBlob(0.84, 0.72, 0.09, 0.085, -0.05, "#ca8a04", "rgba(56, 189, 248, 0.5)");
  drawContinentBlob(0.93, 0.80, 0.02, 0.05, 0.4, "#22c55e", "rgba(56, 189, 248, 0.4)");
  drawContinentBlob(0.5, 0.96, 0.45, 0.05, 0, "#f8fafc", "rgba(224, 242, 254, 0.7)");

  // Graticule Grid
  ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let j = 0; j <= 12; j++) {
    const y = (j / 12) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Equator highlight
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// ─── Main Globe Mesh ──────────────────────────────────────────────────────────
function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);

  useEffect(() => {
    if (earthTexture) earthTexture.needsUpdate = true;
  }, [earthTexture]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.08;
    if (meshRef.current) meshRef.current.rotation.y = t;
    if (wireRef.current) wireRef.current.rotation.y = t;
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          color="#ffffff"
          roughness={0.42}
          metalness={0.12}
          emissive="#091b36"
          emissiveIntensity={0.25}
        />
      </mesh>

      <mesh ref={wireRef}>
        <sphereGeometry args={[1.002, 36, 36]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.06} />
      </mesh>
    </>
  );
}

// ─── Tilted Orbital Rings ─────────────────────────────────────────────────────
function OrbitRings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1.current) ring1.current.rotation.z = t * 0.12;
    if (ring2.current) ring2.current.rotation.z = -t * 0.08;
  });

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2.8, 0.25, 0]}>
        <torusGeometry args={[1.38, 0.003, 8, 120]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3.4, -0.4, 0]}>
        <torusGeometry args={[1.52, 0.002, 8, 120]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.25} />
      </mesh>
    </>
  );
}

// ─── Floating Star Dust Particles ─────────────────────────────────────────────
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 350;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.7 + Math.random() * 1.8;
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.025;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#7dd3fc" size={0.015} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// ─── Responsive Camera Controller ─────────────────────────────────────────────
// Adjusts the camera's Z position based on the canvas aspect ratio so the globe
// is always fully visible on mobile without clipping.
function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const isMobile = size.width < 640;
    const isTablet = size.width < 1024;

    // Pull the camera back on small screens so the full globe fits in frame
    const z = isMobile ? 3.6 : isTablet ? 3.1 : 2.75;
    const y = isMobile ? 0.1 : 0.25;

    camera.position.set(0, y, z);
    camera.updateProjectionMatrix();
  }, [camera, size.width]);

  return null;
}

// ─── Scene Composition ────────────────────────────────────────────────────────
function GlobeScene() {
  return (
    <>
      {/* Vibrant Studio & Sun Lighting */}
      <ambientLight intensity={1.35} color="#dbeafe" />
      <directionalLight position={[6, 4.5, 5]} intensity={2.8} color="#ffffff" />
      <directionalLight position={[-6, -2.5, -4]} intensity={1.2} color="#38bdf8" />
      <pointLight position={[0, 5, 2]} intensity={0.9} color="#06b6d4" />

      <Stars radius={90} depth={50} count={2800} factor={3.5} saturation={0.3} fade speed={0.6} />

      <GlobeMesh />
      <AtmosphereGlow />
      <OrbitRings />
      <ParticleField />

      {DESTINATIONS.map((d) => (
        <DestinationPin key={d.label} {...d} />
      ))}

      {/* Responsive camera must be inside Canvas so it can use useThree */}
      <ResponsiveCamera />

      {/* Touch-friendly OrbitControls:
          - enableZoom=false prevents accidental zoom on pinch
          - touches prop sets single-finger rotate and two-finger dolly modes
          - rotateSpeed is slightly reduced so touch feels natural */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        dampingFactor={0.08}
        enableDamping
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
        rotateSpeed={0.6}
        touches={{
          ONE: 2, // TOUCH.ROTATE
          TWO: 0, // TOUCH.DOLLY_PAN – disabled (maps to TOUCH.NONE=0 in r3f)
        }}
      />
    </>
  );
}

// ─── 2D Fallback (responsive) ─────────────────────────────────────────────────
function GlobeFallback2D() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-3xl scale-150 animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl scale-125" />

        {/* viewBox is fixed; width/height are 100% so it scales with container */}
        <svg
          viewBox="0 0 300 300"
          className="relative z-10 w-full h-full max-w-[340px] max-h-[340px]"
          aria-label="2D Globe fallback"
        >
          <defs>
            <radialGradient id="globeGrad2d" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="60%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0b1b38" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="150" r="140" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="150" cy="150" r="128" fill="url(#globeGrad2d)" />
          {/* Continents */}
          <ellipse cx="120" cy="115" rx="35" ry="40" fill="#22c55e" fillOpacity="0.85" />
          <ellipse cx="180" cy="120" rx="30" ry="35" fill="#16a34a" fillOpacity="0.85" />
          <ellipse cx="190" cy="180" rx="38" ry="45" fill="#ca8a04" fillOpacity="0.8" />
          <ellipse cx="230" cy="210" rx="22" ry="18" fill="#22c55e" fillOpacity="0.85" />
          {/* Pins */}
          <circle cx="170" cy="105" r="5" fill="#38bdf8" />
          <circle cx="210" cy="130" r="5" fill="#f59e0b" />
          <circle cx="115" cy="130" r="5" fill="#ec4899" />
          {/* Grid lines */}
          <line x1="150" y1="10" x2="150" y2="290" stroke="#38bdf8" strokeOpacity="0.15" strokeWidth="1" />
          <line x1="10" y1="150" x2="290" y2="150" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1.5" />
        </svg>

        <p className="absolute bottom-0 text-center text-[10px] text-cyan-400/70 font-medium tracking-widest uppercase">
          2D Mode
        </p>
      </div>
    </div>
  );
}

// ─── Exported Component ───────────────────────────────────────────────────────
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
        // Limit DPR to 1.5 on mobile to save GPU bandwidth without sacrificing quality
        dpr={typeof window !== "undefined" && window.innerWidth < 640 ? [1, 1.5] : [1, 2]}
        style={{ background: "transparent", touchAction: "pan-y" }}
        // camera prop sets FOV – wider on mobile so the globe doesn't get clipped
        camera={{ fov: 50, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <GlobeScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
