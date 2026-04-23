'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import type { AnimationState, GotchiTheme } from '@/types';
import { getLanguageConfig } from '@/config/languageModels';
import { applyLanguageAnimation } from './LanguageAnimations';

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

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    let isCancelled = false;
    setVrm(null);

    loader.load(
      modelUrl,
      (gltf) => {
        if (isCancelled) return;
        const vrmData = gltf.userData.vrm as VRM;

        gltf.scene.traverse((obj) => {
          obj.frustumCulled = false;
          if ((obj as THREE.Mesh).isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        if (vrmData) {
          setVrm(vrmData);
        } else {
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

  useEffect(() => {
    if (vrm && vrm.humanoid) {
      const b = vrm.humanoid;
      const head = b.getNormalizedBoneNode('head');
      if (head) {
        head.updateWorldMatrix(true, false);
        const headPos = new THREE.Vector3();
        head.getWorldPosition(headPos);

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(head.getWorldQuaternion(new THREE.Quaternion())).normalize();

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

  useFrame((state, delta) => {
    if (!vrm) return;
    vrm.update(delta);

    const t = state.clock.elapsedTime;
    applyLanguageAnimation(vrm, theme, animationState, t, mood);
  });

  if (!vrm) {
    const HtmlAny = Html as any;
    return (
       <HtmlAny center position={[0, 0.5, 0]}>
         <div className="text-fuji animate-breathe font-mono text-sm whitespace-nowrap">
           Loading 3D Model...
         </div>
       </HtmlAny>
    );
  }

  return (
    <primitive object={vrm.scene} position={[0, -0.6, 0]}>
      <pointLight
        position={[0, 1, 0]}
        color={langConfig.accentColor}
        intensity={0.3}
        distance={2}
      />
    </primitive>
  );
}

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
  const SparklesAny = Sparkles as any;
  const FloatAny = Float as any;
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
           intensity={1.0}
           castShadow
           shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[3, 2, -2]}
          intensity={0.3}
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

        {/* Reduced sparkles — warm and subdued */}
        <SparklesAny
          count={15}
          scale={1.5}
          size={3}
          speed={0.3}
          opacity={0.4}
          color={langConfig.primaryColor}
          position={[0, 1.2, 0]}
        />

        {/* Toned-down floating rings */}
        <FloatAny speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
           <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <torusGeometry args={[0.7, 0.01, 16, 100]} />
             <meshStandardMaterial
               color={langConfig.primaryColor}
               emissive={langConfig.primaryColor}
               emissiveIntensity={0.8}
               transparent
               opacity={0.3}
             />
           </mesh>
        </FloatAny>

        <OrbitControlsAny
           makeDefault
           enableZoom={true}
           enablePan={true}
           minDistance={0.1}
           maxDistance={5.0}
        />

        <ContactShadowsAny
           position={[0, 0, 0]}
           opacity={0.4}
           scale={2}
           blur={2}
           far={2}
           color="#2a251e"
        />
      </CanvasAny>
    </div>
  );
}
