import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { CharacterAnimation, CharacterMood, CharacterTier } from '../types';
import { ANIMATION_PATHS, CHARACTER_MODEL_PATH, moodToAnimation } from './animationMap';

interface ModelWaifuProps {
  tier: CharacterTier;
  mood: CharacterMood;
  level: number;
  animation?: CharacterAnimation;
}

const SPEED: Partial<Record<CharacterAnimation, number>> = {
  climbing: 0.85,
  joyfulJump: 0.95,
  jumpingDown: 0.9,
  kneelingPointing: 0.85,
  rumbaDancing: 0.8,
  sittingLaughing: 0.9,
  standingClap: 0.95,
};

const CROSSFADE_DURATION = 0.35;
const TARGET_HEIGHT = 2.6;
const HIPS_POSITION_TRACK = 'mixamorig1Hips.position';

/**
 * Extract the first AnimationClip from a GLTF and rename it.
 */
function stabilizeRootMotion(
  clip: THREE.AnimationClip,
  hipsPosition: [number, number, number] | null,
) {
  if (!hipsPosition) return clip;
  for (const track of clip.tracks) {
    if (track.name !== HIPS_POSITION_TRACK || track.getValueSize() !== 3) continue;
    for (let i = 0; i < track.values.length; i += 3) {
      track.values[i] = hipsPosition[0];
      track.values[i + 1] = hipsPosition[1];
      track.values[i + 2] = hipsPosition[2];
    }
  }
  return clip;
}

function firstHipsPosition(clip: THREE.AnimationClip | undefined) {
  const track = clip?.tracks.find(
    (t) => t.name === HIPS_POSITION_TRACK && t.getValueSize() === 3,
  );
  if (!track) return null;
  return [
    track.values[0],
    track.values[1],
    track.values[2],
  ] as [number, number, number];
}

function extractClip(
  gltf: { animations: THREE.AnimationClip[] },
  name: string,
  hipsPosition: [number, number, number] | null,
): THREE.AnimationClip | null {
  const src = gltf.animations[0];
  if (!src) return null;
  const clip = src.clone();
  clip.name = name;
  return stabilizeRootMotion(clip, hipsPosition);
}

export function ModelWaifu({ tier, mood, level, animation }: ModelWaifuProps) {
  const root = useRef<THREE.Group>(null);
  const mixerRoot = useRef<THREE.Group>(null);
  const prevAnimRef = useRef<CharacterAnimation | null>(null);

  const activeAnimation = animation ?? moodToAnimation(mood);

  // Load the base character model ONCE (mesh + skeleton)
  const baseGltf = useGLTF(CHARACTER_MODEL_PATH);

  // Load every animation .glb (drei caches them, so each URL is fetched only once)
  const idleGltf = useGLTF(ANIMATION_PATHS.idle);
  const climbingGltf = useGLTF(ANIMATION_PATHS.climbing);
  const joyfulJumpGltf = useGLTF(ANIMATION_PATHS.joyfulJump);
  const jumpingDownGltf = useGLTF(ANIMATION_PATHS.jumpingDown);
  const kneelingPointingGltf = useGLTF(ANIMATION_PATHS.kneelingPointing);
  const rumbaDancingGltf = useGLTF(ANIMATION_PATHS.rumbaDancing);
  const sittingLaughingGltf = useGLTF(ANIMATION_PATHS.sittingLaughing);
  const standingClapGltf = useGLTF(ANIMATION_PATHS.standingClap);

  // Collect all clips into a single array (stable reference via useMemo)
  const allClips = useMemo(() => {
    const hipsPosition = firstHipsPosition(idleGltf.animations[0]);
    const entries: [string, { animations: THREE.AnimationClip[] }][] = [
      ['idle', idleGltf],
      ['climbing', climbingGltf],
      ['joyfulJump', joyfulJumpGltf],
      ['jumpingDown', jumpingDownGltf],
      ['kneelingPointing', kneelingPointingGltf],
      ['rumbaDancing', rumbaDancingGltf],
      ['sittingLaughing', sittingLaughingGltf],
      ['standingClap', standingClapGltf],
    ];
    const clips: THREE.AnimationClip[] = [];
    for (const [name, gltf] of entries) {
      const clip = extractClip(gltf, name, hipsPosition);
      if (clip) clips.push(clip);
    }
    return clips;
  }, [
    idleGltf,
    climbingGltf,
    joyfulJumpGltf,
    jumpingDownGltf,
    kneelingPointingGltf,
    rumbaDancingGltf,
    sittingLaughingGltf,
    standingClapGltf,
  ]);

  // Clone the base model scene once (so we don't mutate the cached original)
  const model = useMemo(() => {
    baseGltf.scene.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(baseGltf.scene);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = size.y > 0.001 ? TARGET_HEIGHT / size.y : 1;

    const scene = clone(baseGltf.scene) as THREE.Group;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
      }
    });

    scene.position.set(-center.x, -bounds.min.y, -center.z);
    return { scene, scale };
  }, [baseGltf.scene]);

  // Single AnimationMixer bound to our cloned model
  const { actions } = useAnimations(allClips, mixerRoot);

  // Crossfade to the active animation whenever it changes
  useEffect(() => {
    const next = actions[activeAnimation];
    if (!next) return;

    const prev = prevAnimRef.current ? actions[prevAnimRef.current] : null;

    next
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveTimeScale(SPEED[activeAnimation] ?? 1)
      .setEffectiveWeight(1);

    if (prev && prev !== next) {
      next.fadeIn(CROSSFADE_DURATION).play();
      prev.fadeOut(CROSSFADE_DURATION);
    } else {
      next.fadeIn(0.15).play();
    }

    prevAnimRef.current = activeAnimation;
  }, [actions, activeAnimation]);

  useFrame((state) => {
    if (!root.current) return;
    const t = state.clock.getElapsedTime();
    root.current.rotation.y = Math.sin(t * 0.32) * 0.04;
    root.current.position.y = -1.0 + Math.sin(t * 1.1) * 0.025;
  });

  const auraScale = 1 + Math.min(level, 100) / 240;

  return (
    <group ref={root} position={[0, -1.0, 0]}>
      {/* Floor ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[0.9, 1.65, 72]} />
        <meshBasicMaterial
          color={tier.accent}
          transparent
          opacity={0.34}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Aura sphere */}
      {tier.hasAura && (
        <mesh scale={[auraScale, auraScale, auraScale]} position={[0, 1.3, 0]}>
          <sphereGeometry args={[1.55, 36, 36]} />
          <meshBasicMaterial
            color={tier.color}
            transparent
            opacity={0.13}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Character model */}
      <group ref={mixerRoot} scale={model.scale}>
        <primitive object={model.scene} />
      </group>
    </group>
  );
}

// Preload the base model + all animations at module level
useGLTF.preload(CHARACTER_MODEL_PATH);
Object.values(ANIMATION_PATHS).forEach((path) => useGLTF.preload(path));
