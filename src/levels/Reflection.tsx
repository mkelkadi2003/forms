import { useState } from "react";
import { BADGES, IDEAS } from "../data/content";
import { useGame, type Screen } from "../state/GameContext";
import { sound } from "../lib/audio";
import { Bubble, Btn, Confetti, Decor, LevelFrame, LevelHeader, Robot } from "../components/ui";
import { cn } from "../utils/cn";

export default function Reflection({ nav }: { nav: (s: Screen) => void }) {
  const { progress, completedCount, completeLevel, addBadge } = useGame();
  const [chosen, setChosen] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(0);
  const idea = IDEAS.find((i) => i.id === chosen);

  const pick = (id: string) => {
    setChosen(id);
    sound.play("ding");
    if (!progress.completed.reflect) {
      completeLevel("reflect");
      addBadge("reflect");
      setConfetti((n) => n + 1);
      window.setTimeout(() => sound.play("applause"), 300);
    }
  };

  const earnedBadges = BADGES.filter((b) => progress.badges.includes(b.id)).length;

  return (
    <LevelFrame
      background="linear-gradient(160deg, #03434a 0%, #00797a 45%, #3fc1b5 100%)"
      decor={
        <Decor
          items={[
            { e: "💡", x: "4%", y: "14%", size: 46 },
            { e: "✨", x: "92%", y: "12%", size: 34, delay: 1 },
            { e: "🌈", x: "90%", y: "70%", size: 40, delay: 2 },
            { e: "☁️", x: "3%", y: "78%", size: 46, delay: 0.5 },
          ]}
        />
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 text-white sm:px-6">
        <LevelHeader num={6} title="Think Like a Form Master!" emoji="💡" color="#fbbc04" onCity={() => nav("city")} />

        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="relative shrink-0">
            <Robot mood={chosen ? "cheer" : "think"} talking size={130} />
            <span className="anim-float absolute -right-5 -top-5 text-5xl" aria-hidden="true">
              💡
            </span>
          </div>
          <Bubble className="w-full text-ink">
            <p className="font-display text-xl sm:text-2xl">Think like a Form Master! Which idea do you think is the most important? Tap it!</p>
          </Bubble>
        </div>

        <section className="card-kid space-y-6 p-6 text-ink sm:p-8">
          <div className="text-center">
            <p className="font-display text-sm uppercase tracking-widest text-gf-purple">Final reflection</p>
            <h2 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
              How can online forms help you at school, at home, or when working on projects?
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {IDEAS.map((it) => {
              const on = chosen === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => pick(it.id)}
                  aria-pressed={on}
                  className={cn(
                    "group flex flex-col items-center gap-3 rounded-3xl border-4 p-6 text-center transition hover:-translate-y-1",
                    on ? "border-gf-yellow bg-gf-yellow/25 shadow-xl" : "border-gf-blue/20 bg-white hover:shadow-lg"
                  )}
                >
                  <span className={cn("text-6xl transition group-hover:scale-110", on && "anim-bob")} aria-hidden="true">
                    {it.emoji}
                  </span>
                  <span className="font-display text-2xl leading-tight">{it.title}</span>
                  <span className="text-sm font-bold text-ink/60">{on ? "✔ Your choice" : "👆 Tap me!"}</span>
                </button>
              );
            })}
          </div>

          {idea && (
            <div className="pop-in rounded-3xl bg-gf-purple p-5 text-white shadow-xl">
              <p className="font-display text-2xl">
                {idea.emoji} {idea.title}
              </p>
              <p className="mt-1 text-lg font-semibold">{idea.text}</p>
            </div>
          )}
        </section>

        {idea && (
          <section className="fade-up space-y-5 rounded-[2rem] bg-white/15 p-6 text-center sm:p-10">
            <p className="text-6xl" aria-hidden="true">
              🎓🎉
            </p>
            <h2 className="font-display text-4xl sm:text-5xl">Congratulations, Form Masters!</h2>
            <p className="font-display text-2xl sm:text-3xl">You are ready to create your own online forms!</p>

            <div className="card-kid mx-auto max-w-3xl p-5 text-left text-ink">
              <p className="text-center font-display text-xl">🏆 Your Adventure Report</p>
              <div className="mt-4 grid gap-3 text-center sm:grid-cols-4">
                <Stat label="Levels complete" value={`${completedCount} / 6`} />
                <Stat label="Badges earned" value={`${earnedBadges} / ${BADGES.length}`} />
                <Stat label="Trivia best" value={progress.bestScore.L2 !== undefined ? `${progress.bestScore.L2}%` : "—"} />
                <Stat label="Arena best" value={progress.bestScore.L4 !== undefined ? `${progress.bestScore.L4}%` : "—"} />
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {BADGES.map((b) => {
                  const earned = progress.badges.includes(b.id);
                  return (
                    <span
                      key={b.id}
                      className={cn("chip text-sm", earned ? "bg-gf-yellow text-ink" : "bg-ink/10 text-ink/40 grayscale")}
                      title={earned ? b.name : `Locked: ${b.how}`}
                    >
                      {b.emoji} {b.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Btn tone="yellow" size="lg" onClick={() => nav("city")}>
                🏙️ Back to the city
              </Btn>
              <Btn tone="white" onClick={() => nav("final")}>
                🏫 Classroom checklist
              </Btn>
            </div>
          </section>
        )}
      </div>
      <Confetti trigger={confetti} />
    </LevelFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink/5 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{label}</p>
      <p className="font-display text-2xl font-semibold text-gf-purple">{value}</p>
    </div>
  );
}
