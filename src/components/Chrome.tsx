import { useState } from "react";
import { LEVELS } from "../data/content";
import { sound } from "../lib/audio";
import { useGame, type LevelId, type Screen } from "../state/GameContext";
import { cn } from "../utils/cn";
import { Btn, Modal, Toggle } from "./ui";
import { SchoolLogo } from "./SchoolLogo";

/* ---------- Top bar (Home, sound toggles, progress, teacher) ---------- */
export function TopBar({ onHome, onTeacher }: { onHome: () => void; onTeacher: () => void }) {
  const { settings, setMusic, setSfx, completedCount } = useGame();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 text-white shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5">
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:min-w-0 sm:flex-1 sm:justify-start">
          <SchoolLogo className="w-40 shrink-0 sm:w-36 lg:w-44" />
          <div className="font-display text-right sm:hidden xl:block xl:text-left">
            <p className="text-sm font-semibold xl:text-base">Form Adventure City</p>
            <p className="text-xs text-white/75">Grade 6 ICT</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-end sm:gap-3">
          <Btn tone="yellow" size="sm" onClick={onHome} aria-label="Home: back to the city">
            🏠 <span className="hidden sm:inline">Home</span>
          </Btn>
          <button
            type="button"
            onClick={() => sound.play("alert")}
            aria-label="Play attention alert sound"
            title="Play attention alert sound"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-gf-red bg-gf-red px-2.5 py-1.5 font-display text-sm font-semibold text-white shadow transition hover:brightness-110"
          >
            <span aria-hidden="true">🚨</span>
            <span className="hidden md:inline">Alert</span>
          </button>
          <Toggle compact icon="🎵" label="Music" on={settings.music} onToggle={() => setMusic(!settings.music)} />
          <Toggle compact icon="🔊" label="Sound" on={settings.sfx} onToggle={() => setSfx(!settings.sfx)} />
          <span className="whitespace-nowrap rounded-full bg-gf-yellow px-3 py-1.5 font-display text-sm font-semibold text-ink" aria-label={`${completedCount} of 6 levels complete`}>
            ⭐ {completedCount}/6
          </span>
          <button
            type="button"
            onClick={onTeacher}
            aria-label="Teacher controls"
            title="Teacher controls"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-xl transition hover:bg-white/25"
          >
            🧑‍🏫
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Bottom dock: teacher-friendly section navigation ---------- */
const DOCK_ITEMS: { id: Screen; label: string; icon: string }[] = [
  { id: "city", label: "City", icon: "🏙️" },
  { id: "L1", label: "Vote", icon: "🗳️" },
  { id: "L2", label: "Trivia", icon: "🏰" },
  { id: "L3", label: "RoboLab", icon: "🤖" },
  { id: "L4", label: "Arena", icon: "🎯" },
  { id: "final", label: "Classroom", icon: "🏫" },
  { id: "reflect", label: "Reflect", icon: "💡" },
];

export function Dock({ current, onGo }: { current: Screen; onGo: (s: Screen) => void }) {
  const { isUnlocked, progress } = useGame();
  return (
    <nav
      aria-label="Lesson sections"
      className="fixed bottom-3 left-1/2 z-40 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-0.5 overflow-x-auto rounded-full bg-ink/90 p-1.5 shadow-2xl backdrop-blur-md sm:gap-1"
    >
      {DOCK_ITEMS.map((item) => {
        const isLevel = item.id !== "city";
        const locked = isLevel && !isUnlocked(item.id as LevelId);
        const done = isLevel && progress.completed[item.id as LevelId];
        const active = current === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={locked}
            onClick={() => onGo(item.id)}
            aria-current={active ? "page" : undefined}
            aria-label={`${item.label}${locked ? " (locked)" : done ? " (completed)" : ""}`}
            title={locked ? `${item.label} is locked` : item.label}
            className={cn(
              "relative flex min-w-[3rem] flex-col items-center rounded-full px-2 py-1.5 font-display transition sm:min-w-0 sm:flex-row sm:gap-1.5 sm:px-3",
              active ? "bg-white text-ink shadow-lg" : "text-white hover:bg-white/15",
              locked && "opacity-40"
            )}
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {locked ? "🔒" : item.icon}
            </span>
            <span className="text-[0.65rem] font-semibold leading-tight sm:text-sm">{item.label}</span>
            {done && !active && <span className="absolute right-1 top-0.5 h-2.5 w-2.5 rounded-full bg-gf-green ring-2 ring-ink" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- Teacher panel ---------- */
export function TeacherPanel({ open, onClose, onGo }: { open: boolean; onClose: () => void; onGo: (s: Screen) => void }) {
  const { progress, isUnlocked, setTeacherUnlock, resetVotes, resetProgress } = useGame();
  const [confirm, setConfirm] = useState(false);

  const close = () => {
    setConfirm(false);
    onClose();
  };

  const jumps: { id: Screen; label: string }[] = [
    { id: "city", label: "🏙️ City map" },
    ...LEVELS.map((l) => ({ id: l.id as Screen, label: `${l.emoji} ${l.num}. ${l.place}` })),
  ];

  return (
    <Modal open={open} onClose={close} title="🧑‍🏫 Teacher Controls" maxWidth="max-w-3xl">
      <div className="space-y-6">
        <section>
          <h3 className="font-display text-lg">Jump to any section</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
            {jumps.map((j) => {
              const locked = j.id !== "city" && !isUnlocked(j.id as LevelId);
              return (
                <Btn
                  key={j.id}
                  tone="blue"
                  size="sm"
                  className="w-full"
                  disabled={locked}
                  onClick={() => {
                    close();
                    onGo(j.id);
                  }}
                >
                  {locked ? "🔒 " : ""}
                  {j.label}
                </Btn>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-ink/70">Keyboard: use the ← and → arrow keys to move between sections. Press Esc to close this panel.</p>
        </section>

        <section className="rounded-2xl bg-gf-purple/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg">🔊 Classroom Attention Alert & Building Sounds</h3>
              <p className="text-sm text-ink/70">Trigger the attention siren or preview each building’s special sound.</p>
            </div>
            <Btn tone="red" size="sm" onClick={() => sound.play("alert")}>
              🚨 Play Attention Alert
            </Btn>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEVELS.map((lvl) => (
              <Btn key={lvl.id} tone="white" size="sm" onClick={() => sound.playBuilding(lvl.id)}>
                {lvl.emoji} {lvl.place}: {lvl.soundLabel}
              </Btn>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-gf-green/10 p-4">
          <label className="flex cursor-pointer items-center gap-3 font-display text-lg">
            <input
              type="checkbox"
              className="h-6 w-6 accent-gf-green"
              checked={progress.teacherUnlock}
              onChange={(e) => setTeacherUnlock(e.target.checked)}
            />
            Unlock all sections (for teaching)
          </label>
          <p className="mt-1 text-sm text-ink/70">Turn this on to open any level without finishing the ones before it.</p>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <Btn tone="yellow" onClick={resetVotes}>
            🔄 Reset class votes
          </Btn>
          <span className="text-sm text-ink/70">Clears the Level 1 vote chart for the next class.</span>
        </section>

        <section className="rounded-2xl bg-gf-red/10 p-4">
          {!confirm ? (
            <Btn tone="red" onClick={() => setConfirm(true)}>
              ↺ Reset all progress
            </Btn>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-semibold">Erase all stars, badges and scores?</p>
              <Btn
                tone="red"
                onClick={() => {
                  resetProgress();
                  close();
                  onGo("city");
                }}
              >
                Yes, reset everything
              </Btn>
              <Btn tone="white" onClick={() => setConfirm(false)}>
                Cancel
              </Btn>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
