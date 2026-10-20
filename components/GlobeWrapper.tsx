"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the heavy 3D Globe with no SSR
const Globe = dynamic(() => import("./Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Pulsing placeholder rings that mimic the globe silhouette */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-blue-900/20 border border-blue-500/20 animate-pulse" />
        <div className="absolute inset-[10%] rounded-full bg-blue-800/10 border border-blue-400/10 animate-pulse [animation-delay:200ms]" />
        <div className="absolute inset-[22%] rounded-full bg-blue-700/10 border border-blue-300/10 animate-pulse [animation-delay:400ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
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
    // Still detecting — show minimal placeholder matching globe proportions
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-blue-500/20 animate-pulse bg-blue-950/20" />
      </div>
    );
  }

  return <Globe hasWebGL={hasWebGL} />;
}
