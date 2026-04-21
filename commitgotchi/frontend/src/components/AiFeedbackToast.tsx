'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';

export function AiFeedbackToast(): JSX.Element | null {
  const { lastAiFeedback, morningMessage, clearMorningMessage } = useGotchiStore();

  return (
    <>
      {/* AI feedback after commit */}
      <AnimatePresence>
        {lastAiFeedback && (
          <motion.div
            className="fixed bottom-6 left-6 z-40 max-w-sm"
            initial={{ opacity: 0, x: -30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="glass-card p-4 border-cyan-500/30 glow-cyan">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🐱</span>
                <div>
                  <div className="text-xs text-cyan-400 font-semibold mb-1">
                    Gotchi says...
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {lastAiFeedback}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morning standup modal */}
      <AnimatePresence>
        {morningMessage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={clearMorningMessage}
            />
            <motion.div
              className="relative z-10 glass-card p-8 max-w-md w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌅</span>
                <div>
                  <h3 className="font-display font-bold text-white">
                    Good Morning!
                  </h3>
                  <div className="text-xs text-slate-500">
                    Morning Stand-up from Gotchi
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {morningMessage}
              </p>

              <button
                id="morning-dismiss-btn"
                onClick={clearMorningMessage}
                className="btn-neon w-full"
              >
                Let&apos;s build! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
