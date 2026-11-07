import { useEffect, useState, type ReactNode } from "react";
import { FILL_BLANKS, ROUND_A_EXPLAIN, ROUND_B_EXPLAIN, TRUE_FALSE } from "../data/content";
import { useGame, type Screen } from "../state/GameContext";
import { sound } from "../lib/audio";
import { Bubble, Btn, Confetti, Decor, Feedback, LevelFrame, LevelHeader, ProgressBar, Robot, StarBurst, Stars, shuffle } from "../components/ui";
import { cn } from "../utils/cn";

type Phase = "intro" | "fill" | "between" | "tf" | "final";

const FILL_COUNT = FILL_BLANKS.length;
const TF_COUNT = TRUE_FALSE.length;
const TOTAL = FILL_COUNT + TF_COUNT;
const POINTS = 10;
const SECONDS = 15;

export default function Level2Trivia({ nav }: { nav: (s: Screen) => void }) {
  const { completeLevel, addBadge } = useGame();
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array.from({ length: TOTAL }, () => null));
  const [picked, setPicked] = useState<string | boolean | null>(null);
  const [fillOptions] = useState(() => FILL_BLANKS.map((q) => shuffle(q.options)));
  const [burst, setBurst] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string>("Send");
  const [studiedTools, setStudiedTools] = useState<string[]>(["Send"]);
  const [studiedFacts, setStudiedFacts] = useState<number[]>([0]);

  const correct = results.filter((r) => r === true).length;
  const score = correct * POINTS;
  const stars = correct >= 9 ? 3 : correct >= 6 ? 2 : 1;
  const medal = score >= 90 ? "🥇 Gold Form Master" : score >= 70 ? "🥈 Silver Form Scholar" : "🥉 Bronze Form Learner";
  const answeredCount = results.filter((r) => r !== null).length;

  const record = (index: number, ok: boolean) => {
    setResults((prev) => {
      const next = [...prev];
      next[index] = ok;
      return next;
    });
  };

  const inspectTool = (word: string) => {
    sound.play("pop");
    setSelectedTool(word);
    setStudiedTools((prev) => (prev.includes(word) ? prev : [...prev, word]));
  };

  const inspectFact = (idx: number) => {
    sound.play("pop");
    setStudiedFacts((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  /* ----- Round A: fill in the blanks ----- */
  const pickFill = (opt: string) => {
    if (picked !== null) return;
    const q = FILL_BLANKS[qIndex];
    const ok = opt === q.answer;
    setPicked(opt);
    record(qIndex, ok);
    if (ok) {
      sound.play("correct");
      setBurst((b) => b + 1);
    } else {
      sound.play("wrong");
    }
  };

  const nextFill = () => {
    setPicked(null);
    if (qIndex < FILL_COUNT - 1) {
      setQIndex(qIndex + 1);
    } else {
      setQIndex(0);
      setPhase("between");
    }
  };

  /* ----- Round B: true or false lightning ----- */
  const pickTF = (value: boolean) => {
    if (picked !== null) return;
    const q = TRUE_FALSE[qIndex];
    const ok = value === q.answer;
    setPicked(value);
    record(FILL_COUNT + qIndex, ok);
    if (ok) {
      sound.play("correct");
      setBurst((b) => b + 1);
    } else {
      sound.play("wrong");
    }
  };

  const timeUp = () => {
    if (picked !== null) return;
    setPicked("timeout");
    record(FILL_COUNT + qIndex, false);
    sound.play("alert");
  };

  const startTF = () => {
    setPhase("tf");
    setQIndex(0);
    setPicked(null);
    setTimerKey((k) => k + 1);
  };

  const nextTF = () => {
    setPicked(null);
    if (qIndex < TF_COUNT - 1) {
      setQIndex(qIndex + 1);
      setTimerKey((k) => k + 1);
    } else {
      setPhase("final");
      completeLevel("L2", score);
      addBadge("trivia");
      sound.play("fanfare");
      setConfetti((n) => n + 1);
    }
  };

  const restart = () => {
    setResults(Array.from({ length: TOTAL }, () => null));
    setQIndex(0);
    setPicked(null);
    setPhase("intro");
  };

  // Clamp so the lookups stay valid while the other round is on screen.
  const fillQ = FILL_BLANKS[Math.min(qIndex, FILL_COUNT - 1)];
  const tfQ = TRUE_FALSE[Math.min(qIndex, TF_COUNT - 1)];
  const [before, after] = fillQ.text.split("______");
  const answered = picked !== null;
  const correctA = results.slice(0, FILL_COUNT).filter((r) => r === true).length;
  const activeToolObj = ROUND_A_EXPLAIN.find((t) => t.word === selectedTool) ?? ROUND_A_EXPLAIN[0];

  const tfClass = (value: boolean) => {
    if (!answered) return "";
    if (tfQ.answer === value) return "is-hit";
    if (picked === value) return "anim-shake";
    return "is-dim";
  };

  return (
    <LevelFrame
      background="linear-gradient(180deg, #120a2e 0%, #2a1670 45%, #5b2fc9 100%)"
      decor={
        <>
          <div className="stars-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          <Decor
            items={[
              { e: "🌙", x: "4%", y: "10%", size: 46 },
              { e: "⭐", x: "92%", y: "8%", size: 30, delay: 1 },
              { e: "✨", x: "86%", y: "70%", size: 34, delay: 2 },
              { e: "⭐", x: "3%", y: "78%", size: 28, delay: 0.5 },
            ]}
          />
        </>
      }
    >
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 pt-6 text-white sm:px-6">
        <LevelHeader num={2} title="Form Master Trivia Tower" emoji="🏰" color="#fbbc04" onCity={() => nav("city")} />

        {/* Score + Step Switcher strip (Explain -> Activity A -> Explain B -> Option B Activity) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/10 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-gf-yellow text-ink">
              ⭐ Score: {score} / {TOTAL * POINTS}
            </span>
            <span className="chip bg-white text-ink">
              Answered: {answeredCount} / {TOTAL}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" role="navigation" aria-label="Trivia Tower stages">
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                setPhase("intro");
              }}
              className={cn(
                "rounded-full px-3 py-1 font-display text-xs font-bold transition sm:text-sm",
                phase === "intro" ? "bg-gf-yellow text-ink shadow" : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              📖 1. Explain Tools (A)
            </button>
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                setQIndex(0);
                setPhase("fill");
              }}
              className={cn(
                "rounded-full px-3 py-1 font-display text-xs font-bold transition sm:text-sm",
                phase === "fill" ? "bg-gf-green text-white shadow" : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              🎮 2. Option A: Fill Blanks
            </button>
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                setPhase("between");
              }}
              className={cn(
                "rounded-full px-3 py-1 font-display text-xs font-bold transition sm:text-sm",
                phase === "between" ? "bg-gf-yellow text-ink shadow" : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              📖 3. Explain Facts (B)
            </button>
            <button
              type="button"
              onClick={startTF}
              className={cn(
                "rounded-full px-3 py-1 font-display text-xs font-bold transition sm:text-sm",
                phase === "tf" ? "bg-gf-red text-white shadow" : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              ⚡ 4. Option B: True/False
            </button>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_15rem]">
          <div className="min-w-0">
            {/* ---------- Intro: Explain the 4 Google Forms tools FIRST, then start Round A ---------- */}
            {phase === "intro" && (
              <section className="fade-up space-y-5">
                <div className="flex flex-col items-center gap-4 md:flex-row">
                  <Robot mood="happy" talking size={115} className="shrink-0" />
                  <Bubble className="w-full text-ink">
                    <p className="font-display text-xl sm:text-2xl">
                      Before we climb the Trivia Tower, let's <strong>learn the 4 key tools inside Google Forms</strong>! Tap each tool on the form below.
                    </p>
                  </Bubble>
                </div>

                <div className="card-kid p-6 text-ink sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="chip bg-gf-purple text-white">📖 Step 1: Explain the Form Tools First</span>
                    <span className="text-sm font-bold text-ink/70">
                      Tools explored: {studiedTools.length} / {ROUND_A_EXPLAIN.length}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl">Inside Google Forms: 4 Important Tools</h2>
                  <p className="mt-1 text-base font-semibold text-ink/75">
                    Click each highlighted button on the simulated Google Form to see what it does before starting Activity A!
                  </p>

                  {/* Interactive Mock Google Form showing the 4 tools */}
                  <div className="mt-4 overflow-hidden rounded-3xl border-4 border-gf-purple/25 bg-gf-purple/5">
                    {/* Top toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gf-purple px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">
                          📝
                        </span>
                        <span className="font-display text-lg font-bold">School Event Form</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => inspectTool("Templates")}
                          className={cn(
                            "rounded-xl px-3 py-1.5 font-display text-sm font-bold transition",
                            selectedTool === "Templates" ? "bg-gf-yellow text-ink ring-4 ring-white" : "bg-white/20 text-white hover:bg-white/30"
                          )}
                        >
                          📋 Templates
                        </button>
                        <button
                          type="button"
                          onClick={() => inspectTool("Send")}
                          className={cn(
                            "rounded-xl px-3.5 py-1.5 font-display text-sm font-bold transition",
                            selectedTool === "Send" ? "bg-gf-yellow text-ink ring-4 ring-white" : "bg-gf-green text-white hover:brightness-110"
                          )}
                        >
                          📤 Send
                        </button>
                      </div>
                    </div>

                    {/* Questions / Responses tabs */}
                    <div className="flex items-center justify-center gap-4 border-b-2 border-gf-purple/15 bg-white px-4 py-2.5">
                      <span className="font-display text-sm font-bold text-ink/60">Questions</span>
                      <button
                        type="button"
                        onClick={() => inspectTool("Responses")}
                        className={cn(
                          "rounded-xl px-3.5 py-1 font-display text-sm font-bold transition",
                          selectedTool === "Responses"
                            ? "bg-gf-purple text-white ring-4 ring-gf-yellow"
                            : "bg-gf-purple/15 text-gf-purple hover:bg-gf-purple/25"
                        )}
                      >
                        📊 Responses (12)
                      </button>
                    </div>

                    {/* Question body with Voice input */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-display text-base font-bold text-ink">Question: What did you enjoy most today?</p>
                        <p className="text-xs font-semibold text-ink/70">Students can type their answer or speak it using a microphone!</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => inspectTool("Voice")}
                        className={cn(
                          "rounded-xl px-3.5 py-2 font-display text-sm font-bold transition",
                          selectedTool === "Voice" ? "bg-gf-blue text-white ring-4 ring-gf-yellow" : "bg-gf-blue/15 text-gf-blue hover:bg-gf-blue/25"
                        )}
                      >
                        🎤 Voice Input
                      </button>
                    </div>
                  </div>

                  {/* 4 Clickable Feature Cards */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {ROUND_A_EXPLAIN.map((item) => {
                      const active = selectedTool === item.word;
                      const seen = studiedTools.includes(item.word);
                      return (
                        <button
                          key={item.word}
                          type="button"
                          onClick={() => inspectTool(item.word)}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-2xl border-4 p-3.5 text-left transition hover:-translate-y-0.5",
                            active ? "border-gf-purple bg-gf-purple/10 shadow-md" : "border-ink/10 bg-white"
                          )}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="text-2xl" aria-hidden="true">
                              {item.emoji}
                            </span>
                            <span className="text-xs font-extrabold text-gf-green">{seen ? "✓ Learned" : "Tap"}</span>
                          </div>
                          <p className="font-display text-lg font-bold text-gf-purple">{item.word}</p>
                          <p className="text-xs font-semibold text-ink/70">{item.whereInForm}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Tool Detailed Explanation */}
                  <div key={activeToolObj.word} className="pop-in mt-4 rounded-2xl border-4 border-gf-purple/25 bg-gf-purple/10 p-4">
                    <p className="font-display text-xl font-bold text-gf-purple">
                      {activeToolObj.emoji} {activeToolObj.word} — <span className="text-base text-ink/75">{activeToolObj.whereInForm}</span>
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink">{activeToolObj.explanation}</p>
                  </div>

                  {/* Start Activity Buttons (Option A or jump to Option B) */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/10 pt-5">
                    <Btn tone="white" size="md" onClick={() => setPhase("between")}>
                      ⚡ Go to Option B (Round B: True or False)
                    </Btn>
                    <Btn tone="yellow" size="xl" onClick={() => setPhase("fill")}>
                      🏁 Start Round A
                    </Btn>
                  </div>
                </div>
              </section>
            )}

            {/* ---------- Round A: Fill in the Blanks Activity ---------- */}
            {phase === "fill" && (
              <section className="fade-up space-y-5">
                <GuideRow mood="think" text="Activity A! Read the sentence and pick the missing word we just learned." />
                <div className="card-kid relative overflow-hidden p-6 text-ink sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="chip bg-gf-green text-white">
                      🎮 Activity A • Question {qIndex + 1} of {FILL_COUNT}
                    </span>
                    <span className="chip">Fill in the Blanks</span>
                  </div>
                  <p className="mt-6 text-center font-display text-2xl leading-relaxed sm:text-3xl">
                    {before}
                    <span
                      className={cn(
                        "mx-1 inline-block min-w-[7ch] rounded-xl border-b-4 px-3 align-middle",
                        !answered && "border-gf-blue bg-gf-blue/10 text-gf-blue",
                        answered && picked === fillQ.answer && "border-gf-green bg-gf-green/15 text-gf-green",
                        answered && picked !== fillQ.answer && "border-gf-red bg-gf-red/10 text-gf-red"
                      )}
                    >
                      {answered ? fillQ.answer : "______"}
                    </span>
                    {after}
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {fillOptions[qIndex].map((opt) => {
                      const isAnswer = opt === fillQ.answer;
                      const isPick = picked === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={answered}
                          onClick={() => pickFill(opt)}
                          className={cn(
                            "answer-tile justify-center text-2xl",
                            answered && isAnswer && "is-right",
                            answered && isPick && !isAnswer && "is-wrong",
                            answered && !isAnswer && !isPick && "is-dim"
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <StarBurst trigger={burst} />

                  <div className="mt-6 space-y-4">
                    {answered && (
                      <>
                        {picked === fillQ.answer ? (
                          <Feedback tone="good">🌟 Correct! +{POINTS} points</Feedback>
                        ) : (
                          <Feedback tone="bad">Oops! The correct word is “{fillQ.answer}”.</Feedback>
                        )}
                        <div className="flex justify-end">
                          <Btn tone="yellow" onClick={nextFill}>
                            {qIndex < FILL_COUNT - 1 ? "Next question ➡️" : "Finish Round A ➡️"}
                          </Btn>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ---------- Between rounds: Explain Round B (Option B) Facts FIRST, then Start Round B ---------- */}
            {phase === "between" && (
              <section className="card-kid pop-in space-y-5 p-6 text-ink sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="chip bg-gf-purple text-white">📖 Step 2: Explain Option B (Round B) Facts First</span>
                  <span className="chip bg-gf-yellow text-ink">Round A Score: {correctA * POINTS} pts</span>
                </div>

                <div className="text-center">
                  <h2 className="font-display text-3xl sm:text-4xl">Learn Before You Play: 6 Google Forms Facts!</h2>
                  <p className="mt-1 text-base font-semibold text-ink/75 sm:text-lg">
                    Review these 6 important facts about Google Forms with your class, then click <strong>Start Round B</strong> for the True or False Lightning Challenge!
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ROUND_B_EXPLAIN.map((fact, idx) => {
                    const seen = studiedFacts.includes(idx);
                    return (
                      <button
                        key={fact.title}
                        type="button"
                        onClick={() => inspectFact(idx)}
                        className={cn(
                          "flex flex-col items-start gap-1.5 rounded-2xl border-4 p-4 text-left transition hover:-translate-y-0.5",
                          seen ? "border-gf-purple bg-gf-purple/10 shadow-sm" : "border-ink/10 bg-white"
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-3xl" aria-hidden="true">
                            {fact.emoji}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 font-display text-xs font-bold text-white",
                              fact.badge === "TRUE" ? "bg-gf-green" : "bg-gf-red"
                            )}
                          >
                            Key Fact
                          </span>
                        </div>
                        <p className="font-display text-lg font-bold text-ink">{fact.title}</p>
                        <p className="text-sm font-semibold leading-snug text-ink/80">{fact.explanation}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Btn tone="red" size="xl" onClick={startTF}>
                    ⚡ Start Round B
                  </Btn>
                </div>
              </section>
            )}

            {/* ---------- Round B (Option B: True or False Lightning Activity) ---------- */}
            {phase === "tf" && (
              <section className="fade-up space-y-5">
                <GuideRow mood="cheer" text="Option B: True or False Lightning Challenge! Read carefully and tap TRUE or FALSE." />
                <div className="card-kid relative overflow-hidden p-6 text-ink sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="chip bg-gf-red text-white">
                      ⚡ Option B (Round B) • Question {qIndex + 1} of {TF_COUNT}
                    </span>
                    <Countdown key={timerKey} seconds={SECONDS} stopped={answered} onExpire={timeUp} />
                  </div>

                  <p className="mt-6 text-center font-display text-3xl leading-snug sm:text-4xl">{tfQ.text}</p>

                  <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
                    <button type="button" disabled={answered} onClick={() => pickTF(true)} className={cn("tf-btn tf-true", tfClass(true))}>
                      ✔ TRUE
                    </button>
                    <button type="button" disabled={answered} onClick={() => pickTF(false)} className={cn("tf-btn tf-false", tfClass(false))}>
                      ✖ FALSE
                    </button>
                  </div>

                  <StarBurst trigger={burst} />

                  <div className="mt-6 space-y-4">
                    {answered && (
                      <>
                        {picked === tfQ.answer && <Feedback tone="good">🌟 Correct! It is {tfQ.answer ? "TRUE" : "FALSE"}. +{POINTS} points</Feedback>}
                        {picked === "timeout" && <Feedback tone="info">⏰ Time’s up! It is {tfQ.answer ? "TRUE" : "FALSE"}.</Feedback>}
                        {picked !== tfQ.answer && picked !== "timeout" && (
                          <Feedback tone="bad">Not quite! It is {tfQ.answer ? "TRUE" : "FALSE"}.</Feedback>
                        )}
                        <p className="rounded-2xl bg-ink/5 p-4 text-lg font-semibold">💡 {tfQ.why}</p>
                        <div className="flex justify-end">
                          <Btn tone="yellow" onClick={nextTF}>
                            {qIndex < TF_COUNT - 1 ? "Next question ➡️" : "See my final score 🏆"}
                          </Btn>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ---------- Final score ---------- */}
            {phase === "final" && (
              <section className="card-kid pop-in relative space-y-4 overflow-hidden p-6 text-center text-ink sm:p-10">
                <div className="anim-bob text-7xl" aria-hidden="true">
                  🏆
                </div>
                <h2 className="font-display text-4xl">Trivia Tower Complete!</h2>
                <p className="font-display text-6xl text-gf-purple">
                  {score} <span className="text-3xl text-ink/60">/ {TOTAL * POINTS}</span>
                </p>
                <Stars count={stars} total={3} />
                <p className="text-lg font-semibold">
                  {correct} of {TOTAL} answers correct
                </p>
                <div className="mx-auto max-w-md">
                  <ProgressBar value={score} max={TOTAL * POINTS} color="#673ab7" track="#ece6fb" height={18} />
                </div>
                <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-gf-yellow px-6 py-3 font-display text-xl shadow-lg">{medal}</div>
                <p className="text-ink/80">Badge earned: 🏆 Trivia Champ</p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Btn tone="purple" onClick={restart}>
                    🔁 Play again
                  </Btn>
                  <Btn tone="blue" size="lg" onClick={() => nav("L3")}>
                    🤖 Next: RoboLab
                  </Btn>
                  <Btn tone="white" onClick={() => nav("city")}>
                    🏙️ City
                  </Btn>
                </div>
              </section>
            )}
          </div>

          <Tower results={results} />
        </div>
      </div>
      <Confetti trigger={confetti} />
    </LevelFrame>
  );
}

/* ---------- Helpers ---------- */
function GuideRow({ mood, text }: { mood: "happy" | "think" | "cheer"; text: string }): ReactNode {
  return (
    <div className="flex items-center gap-4">
      <Robot mood={mood} size={84} className="shrink-0" />
      <Bubble className="flex-1 text-ink">
        <p className="font-display text-lg sm:text-xl">{text}</p>
      </Bubble>
    </div>
  );
}

/** Teacher-started countdown ring for each Round B question. */
function Countdown({ seconds, stopped, onExpire }: { seconds: number; stopped: boolean; onExpire: () => void }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (stopped && running) setRunning(false);
  }, [stopped, running]);

  useEffect(() => {
    if (running && left > 0 && left <= 3) sound.play("tick");
  }, [left, running]);

  useEffect(() => {
    if (running && left === 0) {
      setRunning(false);
      onExpire();
    }
  }, [left, running, onExpire]);

  const pct = (left / seconds) * 100;
  const urgent = running && left <= 3;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className={cn("grid h-20 w-20 place-items-center rounded-full p-1.5 shadow-lg", urgent && "anim-shake")}
        style={{ background: `conic-gradient(${urgent ? "#ea4335" : "#fbbc04"} ${pct}%, #e9e3f7 0)` }}
        aria-label={`${left} seconds left`}
      >
        <div className="grid h-full w-full place-items-center rounded-full bg-white font-display text-3xl font-semibold text-ink">{left}</div>
      </div>
      {!running && !stopped && left === seconds && (
        <Btn tone="yellow" size="sm" onClick={() => setRunning(true)}>
          ⏱️ Teacher: start timer
        </Btn>
      )}
      {running && <span className="font-display text-lg font-semibold text-gf-red">⏳ Hurry!</span>}
      {left === 0 && <span className="font-display text-lg font-semibold text-gf-red">Time’s up!</span>}
    </div>
  );
}

/** Vertical tower that fills up as students answer (floor 1 at the bottom). */
function Tower({ results }: { results: (boolean | null)[] }) {
  const answered = results.filter((r) => r !== null).length;
  return (
    <aside className="card-kid p-4 text-ink" aria-label="Trivia tower progress">
      <p className="text-center font-display text-lg">🏰 Tower climb</p>
      <div className="mt-3 flex flex-row gap-1.5 md:flex-col-reverse">
        {results.map((r, i) => (
          <div
            key={i}
            className={cn(
              "relative flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg font-display text-sm font-semibold md:flex-none md:justify-between md:px-3",
              r === true && "bg-gf-green text-white",
              r === false && "bg-gf-red text-white",
              r === null && "bg-ink/10 text-ink/70"
            )}
          >
            <span className="md:hidden">{i + 1}</span>
            <span className="hidden md:inline">Floor {i + 1}</span>
            <span aria-hidden="true">{r === true ? "⭐" : r === false ? "✖" : ""}</span>
            {i === answered && answered < results.length && (
              <span className="anim-bob absolute -right-3 top-1/2 -translate-y-1/2 text-2xl md:-right-7" aria-hidden="true">
                🤖
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-ink/70">Floors climbed: {results.filter((r) => r === true).length}</p>
    </aside>
  );
}
