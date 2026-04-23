'use client';

import type { GotchiTheme, AnimationState } from '@/types';
import type { VRM } from '@pixiv/three-vrm';

// ---- Language-specific animation behaviors ----

export interface LanguageAnimationConfig {
  idleSpeed: number;
  typingIntensity: number;
  celebrationStyle: 'energetic' | 'calm' | 'powerful' | 'elegant';
  breathingRate: number;
  headMovementRange: number;
}

export const LANGUAGE_ANIMATIONS: Record<GotchiTheme, LanguageAnimationConfig> = {
  'C++': {
    idleSpeed: 1.5,
    typingIntensity: 1.8,
    celebrationStyle: 'powerful',
    breathingRate: 1.8,
    headMovementRange: 0.08,
  },

  'Java': {
    idleSpeed: 1.0,
    typingIntensity: 1.2,
    celebrationStyle: 'calm',
    breathingRate: 1.3,
    headMovementRange: 0.12,
  },

  'Python': {
    idleSpeed: 0.8,
    typingIntensity: 1.0,
    celebrationStyle: 'elegant',
    breathingRate: 1.2,
    headMovementRange: 0.15,
  },

  'JS': {
    idleSpeed: 1.3,
    typingIntensity: 1.5,
    celebrationStyle: 'energetic',
    breathingRate: 1.5,
    headMovementRange: 0.2,
  },

  'TypeScript': {
    idleSpeed: 1.1,
    typingIntensity: 1.3,
    celebrationStyle: 'calm',
    breathingRate: 1.4,
    headMovementRange: 0.1,
  },

  'Rust': {
    idleSpeed: 1.2,
    typingIntensity: 1.6,
    celebrationStyle: 'powerful',
    breathingRate: 1.6,
    headMovementRange: 0.09,
  },

  'Go': {
    idleSpeed: 1.4,
    typingIntensity: 1.4,
    celebrationStyle: 'energetic',
    breathingRate: 1.7,
    headMovementRange: 0.11,
  },

  'C#': {
    idleSpeed: 1.0,
    typingIntensity: 1.2,
    celebrationStyle: 'calm',
    breathingRate: 1.3,
    headMovementRange: 0.13,
  },

  'Ruby': {
    idleSpeed: 0.9,
    typingIntensity: 1.1,
    celebrationStyle: 'elegant',
    breathingRate: 1.2,
    headMovementRange: 0.16,
  },

  'PHP': {
    idleSpeed: 1.0,
    typingIntensity: 1.2,
    celebrationStyle: 'calm',
    breathingRate: 1.4,
    headMovementRange: 0.14,
  },

  'Swift': {
    idleSpeed: 1.3,
    typingIntensity: 1.4,
    celebrationStyle: 'energetic',
    breathingRate: 1.5,
    headMovementRange: 0.12,
  },

  'Kotlin': {
    idleSpeed: 1.1,
    typingIntensity: 1.3,
    celebrationStyle: 'calm',
    breathingRate: 1.4,
    headMovementRange: 0.11,
  },
};

export function getAnimationConfig(theme: GotchiTheme): LanguageAnimationConfig {
  return LANGUAGE_ANIMATIONS[theme] || LANGUAGE_ANIMATIONS['JS'];
}

// ---- Apply language-specific animations to VRM ----

export function applyLanguageAnimation(
  vrm: VRM,
  theme: GotchiTheme,
  animationState: AnimationState,
  time: number,
  mood: number,
): void {
  const config = getAnimationConfig(theme);
  const b = vrm.humanoid;
  const ex = vrm.expressionManager;

  if (!b) return;

  const speedMultiplier = config.idleSpeed;
  const t = time * speedMultiplier;
  const sin1 = Math.sin(t * 2);
  const sin2 = Math.sin(t * 4);
  const breathe = Math.sin(t * config.breathingRate) * 0.02;

  // Reset expressions
  if (ex) {
    ex.setValue('happy', 0);
    ex.setValue('angry', 0);
    ex.setValue('sad', 0);
    ex.setValue('surprised', 0);
    ex.setValue('blink', 0);
  }

  // Reset rotations
  ['neck', 'rightUpperArm', 'leftUpperArm', 'rightLowerArm', 'leftLowerArm'].forEach(n => {
    const bone = b.getNormalizedBoneNode(n as any);
    if (bone) {
      if (n.includes('Arm')) {
        bone.rotation.z = Math.PI / 3 * (n.includes('right') ? -1 : 1);
        bone.rotation.x = 0;
      } else {
        bone.rotation.x = 0;
        bone.rotation.z = 0;
      }
    }
  });

  const hips = b.getNormalizedBoneNode('hips');
  if (hips) hips.position.y = 1.0;

  // State-specific animations with language personality
  if (animationState === 'typing' || animationState === 'idle') {
    const h = b.getNormalizedBoneNode('head');
    if (h) h.rotation.y = Math.sin(t * 0.5) * config.headMovementRange;

    const chest = b.getNormalizedBoneNode('chest');
    if (chest) chest.scale.setScalar(1 + breathe);

    if (ex && Math.sin(t * 3) > 0.95) ex.setValue('blink', 1);

    if (animationState === 'typing') {
      const intensity = config.typingIntensity;
      const rArm = b.getNormalizedBoneNode('rightLowerArm');
      const lArm = b.getNormalizedBoneNode('leftLowerArm');
      if (rArm) rArm.rotation.x = -1.0 + sin2 * 0.2 * intensity;
      if (lArm) lArm.rotation.x = -1.0 + Math.cos(t * 4) * 0.2 * intensity;

      if (ex) ex.setValue('happy', mood > 50 ? 0.5 : 0);
    }
  }
  else if (animationState === 'ci_success' || animationState === 'level_up') {
    if (ex) ex.setValue('happy', 1.0);

    // Celebration style based on language
    const jumpHeight = config.celebrationStyle === 'powerful' ? 0.2 :
                       config.celebrationStyle === 'energetic' ? 0.18 :
                       config.celebrationStyle === 'elegant' ? 0.12 : 0.15;

    if (hips) hips.position.y = 1.0 + Math.abs(sin1) * jumpHeight;

    const rArm = b.getNormalizedBoneNode('rightUpperArm');
    const lArm = b.getNormalizedBoneNode('leftUpperArm');

    if (config.celebrationStyle === 'powerful') {
      // Strong, confident pose
      if (rArm) rArm.rotation.z = -Math.PI * 0.9;
      if (lArm) lArm.rotation.z = Math.PI * 0.9;
    } else if (config.celebrationStyle === 'energetic') {
      // Excited waving
      if (rArm) rArm.rotation.z = -Math.PI * 0.8 + sin1 * 0.2;
      if (lArm) lArm.rotation.z = Math.PI * 0.8 + sin1 * 0.2;
    } else if (config.celebrationStyle === 'elegant') {
      // Graceful celebration
      if (rArm) rArm.rotation.z = -Math.PI * 0.6;
      if (lArm) lArm.rotation.z = Math.PI * 0.6;
    } else {
      // Calm celebration
      if (rArm) rArm.rotation.z = -Math.PI * 0.7;
      if (lArm) lArm.rotation.z = Math.PI * 0.7;
    }
  }
  else if (animationState === 'ci_failure') {
    if (ex) ex.setValue('surprised', 1.0);

    if (hips) hips.position.x = Math.sin(t * 30) * 0.02;

    const neck = b.getNormalizedBoneNode('neck');
    if (neck) neck.rotation.x = 0.2;
  }
  else if (animationState === 'sleeping' || animationState === 'focus_lost') {
    if (ex) ex.setValue('blink', 1.0);

    const neck = b.getNormalizedBoneNode('neck');
    if (neck) neck.rotation.x = 0.4 + breathe;

    const chest = b.getNormalizedBoneNode('chest');
    if (chest) chest.scale.setScalar(1 + Math.sin(t * 1) * 0.05);
  }
}
