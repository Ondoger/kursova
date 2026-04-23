'use client';

import { motion } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';

function calculateXpForNextLevel(level: number): number {
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
    <div className="washi-card px-6 py-4 flex items-center gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.username} avatar`}
            className="w-10 h-10 rounded-full border-2 border-fuji/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-sumi-700 flex items-center justify-center text-sumi-200 font-medium">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      {/* Level badge */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm text-sumi-900"
          style={{
            background: '#b4a7d6',
          }}
        >
          {level}
        </div>
        <span className="text-xs text-sumi-500 mt-0.5">LVL</span>
      </div>

      {/* XP Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gradient-ink">
            {totalXP.toLocaleString()} XP
          </span>
          <span className="text-xs text-sumi-500">
            {Math.round(xpToNext).toLocaleString()} to Level {level + 1}
          </span>
        </div>

        <div className="xp-track">
          <motion.div
            className="h-full rounded-full bg-fuji"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="text-xs text-sumi-600 mt-1">
          {Math.round(progress)}% to next level
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="stat-pill">
          <span className="text-yamabuki font-mono">{commitCoins.toLocaleString()}</span>
          <span className="text-sumi-500 text-xs">coins</span>
        </div>

        <div className="stat-pill">
          <span className="text-yamabuki font-mono">{currentStreak}d</span>
          <span className="text-sumi-500 text-xs">streak</span>
        </div>
      </div>
    </div>
  );
}
