import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  GotchiData,
  UserData,
  AnimationState,
  RoomLightingState,
  GuildMessagePayload,
  XpUpdatePayload,
  TimerTickPayload,
  ActivityLogEntry,
} from '@/types';

// ==============================================================
// State interface
// ==============================================================

interface GotchiState {
  // User & Gotchi data
  user: UserData | null;
  gotchi: GotchiData | null;

  // Gamification
  totalXP: number;
  level: number;
  commitCoins: number;
  currentStreak: number;

  // Visual state
  animationState: AnimationState;
  roomLighting: RoomLightingState;
  lastAiFeedback: string | null;
  morningMessage: string | null;
  showLevelUp: boolean;
  levelUpMessage: string | null;

  // Selected Avatar
  selectedModelUrl: string;

  // Pomodoro
  pomodoroActive: boolean;
  pomodoroRemaining: number;  // ms
  pomodoroTotal: number;      // ms
  pomodoroPercent: number;

  // Guild chat
  guildMessages: GuildMessagePayload[];

  // Activity feed
  activityFeed: ActivityLogEntry[];

  // Connection
  isSocketConnected: boolean;
  isLoading: boolean;
}

// ==============================================================
// Actions interface
// ==============================================================

interface GotchiActions {
  // Hydration
  setUser: (user: UserData) => void;
  setGotchi: (gotchi: GotchiData) => void;

  // Animation control
  setAnimationState: (state: AnimationState) => void;
  setRoomLighting: (lighting: RoomLightingState) => void;
  setSelectedModelUrl: (url: string) => void;

  // XP events
  applyXpUpdate: (payload: XpUpdatePayload) => void;
  triggerLevelUp: (level: number, message: string) => void;
  dismissLevelUp: () => void;

  // CI events
  handleCiSuccess: (payload: { xpGained?: number; message: string }) => void;
  handleCiFailure: () => void;
  clearCiState: () => void;

  // Focus / Sleep
  handleFocusLost: (energyDeducted: number) => void;
  handleForceSleep: (message: string) => void;

  // Pomodoro
  updatePomodoroTimer: (payload: TimerTickPayload) => void;
  setPomodoroActive: (active: boolean) => void;
  clearPomodoro: () => void;

  // Guild chat
  addGuildMessage: (msg: GuildMessagePayload) => void;
  clearGuildMessages: () => void;

  // Activity feed
  addActivityEntry: (entry: ActivityLogEntry) => void;
  setActivityFeed: (entries: ActivityLogEntry[]) => void;

  // Connection
  setSocketConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;

  // AI
  setMorningMessage: (msg: string) => void;
  clearMorningMessage: () => void;
}

type GotchiStore = GotchiState & GotchiActions;

// ==============================================================
// Store implementation
// ==============================================================

export const useGotchiStore = create<GotchiStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ---- Initial state ----
      user: null,
      gotchi: null,
      totalXP: 0,
      level: 1,
      commitCoins: 0,
      currentStreak: 0,
      animationState: 'idle',
      roomLighting: 'normal',
      lastAiFeedback: null,
      morningMessage: null,
      showLevelUp: false,
      levelUpMessage: null,
      selectedModelUrl: '/models/character.vrm',
      pomodoroActive: false,
      pomodoroRemaining: 0,
      pomodoroTotal: 25 * 60 * 1000,
      pomodoroPercent: 0,
      guildMessages: [],
      activityFeed: [],
      isSocketConnected: false,
      isLoading: true,

      // ---- Hydration ----
      setUser: (user) =>
        set({
          user,
          totalXP: user.totalXP,
          level: user.level,
          commitCoins: user.commitCoins,
          currentStreak: user.currentStreak,
        }),

      setGotchi: (gotchi) => set({ gotchi }),

      // ---- Animation ----
      setAnimationState: (state) => set({ animationState: state }),
      setRoomLighting: (lighting) => set({ roomLighting: lighting }),
      setSelectedModelUrl: (url) => set({ selectedModelUrl: url }),

      // ---- XP ----
      applyXpUpdate: (payload) => {
        set((prev) => ({
          totalXP: payload.newTotalXP,
          level: payload.newLevel,
          commitCoins: (prev.commitCoins ?? 0) + payload.coinsGained,
          lastAiFeedback: payload.aiFeedback,
          animationState: 'typing',
          user: prev.user
            ? { ...prev.user, totalXP: payload.newTotalXP, level: payload.newLevel }
            : prev.user,
        }));

        // Return to idle after 3s
        setTimeout(() => {
          if (get().animationState === 'typing') {
            set({ animationState: 'idle' });
          }
        }, 3000);
      },

      triggerLevelUp: (level, message) => {
        set({
          showLevelUp: true,
          levelUpMessage: message,
          level,
          animationState: 'level_up',
        });
      },

      dismissLevelUp: () =>
        set({ showLevelUp: false, levelUpMessage: null, animationState: 'idle' }),

      // ---- CI events ----
      handleCiSuccess: ({ xpGained, message: _msg }) => {
        set({
          animationState: 'ci_success',
          roomLighting: 'ci_success',
          totalXP: get().totalXP + (xpGained ?? 0),
        });

        // Auto-reset after 5s
        setTimeout(() => {
          set({ animationState: 'idle', roomLighting: 'normal' });
        }, 5000);
      },

      handleCiFailure: () => {
        set({
          animationState: 'ci_failure',
          roomLighting: 'ci_failure',
          gotchi: get().gotchi
            ? {
                ...get().gotchi!,
                energy: Math.max(0, get().gotchi!.energy - 10),
              }
            : get().gotchi,
        });

        // Auto-reset after 5s
        setTimeout(() => {
          set({ animationState: 'idle', roomLighting: 'normal' });
        }, 5000);
      },

      clearCiState: () =>
        set({ animationState: 'idle', roomLighting: 'normal' }),

      // ---- Focus ----
      handleFocusLost: (energyDeducted) => {
        set((prev) => ({
          animationState: 'focus_lost',
          roomLighting: 'focus_lost',
          gotchi: prev.gotchi
            ? { ...prev.gotchi, energy: Math.max(0, prev.gotchi.energy - energyDeducted) }
            : prev.gotchi,
        }));

        setTimeout(() => {
          set({ animationState: 'idle', roomLighting: 'normal' });
        }, 4000);
      },

      handleForceSleep: (_message) => {
        set({ animationState: 'sleeping', roomLighting: 'focus_lost' });
      },

      // ---- Pomodoro ----
      updatePomodoroTimer: ({ remaining, total, percent }) =>
        set({ pomodoroRemaining: remaining, pomodoroTotal: total, pomodoroPercent: percent }),

      setPomodoroActive: (active) => set({ pomodoroActive: active }),

      clearPomodoro: () =>
        set({
          pomodoroActive: false,
          pomodoroRemaining: 0,
          pomodoroPercent: 0,
        }),

      // ---- Guild chat ----
      addGuildMessage: (msg) =>
        set((prev) => ({
          guildMessages: [...prev.guildMessages.slice(-99), msg],
        })),

      clearGuildMessages: () => set({ guildMessages: [] }),

      // ---- Activity feed ----
      addActivityEntry: (entry) =>
        set((prev) => ({
          activityFeed: [entry, ...prev.activityFeed.slice(0, 19)],
        })),

      setActivityFeed: (entries) => set({ activityFeed: entries }),

      // ---- Connection ----
      setSocketConnected: (connected) => set({ isSocketConnected: connected }),
      setLoading: (loading) => set({ isLoading: loading }),

      // ---- AI ----
      setMorningMessage: (msg) => set({ morningMessage: msg }),
      clearMorningMessage: () => set({ morningMessage: null }),
    })),
    { name: 'CommitGotchiStore' },
  ),
);
