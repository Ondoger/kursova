'use client';

import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { AnimationState, RoomLightingState, GotchiTheme } from '@/types';
const GotchiModel3D = dynamic(
  () => import('./GotchiModel3D').then((mod) => mod.GotchiModel3D),
  { ssr: false }
);

// ---- Floating Zzz animation ----
function SleepingZzz(): JSX.Element {
  return (
    <div className="absolute -top-6 right-0 flex flex-col gap-1 pointer-events-none">
      {[0, 0.4, 0.8].map((delay, i) => (
        <motion.span
          key={i}
          className="text-lg font-bold text-fuji/50 select-none"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.7, 0],
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

// ---- Room background (zen garden) ----
function RoomBackground({
  lighting,
}: {
  lighting: RoomLightingState;
}): JSX.Element {
  const tintMap: Record<RoomLightingState, string> = {
    normal: 'rgba(180, 167, 214, 0.03)',
    ci_success: 'rgba(107, 158, 126, 0.08)',
    ci_failure: 'rgba(200, 90, 68, 0.08)',
    focus_lost: 'rgba(122, 110, 92, 0.06)',
  };

  const tint = tintMap[lighting];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg" aria-hidden="true">
      {/* Floor — tatami texture */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%]"
        style={{
          background: `linear-gradient(180deg, rgba(36, 33, 25, 0.95) 0%, rgba(30, 27, 20, 0.98) 100%)`,
        }}
      />

      {/* Tatami grid */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%] pattern-shoji"
        style={{ opacity: 0.4 }}
      />

      {/* Wall — shoji pattern */}
      <div
        className="absolute top-0 left-0 right-0 h-[65%]"
        style={{
          background: `linear-gradient(180deg, rgba(14, 14, 16, 0.98) 0%, rgba(30, 27, 23, 0.95) 100%)`,
        }}
      />

      {/* Room decoration — kakejiku (hanging scroll) */}
      <div className="absolute top-6 left-8 opacity-50">
        <div className="w-12 h-20 rounded-sm border border-sumi-700 bg-sumi-900/60 flex items-center justify-center">
          <span className="text-lg text-fuji/30 font-serif select-none">道</span>
        </div>
        <div className="w-4 h-1 mx-auto bg-sumi-700 rounded-b" />
      </div>

      {/* Bookshelf — earthy tones */}
      <div className="absolute top-6 right-8 flex gap-1 opacity-50">
        {['#7a6e5c', '#6b9e7e', '#d4a843', '#b4a7d6', '#c85a44'].map((color, i) => (
          <div
            key={i}
            className="w-3 rounded-t"
            style={{ height: `${28 + i * 4}px`, backgroundColor: color, opacity: 0.5 }}
          />
        ))}
      </div>

      {/* Dynamic room tint overlay */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{ backgroundColor: tint }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Window — minimal */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-24 border border-sumi-700 bg-sumi-900/30 rounded-t-sm overflow-hidden opacity-40">
        <div className="grid grid-cols-2 h-full divide-x divide-y divide-sumi-700">
          <div className="bg-sumi-950/30" />
          <div className="bg-sumi-900/20" />
          <div className="bg-sumi-900/20" />
          <div className="bg-sumi-950/30" />
        </div>
      </div>
    </div>
  );
}

// ---- CI Alarm overlay ----
function CiFailureAlarm(): JSX.Element {
  return (
    <motion.div
      className="absolute inset-0 rounded-lg pointer-events-none z-10 border border-shu/50"
      animate={{ opacity: [0, 0.6, 0, 0.6, 0] }}
      transition={{ duration: 0.8, repeat: 3 }}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-shu/80 text-sumi-50 text-xs font-mono px-3 py-1 rounded-md flex items-center gap-2">
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
            y: [0, -3, 0],
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          });
          break;

        case 'ci_success':
          await controls.start({
            y: [0, -16, -2, -10, 0],
            scale: [1, 1.08, 1, 1.04, 1],
            transition: { duration: 0.8, times: [0, 0.2, 0.5, 0.7, 1] },
          });
          break;

        case 'ci_failure':
          await controls.start({
            x: [0, -6, 6, -4, 4, 0],
            transition: { duration: 0.5 },
          });
          break;

        case 'level_up':
          await controls.start({
            y: [0, -20, 0, -12, 0],
            scale: [1, 1.1, 1, 1.06, 1],
            transition: { duration: 1.2 },
          });
          break;

        case 'sleeping':
        case 'focus_lost':
          controls.start({
            y: [0, 3, 0],
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

  useEffect(() => {
    void triggerAnimation('idle');
  }, [triggerAnimation]);

  const isTyping = animationState === 'typing' || animationState === 'idle';
  const isAsleep =
    animationState === 'sleeping' || animationState === 'focus_lost';

  // Drifting ember particles instead of confetti
  const showEmbers = showConfetti;

  return (
    <div
      className="relative w-full h-full rounded-lg overflow-hidden"
      data-room-state={lighting}
      aria-label={`${gotchiName}'s room`}
      role="region"
    >
      <RoomBackground lighting={lighting} />

      {/* Drifting embers on success/level up */}
      {showEmbers && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 3,
                height: 3 + Math.random() * 3,
                left: `${10 + Math.random() * 80}%`,
                bottom: '-5%',
                backgroundColor: i % 2 === 0 ? '#d4a843' : '#b4a7d6',
                opacity: 0.5,
              }}
              animate={{
                y: [0, -(300 + Math.random() * 200)],
                x: [0, (Math.random() - 0.5) * 80],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 1.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* CI failure alarm */}
      <AnimatePresence>
        {lighting === 'ci_failure' && <CiFailureAlarm />}
      </AnimatePresence>

      {/* Gotchi character */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
        <motion.div
          animate={controls}
          className="w-full h-full relative"
          style={{ filter: 'var(--gotchi-filter)' }}
        >
          <GotchiModel3D animationState={animationState} mood={mood} modelUrl={modelUrl} theme={theme} />

          <AnimatePresence>
            {isAsleep && <SleepingZzz />}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Typing indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[0, 0.15, 0.3].map((delay) => (
              <motion.div
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-fuji/50"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.2, delay, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat HUD — text-based mood/energy */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-20">
        <div className="stat-pill">
          <span className="text-xs text-sumi-400">mood</span>
          <span className="font-mono text-fuji">{mood}</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20">
        <div className="stat-pill">
          <span className="text-xs text-sumi-400">energy</span>
          <span className="font-mono text-hanada">{energy}</span>
        </div>
      </div>

      {/* Name plate */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="px-4 py-1 rounded-md washi-card text-xs font-medium text-sumi-200 border-sumi-700">
          {gotchiName}
        </div>
      </div>

      {/* State label */}
      <AnimatePresence>
        {animationState !== 'idle' && (
          <motion.div
            className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium border ${
                animationState === 'ci_success' || animationState === 'level_up'
                  ? 'text-wakatake border-wakatake/30 bg-wakatake/10'
                  : animationState === 'ci_failure'
                  ? 'text-shu border-shu/30 bg-shu/10'
                  : animationState === 'sleeping' || animationState === 'focus_lost'
                  ? 'text-sumi-400 border-sumi-600 bg-sumi-800/50'
                  : 'text-fuji border-fuji/30 bg-fuji/10'
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
