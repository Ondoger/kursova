'use client';

import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { AnimationState, RoomLightingState } from '@/types';
const GotchiModel3D = dynamic(
  () => import('./GotchiModel3D').then((mod) => mod.GotchiModel3D),
  { ssr: false }
);

// Dynamically import confetti to avoid SSR issues
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// GotchiCharacter3D is now imported from GotchiCharacter3D.tsx

// ---- Floating Zzz animation ----
function SleepingZzz(): JSX.Element {
  return (
    <div className="absolute -top-6 right-0 flex flex-col gap-1 pointer-events-none">
      {[0, 0.4, 0.8].map((delay, i) => (
        <motion.span
          key={i}
          className="text-lg font-bold text-indigo-300 select-none"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, 8 + i * 4, 16 + i * 6],
            y: [0, -12 - i * 8, -28 - i * 12],
            scale: [0.5, 1, 1.2],
          }}
          transition={{
            duration: 1.5,
            delay,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        >
          Z
        </motion.span>
      ))}
    </div>
  );
}

// ---- Room background (isometric-style) ----
function RoomBackground({
  lighting,
}: {
  lighting: RoomLightingState;
}): JSX.Element {
  const tintMap: Record<RoomLightingState, string> = {
    normal: 'rgba(34, 211, 238, 0.04)',
    ci_success: 'rgba(251, 191, 36, 0.12)',
    ci_failure: 'rgba(239, 68, 68, 0.12)',
    focus_lost: 'rgba(99, 102, 241, 0.08)',
  };

  const tint = tintMap[lighting];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      {/* Floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%]"
        style={{
          background: `linear-gradient(180deg, rgba(15,21,53,0.9) 0%, rgba(10,14,42,0.95) 100%)`,
        }}
      />

      {/* Grid floor pattern */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Wall */}
      <div
        className="absolute top-0 left-0 right-0 h-[65%]"
        style={{
          background: `linear-gradient(180deg, rgba(5,7,20,0.98) 0%, rgba(15,21,53,0.9) 100%)`,
        }}
      />

      {/* Room decorations — small monitor */}
      <div className="absolute top-6 left-8 opacity-60">
        <div className="w-16 h-10 rounded border border-cyan-500/30 bg-navy-800 flex items-center justify-center">
          <div className="w-12 h-7 rounded bg-cyan-900/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="w-6 h-2 mx-auto bg-slate-700 rounded-b" />
      </div>

      {/* Bookshelf */}
      <div className="absolute top-6 right-8 flex gap-1 opacity-60">
        {['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ec4899'].map((color, i) => (
          <div
            key={i}
            className="w-3 rounded-t"
            style={{ height: `${28 + i * 4}px`, backgroundColor: color, opacity: 0.7 }}
          />
        ))}
      </div>

      {/* Neon strip lights at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${
            lighting === 'ci_success'
              ? 'rgba(251,191,36,0.8)'
              : lighting === 'ci_failure'
              ? 'rgba(239,68,68,0.8)'
              : 'rgba(34,211,238,0.5)'
          }, transparent)`,
        }}
      />

      {/* Dynamic room tint overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ backgroundColor: tint }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Window */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-24 border border-cyan-500/20 bg-cyan-950/20 rounded-t-lg overflow-hidden opacity-50">
        <div className="grid grid-cols-2 h-full divide-x divide-y divide-cyan-500/20">
          <div className="bg-indigo-950/30" />
          <div className="bg-sky-950/20" />
          <div className="bg-sky-950/20" />
          <div className="bg-indigo-950/30" />
        </div>
      </div>
    </div>
  );
}

// ---- CI Alarm overlay ----
function CiFailureAlarm(): JSX.Element {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl pointer-events-none z-10 border-2 border-red-500"
      animate={{ opacity: [0, 0.7, 0, 0.7, 0] }}
      transition={{ duration: 0.8, repeat: 3 }}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-xs font-mono px-3 py-1 rounded-full flex items-center gap-2">
        <span className="animate-pulse">⚠</span>
        CI BUILD FAILED
      </div>
    </motion.div>
  );
}

// ---- Main GotchiRoom component ----

interface GotchiRoomProps {
  animationState: AnimationState;
  lighting: RoomLightingState;
  mood: number;
  energy: number;
  gotchiName: string;
  modelUrl: string;
  theme: GotchiTheme;
  showConfetti?: boolean;
}

export function GotchiRoom({
  animationState,
  lighting,
  mood,
  energy,
  gotchiName,
  modelUrl,
  theme,
  showConfetti = false,
}: GotchiRoomProps): JSX.Element {
  const controls = useAnimation();
  const prevStateRef = useRef<AnimationState>(animationState);

  const triggerAnimation = useCallback(
    async (state: AnimationState) => {
      switch (state) {
        case 'idle':
        case 'typing':
          await controls.start({
            y: [0, -4, 0],
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          });
          break;

        case 'ci_success':
          await controls.start({
            y: [0, -24, -4, -18, 0],
            rotate: [0, -5, 5, -3, 0],
            scale: [1, 1.15, 1, 1.1, 1],
            transition: { duration: 0.8, times: [0, 0.2, 0.5, 0.7, 1] },
          });
          break;

        case 'ci_failure':
          await controls.start({
            x: [0, -8, 8, -6, 6, 0],
            rotate: [0, -3, 3, -2, 2, 0],
            transition: { duration: 0.5 },
          });
          break;

        case 'level_up':
          await controls.start({
            y: [0, -30, 0, -20, 0],
            scale: [1, 1.2, 1, 1.1, 1],
            rotate: [0, -8, 8, -4, 0],
            transition: { duration: 1.2 },
          });
          break;

        case 'sleeping':
        case 'focus_lost':
          controls.start({
            y: [0, 4, 0],
            rotate: [0, 3, 0],
            transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          });
          break;

        default:
          controls.start({ y: 0, x: 0, rotate: 0, scale: 1 });
      }
    },
    [controls],
  );

  useEffect(() => {
    if (prevStateRef.current !== animationState) {
      prevStateRef.current = animationState;
      void triggerAnimation(animationState);
    }
  }, [animationState, triggerAnimation]);

  // Start idle animation on mount
  useEffect(() => {
    void triggerAnimation('idle');
  }, [triggerAnimation]);

  const isTyping = animationState === 'typing' || animationState === 'idle';
  const isAsleep =
    animationState === 'sleeping' || animationState === 'focus_lost';

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden"
      data-room-state={lighting}
      aria-label={`${gotchiName}'s room`}
      role="region"
    >
      {/* Room background */}
      <RoomBackground lighting={lighting} />

      {/* Confetti on CI success / level up */}
      {showConfetti && (
        <Confetti
          width={400}
          height={400}
          recycle={false}
          numberOfPieces={120}
          colors={['#22d3ee', '#8b5cf6', '#fbbf24', '#34d399', '#f9a8d4']}
        />
      )}

      {/* CI failure alarm */}
      <AnimatePresence>
        {lighting === 'ci_failure' && <CiFailureAlarm />}
      </AnimatePresence>

      {/* Gotchi character — 3D anime */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
        <motion.div
          animate={controls}
          className="w-full h-full relative"
          style={{ filter: 'var(--gotchi-filter)' }}
        >
          <GotchiModel3D animationState={animationState} mood={mood} modelUrl={modelUrl} theme={theme} />

          {/* Zzz overlay */}
          <AnimatePresence>
            {isAsleep && <SleepingZzz />}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Typing animation — keyboard glow */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[0, 0.1, 0.2].map((delay) => (
              <motion.div
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 0.8, delay, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat HUD — bottom corners */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-20">
        <div className="stat-pill">
          <span>💜</span>
          <span className="font-mono text-purple-300">{mood}</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20">
        <div className="stat-pill">
          <span>⚡</span>
          <span className="font-mono text-cyan-300">{energy}</span>
        </div>
      </div>

      {/* Name plate */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="px-4 py-1 rounded-full glass-card text-xs font-semibold text-cyan-300 border-cyan-500/30">
          {gotchiName}
        </div>
      </div>

      {/* State label */}
      <AnimatePresence>
        {animationState !== 'idle' && (
          <motion.div
            className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                animationState === 'ci_success' || animationState === 'level_up'
                  ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
                  : animationState === 'ci_failure'
                  ? 'text-red-300 border-red-500/40 bg-red-500/10'
                  : animationState === 'sleeping' || animationState === 'focus_lost'
                  ? 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10'
                  : 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
              }`}
            >
              {animationState.replace('_', ' ').toUpperCase()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
