// ====================================================
// Shared domain types for CommitGotchi frontend
// ====================================================

export type GotchiTheme = 'JS' | 'Python' | 'Rust' | 'Go' | 'TypeScript' | 'Java' | 'C++' | 'C#' | 'Ruby' | 'PHP' | 'Swift' | 'Kotlin';

export type AnimationState =
  | 'idle'
  | 'typing'
  | 'ci_success'
  | 'ci_failure'
  | 'focus_lost'
  | 'sleeping'
  | 'celebrating'
  | 'level_up';

export type RoomLightingState = 'normal' | 'ci_success' | 'ci_failure' | 'focus_lost';

export interface GotchiData {
  id: string;
  userId: string;
  name: string;
  theme: GotchiTheme;
  mood: number;       // 0-100
  energy: number;     // 0-100
  outfitId: string | null;
  level: number;
}

export interface UserData {
  id: string;
  githubId: string;
  email: string | null;
  username: string;
  avatarUrl: string | null;
  totalXP: number;
  level: number;
  commitCoins: number;
  currentStreak: number;
  lastCommitDate: string | null;
  guildId: string | null;
  gotchi?: GotchiData;
}

export interface GuildData {
  id: string;
  name: string;
  description: string | null;
  totalXP: number;
  mascotLevel: number;
  iconUrl: string | null;
  members?: GuildMember[];
  _count?: { members: number };
}

export interface GuildMember {
  id: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  totalXP: number;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  actionType: string;
  xpGained: number;
  coinsGained: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ---- Socket event payloads ----

export interface XpUpdatePayload {
  xpGained: number;
  coinsGained: number;
  newTotalXP: number;
  newLevel: number;
  didLevelUp: boolean;
  aiFeedback: string;
  commitCount: number;
  repo: string;
}

export interface CiEventPayload {
  workflowName: string;
  repo: string;
  xpGained?: number;
  message: string;
}

export interface ForceSleepPayload {
  message: string;
  reason: 'night_hours' | 'streak_overload';
}

export interface LevelUpPayload {
  newLevel: number;
  message: string;
}

export interface TimerTickPayload {
  remaining: number;  // ms
  total: number;      // ms
  percent: number;    // 0-100
}

export interface PomodoroCompletePayload {
  xpGained: number;
  coinsGained: number;
  message: string;
}

export interface GuildMessagePayload {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface FocusLostAckPayload {
  energyDeducted: number;
  message: string;
}

export interface ThemeChangedPayload {
  newTheme: GotchiTheme;
  language: string;
  message: string;
}
