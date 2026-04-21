'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────
function ModalShell({
  isOpen, onClose, title, icon, children,
}: ModalProps & { title: string; icon: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(15,10,46,0.98) 0%, rgba(30,27,75,0.98) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 60px rgba(139,92,246,0.2), 0 20px 60px rgba(0,0,0,0.6)',
            }}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <h2 className="font-display font-bold text-lg text-white">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all flex items-center justify-center text-sm"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Neon top line */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />

            {/* Content */}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Inventory Modal ──────────────────────────────────────────────────────────
const INVENTORY_ITEMS = [
  { id: 'commit-streak', icon: '🔥', name: 'Commit Streak', desc: 'Current streak badge', rarity: 'rare', count: 1 },
  { id: 'xp-boost', icon: '⚡', name: 'XP Boost ×2', desc: 'Double XP for 1 hour', rarity: 'epic', count: 2 },
  { id: 'focus-potion', icon: '🍵', name: 'Focus Potion', desc: 'Restores 30 energy', rarity: 'common', count: 3 },
  { id: 'pr-badge', icon: '🔗', name: 'PR Master', desc: 'Merged 5 pull requests', rarity: 'rare', count: 1 },
  { id: 'night-owl', icon: '🦉', name: 'Night Owl', desc: 'Coded past midnight', rarity: 'uncommon', count: 1 },
  { id: 'star-badge', icon: '⭐', name: 'Rising Star', desc: 'Top contributor this week', rarity: 'legendary', count: 1 },
];

const RARITY_COLORS: Record<string, string> = {
  common: 'border-slate-600 bg-slate-800/40 text-slate-400',
  uncommon: 'border-green-500/40 bg-green-900/20 text-green-400',
  rare: 'border-blue-500/40 bg-blue-900/20 text-blue-400',
  epic: 'border-purple-500/40 bg-purple-900/20 text-purple-400',
  legendary: 'border-amber-500/50 bg-amber-900/20 text-amber-400',
};

export function InventoryModal({ isOpen, onClose }: ModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Inventory" icon="🎒">
      <div className="grid grid-cols-2 gap-3">
        {INVENTORY_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            id={`inventory-item-${item.id}`}
            className={`rounded-xl p-3 border flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform ${RARITY_COLORS[item.rarity]}`}
            whileHover={{ y: -2 }}
          >
            <span className="text-3xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{item.name}</div>
              <div className="text-xs opacity-70 truncate">{item.desc}</div>
              <div className="text-xs font-mono mt-1 capitalize opacity-80">{item.rarity}</div>
            </div>
            {item.count > 1 && (
              <div className="text-xs font-mono bg-white/10 rounded-full px-1.5 py-0.5 flex-shrink-0">
                ×{item.count}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-600 mt-4 font-mono">
        Complete challenges to unlock more items
      </p>
    </ModalShell>
  );
}

// ─── Leaderboard Modal ────────────────────────────────────────────────────────
const LEADERBOARD_DATA = [
  { rank: 1, username: 'torvalds_vi', xp: 48200, streak: 142, avatar: '👑' },
  { rank: 2, username: 'rustacean_pro', xp: 41500, streak: 98, avatar: '🔥' },
  { rank: 3, username: 'typescript_god', xp: 38900, streak: 77, avatar: '⚡' },
  { rank: 4, username: 'gitmaster_x', xp: 34100, streak: 64, avatar: '🌟' },
  { rank: 5, username: 'you', xp: 5, streak: 0, avatar: '🐱', isYou: true },
];

const RANK_STYLES: Record<number, string> = {
  1: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
  2: 'text-slate-300 border-slate-500/40 bg-slate-500/10',
  3: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
};

export function LeaderboardModal({ isOpen, onClose }: ModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Leaderboard" icon="🏆">
      <div className="space-y-2">
        {LEADERBOARD_DATA.map((entry, i) => (
          <motion.div
            key={entry.rank}
            id={`leaderboard-rank-${entry.rank}`}
            className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
              (entry as any).isYou
                ? 'border-cyan-500/40 bg-cyan-500/8 ring-1 ring-cyan-500/20'
                : RANK_STYLES[entry.rank] ?? 'border-white/8 bg-white/3'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            {/* Rank badge */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              entry.rank <= 3 ? RANK_STYLES[entry.rank] : 'bg-white/5 text-slate-500'
            } border`}>
              {entry.rank <= 3 ? entry.avatar : `#${entry.rank}`}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate ${(entry as any).isYou ? 'text-cyan-400' : 'text-white'}`}>
                {(entry as any).isYou ? '🐱 You' : entry.username}
              </div>
              <div className="text-xs text-slate-500 font-mono">🔥 {entry.streak} day streak</div>
            </div>

            {/* XP */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-mono text-purple-400 font-semibold">{entry.xp.toLocaleString()} XP</div>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-600 mt-4 font-mono">
        Make commits to climb the ranks!
      </p>
    </ModalShell>
  );
}

// ─── Browse Guilds Modal ──────────────────────────────────────────────────────
const GUILDS = [
  { id: 'rust-wizards', icon: '🦀', name: 'Rust Wizards', members: 24, desc: 'Systems programming masters', tag: 'systems' },
  { id: 'tsgang', icon: '📘', name: 'TypeScript Gang', members: 41, desc: 'Type-safe everything', tag: 'web' },
  { id: 'night-coders', icon: '🌙', name: 'Night Coders', members: 18, desc: 'We code when everyone sleeps', tag: 'lifestyle' },
  { id: 'oss-heroes', icon: '🌍', name: 'OSS Heroes', members: 55, desc: 'Open source contributors', tag: 'community' },
  { id: 'leetcode-purgatory', icon: '💀', name: 'LeetCode Purgatory', members: 32, desc: 'Grind daily, cry nightly', tag: 'algo' },
];

export function GuildsModal({ isOpen, onClose }: ModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Browse Guilds" icon="⚔️">
      <div className="space-y-3">
        {GUILDS.map((guild, i) => (
          <motion.div
            key={guild.id}
            id={`guild-item-${guild.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ x: 4 }}
          >
            <span className="text-3xl flex-shrink-0">{guild.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{guild.name}</span>
                <span className="text-xs text-slate-500 font-mono border border-white/10 rounded px-1">
                  {guild.tag}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{guild.desc}</div>
              <div className="text-xs text-slate-600 font-mono mt-1">👥 {guild.members} members</div>
            </div>
            <button
              className="btn-purple text-xs py-1.5 px-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); alert(`Joined ${guild.name}!`); }}
            >
              Join
            </button>
          </motion.div>
        ))}
      </div>
    </ModalShell>
  );
}

// ─── Characters Modal ─────────────────────────────────────────────────────────
const CHARACTERS = [
  { id: '/models/character.vrm', name: 'Start Initial Model', icon: '🎭' },
  { id: '/models/3560984828333798191.vrm', name: 'Model 2', icon: '✨' },
  { id: '/models/5090520819620548566.vrm', name: 'Model 3', icon: '🌸' },
  { id: '/models/5176996000770800635.vrm', name: 'Model 4', icon: '💎' },
];

export function CharactersModal({ isOpen, onClose }: ModalProps) {
  const { selectedModelUrl, setSelectedModelUrl } = useGotchiStore();

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Characters" icon="🎭">
      <div className="space-y-3">
        {CHARACTERS.map((char, i) => {
          const isSelected = selectedModelUrl === char.id;
          return (
            <motion.div
              key={char.id}
              id={`character-item-${i}`}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                isSelected
                  ? 'border-cyan-500/40 bg-cyan-500/10 ring-1 ring-cyan-500/20'
                  : 'border-white/8 bg-white/3 hover:border-purple-500/30 hover:bg-purple-500/5'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ x: 4 }}
              onClick={() => {
                setSelectedModelUrl(char.id);
                // Optionally close after picking:
                // onClose();
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl flex-shrink-0">{char.icon}</span>
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                    {char.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">
                    {char.id.replace('/models/', '')}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {isSelected ? (
                  <span className="text-xs font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-500/20 px-2 py-1 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-500/30 px-2 py-1 rounded">
                    Select
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </ModalShell>
  );
}
