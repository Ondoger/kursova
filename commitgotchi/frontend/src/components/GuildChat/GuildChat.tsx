'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGotchiStore } from '@/store/useGotchiStore';
import { getSocket } from '@/lib/socket';
import type { GuildMessagePayload } from '@/types';

interface GuildChatProps {
  guildId: string;
  guildName: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  COMMIT: 'Commit',
  BUILD_SUCCESS: 'Build OK',
  BUILD_FAILED: 'Build Failed',
  POMODORO_COMPLETED: 'Focus Done',
  FOCUS_LOST: 'Focus Lost',
  DAILY_LOGIN: 'Login',
  GUILD_JOINED: 'Joined',
  PR_MERGED: 'PR Merged',
  PR_OPENED: 'PR Opened',
  default: 'Activity',
};

export function GuildChat({ guildId, guildName }: GuildChatProps): JSX.Element {
  const { guildMessages, addGuildMessage, activityFeed, user } = useGotchiStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'feed'>('chat');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guildMessages, activeTab]);

  useEffect(() => {
    if (socket.connected) {
      socket.emit('join_guild', { guildId });
    }

    socket.on('guild_member_joined', (payload: { username: string }) => {
      const systemMsg: GuildMessagePayload = {
        userId: 'system',
        username: 'System',
        message: `${payload.username} joined the guild.`,
        timestamp: new Date().toISOString(),
      };
      addGuildMessage(systemMsg);
    });

    return () => {
      socket.off('guild_member_joined');
    };
  }, [guildId, socket, addGuildMessage]);

  const sendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || !socket.connected) return;

    socket.emit('guild_message', { guildId, message: trimmed });
    setMessage('');
  }, [message, guildId, socket]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="washi-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sumi-800">
        <div className="flex items-center gap-2">
          <span className="text-lg text-fuji/40 font-serif select-none">結</span>
          <div>
            <div className="text-sm font-medium text-sumi-100">{guildName}</div>
            <div className="text-xs text-sumi-500">Guild</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-md overflow-hidden border border-sumi-700 text-xs">
          {(['chat', 'feed'] as const).map((tab) => (
            <button
              key={tab}
              id={`guild-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-fuji/15 text-fuji'
                  : 'text-sumi-500 hover:text-sumi-300'
              }`}
            >
              {tab === 'chat' ? 'Chat' : 'Feed'}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {guildMessages.length === 0 && (
                <div className="text-center text-sumi-600 text-sm py-8">
                  Be the first to say hello.
                </div>
              )}

              {guildMessages.map((msg, idx) => {
                const isOwn = msg.userId === user?.id;
                const isSystem = msg.userId === 'system';

                return (
                  <motion.div
                    key={`${msg.timestamp}-${idx}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isSystem ? 'justify-center' : ''}`}
                  >
                    {isSystem ? (
                      <div className="text-xs text-sumi-600 font-mono">
                        {msg.message}
                      </div>
                    ) : (
                      <>
                        {!isOwn && (
                          <div className="w-7 h-7 rounded-full bg-sumi-700 flex-shrink-0 flex items-center justify-center text-sumi-300 text-xs font-medium">
                            {msg.username[0]?.toUpperCase()}
                          </div>
                        )}

                        <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isOwn && (
                            <span className="text-xs text-sumi-500 mb-0.5 ml-1">
                              {msg.username}
                            </span>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg text-sm leading-relaxed ${
                              isOwn
                                ? 'bg-fuji/10 border border-fuji/20 text-sumi-100 rounded-tr-sm'
                                : 'bg-sumi-800/60 border border-sumi-700 text-sumi-200 rounded-tl-sm'
                            }`}
                          >
                            {msg.message}
                          </div>
                          <span className="text-xs text-sumi-700 mt-0.5 mx-1">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}

              <div ref={messagesEndRef} />
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {activityFeed.length === 0 && (
                <div className="text-center text-sumi-600 text-sm py-8">
                  No activity yet. Make a commit.
                </div>
              )}

              {activityFeed.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-2.5 rounded-md bg-sumi-800/30 border border-sumi-800 hover:bg-sumi-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-sumi-300">
                      {ACTION_TYPE_LABELS[entry.actionType] ?? ACTION_TYPE_LABELS.default}
                    </div>
                    {entry.xpGained > 0 && (
                      <div className="text-xs text-fuji font-mono">
                        +{entry.xpGained} XP
                      </div>
                    )}
                    <div className="text-xs text-sumi-600 font-mono mt-0.5">
                      {formatTime(entry.createdAt)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message input */}
      {activeTab === 'chat' && (
        <div className="p-3 border-t border-sumi-800">
          <div className="flex gap-2">
            <input
              id="guild-message-input"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
              maxLength={500}
              className="zen-input flex-1 text-sm"
              aria-label="Guild chat message"
            />
            <button
              id="guild-send-btn"
              onClick={sendMessage}
              disabled={!message.trim()}
              className="btn-ink px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              &uarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
