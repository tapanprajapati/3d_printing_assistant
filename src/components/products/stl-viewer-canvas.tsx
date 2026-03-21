"use client";

import React, { Component, Suspense } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Bounds, Center } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { AlertTriangle } from "lucide-react";
import * as THREE from "three";

// ── Loading fallback: spinning box ────────────────────────────────────────────
function SpinningBox() {
  const mesh = React.useRef<THREE.Mesh>(null);
  useThree(); // ensure we're inside Canvas
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

// ── The actual STL mesh ───────────────────────────────────────────────────────
function ModelMesh({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <Bounds fit clip observe>
      <Center>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.1} />
        </mesh>
      </Center>
    </Bounds>
  );
}

// ── Error boundary ────────────────────────────────────────────────────────────
interface ErrorState {
  hasError: boolean;
}

class ViewerErrorBoundary extends Component<React.PropsWithChildren, ErrorState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm">Failed to load 3D model.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Default export: the full canvas ──────────────────────────────────────────
export default function StlViewerCanvas({ url }: { url: string }) {
  return (
    <ViewerErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <Suspense fallback={<SpinningBox />}>
          <ModelMesh url={url} />
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </ViewerErrorBoundary>
  );
}
