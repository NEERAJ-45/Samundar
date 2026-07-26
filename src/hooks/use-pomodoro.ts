'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export function usePomodoro(initialWorkMinutes = 25, initialBreakMinutes = 5) {
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(initialWorkMinutes * 60);
  const [workMinutes, setWorkMinutes] = useState(initialWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(initialBreakMinutes);
  const [editingTimer, setEditingTimer] = useState(false);
  const [editTimerValue, setEditTimerValue] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const editTimerRef = useRef('');
  const dialPlayedRef = useRef(false);

  const WORK_TIME = workMinutes * 60;
  const BREAK_TIME = breakMinutes * 60;

  const timerMinutes = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;
  const timerProgress = timerMode === 'work'
    ? ((WORK_TIME - timerSeconds) / WORK_TIME) * 100
    : ((BREAK_TIME - timerSeconds) / BREAK_TIME) * 100;

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playDialSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.07);
    }
  }, [getAudioContext]);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    setTimerRunning(true);
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimerSeconds(timerMode === 'work' ? WORK_TIME : BREAK_TIME);
  }, [pauseTimer, timerMode, WORK_TIME, BREAK_TIME]);

  const switchTimerMode = useCallback(() => {
    pauseTimer();
    setTimerMode((prev) => {
      const next = prev === 'work' ? 'break' : 'work';
      setTimerSeconds(next === 'work' ? workMinutes * 60 : breakMinutes * 60);
      return next;
    });
  }, [pauseTimer, workMinutes, breakMinutes]);

  useEffect(() => {
    if (!timerRunning) return;
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const startEditingTimer = useCallback(() => {
    setEditTimerValue(String(timerMinutes));
    editTimerRef.current = String(timerMinutes);
    setEditingTimer(true);
    dialPlayedRef.current = false;
    playDialSound();
  }, [timerMinutes, playDialSound]);

  const handleEditTimerChange = useCallback((val: string) => {
    const clean = val.replace(/\D/g, '');
    editTimerRef.current = clean;
    setEditTimerValue(clean);
    if (!dialPlayedRef.current) {
      dialPlayedRef.current = true;
      playDialSound();
    }
  }, [playDialSound]);

  const handleEditTimerBlur = useCallback(() => {
    setEditingTimer(false);
    const val = editTimerRef.current;
    if (val === '') {
      setEditTimerValue('');
      return;
    }
    const minutes = Math.max(1, parseInt(val) || 1);
    if (timerMode === 'work') setWorkMinutes(minutes);
    else setBreakMinutes(minutes);
    setTimerSeconds(minutes * 60);
    setEditTimerValue('');
    editTimerRef.current = '';
    dialPlayedRef.current = false;
  }, [timerMode]);

  const handleEditTimerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    else if (e.key === 'Escape') {
      setEditingTimer(false);
      setEditTimerValue('');
      editTimerRef.current = '';
      dialPlayedRef.current = false;
    }
  }, []);

  return {
    timerMode,
    timerRunning,
    timerSeconds,
    timerMinutes,
    timerSecs,
    timerProgress,
    editingTimer,
    editTimerValue,
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimerMode,
    startEditingTimer,
    handleEditTimerChange,
    handleEditTimerBlur,
    handleEditTimerKeyDown,
  };
}
