'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Sparkles, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import type { AnimationState, GotchiTheme } from '@/types';
import { getLanguageConfig } from '@/config/languageModels';
import { applyLanguageAnimation } from './LanguageAnimations';

// ─── VRM Model Component ──────────────────────────────────────────────────────
interface VrmCharacterProps {
  animationState: AnimationState;
  mood: number;
  modelUrl: string;
  theme: GotchiTheme;
}

function VrmCharacter({ animationState, mood, modelUrl, theme }: VrmCharacterProps) {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const { camera, controls } = useThree();
  const headRef = useRef<THREE.Object3D | null>(null);
  const langConfig = getLanguageConfig(theme);

  // Load VRM Model
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    let isCancelled = false;
    setVrm(null); // clear current until loaded

    loader.load(
      modelUrl,
      (gltf) => {
        if (isCancelled) return;
        const vrmData = gltf.userData.vrm as VRM;
        
        // 1. We remove manual rotation enforcement so the model retains its native orientation.
        // It doesn't matter which way it faces (+Z or -Z) because our new camera logic
        // dynamically searches for the front of the face!

        // 2. Disable frustum culling
        gltf.scene.traverse((obj) => {
          obj.frustumCulled = false;
          if ((obj as THREE.Mesh).isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        // If it's a VRM, set it. Otherwise fallback to a dummy VRM wrapper so we can still render it.
        if (vrmData) {
          setVrm(vrmData);
        } else {
          // Fallback wrapper for raw .glb dropped in
          setVrm({
            scene: gltf.scene,
            update: () => {},
            humanoid: null,
            expressionManager: null,
          } as any);
        }
      },
      undefined,
      (err) => {
         if (!isCancelled) console.error("Error loading model:", err);
      }
    );

    return () => {
      isCancelled = true;
    };
  }, [modelUrl]);

  // Center camera on the head when VRM changes
  useEffect(() => {
    if (vrm && vrm.humanoid) {
      const b = vrm.humanoid;
      const head = b.getNormalizedBoneNode('head');
      if (head) {
        head.updateWorldMatrix(true, false);
        const headPos = new THREE.Vector3();
        head.getWorldPosition(headPos);

        // Determine which way the face is natively pointing
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(head.getWorldQuaternion(new THREE.Quaternion())).normalize();
        
        // Position camera right in front of head, using its own forward direction
        camera.position.set(headPos.x + forward.x * 1.5, headPos.y - 0.1, headPos.z + forward.z * 1.5);
        
        if (controls) {
           const c = controls as any;
           c.target.copy(headPos);
           c.update();
        } else {
           camera.lookAt(headPos);
        }
      }
    }
  }, [vrm, camera]);


  // Update VRM logic on every frame
  useFrame((state, delta) => {
    if (!vrm) return;
    vrm.update(delta);

    const t = state.clock.elapsedTime;

    // Use language-specific animation system
    applyLanguageAnimation(vrm, theme, animationState, t, mood);
  });

  // Loading state placeholder if VRM not yet parsed
  if (!vrm) {
    const HtmlAny = Html as any;
    return (
       <HtmlAny center position={[0, 0.5, 0]}>
         <div className="text-cyan-300 animate-pulse font-mono text-sm whitespace-nowrap">
           Loading 3D Model...
         </div>
       </HtmlAny>
    );
  }

  return (
    <primitive object={vrm.scene} position={[0, -0.6, 0]}>
      {/* Add language-specific glow effect */}
      <pointLight
        position={[0, 1, 0]}
        color={langConfig.accentColor}
        intensity={0.5}
        distance={2}
      />
    </primitive>
  );
}

// ─── Scene Wrapper ────────────────────────────────────────────────────────────
interface GotchiModel3DProps {
  animationState: AnimationState;
  mood?: number;
  modelUrl: string;
  theme: GotchiTheme;
}

export function GotchiModel3D({ animationState, mood = 80, modelUrl, theme }: GotchiModel3DProps) {
  const CanvasAny = Canvas as any;
  const OrbitControlsAny = OrbitControls as any;
  const ContactShadowsAny = ContactShadows as any;
  const langConfig = getLanguageConfig(theme);

  return (
    <div className="w-full h-full relative outline-none" style={{ background: 'transparent' }}>
      <CanvasAny
        camera={{ position: [0, 1.5, 2.0], fov: 30 }}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
           position={[-2, 5, 4]}
           intensity={1.2}
           castShadow
           shadow-mapSize={[1024, 1024]}
        />
        {/* Language-specific accent lighting */}
        <directionalLight
          position={[3, 2, -2]}
          intensity={0.4}
          color={langConfig.accentColor}
        />

        <React.Suspense fallback={null}>
          <VrmCharacter
            animationState={animationState}
            mood={mood}
            modelUrl={modelUrl}
            theme={theme}
          />
        </React.Suspense>

        {/* Ambient Space Filling Elements */}
        {/* Deep background stars */}
        <Stars radius={5} depth={20} count={300} factor={3} saturation={0.8} fade speed={0.5} />

        {/* Language-themed sparkles */}
        <Sparkles
          count={40}
          scale={1.5}
          size={4}
          speed={0.4}
          opacity={0.7}
          color={langConfig.primaryColor}
          position={[0, 1.2, 0]}
        />
        <Sparkles
          count={40}
          scale={1.8}
          size={2}
          speed={0.5}
          opacity={0.5}
          color={langConfig.secondaryColor}
          position={[0, 1.0, 0]}
        />

        {/* Floating cyber/magic rings with language colors */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <torusGeometry args={[0.7, 0.015, 16, 100]} />
             <meshStandardMaterial
               color={langConfig.primaryColor}
               emissive={langConfig.primaryColor}
               emissiveIntensity={2}
               transparent
               opacity={0.6}
             />
           </mesh>
           <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <torusGeometry args={[0.9, 0.005, 16, 100]} />
             <meshStandardMaterial
               color={langConfig.accentColor}
               emissive={langConfig.accentColor}
               emissiveIntensity={1}
               transparent
               opacity={0.4}
             />
           </mesh>
        </Float>

        <OrbitControlsAny
           makeDefault
           enableZoom={true}
           enablePan={true}
           minDistance={0.1}
           maxDistance={5.0}
        />

        <ContactShadowsAny
           position={[0, 0, 0]}
           opacity={0.6}
           scale={2}
           blur={1.5}
           far={2}
           color="#1e1b4b"
        />
      </CanvasAny>
    </div>
  );
}
