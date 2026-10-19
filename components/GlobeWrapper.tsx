"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the heavy 3D Globe with no SSR
const Globe = dynamic(() => import("./Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-48 h-48 rounded-full bg-blue-900/20 border border-blue-500/20 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-blue-800/10 border border-blue-400/10 animate-pulse-slow" />
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
      </div>
    </div>
  ),
});

export default function GlobeWrapper() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGL(!!gl);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === null) {
    // Still detecting — show minimal placeholder
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-56 h-56 rounded-full border border-blue-500/20 animate-pulse bg-blue-950/20" />
      </div>
    );
  }

  return <Globe hasWebGL={hasWebGL} />;
}
