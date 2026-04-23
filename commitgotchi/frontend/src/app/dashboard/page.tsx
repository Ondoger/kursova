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

  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGuilds, setShowGuilds] = useState(false);
  const [showCharactersModal, setShowCharactersModal] = useState(false);

  const { isConnected } = useSocket(!!user);

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      try {
        const [userRes, gotchiRes] = await Promise.all([
          apiFetch<UserData>('/auth/me'),
          apiFetch<GotchiData>('/gotchi/me'),
        ]);

        setUser(userRes);
        setGotchi(gotchiRes);

        const params = new URLSearchParams(window.location.search);
        if (params.get('morning') === '1') {
          params.delete('morning');
          const newUrl = `${window.location.pathname}`;
          window.history.replaceState({}, '', newUrl);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
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
        {/* Enso circle */}
        <motion.div
          className="relative z-10 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="animate-breathe">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#b4a7d6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="180 40"
              opacity="0.7"
            />
          </svg>
        </motion.div>

        <motion.div
          className="font-display text-xl font-semibold text-gradient-ink mb-2 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          CommitGotchi
        </motion.div>

        <motion.div
          className="text-sumi-500 text-sm relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Preparing your space...
        </motion.div>

        {/* Single progress line */}
        <motion.div
          className="w-48 h-0.5 bg-sumi-800 rounded-full overflow-hidden mt-6 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #b4a7d6, #68a4c4)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    );
  }

  const showConfetti =
    animationState === 'ci_success' || animationState === 'level_up';

  return (
    <>
      <LevelUpOverlay />
      <AiFeedbackToast />

      <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <GuildsModal isOpen={showGuilds} onClose={() => setShowGuilds(false)} />
      <CharactersModal isOpen={showCharactersModal} onClose={() => setShowCharactersModal(false)} />

      <div className="min-h-screen flex flex-col">
        {/* Ambient background — single warm orb */}
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
          <div
            className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] animate-breathe"
            style={{ backgroundColor: 'rgba(212, 168, 67, 0.04)' }}
          />
        </div>

        {/* ============ TOP BAR ============ */}
        <motion.header
          className="relative z-10 px-6 py-3"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-display font-semibold text-sm text-gradient-ink hidden sm:block">
                CommitGotchi
              </span>
            </div>

            {/* XP Bar */}
            <div className="flex-1">
              <XPBar />
            </div>

            {/* Connection indicator */}
            <div
              className={`flex items-center gap-1.5 text-xs rounded-md px-3 py-1.5 border flex-shrink-0 ${
                isConnected
                  ? 'text-wakatake border-wakatake/20 bg-wakatake/5'
                  : 'text-shu border-shu/20 bg-shu/5'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-wakatake' : 'bg-shu'
                }`}
              />
              <span className="hidden sm:block">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={async () => {
                await apiFetch('/auth/logout', { method: 'POST' });
                window.location.href = '/';
              }}
              className="text-sumi-500 hover:text-sumi-300 text-sm transition-colors flex-shrink-0"
              aria-label="Logout"
            >
              Exit
            </button>
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
              className="rounded-lg overflow-hidden relative"
              style={{ gridArea: 'center', minHeight: '460px' }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Static subtle shadow instead of neon pulse */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{ boxShadow: '0 4px 24px rgba(22, 22, 26, 0.3)' }}
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
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            >
              <motion.div
                className="flex-1 min-h-0"
                style={{ minHeight: '300px' }}
              >
                {user?.guildId ? (
                  <GuildChat
                    guildId={user.guildId}
                    guildName="My Guild"
                  />
                ) : (
                  <div className="washi-card h-full flex flex-col items-center justify-center gap-3 text-center p-6">
                    <span className="text-2xl text-fuji/40 font-serif select-none">
                      結
                    </span>
                    <div className="text-sm font-medium text-sumi-100">
                      No Guild Yet
                    </div>
                    <p className="text-xs text-sumi-500 leading-relaxed">
                      Join a guild to unlock real-time chat and compete on the leaderboard.
                    </p>
                    <button
                      id="find-guild-sidebar-btn"
                      className="btn-shu text-xs"
                      onClick={() => setShowGuilds(true)}
                    >
                      Find a Guild
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* ============ BOTTOM CONTROLS ============ */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              style={{ gridArea: 'controls' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            >
              {/* Pomodoro Timer */}
              <div>
                <PomodoroTimer />
              </div>

              {/* GitHub Stats panel */}
              <div className="washi-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display font-medium text-sm text-sumi-100">
                    Stats
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sumi-500">Total Commits</span>
                    <span className="text-xs font-mono text-fuji">
                      {user ? Math.floor(user.totalXP / 10) : 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sumi-500">Streak</span>
                    <span className="text-xs font-mono text-yamabuki">
                      {user?.currentStreak ?? 0} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sumi-500">Mood</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-sumi-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-fuji"
                          initial={{ width: 0 }}
                          animate={{ width: `${gotchi?.mood ?? 0}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-fuji">
                        {gotchi?.mood ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sumi-500">Energy</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-sumi-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-hanada"
                          initial={{ width: 0 }}
                          animate={{ width: `${gotchi?.energy ?? 0}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-hanada">
                        {gotchi?.energy ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sumi-800">
                  <a
                    href={`https://github.com/${user?.username ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sumi-500 hover:text-fuji transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    @{user?.username}
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="washi-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display font-medium text-sm text-sumi-100">
                    Actions
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    id="open-inventory-btn"
                    className="btn-shu w-full text-xs py-2.5 flex items-center justify-center gap-2"
                    onClick={() => setShowInventory(true)}
                  >
                    Inventory
                  </button>

                  <button
                    id="view-leaderboard-btn"
                    className="btn-ink w-full text-xs py-2.5 flex items-center justify-center gap-2"
                    onClick={() => setShowLeaderboard(true)}
                  >
                    Leaderboard
                  </button>

                  <button
                    id="browse-characters-btn"
                    className="w-full text-xs py-2.5 rounded-md border border-sumi-700 bg-sumi-800/50 text-sumi-300 hover:text-sumi-100 hover:bg-sumi-800 transition-all flex items-center justify-center gap-2"
                    onClick={() => setShowCharactersModal(true)}
                  >
                    Characters
                  </button>

                  <button
                    id="browse-guilds-btn"
                    className="w-full text-xs py-2.5 rounded-md border border-sumi-700 text-sumi-400 hover:text-sumi-200 hover:border-sumi-600 transition-all flex items-center justify-center gap-2"
                    onClick={() => setShowGuilds(true)}
                  >
                    Browse Guilds
                  </button>

                  <div className="text-center pt-2">
                    <span
                      className={`text-xs font-mono ${isSocketConnected ? 'text-wakatake' : 'text-shu'}`}
                    >
                      {isSocketConnected ? 'Socket live' : 'Socket offline'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
