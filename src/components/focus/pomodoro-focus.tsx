"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Maximize2,
  Settings,
  List,
  CloudRain,
  Waves,
  Wind,
  Flame,
  X,
  Check,
  Minus,
  Plus,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
type AmbientSoundKey = "rain" | "ocean" | "wind" | "fire";

type AmbientSoundState = Record<AmbientSoundKey, { on: boolean; vol: number }>;

/* ---------------------------------------------------------
   EMBER — an ambient pomodoro timer
   Scenes, breathing progress ring, task list, synthesized
   ambient sound mixer (rain / ocean / wind / fire), settings,
   immersive mode. Single-file, no external assets.
--------------------------------------------------------- */

const SCENES = {
  dusk: {
    label: "Dusk Pine",
    from: "#16332E",
    to: "#0B1F1C",
    accent: "#E8A94C",
    soft: "#F2C878",
  },
  midnight: {
    label: "Midnight",
    from: "#1B2340",
    to: "#070B18",
    accent: "#8FA6E8",
    soft: "#C4D2F5",
  },
  ember: {
    label: "Ember Hearth",
    from: "#3A1B17",
    to: "#150807",
    accent: "#F2794D",
    soft: "#FFAE8C",
  },
  ocean: {
    label: "Deep Ocean",
    from: "#0E3A4A",
    to: "#04141C",
    accent: "#5FD3C4",
    soft: "#A6E9DE",
  },
};

const BREAK_ACCENT = "#8FD9C4";
const MODE_LABEL = { focus: "Focus", short: "Short Break", long: "Long Break" };
const DEFAULT_DURATIONS = { focus: 25, short: 5, long: 15 };

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

let idCounter = 1;

type SceneKey = keyof typeof SCENES;

const PLAYLIST = ["Lofi", "Jazz", "Rain"];

function getTrackSrc(index: number) {
  return `/audio/ambient/${PLAYLIST[index].toLowerCase()}.m4a`;
}

export default function PomodoroFocus() {
  const [scene, setScene] = useState<SceneKey>("dusk");
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus");
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [autoStart, setAutoStart] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: idCounter++,
      text: "Plan the week",
      done: false,
      pomodoros: 0,
      estimate: 2,
    },
    {
      id: idCounter++,
      text: "Deep work block",
      done: false,
      pomodoros: 0,
      estimate: 4,
    },
  ]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [sounds, setSounds] = useState<AmbientSoundState>({
    rain: { on: false, vol: 0.15 },
    ocean: { on: false, vol: 0.15 },
    wind: { on: false, vol: 0.12 },
    fire: { on: false, vol: 0.12 },
  });

  // ---- music player ----
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const idxRef = useRef(0);
  useEffect(() => {
    idxRef.current = currentIdx;
  });

  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    a.src = getTrackSrc(idxRef.current);
    a.load();
    a.addEventListener("timeupdate", () => setPlayerProgress(a.currentTime));
    a.addEventListener("loadedmetadata", () => setPlayerDuration(a.duration));
    a.addEventListener("ended", () => {
      const next = (idxRef.current + 1) % PLAYLIST.length;
      setCurrentIdx(next);
      setNowPlaying(PLAYLIST[next]);
      a.src = getTrackSrc(next);
      a.play().catch(console.error);
    });
    audioRef.current = a;
    return () => {
      a.pause();
      a.src = "";
    };
  }, []);

  function togglePlayer() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      if (!a.src) {
        a.src = getTrackSrc(idxRef.current);
        a.load();
      }
      a.play().catch(console.error);
      setNowPlaying(PLAYLIST[idxRef.current]);
    } else {
      a.pause();
      setNowPlaying(null);
    }
  }
  function playTrack(i: number) {
    const a = audioRef.current;
    if (!a) return;
    if (i === currentIdx && !a.paused) {
      a.pause();
      setNowPlaying(null);
      return;
    }
    const url = `/audio/ambient/${PLAYLIST[i].toLowerCase()}.m4a`;
    setCurrentIdx(i);
    setNowPlaying(PLAYLIST[i]);
    a.src = url;
    a.load();
    a.currentTime = 0;
    a.play().catch((e) => console.error("play failed:", e));
  }
  function nextTrack() {
    playTrack((currentIdx + 1) % PLAYLIST.length);
  }

  // ---- refs to dodge stale closures inside the interval / audio callbacks
  const modeRef = useRef(mode);
  const roundRef = useRef(round);
  const durationsRef = useRef(durations);
  const autoStartRef = useRef(autoStart);
  const activeTaskIdRef = useRef(activeTaskId);
  const soundsRef = useRef(sounds);
  const sceneColorRef = useRef(SCENES[scene].soft);

  useEffect(() => {
    modeRef.current = mode;
    roundRef.current = round;
    durationsRef.current = durations;
    autoStartRef.current = autoStart;
    activeTaskIdRef.current = activeTaskId;
    soundsRef.current = sounds;
    sceneColorRef.current = SCENES[scene].soft;
  });

  const soundNodesRef = useRef<
    | Record<AmbientSoundKey, { audio: HTMLAudioElement; key: AmbientSoundKey }>
    | Partial<
        Record<
          AmbientSoundKey,
          { audio: HTMLAudioElement; key: AmbientSoundKey }
        >
      >
  >({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emberRef = useRef<HTMLDivElement>(null);

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }

  function playChime() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.8);
      });
    } catch {}
  }

  function createAmbientNode(key: AmbientSoundKey) {
    const audio = new Audio(`/audio/ambient/${key}.m4a`);
    audio.loop = true;
    audio.volume = 0;
    const node = { audio, key };
    soundNodesRef.current[key] = node;
    return node;
  }

  async function toggleSound(key: AmbientSoundKey) {
    const willBeOn = !soundsRef.current[key].on;
    if (willBeOn) {
      const node = createAmbientNode(key);
      try {
        await node.audio.play();
      } catch {}
      node.audio.volume = soundsRef.current[key].vol;
    } else {
      const node = soundNodesRef.current[key];
      if (node) {
        node.audio.volume = 0;
        node.audio.pause();
      }
    }
    setSounds((s) => ({ ...s, [key]: { ...s[key], on: willBeOn } }));
  }

  function setVolume(key: AmbientSoundKey, vol: number) {
    setSounds((s) => ({ ...s, [key]: { ...s[key], vol } }));
    const node = soundNodesRef.current[key];
    if (node && soundsRef.current[key].on) {
      node.audio.volume = vol;
    }
  }

  useEffect(() => {
    const nodes = soundNodesRef.current;
    return () => {
      Object.values(nodes).forEach((n) => {
        try {
          n.audio.pause();
          n.audio.src = "";
        } catch {}
      });
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const currentScene = SCENES[scene as keyof typeof SCENES];
  const ringColor = mode === "focus" ? currentScene.accent : BREAK_ACCENT;
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const cycleFilled =
    round > 0 && round % 4 === 0 && mode !== "focus" ? 4 : round % 4;

  const completeSessionRef = React.useRef<() => void>(() => {});

  function completeSession() {
    playChime();
    if (modeRef.current === "focus") {
      const nextRound = roundRef.current + 1;
      setRound(nextRound);
      if (activeTaskIdRef.current) {
        setTasks((ts) =>
          ts.map((t) =>
            t.id === activeTaskIdRef.current
              ? { ...t, pomodoros: t.pomodoros + 1 }
              : t,
          ),
        );
      }
      const nextMode: "short" | "long" = nextRound % 4 === 0 ? "long" : "short";
      setMode(nextMode);
      setTimeLeft(durationsRef.current[nextMode] * 60);
    } else {
      setMode("focus");
      setTimeLeft(durationsRef.current.focus * 60);
    }
    setIsRunning(autoStartRef.current);
  }

  useEffect(() => {
    completeSessionRef.current = completeSession;
  });

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          completeSessionRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  function switchMode(next: "focus" | "short" | "long") {
    setIsRunning(false);
    setMode(next);
  }

  async function handleStartPause() {
    try {
      getAudioCtx().resume();
    } catch {}
    setIsRunning((r) => !r);
  }

  function handleReset() {
    setIsRunning(false);
    setTimeLeft(durations[mode] * 60);
  }

  // ---- tasks ----
  function addTask() {
    const text = taskInput.trim();
    if (!text) return;
    const t = { id: idCounter++, text, done: false, pomodoros: 0, estimate: 1 };
    setTasks((ts) => [...ts, t]);
    setTaskInput("");
    if (!activeTaskId) setActiveTaskId(t.id);
  }
  function toggleTaskDone(id: number) {
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }
  function deleteTask(id: number) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  }
  function adjustEstimate(id: number, delta: number) {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, estimate: Math.max(1, Math.min(12, t.estimate + delta)) }
          : t,
      ),
    );
  }

  // ---- fullscreen ----
  function enterFullscreen() {
    try {
      emberRef.current?.requestFullscreen();
    } catch {}
  }

  function exitFullscreen() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch {}
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && document.fullscreenElement) exitFullscreen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- floating particle canvas ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reduced ? 0 : 34;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2,
      speed: 0.12 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: 0.12 + Math.random() * 0.35,
    }));
    let raf: number;
    function resize() {
      if (!canvas) return;
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", resize);
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = sceneColorRef.current;
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ---- progress ring geometry ----
  const total = durations[mode] * 60;
  const fraction = total > 0 ? timeLeft / total : 0;
  const R = 120;
  const C = 2 * Math.PI * R;
  const dashOffset = C * (1 - fraction);

  return (
    <div
      ref={emberRef}
      className="ember-root"
      style={
        {
          "--bg-from": currentScene.from,
          "--bg-to": currentScene.to,
          "--accent": currentScene.accent,
          "--accent-soft": currentScene.soft,
          "--ring": ringColor,
        } as React.CSSProperties
      }
    >
      <style>{`
        .ember-root, .ember-root * { box-sizing: border-box; }
        .ember-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: var(--bg-from);
          font-family: var(--font-inter);
          color: #EFEAE0;
          transition: background 900ms ease;
          isolation: isolate;
          display: flex;
          flex-direction: column;
        }
        .ember-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

        .ember-vignette {
          position: absolute; inset: 0;
          pointer-events: none;
        }

        .ember-topbar {
          position: relative; z-index: 3;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px 0 22px;
        }
        .ember-brand {
          font-family: var(--font-fraunces); font-weight: 500; font-size: 15px;
          letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-soft);
          display: flex; align-items: center; gap: 8px; opacity: 0.9;
        }
        .ember-brand::before { content: '\\25CF'; font-size: 8px; color: var(--accent); }

        .icon-btn {
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.09);
          color: #EFEAE0; width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; transition: background 160ms ease, transform 160ms ease;
          backdrop-filter: blur(6px);
        }
        .icon-btn:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }
        .icon-btn.active { background: var(--accent); color: #1a1208; border-color: transparent; }

        .scene-row { display: flex; gap: 8px; }
        .scene-dot {
          width: 20px; height: 20px; border-radius: 50%; cursor: pointer;
          border: 2px solid rgba(255,255,255,0.25); transition: transform 160ms ease, border-color 160ms ease;
        }
        .scene-dot:hover { transform: scale(1.12); }
        .scene-dot.selected { border-color: #EFEAE0; }

        .ember-center {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 20px 20px 10px; min-height: 520px; flex: 1;
        }
        .ember-root:fullscreen .ember-center {
          min-height: 0; padding: 0;
        }

        .mode-tabs { display: flex; gap: 6px; background: rgba(255,255,255,0.06); padding: 5px; border-radius: 999px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.06); }
        .mode-tab {
          border: none; background: transparent; color: rgba(239,234,224,0.6);
          font-family: var(--font-inter); font-size: 12.5px; font-weight: 500; letter-spacing: 0.03em;
          padding: 8px 16px; border-radius: 999px; cursor: pointer; transition: all 200ms ease;
        }
        .mode-tab.active { background: rgba(255,255,255,0.95); color: #1a1208; }

        .ring-wrap { position: relative; width: 280px; height: 280px; }
        .ring-wrap.breathing { animation: breathe 4s ease-in-out infinite; }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.015); } }

        .ring-svg { transform: rotate(-90deg); filter: drop-shadow(0 0 18px var(--ring)); }
        .ring-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 6; }
        .ring-progress { fill: none; stroke: var(--ring); stroke-width: 6; stroke-linecap: round; transition: stroke 400ms ease; }

        .ring-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
        .time-display { font-family: var(--font-fraunces); font-weight: 400; font-size: 62px; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; line-height: 1; color: #FBF7ED; }
        .mode-caption { font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(239,234,224,0.55); }
        .focus-task-caption { font-size: 12.5px; color: var(--accent-soft); max-width: 200px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }

        .controls-row { display: flex; align-items: center; gap: 14px; margin-top: 30px; }
        .btn-primary {
          font-family: var(--font-inter); font-weight: 600; font-size: 14px;
          background: var(--accent); color: #1a1208; border: none;
          padding: 13px 34px; border-radius: 999px; cursor: pointer;
          box-shadow: 0 8px 24px -8px var(--accent); transition: transform 160ms ease, box-shadow 160ms ease;
          letter-spacing: 0.02em;
        }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-ghost {
          font-family: var(--font-inter); font-weight: 500; font-size: 13px;
          background: transparent; color: rgba(239,234,224,0.65); border: 1px solid rgba(255,255,255,0.15);
          padding: 12px 20px; border-radius: 999px; cursor: pointer; transition: all 160ms ease;
        }
        .btn-ghost:hover { color: #EFEAE0; border-color: rgba(255,255,255,0.35); }

        .round-dots { display: flex; gap: 8px; margin-top: 22px; }
        .round-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.18); transition: all 300ms ease; }
        .round-dot.filled { background: var(--accent); box-shadow: 0 0 8px var(--accent); }

        .dock {
          position: relative; z-index: 3;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 16px 20px 22px;
        }
        .dock-pill {
          display: flex; align-items: center; gap: 10px;
          background: rgba(20,20,20,0.35); border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(10px); border-radius: 999px; padding: 8px 10px;
        }

        /* side panels */
        .side-panel {
          position: absolute; top: 0; bottom: 0; width: 280px; z-index: 5;
          background: rgba(10,14,13,0.72); backdrop-filter: blur(16px);
          border-right: 1px solid rgba(255,255,255,0.08);
          padding: 20px 18px; transition: transform 320ms cubic-bezier(.4,0,.2,1);
          display: flex; flex-direction: column;
        }
        .side-panel.right { right: 0; left: auto; border-right: none; border-left: 1px solid rgba(255,255,255,0.08); transform: translateX(100%); }
        .side-panel.left { left: 0; transform: translateX(-100%); }
        .side-panel.left.open { transform: translateX(0); }
        .side-panel.right.open { transform: translateX(0); }

        .panel-title { font-family: var(--font-fraunces); font-size: 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .panel-close { cursor: pointer; opacity: 0.6; font-size: 13px; }
        .panel-close:hover { opacity: 1; }

        .task-input-row { display: flex; gap: 8px; margin-bottom: 14px; }
        .task-input {
          flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 9px 11px; color: #EFEAE0; font-size: 13px; font-family: var(--font-inter);
        }
        .task-input::placeholder { color: rgba(239,234,224,0.35); }
        .task-input:focus { outline: none; border-color: var(--accent); }
        .task-add-btn { background: var(--accent); color: #1a1208; border: none; border-radius: 8px; width: 36px; cursor: pointer; font-size: 16px; font-weight: 600; }

        .task-list { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; flex: 1; }
        .task-item {
          display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 10px;
          cursor: pointer; border: 1px solid transparent; transition: background 150ms ease;
        }
        .task-item:hover { background: rgba(255,255,255,0.05); }
        .task-item.active { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.14); }
        .task-check {
          width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid rgba(255,255,255,0.35);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 10px;
        }
        .task-check.done { background: var(--accent); border-color: var(--accent); color: #1a1208; }
        .task-text { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .task-text.done { text-decoration: line-through; opacity: 0.4; }
        .task-est { font-family: var(--font-ibm-plex-mono); font-size: 10.5px; color: rgba(239,234,224,0.45); white-space: nowrap; }
        .task-del { opacity: 0; font-size: 12px; cursor: pointer; padding: 2px 4px; }
        .task-item:hover .task-del { opacity: 0.5; }
        .task-del:hover { opacity: 1 !important; }

        .setting-row { margin-bottom: 18px; }
        .setting-label { font-size: 12px; color: rgba(239,234,224,0.6); margin-bottom: 8px; display: flex; justify-content: space-between; }
        .setting-value { font-family: var(--font-ibm-plex-mono); color: var(--accent-soft); }
        input[type=range] { width: 100%; accent-color: var(--accent); }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; margin-top: 6px; }
        .switch { position: relative; width: 36px; height: 20px; background: rgba(255,255,255,0.15); border-radius: 999px; cursor: pointer; transition: background 200ms ease; }
        .switch.on { background: var(--accent); }
        .switch-knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 200ms ease; }
        .switch.on .switch-knob { transform: translateX(16px); }

        .sound-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 46px; cursor: pointer; }
        .sound-icon {
          width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 15px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: rgba(239,234,224,0.7);
          transition: all 180ms ease;
        }
        .sound-icon.on { background: var(--accent); color: #1a1208; border-color: transparent; box-shadow: 0 0 12px var(--accent); }
        .sound-label { font-size: 9.5px; color: rgba(239,234,224,0.5); letter-spacing: 0.03em; }
        .sound-slider { width: 46px; margin-top: 2px; }

        .immersive-exit {
          position: absolute; top: 18px; left: 18px; z-index: 6;
          font-size: 11px; color: rgba(239,234,224,0.45); cursor: pointer;
          display: flex; align-items: center; gap: 6px;
        }
        .immersive-exit:hover { color: rgba(239,234,224,0.8); }

        /* music player — glassmorphed */
        .music-player {
          position: absolute; top: 60px; right: 20px; z-index: 10;
          width: 220px;
          background: rgba(15,20,18,0.55); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          box-shadow: 0 12px 40px -8px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .mp-head {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; cursor: pointer;
          color: rgba(239,234,224,0.7); font-size: 12px;
          transition: background 160ms ease;
        }
        .mp-head:hover { background: rgba(255,255,255,0.05); }
        .mp-now { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mp-toggle { font-size: 10px; opacity: 0.5; }
        .mp-body {
          padding: 0 14px 14px;
          animation: mpSlideIn 280ms cubic-bezier(.4,0,.2,1);
        }
        @keyframes mpSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mp-progress-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .mp-time { font-family: var(--font-ibm-plex-mono); font-size: 10px; color: rgba(239,234,224,0.4); min-width: 32px; }
        .mp-progress-row input[type=range] { flex: 1; height: 3px; accent-color: var(--accent); }
        .mp-controls { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px; }
        .mp-btn { cursor: pointer; opacity: 0.6; transition: opacity 160ms ease, transform 160ms ease; }
        .mp-btn:hover { opacity: 1; transform: scale(1.1); }
        .mp-play {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--accent); color: #1a1208;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 200ms ease, box-shadow 200ms ease;
          box-shadow: 0 0 12px var(--accent);
        }
        .mp-play:hover { transform: scale(1.08); }
        .mp-tracklist { display: flex; flex-direction: column; gap: 3px; }
        .mp-track {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 8px;
          font-size: 12px; cursor: pointer;
          transition: background 150ms ease;
        }
        .mp-track:hover { background: rgba(255,255,255,0.06); }
        .mp-track.active { background: rgba(255,255,255,0.08); color: var(--accent-soft); }
        .mp-track-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        @media (max-width: 560px) {
          .music-player { top: 56px; right: 10px; width: 180px; }
          .mp-head { font-size: 11px; padding: 8px 10px; }
          .mp-body { padding: 0 10px 10px; }
        }
        @media (max-width: 560px) {
          .side-panel { width: 84%; }
          .time-display { font-size: 42px; }
          .ring-wrap { width: 200px; height: 200px; }
          .ring-svg { width: 200px; height: 200px; }
          .ember-topbar { padding: 12px 14px 0 14px; }
          .ember-brand { font-size: 12px; }
          .scene-dot { width: 16px; height: 16px; }
          .icon-btn { width: 30px; height: 30px; font-size: 13px; }
          .mode-tab { font-size: 11px; padding: 6px 12px; }
          .mode-tabs { margin-bottom: 20px; }
          .controls-row { gap: 10px; margin-top: 22px; }
          .btn-primary { padding: 11px 28px; font-size: 13px; }
          .btn-ghost { padding: 10px 16px; font-size: 12px; }
          .ember-center { padding: 16px 12px 8px; min-height: 440px; }
          .dock { padding: 12px 12px 16px; }
          .dock-pill { gap: 6px; padding: 6px 8px; overflow-x: auto; }
          .sound-btn { width: 40px; }
          .sound-icon { width: 32px; height: 32px; font-size: 13px; }
          .sound-label { font-size: 8px; }
          .sound-slider { width: 32px; }
          .round-dots { gap: 6px; margin-top: 16px; }
          .mode-caption { font-size: 10px; }
          .focus-task-caption { font-size: 11px; }
        }
      `}</style>

      <canvas ref={canvasRef} className="ember-canvas" />
      <div className="ember-vignette" />

      <div className="ember-topbar">
        <div className="ember-brand">Ember</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="scene-row">
            {Object.entries(SCENES).map(([key, s]) => {
              const sceneKey = key as SceneKey;
              return (
                <div
                  key={key}
                  className={`scene-dot${scene === sceneKey ? " selected" : ""}`}
                  style={{ background: s.from }}
                  onClick={() => setScene(sceneKey)}
                  title={s.label}
                />
              );
            })}
          </div>
          <div
            className="icon-btn"
            onClick={enterFullscreen}
            title="Fullscreen"
            aria-label="Enter fullscreen"
          >
            <Maximize2 size={15} />
          </div>
          <div
            className="icon-btn"
            onClick={() => setSettingsOpen((o) => !o)}
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={15} />
          </div>
        </div>
      </div>

      <div className="immersive-exit" onClick={exitFullscreen}>
        <X size={11} /> exit fullscreen (esc)
      </div>

      <div className="ember-center">
        <div className="mode-tabs">
          {Object.keys(MODE_LABEL).map((m) => (
            <button
              key={m}
              className={`mode-tab${mode === m ? " active" : ""}`}
              onClick={() => switchMode(m as "focus" | "short" | "long")}
            >
              {MODE_LABEL[m as keyof typeof MODE_LABEL]}
            </button>
          ))}
        </div>

        <div className={`ring-wrap${isRunning ? " breathing" : ""}`}>
          <svg
            className="ring-svg"
            width="280"
            height="280"
            viewBox="0 0 280 280"
          >
            <circle className="ring-track" cx="140" cy="140" r={R} />
            <circle
              className="ring-progress"
              cx="140"
              cy="140"
              r={R}
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="ring-content">
            <div className="time-display">{formatTime(timeLeft)}</div>
            <div className="mode-caption">
              {MODE_LABEL[mode]} {"\u00B7"} Round{" "}
              {cycleFilled === 0 ? 1 : cycleFilled} of 4
            </div>
            {activeTask && (
              <div className="focus-task-caption">{activeTask.text}</div>
            )}
          </div>
        </div>

        <div className="controls-row">
          <button className="btn-ghost" onClick={handleReset}>
            Reset
          </button>
          <button className="btn-primary" onClick={handleStartPause}>
            {isRunning ? "Pause" : "Start"}
          </button>
        </div>

        <div className="round-dots">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`round-dot${i < cycleFilled ? " filled" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="dock">
        <div
          className="icon-btn"
          onClick={() => setTasksOpen((o) => !o)}
          title="Tasks"
          aria-label="Open tasks"
        >
          <List size={15} />
        </div>
        <div className="dock-pill">
          {(Object.keys(sounds) as AmbientSoundKey[]).map((key) => (
            <div key={key} className="sound-btn">
              <button
                type="button"
                className={`sound-icon${sounds[key].on ? " on" : ""}`}
                onClick={() => toggleSound(key)}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
                aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
              >
                {key === "rain" ? <CloudRain size={15} /> : null}
                {key === "ocean" ? <Waves size={15} /> : null}
                {key === "wind" ? <Wind size={15} /> : null}
                {key === "fire" ? <Flame size={15} /> : null}
              </button>
              <div className="sound-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              {sounds[key].on && (
                <input
                  className="sound-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sounds[key].vol}
                  onChange={(e) => setVolume(key, parseFloat(e.target.value))}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={`side-panel left${tasksOpen ? " open" : ""}`}>
        <div className="panel-title">
          Tasks
          <span className="panel-close" onClick={() => setTasksOpen(false)}>
            close
          </span>
        </div>
        <div className="task-input-row">
          <input
            className="task-input"
            placeholder="Add a task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button className="task-add-btn" onClick={addTask}>
            +
          </button>
        </div>
        <div className="task-list">
          {tasks.map((t) => (
            <div
              key={t.id}
              className={`task-item${activeTaskId === t.id ? " active" : ""}`}
              onClick={() => setActiveTaskId(t.id)}
            >
              <div
                className={`task-check${t.done ? " done" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskDone(t.id);
                }}
              >
                {t.done ? <Check size={10} /> : ""}
              </div>
              <div className={`task-text${t.done ? " done" : ""}`}>
                {t.text}
              </div>
              <div className="task-est" onClick={(e) => e.stopPropagation()}>
                <span
                  onClick={() => adjustEstimate(t.id, -1)}
                  style={{ cursor: "pointer", marginRight: 4 }}
                >
                  <Minus size={10} />
                </span>
                {t.pomodoros}/{t.estimate}
                <span
                  onClick={() => adjustEstimate(t.id, 1)}
                  style={{ cursor: "pointer", marginLeft: 4 }}
                >
                  <Plus size={10} />
                </span>
              </div>
              <div
                className="task-del"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(t.id);
                }}
              >
                <X size={12} />
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: "rgba(239,234,224,0.4)",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No tasks yet — add one above.
            </div>
          )}
        </div>
      </div>

      {/* SETTINGS PANEL */}
      <div className={`side-panel right${settingsOpen ? " open" : ""}`}>
        <div className="panel-title">
          Settings
          <span className="panel-close" onClick={() => setSettingsOpen(false)}>
            close
          </span>
        </div>
        {(["focus", "short", "long"] as const).map((m) => (
          <div className="setting-row" key={m}>
            <div className="setting-label">
              <span>{MODE_LABEL[m]}</span>
              <span className="setting-value">{durations[m]} min</span>
            </div>
            <input
              type="range"
              min="1"
              max={m === "focus" ? 60 : 30}
              step="1"
              value={durations[m]}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDurations((d) => ({ ...d, [m]: val }));
                if (mode === m && !isRunning) setTimeLeft(val * 60);
              }}
            />
          </div>
        ))}
        <div className="toggle-row">
          <span>Auto-start next session</span>
          <div
            className={`switch${autoStart ? " on" : ""}`}
            onClick={() => setAutoStart((a) => !a)}
          >
            <div className="switch-knob" />
          </div>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 11,
            color: "rgba(239,234,224,0.35)",
            lineHeight: 1.5,
          }}
        >
          Every 4th focus session is followed by a long break. Ambient sounds
          are synthesized live — no audio files loaded.
        </div>
      </div>

      {/* MUSIC PLAYER */}
      <div className="music-player">
        <div className="mp-head" onClick={() => setPlayerOpen((o) => !o)}>
          <Music size={13} />
          <span className="mp-now">{nowPlaying ?? "Music"}</span>
          <span className="mp-toggle">{playerOpen ? "▾" : "▸"}</span>
        </div>
        {playerOpen && (
          <div className="mp-body">
            <div className="mp-progress-row">
              <span className="mp-time">{formatTime(playerProgress)}</span>
              <input
                type="range"
                min="0"
                max={playerDuration || 1}
                step="0.1"
                value={playerProgress}
                onChange={(e) => {
                  if (audioRef.current)
                    audioRef.current.currentTime = parseFloat(e.target.value);
                  setPlayerProgress(parseFloat(e.target.value));
                }}
              />
              <span className="mp-time">{formatTime(playerDuration)}</span>
            </div>
            <div className="mp-controls">
              <SkipBack
                size={14}
                onClick={() =>
                  playTrack(
                    (currentIdx - 1 + PLAYLIST.length) % PLAYLIST.length,
                  )
                }
                className="mp-btn"
              />
              <div className="mp-play" onClick={togglePlayer}>
                {nowPlaying ? <Pause size={16} /> : <Play size={16} />}
              </div>
              <SkipForward size={14} onClick={nextTrack} className="mp-btn" />
            </div>
            <div className="mp-tracklist">
              {PLAYLIST.map((name, i) => (
                <div
                  key={name}
                  className={`mp-track${i === currentIdx && nowPlaying ? " active" : ""}`}
                  onClick={() => playTrack(i)}
                >
                  <span className="mp-track-name">{name}</span>
                  {i === currentIdx && nowPlaying ? (
                    <Pause size={12} />
                  ) : (
                    <Play size={12} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
