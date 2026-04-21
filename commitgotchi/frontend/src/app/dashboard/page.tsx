'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';
import { useSocket } from '@/hooks/useSocket';
import { apiFetch } from '@/lib/api';
import { GotchiRoom } from '@/components/GotchiRoom/GotchiRoom';
import { XPBar } from '@/components/XPBar/XPBar';
import { GuildChat } from '@/components/GuildChat/GuildChat';
import { PomodoroTimer } from '@/components/Pomodoro/PomodoroTimer';
import { LevelUpOverlay } from '@/components/LevelUpOverlay';
import { AiFeedbackToast } from '@/components/AiFeedbackToast';
import { InventoryModal, LeaderboardModal, GuildsModal, CharactersModal } from '@/components/Modals/DashboardModals';
import type { UserData, GotchiData } from '@/types';

// NOTE: metadata must be in a server component — this page is client-only
// so metadata is defined in a separate file (layout or metadata.ts)

interface ProfileResponse {
  user: UserData;
  gotchi: GotchiData;
}

export default function DashboardPage(): JSX.Element {
  const {
    user,
    gotchi,
    animationState,
    roomLighting,
    isSocketConnected,
    isLoading,
    selectedModelUrl,
    setUser,
    setGotchi,
    setLoading,
    setMorningMessage,
  } = useGotchiStore();

  // ── Modal state ──
  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGuilds, setShowGuilds] = useState(false);
  const [showCharactersModal, setShowCharactersModal] = useState(false);

  // Connect Socket.io
  const { isConnected } = useSocket(!!user);

  // Load user & gotchi data on mount
  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      try {
        const [userRes, gotchiRes] = await Promise.all([
          apiFetch<UserData>('/auth/me'),
          apiFetch<GotchiData>('/gotchi/me'),
        ]);

        setUser(userRes);
        setGotchi(gotchiRes);

        // Check for morning message in URL params (set by backend on first daily login)
        const params = new URLSearchParams(window.location.search);
        if (params.get('morning') === '1') {
          // The morning message is received via socket after connection
          params.delete('morning');
          const newUrl = `${window.location.pathname}`;
          window.history.replaceState({}, '', newUrl);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        // Redirect to login if unauthorized
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [setUser, setGotchi, setLoading, setMorningMessage]);

  // ---- Loading screen ----
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-500"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <motion.div
          className="text-8xl mb-6 relative z-10"
          animate={{
            y: [0, -12, 0],
            rotate: [0, -5, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐱
        </motion.div>

        <motion.div
          className="font-display text-2xl font-bold text-gradient-cyan mb-2 relative z-10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          CommitGotchi
        </motion.div>

        <motion.div
          className="text-slate-500 text-sm relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading your companion...
        </motion.div>

        <div className="flex gap-1.5 mt-6 relative z-10">
          {[0, 0.2, 0.4].map((d) => (
            <motion.div
              key={d}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.5, 0.8],
                y: [0, -10, 0],
              }}
              transition={{ duration: 0.8, delay: d, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Loading bar */}
        <motion.div
          className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    );
  }

  const showConfetti =
    animationState === 'ci_success' || animationState === 'level_up';

  return (
    <>
      {/* Overlays */}
      <LevelUpOverlay />
      <AiFeedbackToast />

      {/* ── Modals ── */}
      <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <GuildsModal isOpen={showGuilds} onClose={() => setShowGuilds(false)} />
      <CharactersModal isOpen={showCharactersModal} onClose={() => setShowCharactersModal(false)} />

      <div className="min-h-screen flex flex-col">
        {/* Animated background orbs */}
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
          <motion.div
            className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-pink-500/8 blur-[80px]"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.08, 0.12, 0.08],
              x: [-50, 50, -50],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
        </div>

        {/* ============ TOP BAR ============ */}
        <motion.header
          className="relative z-10 px-6 py-3"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🐱
              </motion.span>
              <span className="font-display font-bold text-sm text-gradient-cyan hidden sm:block">
                CommitGotchi
              </span>
            </motion.div>

            {/* XP Bar — takes most space */}
            <div className="flex-1">
              <XPBar />
            </div>

            {/* Connection indicator */}
            <motion.div
              className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border flex-shrink-0 ${
                isConnected
                  ? 'text-green-400 border-green-500/30 bg-green-500/10'
                  : 'text-red-400 border-red-500/30 bg-red-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              animate={isConnected ? { boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.3)', '0 0 0 rgba(34, 197, 94, 0)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
                animate={isConnected ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="hidden sm:block">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </motion.div>

            {/* Logout */}
            <motion.button
              id="logout-btn"
              onClick={async () => {
                await apiFetch('/auth/logout', { method: 'POST' });
                window.location.href = '/';
              }}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors flex-shrink-0"
              aria-label="Logout"
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Exit
            </motion.button>
          </div>
        </motion.header>

        {/* ============ MAIN CONTENT ============ */}
        <main className="relative z-10 flex-1 px-6 pb-6 max-w-screen-2xl mx-auto w-full">
          <div
            className="grid gap-4 h-full"
            style={{
              gridTemplateColumns: '1fr 420px 280px',
              gridTemplateRows: 'auto 1fr auto',
              gridTemplateAreas: `
                "center center sidebar"
                "center center sidebar"
                "controls controls sidebar"
              `,
            }}
          >
            {/* ============ CENTER: Gotchi Room ============ */}
            <motion.div
              className="rounded-2xl overflow-hidden relative"
              style={{ gridArea: 'center', minHeight: '460px' }}
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(99, 102, 241, 0.3)',
                    '0 0 50px rgba(139, 92, 246, 0.4)',
                    '0 0 30px rgba(99, 102, 241, 0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <GotchiRoom
                animationState={animationState}
                lighting={roomLighting}
                mood={gotchi?.mood ?? 75}
                energy={gotchi?.energy ?? 100}
                gotchiName={gotchi?.name ?? 'Gotchi'}
                modelUrl={selectedModelUrl}
                theme={gotchi?.theme ?? 'JS'}
                showConfetti={showConfetti}
              />
            </motion.div>

            {/* ============ RIGHT SIDEBAR ============ */}
            <motion.div
              className="flex flex-col gap-4"
              style={{ gridArea: 'sidebar' }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Guild chat — takes all remaining space */}
              <motion.div
                className="flex-1 min-h-0"
                style={{ minHeight: '300px' }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {user?.guildId ? (
                  <GuildChat
                    guildId={user.guildId}
                    guildName="My Guild"
                  />
                ) : (
                  <div className="glass-card h-full flex flex-col items-center justify-center gap-3 text-center p-6 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                      animate={{ opacity: [0.1, 0.2, 0.1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.span
                      className="text-3xl relative z-10"
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ⚔️
                    </motion.span>
                    <div className="text-sm font-semibold text-white relative z-10">
                      No Guild Yet
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed relative z-10">
                      Join a guild to unlock real-time chat and compete on the leaderboard.
                    </p>
                    <motion.button
                      id="find-guild-sidebar-btn"
                      className="btn-purple text-xs relative z-10"
                      onClick={() => setShowGuilds(true)}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Find a Guild
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* ============ BOTTOM CONTROLS ============ */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              style={{ gridArea: 'controls' }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Pomodoro Timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <PomodoroTimer />
              </motion.div>

              {/* GitHub Stats panel */}
              <motion.div
                className="glass-card p-5 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"
                  animate={{ opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <motion.span
                    className="text-xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    📊
                  </motion.span>
                  <span className="font-display font-semibold text-sm text-white">
                    GitHub Stats
                  </span>
                </div>

                <div className="space-y-3 relative z-10">
                  <motion.div
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-xs text-slate-500">Total Commits</span>
                    <motion.span
                      className="text-xs font-mono text-cyan-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {user ? Math.floor(user.totalXP / 10) : 0}
                    </motion.span>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-xs text-slate-500">Streak</span>
                    <span className="text-xs font-mono text-orange-400">
                      🔥 {user?.currentStreak ?? 0} days
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-xs text-slate-500">Gotchi Mood</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${gotchi?.mood ?? 0}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-purple-400">
                        {gotchi?.mood ?? 0}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-xs text-slate-500">Energy</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${gotchi?.energy ?? 0}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-cyan-400">
                        {gotchi?.energy ?? 0}
                      </span>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 relative z-10">
                  <motion.a
                    href={`https://github.com/${user?.username ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                    whileHover={{ x: 3 }}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    @{user?.username}
                  </motion.a>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="glass-card p-5 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
                  animate={{ opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />

                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <motion.span
                    className="text-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚡
                  </motion.span>
                  <span className="font-display font-semibold text-sm text-white">
                    Quick Actions
                  </span>
                </div>

                <div className="space-y-2 relative z-10">
                  <motion.button
                    id="open-inventory-btn"
                    className="btn-purple w-full text-xs py-2.5 flex items-center justify-center gap-2"
                    onClick={() => setShowInventory(true)}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    🎒 Open Inventory
                  </motion.button>

                  <motion.button
                    id="view-leaderboard-btn"
                    className="btn-neon w-full text-xs py-2.5 flex items-center justify-center gap-2"
                    onClick={() => setShowLeaderboard(true)}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    🏆 Leaderboard
                  </motion.button>

                  <motion.button
                    id="browse-characters-btn"
                    className="w-full text-xs py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                    onClick={() => setShowCharactersModal(true)}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    🎭 Персонажі
                  </motion.button>

                  <motion.button
                    id="browse-guilds-btn"
                    className="w-full text-xs py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                    onClick={() => setShowGuilds(true)}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                  >
                    ⚔️ Browse Guilds
                  </motion.button>

                  {/* Connection status debug */}
                  <motion.div
                    className="text-center pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <motion.span
                      className={`text-xs font-mono ${isSocketConnected ? 'text-green-500' : 'text-red-500'}`}
                      animate={isSocketConnected ? { opacity: [0.5, 1, 0.5] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isSocketConnected ? '● Socket live' : '○ Socket offline'}
                    </motion.span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
