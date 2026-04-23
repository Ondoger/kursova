'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';
import { getSocket } from '@/lib/socket';

const POMODORO_DURATIONS = [
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTimer(): JSX.Element {
  const {
    pomodoroActive,
    pomodoroRemaining,
    pomodoroPercent,
    setPomodoroActive,
    clearPomodoro,
    handleFocusLost: handleFocusLostStore,
  } = useGotchiStore();

  const [selectedDuration, setSelectedDuration] = useState(25);
  const tabHiddenAtRef = useRef<number | null>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!pomodoroActive) return;

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        tabHiddenAtRef.current = Date.now();
      } else if (tabHiddenAtRef.current !== null) {
        const tabHiddenMs = Date.now() - tabHiddenAtRef.current;
        tabHiddenAtRef.current = null;

        if (tabHiddenMs > 2000) {
          socket.emit('focus_lost', { tabHiddenMs });
          handleFocusLostStore(Math.min(15, Math.floor(tabHiddenMs / 60000) + 5));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pomodoroActive, socket, handleFocusLostStore]);

  const handleStart = useCallback(() => {
    socket.emit('start_pomodoro', { duration: selectedDuration });
    setPomodoroActive(true);
  }, [selectedDuration, socket, setPomodoroActive]);

  const handleStop = useCallback(() => {
    socket.emit('stop_pomodoro');
    clearPomodoro();
  }, [socket, clearPomodoro]);

  const strokeDashoffset = CIRCUMFERENCE - (pomodoroPercent / 100) * CIRCUMFERENCE;

  return (
    <div className="washi-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-medium text-sm text-sumi-100">
            Focus Timer
          </span>
        </div>

        <AnimatePresence>
          {pomodoroActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-wakatake font-mono"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-wakatake animate-breathe" />
              ACTIVE
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enso timer circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="rgba(180, 167, 214, 0.08)"
              strokeWidth="4"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="#b4a7d6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-medium text-sumi-100">
              {pomodoroActive
                ? formatTime(pomodoroRemaining)
                : `${String(selectedDuration).padStart(2, '0')}:00`}
            </span>
            <span className="text-xs text-sumi-500 mt-0.5">
              {pomodoroActive ? 'remaining' : 'focus'}
            </span>
          </div>
        </div>

        {/* Duration selector */}
        {!pomodoroActive && (
          <div className="flex gap-2">
            {POMODORO_DURATIONS.map(({ label, value }) => (
              <button
                key={value}
                id={`pomodoro-${value}min`}
                onClick={() => setSelectedDuration(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedDuration === value
                    ? 'bg-fuji/15 border border-fuji/30 text-fuji'
                    : 'bg-sumi-800/50 border border-sumi-700 text-sumi-500 hover:text-sumi-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!pomodoroActive ? (
          <button
            id="pomodoro-start-btn"
            onClick={handleStart}
            className="btn-ink flex-1 text-sm py-2.5"
          >
            Start Focus
          </button>
        ) : (
          <button
            id="pomodoro-stop-btn"
            onClick={handleStop}
            className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium border border-shu/30 text-shu bg-shu/10 hover:bg-shu/20 transition-all"
          >
            Stop
          </button>
        )}
      </div>

      {/* Focus tip */}
      <p className="text-xs text-sumi-600 text-center leading-relaxed">
        {pomodoroActive
          ? 'Stay on this tab. Your companion is watching.'
          : 'Switching tabs during focus drains energy.'}
      </p>
    </div>
  );
}
