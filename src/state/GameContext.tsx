import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { sound } from "../lib/audio";

export type LevelId = "L1" | "L2" | "L3" | "L4" | "final" | "reflect";
export type Screen = "welcome" | "city" | LevelId;
export type VoteOption = "games" | "computers" | "science" | "art";
export type BadgeId = "vote" | "trivia" | "robo" | "certificate" | "classroom" | "reflect";

/** Order in which the levels unlock. Each level needs the one before it to be completed. */
export const LEVEL_ORDER: LevelId[] = ["L1", "L2", "L3", "L4", "final", "reflect"];

export interface Progress {
  started: boolean;
  completed: Record<LevelId, boolean>;
  bestScore: Partial<Record<LevelId, number>>;
  votes: Record<VoteOption, number>;
  badges: BadgeId[];
  missions: boolean[];
  checklist: boolean[];
  teacherUnlock: boolean;
}

export interface Settings {
  music: boolean;
  sfx: boolean;
}

const PROGRESS_KEY = "form-adventure-city:progress:v1";
const SETTINGS_KEY = "form-adventure-city:settings:v1";

export const DEFAULT_VOTES: Record<VoteOption, number> = { games: 4, computers: 3, science: 2, art: 5 };

function freshProgress(): Progress {
  return {
    started: false,
    completed: { L1: false, L2: false, L3: false, L4: false, final: false, reflect: false },
    bestScore: {},
    votes: { ...DEFAULT_VOTES },
    badges: [],
    missions: [false, false, false, false],
    checklist: [false, false, false, false, false, false, false, false],
    teacherUnlock: false,
  };
}

function loadProgress(): Progress {
  const base = freshProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<Progress>;
    return {
      ...base,
      ...saved,
      completed: { ...base.completed, ...(saved.completed ?? {}) },
      bestScore: saved.bestScore ?? {},
      votes: { ...base.votes, ...(saved.votes ?? {}) },
      badges: Array.isArray(saved.badges) ? saved.badges : [],
      missions: base.missions.map((_, i) => Boolean(saved.missions?.[i])),
      checklist: base.checklist.map((_, i) => Boolean(saved.checklist?.[i])),
    };
  } catch {
    return base;
  }
}

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Settings>;
      return { music: s.music ?? true, sfx: s.sfx ?? true };
    }
  } catch {
    /* ignore corrupt settings */
  }
  return { music: true, sfx: true };
}

interface GameContextValue {
  progress: Progress;
  settings: Settings;
  completedCount: number;
  isUnlocked: (id: LevelId) => boolean;
  markStarted: () => void;
  completeLevel: (id: LevelId, score?: number) => void;
  addBadge: (id: BadgeId) => void;
  castVote: (option: VoteOption) => void;
  resetVotes: () => void;
  setMissionDone: (index: number, done: boolean) => void;
  setChecklistItem: (index: number, done: boolean) => void;
  setTeacherUnlock: (on: boolean) => void;
  resetProgress: () => void;
  setMusic: (on: boolean) => void;
  setSfx: (on: boolean) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [progress]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  useEffect(() => {
    sound.setSfx(settings.sfx);
  }, [settings.sfx]);

  useEffect(() => {
    sound.setMusic(settings.music);
  }, [settings.music]);

  const isUnlocked = useCallback(
    (id: LevelId) => {
      if (progress.teacherUnlock) return true;
      const idx = LEVEL_ORDER.indexOf(id);
      if (idx <= 0) return true;
      return progress.completed[LEVEL_ORDER[idx - 1]];
    },
    [progress]
  );

  const markStarted = useCallback(() => {
    setProgress((p) => (p.started ? p : { ...p, started: true }));
  }, []);

  const completeLevel = useCallback((id: LevelId, score?: number) => {
    setProgress((p) => ({
      ...p,
      completed: { ...p.completed, [id]: true },
      bestScore:
        score === undefined ? p.bestScore : { ...p.bestScore, [id]: Math.max(score, p.bestScore[id] ?? 0) },
    }));
  }, []);

  const addBadge = useCallback((id: BadgeId) => {
    setProgress((p) => (p.badges.includes(id) ? p : { ...p, badges: [...p.badges, id] }));
  }, []);

  const castVote = useCallback((option: VoteOption) => {
    setProgress((p) => ({ ...p, votes: { ...p.votes, [option]: p.votes[option] + 1 } }));
  }, []);

  const resetVotes = useCallback(() => {
    setProgress((p) => ({ ...p, votes: { ...DEFAULT_VOTES } }));
  }, []);

  const setMissionDone = useCallback((index: number, done: boolean) => {
    setProgress((p) => {
      if (p.missions[index] === done) return p;
      const missions = [...p.missions];
      missions[index] = done;
      return { ...p, missions };
    });
  }, []);

  const setChecklistItem = useCallback((index: number, done: boolean) => {
    setProgress((p) => {
      if (p.checklist[index] === done) return p;
      const checklist = [...p.checklist];
      checklist[index] = done;
      return { ...p, checklist };
    });
  }, []);

  const setTeacherUnlock = useCallback((on: boolean) => {
    setProgress((p) => ({ ...p, teacherUnlock: on }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(freshProgress());
  }, []);

  const setMusic = useCallback((on: boolean) => {
    setSettings((s) => ({ ...s, music: on }));
  }, []);

  const setSfx = useCallback((on: boolean) => {
    setSettings((s) => ({ ...s, sfx: on }));
  }, []);

  const completedCount = LEVEL_ORDER.filter((id) => progress.completed[id]).length;

  const value = useMemo<GameContextValue>(
    () => ({
      progress,
      settings,
      completedCount,
      isUnlocked,
      markStarted,
      completeLevel,
      addBadge,
      castVote,
      resetVotes,
      setMissionDone,
      setChecklistItem,
      setTeacherUnlock,
      resetProgress,
      setMusic,
      setSfx,
    }),
    [
      progress,
      settings,
      completedCount,
      isUnlocked,
      markStarted,
      completeLevel,
      addBadge,
      castVote,
      resetVotes,
      setMissionDone,
      setChecklistItem,
      setTeacherUnlock,
      resetProgress,
      setMusic,
      setSfx,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
