import { useState } from "react";
import { LESSON_OBJECTIVES } from "../data/content";
import { Btn, Bubble, Robot, Toggle } from "../components/ui";
import { sound } from "../lib/audio";
import { useGame } from "../state/GameContext";
import { cn } from "../utils/cn";

const TITLE = "Form Adventure City";

const FLOATERS = [
  { e: "📝", x: "6%", y: "16%", s: 56, d: 0 },
  { e: "✅", x: "86%", y: "12%", s: 48, d: 0.8 },
  { e: "📊", x: "10%", y: "74%", s: 52, d: 1.2 },
  { e: "⭐", x: "88%", y: "66%", s: 44, d: 0.4 },
  { e: "📋", x: "46%", y: "5%", s: 38, d: 1.6 },
  { e: "🎈", x: "76%", y: "86%", s: 48, d: 2 },
  { e: "🗳️", x: "22%", y: "88%", s: 40, d: 1 },
];

export default function Welcome({ onStart, hasProgress }: { onStart: () => void; hasProgress: boolean }) {
  const { settings, setMusic, setSfx } = useGame();
  const [checkedObj, setCheckedObj] = useState<number[]>([]);

  const toggleObjective = (idx: number) => {
    sound.play("pop");
    setCheckedObj((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  return (
    <section
      className="relative min-h-dvh overflow-hidden text-white"
      style={{ background: "linear-gradient(160deg, #2c1273 0%, #673ab7 40%, #4285f4 100%)" }}
    >
      <div className="stars-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      {FLOATERS.map((f) => (
        <span
          key={f.e + f.x}
          className="anim-float pointer-events-none absolute select-none opacity-90"
          style={{ left: f.x, top: f.y, fontSize: f.s, animationDelay: `${f.d}s` }}
          aria-hidden="true"
        >
          {f.e}
        </span>
      ))}

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-6 px-5 py-10 text-center">
        <p className="pop-in rounded-full bg-gf-yellow px-6 py-2 font-display text-lg font-semibold text-ink shadow-lg sm:text-xl">
          Welcome, Form Masters! • Grade 4 ICT Lesson
        </p>

        <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl" aria-label={TITLE}>
          {TITLE.split("").map((ch, i) => (
            <span key={i} className="title-letter" style={{ animationDelay: `${i * 0.07}s` }} aria-hidden="true">
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <p className="max-w-2xl text-xl font-semibold leading-snug sm:text-2xl">
          Are you ready to discover how online forms collect information, organize answers, and make life easier?
        </p>

        {/* FIRST: Lesson Learning Objectives Card */}
        <div className="card-kid w-full max-w-4xl p-5 text-left text-ink sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gf-purple px-3.5 py-1 font-display text-sm font-bold uppercase tracking-wider text-white">
                🎯 Today's Learning Objectives
              </span>
              <span className="text-sm font-bold text-ink/70">Lesson: Working with Forms Online – Google Forms</span>
            </div>
            <span className="text-xs font-bold text-gf-purple">👆 Tap each objective as we read it together!</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {LESSON_OBJECTIVES.map((obj, idx) => {
              const done = checkedObj.includes(idx);
              return (
                <button
                  key={obj.title}
                  type="button"
                  onClick={() => toggleObjective(idx)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border-4 p-4 text-left transition hover:-translate-y-1",
                    done ? "border-gf-green bg-gf-green/10 shadow-md" : "border-gf-purple/20 bg-gf-purple/5"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-3xl" aria-hidden="true">
                      {obj.emoji}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-display text-xs font-bold",
                        done ? "bg-gf-green text-white" : "bg-ink/10 text-ink/70"
                      )}
                    >
                      {done ? "✓ Ready!" : "Tap"}
                    </span>
                  </div>
                  <p className="font-display text-lg font-bold leading-snug text-ink">{obj.title}</p>
                  <p className="text-sm font-semibold leading-relaxed text-ink/80">{obj.text}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Robot mood="wave" size={145} talking className="anim-bob shrink-0" />
          <Bubble className="max-w-lg text-left">
            <p className="font-display text-xl font-semibold">Hi! I'm Byte, your robot guide.</p>
            <p className="mt-1 text-base sm:text-lg">
              In each building, we will <strong>first learn and explain</strong> how the online form works, and <strong>then play an interactive activity</strong>!
            </p>
          </Bubble>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Btn tone="yellow" size="xl" onClick={onStart}>
            🚀 Start Adventure
          </Btn>
          {hasProgress && (
            <Btn tone="white" size="lg" onClick={onStart}>
              ▶ Continue
            </Btn>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Toggle icon="🎵" label="Background music" on={settings.music} onToggle={() => setMusic(!settings.music)} />
          <Toggle icon="🔊" label="Sound effects" on={settings.sfx} onToggle={() => setSfx(!settings.sfx)} />
        </div>

        <p className="text-sm font-semibold text-white/80">Best in Google Chrome • Grade 4 ICT • Tap or click to play</p>
      </div>
    </section>
  );
}
