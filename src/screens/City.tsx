import { useState } from "react";
import { BADGES, LESSON_OBJECTIVES, LEVELS } from "../data/content";
import { useGame, type LevelId } from "../state/GameContext";
import { sound } from "../lib/audio";
import { BadgeMedal, Bubble, Btn, ProgressBar, Robot } from "../components/ui";
import { cn } from "../utils/cn";

const HEIGHTS = ["h-44", "h-56", "h-48", "h-52", "h-44", "h-60"];
const ROOFS: ("tri" | "dome" | "flat" | "spire")[] = ["tri", "spire", "flat", "dome", "tri", "flat"];

interface BuildingProps {
  index: number;
  locked: boolean;
  done: boolean;
  best?: number;
  shaking: boolean;
  onClick: () => void;
}

function Building({ index, locked, done, best, shaking, onClick }: BuildingProps) {
  const lvl = LEVELS[index];
  const roof = ROOFS[index];
  const roofStyle = { background: "#24163f" };
  const status = locked ? "🔒 Locked" : done ? "✅ Completed • Replay" : "▶ Start here!";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${lvl.title}. ${locked ? "Locked. Finish the previous level first." : done ? "Completed. Click to replay." : "Click to start."}`}
      className={cn(
        "group relative flex w-full flex-col items-center outline-none transition-transform duration-300 hover:-translate-y-2 focus-visible:-translate-y-2",
        shaking && "anim-shake"
      )}
    >
      <span className="anim-float mb-1 text-4xl drop-shadow-lg sm:text-5xl" aria-hidden="true">
        {lvl.emoji}
      </span>

      <div className="relative w-full max-w-[13rem] sm:max-w-[15rem]">
        {/* roof variants */}
        {roof === "tri" && <span className="absolute -top-9 left-0 right-0 h-10" style={{ ...roofStyle, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} aria-hidden="true" />}
        {roof === "dome" && <span className="absolute -top-6 left-1/2 h-12 w-28 -translate-x-1/2 rounded-t-full" style={roofStyle} aria-hidden="true" />}
        {roof === "flat" && <span className="absolute -top-3 -left-2 -right-2 h-5 rounded-lg" style={roofStyle} aria-hidden="true" />}
        {roof === "spire" && (
          <span className="absolute -top-16 left-1/2 h-16 w-12 -translate-x-1/2 rounded-t-xl" style={roofStyle} aria-hidden="true">
            <span className="absolute -top-6 left-1/2 h-6 w-1 -translate-x-1/2 bg-ink" />
            <span className="absolute -top-6 left-1/2 h-3 w-4 bg-gf-red" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
          </span>
        )}

        {/* body */}
        <div
          className={cn("relative w-full rounded-t-[1.5rem] rounded-b-2xl shadow-[0_18px_30px_-12px_rgba(36,22,63,0.55)]", HEIGHTS[index])}
          style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.28), rgba(36,22,63,0.28)), ${lvl.color}` }}
        >
          <div className="absolute inset-x-4 top-5 grid grid-cols-3 gap-2.5">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className={cn("bwin", !locked && i % 4 !== 3 && "lit window-lit")}
                style={{ animationDelay: `${((i * 0.37) % 3).toFixed(2)}s` }}
              />
            ))}
          </div>
          <span className="absolute bottom-0 left-1/2 h-14 w-12 -translate-x-1/2 rounded-t-xl bg-ink/50" aria-hidden="true" />
          {locked && (
            <span className="absolute inset-0 grid place-items-center rounded-[inherit] bg-ink/45 text-5xl" aria-hidden="true">
              🔒
            </span>
          )}
        </div>
      </div>

      {/* label card */}
      <div className="card-kid -mt-3 w-full max-w-[13rem] p-3 text-center sm:max-w-[15rem]">
        <p className="font-display text-xs font-semibold uppercase tracking-wider" style={{ color: lvl.color }}>
          Level {lvl.num} • {lvl.place}
        </p>
        <p className="font-display text-base leading-tight sm:text-lg">{lvl.title}</p>
        <p className={cn("mt-1 text-sm font-bold", locked ? "text-ink/50" : done ? "text-gf-green" : "text-gf-purple")}>{status}</p>
        <span className="mt-1 inline-block rounded-full bg-gf-purple/10 px-2.5 py-0.5 text-xs font-bold text-gf-purple">
          {lvl.soundLabel}
        </span>
        {best !== undefined && <p className="mt-0.5 text-xs font-bold text-ink/70">Best score: {best}%</p>}
      </div>
    </button>
  );
}

export default function City({ onEnter }: { onEnter: (id: LevelId) => void }) {
  const { progress, completedCount, isUnlocked, resetProgress } = useGame();
  const [shakeId, setShakeId] = useState<LevelId | null>(null);
  const [hint, setHint] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const nextLevel = LEVELS.find((l) => !progress.completed[l.id]);
  const guide =
    completedCount === 0
      ? "Your first mission is the Mystery Voting Show in Vote Plaza. Tap that building to begin!"
      : completedCount === LEVELS.length
        ? "You did it! You are a true Form Master! 🎉 Visit any building to replay it."
        : `Great work! Your next stop is ${nextLevel?.place ?? "the city"}.`;

  const handleBuilding = (index: number) => {
    const lvl = LEVELS[index];
    if (!isUnlocked(lvl.id)) {
      sound.play("alert");
      setShakeId(lvl.id);
      setHint(`🚨 Alert! 🔒 Finish “${LEVELS[index - 1].place}” first to open ${lvl.place}.`);
      window.setTimeout(() => setShakeId(null), 650);
      return;
    }
    setHint("");
    onEnter(lvl.id);
  };

  return (
    <div className="min-h-dvh pb-40 pt-6" style={{ background: "linear-gradient(180deg, #7bbcff 0%, #cfeaff 45%, #fff6dc 100%)" }}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        {/* Lesson Objectives Banner (First!) */}
        <section className="card-kid p-4 sm:p-5" aria-label="Lesson learning objectives">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gf-purple px-3.5 py-1 font-display text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
              🎯 Lesson Learning Objectives
            </span>
            <span className="text-xs font-bold text-ink/70 sm:text-sm">Working with Forms Online – Google Forms</span>
          </div>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {LESSON_OBJECTIVES.map((o) => (
              <div key={o.title} className="rounded-2xl border-2 border-gf-purple/15 bg-gf-purple/5 p-3">
                <p className="font-display text-sm font-bold text-gf-purple sm:text-base">
                  {o.emoji} {o.title}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-ink/80 sm:text-sm">{o.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guide robot */}
        <section className="flex flex-col items-center gap-4 md:flex-row">
          <Robot mood={completedCount === LEVELS.length ? "cheer" : "happy"} talking size={130} className="anim-bob shrink-0" />
          <Bubble className="w-full max-w-2xl">
            <p className="font-display text-2xl font-semibold">Welcome to Form Adventure City!</p>
            <p className="mt-1 text-lg">{guide}</p>
          </Bubble>
        </section>

        {/* Progress tracker */}
        <section className="card-kid p-5 sm:p-6" aria-labelledby="progress-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p id="progress-title" className="font-display text-sm font-semibold uppercase tracking-widest text-gf-purple">
                Adventure progress
              </p>
              <p className="font-display text-3xl sm:text-4xl">
                {completedCount} of {LEVELS.length} levels complete
              </p>
            </div>
            <div className="flex items-center gap-2 text-3xl" aria-hidden="true">
              {LEVELS.map((l) => (
                <span key={l.id} className={cn("transition duration-500", progress.completed[l.id] ? "scale-110" : "opacity-30 grayscale")}>
                  {l.emoji}
                </span>
              ))}
            </div>
          </div>
          <ProgressBar className="mt-4" value={completedCount} max={LEVELS.length} color="#34a853" track="#ece6fb" height={18} />
          <div className="mt-4 grid gap-3 text-sm font-semibold sm:grid-cols-3">
            <div className="rounded-2xl bg-gf-purple/10 px-4 py-2">
              🏰 Best trivia score: {progress.bestScore.L2 !== undefined ? `${progress.bestScore.L2}%` : "not yet"}
            </div>
            <div className="rounded-2xl bg-gf-red/10 px-4 py-2">
              🎯 Arena score: {progress.bestScore.L4 !== undefined ? `${progress.bestScore.L4}%` : "not yet"}
            </div>
            <div className="rounded-2xl bg-gf-yellow/20 px-4 py-2">
              🎓 Certificate: {progress.badges.includes("certificate") ? "Earned!" : "Score 70% in the Arena"}
            </div>
          </div>
        </section>

        {/* Cityscape */}
        <section aria-label="Form Adventure City map">
          <div className="city-sky relative overflow-hidden rounded-[2.5rem] border-4 border-white/80 px-5 pb-0 pt-8 shadow-2xl sm:px-10 sm:pt-10">
            <div className="sun absolute right-8 top-6 hidden sm:block" aria-hidden="true" />
            <div className="cloud" style={{ top: "6%", animationDelay: "-12s" }} aria-hidden="true" />
            <div className="cloud" style={{ top: "20%", animationDelay: "-40s", transform: "scale(0.7)" }} aria-hidden="true" />
            <span className="anim-float absolute left-3 top-28 text-3xl opacity-80" aria-hidden="true">
              📝
            </span>
            <span className="anim-float absolute right-4 top-44 text-3xl opacity-80" style={{ animationDelay: "1s" }} aria-hidden="true">
              📊
            </span>
            <span className="anim-float absolute left-1/2 top-16 hidden text-3xl opacity-80 md:block" style={{ animationDelay: "2s" }} aria-hidden="true">
              ✅
            </span>

            <div className="relative z-10 grid grid-cols-2 items-end gap-x-5 gap-y-10 md:grid-cols-3">
              {LEVELS.map((lvl, i) => (
                <Building
                  key={lvl.id}
                  index={i}
                  locked={!isUnlocked(lvl.id)}
                  done={progress.completed[lvl.id]}
                  best={lvl.id === "L2" ? progress.bestScore.L2 : lvl.id === "L4" ? progress.bestScore.L4 : undefined}
                  shaking={shakeId === lvl.id}
                  onClick={() => handleBuilding(i)}
                />
              ))}
            </div>
            <div className="road -mx-5 mt-8 sm:-mx-10" aria-hidden="true" />
          </div>
          <div className="mt-3 min-h-10 text-center" role="status" aria-live="polite">
            {hint && (
              <div className="pop-in alert-light mx-auto inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-gf-red px-5 py-2.5 font-display text-lg font-bold text-white shadow-xl">
                <span>{hint}</span>
              </div>
            )}
          </div>

          {/* Building Soundboard: preview any building's special sound */}
          <div className="card-kid mt-3 flex flex-wrap items-center justify-center gap-2 px-4 py-3 text-center">
            <span className="font-display text-sm font-bold text-gf-purple">🔊 Building Sounds (tap to hear):</span>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => sound.playBuilding(lvl.id)}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-gf-purple/20 bg-gf-purple/5 px-3 py-1 font-display text-xs font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-gf-purple/15 sm:text-sm"
                title={`Play ${lvl.place} sound (${lvl.soundLabel})`}
              >
                <span aria-hidden="true">{lvl.emoji}</span>
                <span>{lvl.soundLabel}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Badge shelf */}
        <section className="rounded-[2rem] bg-gf-purple p-5 text-white shadow-2xl sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl">🏅 Badge shelf</h2>
            <p className="font-semibold text-white/85">
              {progress.badges.length} of {BADGES.length} badges earned
            </p>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
            {BADGES.map((b) => (
              <BadgeMedal key={b.id} emoji={b.emoji} name={b.name} earned={progress.badges.includes(b.id)} />
            ))}
          </div>
        </section>

        {/* Footer controls */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink/75">Finished buildings stay open, so you can replay them any time.</p>
          {!confirmReset ? (
            <Btn tone="dark" size="sm" onClick={() => setConfirmReset(true)}>
              ↺ Reset progress
            </Btn>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Erase all stars, badges and scores?</span>
              <Btn
                tone="red"
                size="sm"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                  setHint("A fresh adventure begins! 🚀");
                }}
              >
                Yes, reset
              </Btn>
              <Btn tone="white" size="sm" onClick={() => setConfirmReset(false)}>
                Cancel
              </Btn>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
