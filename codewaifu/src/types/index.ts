export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string | null;
  company: string | null;
  blog: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  fork: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    commits?: Array<{
      sha: string;
      message: string;
      author: { email: string; name: string };
    }>;
    action?: string;
    ref?: string;
    ref_type?: string;
    pull_request?: { merged: boolean };
  };
  created_at: string;
}

export interface GitHubStats {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  totalCommits: number;
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  publicRepos: number;
  followers: number;
  following: number;
  currentStreak: number;
  longestStreak: number;
  languages: Record<string, number>;
  languagesCount: number;
  commitsByDay: Record<string, number>;
  commitsByHour: number[];
  commitsByMonth: Record<string, number>;
  prsOpened: number;
  prsMerged: number;
  issuesOpened: number;
  nightOwlCommits: number;
  earlyBirdCommits: number;
  fetchedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  check: (stats: GitHubStats) => boolean;
  progress?: (stats: GitHubStats) => { current: number; goal: number };
}

export interface CharacterTier {
  min: number;
  max: number;
  name: string;
  color: string;
  accent: string;
  hasAura: boolean;
  hasWings: boolean;
  hasParticles: boolean;
  description: string;
}

export type CharacterAnimation =
  | 'idle'
  | 'climbing'
  | 'joyfulJump'
  | 'jumpingDown'
  | 'kneelingPointing'
  | 'rumbaDancing'
  | 'sittingLaughing'
  | 'standingClap';

export type CharacterMood =
  | 'idle'
  | 'victory'
  | 'levelup'
  | 'sad'
  | 'working'
  | 'climbing'
  | 'jumpingDown'
  | 'rumbaDancing'
  | 'sittingLaughing';
