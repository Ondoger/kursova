'use client';

import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useGotchiStore } from '@/store/useGotchiStore';
import type {
  XpUpdatePayload,
  CiEventPayload,
  ForceSleepPayload,
  LevelUpPayload,
  TimerTickPayload,
  PomodoroCompletePayload,
  GuildMessagePayload,
  FocusLostAckPayload,
  ThemeChangedPayload,
} from '@/types';

/**
 * Connects Socket.io and wires all server events to Zustand store.
 * Must be mounted once at the dashboard level after authentication.
 */
export function useSocket(enabled: boolean = true): { isConnected: boolean } {
  const {
    applyXpUpdate,
    handleCiSuccess,
    handleCiFailure,
    handleFocusLost,
    handleForceSleep,
    triggerLevelUp,
    updatePomodoroTimer,
    clearPomodoro,
    addGuildMessage,
    setSocketConnected,
    addActivityEntry,
    setGotchi,
  } = useGotchiStore();

  const isConnected = useGotchiStore((s) => s.isSocketConnected);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    mountedRef.current = true;
    const socket = getSocket();

    // ---- Connection lifecycle ----
    socket.on('connect', () => {
      if (!mountedRef.current) return;
      setSocketConnected(true);
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      if (!mountedRef.current) return;
      setSocketConnected(false);
      console.warn('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // ---- XP & Leveling ----
    socket.on('xp_update', (payload: XpUpdatePayload) => {
      if (!mountedRef.current) return;
      applyXpUpdate(payload);

      // Add to activity feed
      addActivityEntry({
        id: Math.random().toString(36).slice(2),
        userId: '',
        actionType: 'COMMIT',
        xpGained: payload.xpGained,
        coinsGained: payload.coinsGained,
        createdAt: new Date().toISOString(),
        metadata: { repo: payload.repo, commitCount: payload.commitCount },
      });
    });

    socket.on('level_up', (payload: LevelUpPayload) => {
      if (!mountedRef.current) return;
      triggerLevelUp(payload.newLevel, payload.message);
    });

    // ---- CI Events ----
    socket.on('ci_success', (payload: CiEventPayload) => {
      if (!mountedRef.current) return;
      handleCiSuccess({ xpGained: payload.xpGained, message: payload.message });

      addActivityEntry({
        id: Math.random().toString(36).slice(2),
        userId: '',
        actionType: 'BUILD_SUCCESS',
        xpGained: payload.xpGained ?? 0,
        coinsGained: 0,
        createdAt: new Date().toISOString(),
        metadata: { repo: payload.repo },
      });
    });

    socket.on('ci_failure', (payload: CiEventPayload) => {
      if (!mountedRef.current) return;
      handleCiFailure();

      addActivityEntry({
        id: Math.random().toString(36).slice(2),
        userId: '',
        actionType: 'BUILD_FAILED',
        xpGained: 0,
        coinsGained: 0,
        createdAt: new Date().toISOString(),
        metadata: { repo: payload.repo },
      });
    });

    // ---- Pomodoro ----
    socket.on('timer_tick', (payload: TimerTickPayload) => {
      if (!mountedRef.current) return;
      updatePomodoroTimer(payload);
    });

    socket.on('pomodoro_complete', (_payload: PomodoroCompletePayload) => {
      if (!mountedRef.current) return;
      clearPomodoro();
    });

    // ---- Focus ----
    socket.on('focus_lost_ack', (payload: FocusLostAckPayload) => {
      if (!mountedRef.current) return;
      handleFocusLost(payload.energyDeducted);
    });

    // ---- Wellness ----
    socket.on('force_sleep', (payload: ForceSleepPayload) => {
      if (!mountedRef.current) return;
      handleForceSleep(payload.message);
    });

    // ---- Guild chat ----
    socket.on('guild_message', (payload: GuildMessagePayload) => {
      if (!mountedRef.current) return;
      addGuildMessage(payload);
    });

    // ---- Theme changed (language detection) ----
    socket.on('theme_changed', (payload: ThemeChangedPayload) => {
      if (!mountedRef.current) return;
      console.log('[Socket] Theme changed:', payload);

      // Update Gotchi theme in store
      const currentGotchi = useGotchiStore.getState().gotchi;
      if (currentGotchi) {
        setGotchi({
          ...currentGotchi,
          theme: payload.newTheme,
        });
      }

      // Show notification toast
      if (payload.message) {
        // You can add a toast notification here if you have a toast system
        console.log('🎨', payload.message);
      }
    });

    // Connect
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      mountedRef.current = false;
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('xp_update');
      socket.off('level_up');
      socket.off('ci_success');
      socket.off('ci_failure');
      socket.off('timer_tick');
      socket.off('pomodoro_complete');
      socket.off('focus_lost_ack');
      socket.off('force_sleep');
      socket.off('guild_message');
      socket.off('theme_changed');
      disconnectSocket();
    };
  }, [
    enabled,
    applyXpUpdate,
    handleCiSuccess,
    handleCiFailure,
    handleFocusLost,
    handleForceSleep,
    triggerLevelUp,
    updatePomodoroTimer,
    clearPomodoro,
    addGuildMessage,
    setSocketConnected,
    addActivityEntry,
    setGotchi,
  ]);

  return { isConnected };
}
