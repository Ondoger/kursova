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
            initial={{ opacity: 0, x: -20, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="washi-card p-4 border-fuji/20">
              <div className="flex items-start gap-3">
                <div>
                  <div className="text-xs text-fuji font-medium mb-1 font-display">
                    Companion says...
                  </div>
                  <p className="text-sm text-sumi-200 leading-relaxed">
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
              className="absolute inset-0 bg-sumi-950/60 backdrop-blur-sm"
              onClick={clearMorningMessage}
            />
            <motion.div
              className="relative z-10 washi-card p-8 max-w-md w-full mx-4"
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="font-display font-semibold text-sumi-100">
                    Good Morning
                  </h3>
                  <div className="text-xs text-sumi-500">
                    Morning message from your companion
                  </div>
                </div>
              </div>

              <p className="text-sumi-300 text-sm leading-relaxed mb-6">
                {morningMessage}
              </p>

              <button
                id="morning-dismiss-btn"
                onClick={clearMorningMessage}
                className="btn-ink w-full"
              >
                Begin
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
