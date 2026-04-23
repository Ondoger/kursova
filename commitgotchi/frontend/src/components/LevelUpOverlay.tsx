'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';

export function LevelUpOverlay(): JSX.Element | null {
  const { showLevelUp, levelUpMessage, level, dismissLevelUp } = useGotchiStore();

  return (
    <AnimatePresence>
      {showLevelUp && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-sumi-950/70 backdrop-blur-sm"
            onClick={dismissLevelUp}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 washi-card p-10 text-center max-w-sm w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { duration: 0.4, ease: 'easeOut' },
            }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Kanji symbol */}
            <div className="text-5xl mb-4 text-fuji/40 font-serif select-none">
              昇
            </div>

            <h2 className="font-display text-3xl font-semibold text-gradient-warm mb-2">
              Level Up
            </h2>

            <div className="text-5xl font-display font-bold text-sumi-100 mb-4">
              {level}
            </div>

            <p className="text-sumi-300 text-sm mb-6">
              {levelUpMessage ?? 'You leveled up. Your companion is pleased.'}
            </p>

            <button
              id="levelup-dismiss-btn"
              onClick={dismissLevelUp}
              className="btn-ink w-full text-base py-3"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
