'use client';

import { motion } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';

function calculateXpForNextLevel(level: number): number {
  // Inverse of: level = floor(0.1 * sqrt(totalXP)) + 1
  // totalXP = ((level - 1) / 0.1)^2
  return Math.pow((level - 1) / 0.1, 2);
}

function calculateXpForCurrentLevel(level: number): number {
  return Math.pow((level - 2) / 0.1, 2);
}

export function XPBar(): JSX.Element {
  const { totalXP, level, commitCoins, currentStreak, user } = useGotchiStore();

  const nextLevelXP = calculateXpForNextLevel(level + 1);
  const currentLevelXP = calculateXpForCurrentLevel(level + 1);
  const progress = Math.min(
    100,
    ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100,
  );

  const xpToNext = Math.max(0, nextLevelXP - totalXP);

  return (
    <div className="glass-card px-6 py-4 flex items-center gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.username} avatar`}
            className="w-10 h-10 rounded-full border-2 border-cyan-500/50"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      {/* Level badge */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm glow-purple"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
          }}
        >
          {level}
        </div>
        <span className="text-xs text-slate-500 mt-0.5">LVL</span>
      </div>

      {/* XP Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gradient-cyan">
            {totalXP.toLocaleString()} XP
          </span>
          <span className="text-xs text-slate-500">
            {Math.round(xpToNext).toLocaleString()} to Level {level + 1}
          </span>
        </div>

        <div className="xp-track">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
              boxShadow: '0 0 8px rgba(34,211,238,0.5)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="text-xs text-slate-600 mt-1">
          {Math.round(progress)}% to next level
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Coins */}
        <div className="stat-pill glow-amber bg-amber-500/10 border-amber-500/30">
          <span>🪙</span>
          <span className="text-amber-300 font-mono">{commitCoins.toLocaleString()}</span>
        </div>

        {/* Streak */}
        <div className="stat-pill bg-orange-500/10 border-orange-500/30">
          <span>🔥</span>
          <span className="text-orange-300 font-mono">{currentStreak}d</span>
        </div>
      </div>
    </div>
  );
}
