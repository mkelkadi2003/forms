import { useState, type CSSProperties } from "react";
import { CLASS_STEPS } from "../data/content";
import { useGame, type Screen } from "../state/GameContext";
import { sound } from "../lib/audio";
import { Bubble, Btn, Confetti, Decor, LevelFrame, LevelHeader, ProgressBar, Robot } from "../components/ui";
import { cn } from "../utils/cn";

export default function FinalMission({ nav }: { nav: (s: Screen) => void }) {
  const { progress, setChecklistItem, completeLevel, addBadge } = useGame();
  const [pair, setPair] = useState("");
  const [confetti, setConfetti] = useState(0);

  const doneCount = progress.checklist.filter(Boolean).length;
  const allDone = doneCount === CLASS_STEPS.length;

  const toggle = (index: number) => {
    const next = !progress.checklist[index];
    setChecklistItem(index, next);
    const updated = progress.checklist.map((v, j) => (j === index ? next : v));
    if (updated.every(Boolean)) {
      completeLevel("final");
      addBadge("classroom");
      sound.play("badge");
      setConfetti((n) => n + 1);
    } else if (next) {
      sound.play("pop");
    }
  };

  return (
    <LevelFrame
      background="radial-gradient(circle at 85% 0%, rgba(242,153,0,0.3), transparent 40%), linear-gradient(180deg, #123d2b 0%, #1d5a3f 60%, #2b7a53 100%)"
      decor={
        <Decor
          items={[
            { e: "📐", x: "3%", y: "16%", size: 42 },
            { e: "✏️", x: "93%", y: "12%", size: 36, delay: 1 },
            { e: "🖍️", x: "92%", y: "66%", size: 38, delay: 2 },
            { e: "📎", x: "3%", y: "78%", size: 34, delay: 0.5 },
            { e: "🍎", x: "50%", y: "94%", size: 32, delay: 1.5 },
          ]}
        />
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 text-white sm:px-6">
        <LevelHeader num={5} title="Real-World Classroom Mission" emoji="🏫" color="#fbbc04" onCity={() => nav("city")} />

        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Robot mood={allDone ? "cheer" : "happy"} talking size={110} className="shrink-0" />
          <Bubble className="w-full text-ink">
            <p className="font-display text-xl sm:text-2xl">Build your real form step by step. Tick each step as you finish!</p>
          </Bubble>
        </div>

        {/* Mission card (notebook paper look) */}
        <section
          className="card-kid p-6 text-ink sm:p-8"
          style={{ backgroundImage: "repeating-linear-gradient(180deg, #ffffff 0px, #ffffff 31px, #cfe3f5 31px, #cfe3f5 32px)" }}
        >
          <p className="font-display text-sm uppercase tracking-widest text-gf-purple">👫 Work in pairs</p>
          <h2 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">Your Mission: Create a RoboChallenge Feedback Form!</h2>
          <p className="mt-2 text-lg font-semibold text-ink/75">Use the real Google Forms website. Follow the steps below.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="block">
              <span className="font-display text-sm font-semibold text-ink/70">Pair name (optional – a nickname, not a real name)</span>
              <input
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                maxLength={20}
                placeholder="e.g. Team Robo Rockets"
                className="mt-1 w-full rounded-2xl border-4 border-gf-purple/20 bg-white px-4 py-2 font-display text-xl text-ink focus:border-gf-purple focus:outline-none"
              />
            </label>
            <a
              href="https://forms.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn3d btn3d-lg justify-self-start md:justify-self-end"
              style={{ "--c": "#4285f4", "--shadow": "#2a64c9", "--t": "#ffffff" } as CSSProperties}
            >
              🌐 Open forms.google.com ↗
            </a>
          </div>
        </section>

        {/* Safety reminder */}
        <section className="rounded-3xl bg-gf-yellow p-5 font-bold text-ink shadow-lg">
          🔒 Safety first: never share personal email addresses. Use only the approved classroom sharing method from your teacher.
        </section>

        {/* Checklist */}
        <section className="card-kid p-6 text-ink sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-2xl">✅ My checklist</p>
            <p className="font-display text-xl text-gf-purple">
              {doneCount} / {CLASS_STEPS.length} steps done
            </p>
          </div>
          <ProgressBar className="mt-3" value={doneCount} max={CLASS_STEPS.length} color="#34a853" track="#ece6fb" height={16} />

          <ol className="mt-6 space-y-3">
            {CLASS_STEPS.map((step, i) => {
              const done = progress.checklist[i];
              return (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={done}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-2xl border-4 bg-white p-4 text-left transition hover:-translate-y-0.5",
                      done ? "border-gf-green bg-gf-green/10" : "border-ink/10"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border-4 text-2xl font-bold transition",
                        done ? "pop-in border-gf-green bg-gf-green text-white" : "border-gf-purple/40 bg-white text-transparent"
                      )}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="flex-1">
                      <span className={cn("block font-display text-xl leading-snug", done && "text-ink/60 line-through decoration-gf-green decoration-4")}>
                        {i + 1}. {step.title}
                      </span>
                      <span className="mt-1 block text-base font-semibold text-ink/70">💡 Tip: {step.tip}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {!allDone && <p className="mt-5 text-center font-semibold text-ink/70">Tick every step to finish this mission and earn your badge.</p>}
        </section>

        {allDone && (
          <section className="card-kid pop-in space-y-4 p-6 text-center text-ink sm:p-8">
            <div className="anim-bob text-6xl" aria-hidden="true">
              🏅
            </div>
            <h3 className="font-display text-3xl">Badge earned: Classroom Form Pro!</h3>
            <p className="text-lg font-semibold">
              {pair.trim() ? `Well done, ${pair.trim()}!` : "Well done, pair!"} You built a real feedback form for the RoboChallenge event.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Btn tone="teal" size="lg" onClick={() => nav("reflect")}>
                💡 Next: Think Like a Form Master
              </Btn>
              <Btn tone="white" onClick={() => nav("city")}>
                🏙️ City
              </Btn>
            </div>
          </section>
        )}
      </div>
      <Confetti trigger={confetti} />
    </LevelFrame>
  );
}
