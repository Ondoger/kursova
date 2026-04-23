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
  isOpen, onClose, title, children,
}: ModalProps & { title: string; children: React.ReactNode }) {
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
            className="absolute inset-0 bg-sumi-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-lg overflow-hidden"
            style={{
              background: 'rgba(30, 27, 23, 0.98)',
              border: '1px solid rgba(180, 167, 214, 0.12)',
              boxShadow: '0 8px 32px rgba(22, 22, 26, 0.5)',
            }}
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sumi-800">
              <h2 className="font-display font-semibold text-lg text-sumi-100">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md bg-sumi-800/50 hover:bg-sumi-700 text-sumi-400 hover:text-sumi-100 transition-all flex items-center justify-center text-sm"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

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
  { id: 'commit-streak', name: 'Commit Streak', desc: 'Current streak badge', rarity: 'rare', count: 1 },
  { id: 'xp-boost', name: 'XP Boost x2', desc: 'Double XP for 1 hour', rarity: 'epic', count: 2 },
  { id: 'focus-potion', name: 'Focus Potion', desc: 'Restores 30 energy', rarity: 'common', count: 3 },
  { id: 'pr-badge', name: 'PR Master', desc: 'Merged 5 pull requests', rarity: 'rare', count: 1 },
  { id: 'night-owl', name: 'Night Owl', desc: 'Coded past midnight', rarity: 'uncommon', count: 1 },
  { id: 'star-badge', name: 'Rising Star', desc: 'Top contributor this week', rarity: 'legendary', count: 1 },
];

const RARITY_COLORS: Record<string, string> = {
  common: 'border-sumi-600 bg-sumi-800/40 text-sumi-400',
  uncommon: 'border-wakatake/30 bg-wakatake/5 text-wakatake',
  rare: 'border-hanada/30 bg-hanada/5 text-hanada',
  epic: 'border-fuji/30 bg-fuji/5 text-fuji',
  legendary: 'border-yamabuki/30 bg-yamabuki/5 text-yamabuki',
};

export function InventoryModal({ isOpen, onClose }: ModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Inventory">
      <div className="grid grid-cols-2 gap-3">
        {INVENTORY_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            id={`inventory-item-${item.id}`}
            className={`rounded-lg p-3 border flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform ${RARITY_COLORS[item.rarity]}`}
            whileHover={{ y: -1 }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sumi-100 truncate">{item.name}</div>
              <div className="text-xs opacity-70 truncate">{item.desc}</div>
              <div className="text-xs font-mono mt-1 capitalize opacity-60">{item.rarity}</div>
            </div>
            {item.count > 1 && (
              <div className="text-xs font-mono bg-sumi-800 rounded-md px-1.5 py-0.5 flex-shrink-0">
                x{item.count}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-sumi-600 mt-4 font-mono">
        Complete challenges to unlock more items
      </p>
    </ModalShell>
  );
}

// ─── Leaderboard Modal ────────────────────────────────────────────────────────
const LEADERBOARD_DATA = [
  { rank: 1, username: 'torvalds_vi', xp: 48200, streak: 142, isYou: false },
  { rank: 2, username: 'rustacean_pro', xp: 41500, streak: 98, isYou: false },
  { rank: 3, username: 'typescript_god', xp: 38900, streak: 77, isYou: false },
  { rank: 4, username: 'gitmaster_x', xp: 34100, streak: 64, isYou: false },
  { rank: 5, username: 'you', xp: 5, streak: 0, isYou: true },
];

const RANK_STYLES: Record<number, string> = {
  1: 'text-yamabuki border-yamabuki/30 bg-yamabuki/5',
  2: 'text-sumi-300 border-sumi-600 bg-sumi-800/30',
  3: 'text-shu border-shu/30 bg-shu/5',
};

export function LeaderboardModal({ isOpen, onClose }: ModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Leaderboard">
      <div className="space-y-2">
        {LEADERBOARD_DATA.map((entry, i) => (
          <motion.div
            key={entry.rank}
            id={`leaderboard-rank-${entry.rank}`}
            className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
              entry.isYou
                ? 'border-fuji/30 bg-fuji/5 ring-1 ring-fuji/10'
                : RANK_STYLES[entry.rank] ?? 'border-sumi-800 bg-sumi-800/20'
            }`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={`w-9 h-9 rounded-md flex items-center justify-center font-medium text-sm flex-shrink-0 ${
              entry.rank <= 3 ? RANK_STYLES[entry.rank] : 'bg-sumi-800 text-sumi-500'
            } border`}>
              #{entry.rank}
            </div>

            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate ${entry.isYou ? 'text-fuji' : 'text-sumi-100'}`}>
                {entry.isYou ? 'You' : entry.username}
              </div>
              <div className="text-xs text-sumi-500 font-mono">{entry.streak} day streak</div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-sm font-mono text-fuji font-medium">{entry.xp.toLocaleString()} XP</div>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-sumi-600 mt-4 font-mono">
        Make commits to climb the ranks
      </p>
    </ModalShell>
  );
}

// ─── Browse Guilds Modal ──────────────────────────────────────────────────────
const GUILDS = [
  { id: 'rust-wizards', name: 'Rust Wizards', members: 24, desc: 'Systems programming masters', tag: 'systems' },
  { id: 'tsgang', name: 'TypeScript Gang', members: 41, desc: 'Type-safe everything', tag: 'web' },
  { id: 'night-coders', name: 'Night Coders', members: 18, desc: 'We code when everyone sleeps', tag: 'lifestyle' },
  { id: 'oss-heroes', name: 'OSS Heroes', members: 55, desc: 'Open source contributors', tag: 'community' },
  { id: 'leetcode-purgatory', name: 'LeetCode Purgatory', members: 32, desc: 'Grind daily, cry nightly', tag: 'algo' },
];

export function GuildsModal({ isOpen, onClose }: ModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Browse Guilds">
      <div className="space-y-3">
        {GUILDS.map((guild, i) => (
          <motion.div
            key={guild.id}
            id={`guild-item-${guild.id}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-sumi-800 bg-sumi-800/20 hover:border-fuji/20 hover:bg-fuji/5 transition-all cursor-pointer group"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 3 }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-sumi-100">{guild.name}</span>
                <span className="text-xs text-sumi-500 font-mono border border-sumi-700 rounded px-1">
                  {guild.tag}
                </span>
              </div>
              <div className="text-xs text-sumi-500 mt-0.5">{guild.desc}</div>
              <div className="text-xs text-sumi-600 font-mono mt-1">{guild.members} members</div>
            </div>
            <button
              className="btn-shu text-xs py-1.5 px-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
  { id: '/models/character.vrm', name: 'Start Initial Model' },
  { id: '/models/3560984828333798191.vrm', name: 'Model 2' },
  { id: '/models/5090520819620548566.vrm', name: 'Model 3' },
  { id: '/models/5176996000770800635.vrm', name: 'Model 4' },
];

export function CharactersModal({ isOpen, onClose }: ModalProps) {
  const { selectedModelUrl, setSelectedModelUrl } = useGotchiStore();

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Characters">
      <div className="space-y-3">
        {CHARACTERS.map((char, i) => {
          const isSelected = selectedModelUrl === char.id;
          return (
            <motion.div
              key={char.id}
              id={`character-item-${i}`}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer group ${
                isSelected
                  ? 'border-fuji/30 bg-fuji/5 ring-1 ring-fuji/10'
                  : 'border-sumi-800 bg-sumi-800/20 hover:border-fuji/20 hover:bg-fuji/5'
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 3 }}
              onClick={() => {
                setSelectedModelUrl(char.id);
              }}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className={`text-sm font-medium ${isSelected ? 'text-fuji' : 'text-sumi-100'}`}>
                    {char.name}
                  </div>
                  <div className="text-xs text-sumi-500 font-mono mt-0.5 truncate max-w-[200px]">
                    {char.id.replace('/models/', '')}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {isSelected ? (
                  <span className="text-xs font-medium text-fuji border border-fuji/30 bg-fuji/10 px-2 py-1 rounded-md">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-medium text-sumi-400 opacity-0 group-hover:opacity-100 transition-opacity border border-sumi-600 px-2 py-1 rounded-md">
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
