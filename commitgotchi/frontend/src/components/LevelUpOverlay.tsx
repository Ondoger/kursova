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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismissLevelUp}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 glass-card p-10 text-center max-w-sm w-full mx-4 glow-amber"
            initial={{ scale: 0.5, rotate: -5 }}
            animate={{
              scale: 1,
              rotate: 0,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Stars */}
            {['★', '✦', '★', '✦', '★'].map((star, i) => (
              <motion.span
                key={i}
                className="absolute text-amber-400 text-xl"
                style={{
                  top: `${10 + i * 8}%`,
                  left: `${5 + i * 22}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              >
                {star}
              </motion.span>
            ))}

            <motion.div
              className="text-7xl mb-4"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              🎊
            </motion.div>

            <h2 className="font-display text-4xl font-bold text-gradient-amber mb-2">
              Level Up!
            </h2>

            <div className="text-6xl font-display font-black text-white mb-4">
              {level}
            </div>

            <p className="text-slate-300 text-sm mb-6">
              {levelUpMessage ?? 'You leveled up! Your Gotchi is overjoyed!'}
            </p>

            <button
              id="levelup-dismiss-btn"
              onClick={dismissLevelUp}
              className="btn-neon w-full text-base py-3"
            >
              Awesome! 🐱
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
