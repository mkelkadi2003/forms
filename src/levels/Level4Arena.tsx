import { useEffect, useState } from "react";
import { ARENA, FORM_TOOLBAR, type ArenaQuestion } from "../data/content";
import { useGame, type Screen } from "../state/GameContext";
import { sound } from "../lib/audio";
import { Bubble, Btn, Confetti, Decor, Feedback, LevelFrame, LevelHeader, ProgressBar, Robot, StarBurst } from "../components/ui";
import { cn } from "../utils/cn";

type Phase = "intro" | "countdown" | "play" | "results";
type HostMood = "wave" | "think" | "cheer" | "sad";

const TOTAL = ARENA.length;
const PASS = 70;

function kindLabel(q: ArenaQuestion): string {
  if (q.kind === "mc") return q.scenario ? "Scenario question" : "Multiple choice";
  if (q.kind === "tf") return "True or False";
  if (q.kind === "match") return "Match it!";
  return "Find the button";
}

function revealFor(q: ArenaQuestion): string {
  if (q.kind === "mc") return `The answer is “${q.options[q.answer]}”.`;
  if (q.kind === "tf") return `The answer is ${q.answer ? "TRUE" : "FALSE"}.`;
  if (q.kind === "identify") return `The correct button is “${q.target}”.`;
  return "Each feature has its own special job.";
}

export default function Level4Arena({ nav }: { nav: (s: Screen) => void }) {
  const { progress, completeLevel, addBadge } = useGame();
  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(3);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answer, setAnswer] = useState<{ ok: boolean; label: string } | null>(null);
  const [burst, setBurst] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [host, setHost] = useState<HostMood>("wave");
  const [name, setName] = useState("");

  // Matching question state
  const [matchLeft, setMatchLeft] = useState<number | null>(null);
  const [matchDone, setMatchDone] = useState<number[]>([]);
  const [rightDone, setRightDone] = useState<number[]>([]);
  const [matchMistakes, setMatchMistakes] = useState(0);
  const [wrongRight, setWrongRight] = useState<number | null>(null);

  const q = ARENA[index];
  const answered = answer !== null;
  const pct = Math.round((score / TOTAL) * 100);
  const pass = pct >= PASS;

  /* 3-2-1 countdown before the show starts */
  useEffect(() => {
    if (phase !== "countdown") return;
    const t = window.setTimeout(() => {
      if (count > 0) {
        setCount(count - 1);
        sound.play("drum");
      } else {
        sound.play("fanfare");
        setPhase("play");
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  /* Save the result once the show is over */
  useEffect(() => {
    if (phase !== "results") return;
    completeLevel("L4", pct);
    if (pct >= PASS) addBadge("certificate");
  }, [phase, pct, completeLevel, addBadge]);

  const resetMatch = () => {
    setMatchLeft(null);
    setMatchDone([]);
    setRightDone([]);
    setMatchMistakes(0);
    setWrongRight(null);
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setIndex(0);
    setAnswer(null);
    resetMatch();
    setHost("think");
    setCount(3);
    setName("");
    setPhase("countdown");
    sound.play("drum");
  };

  const finish = (ok: boolean, label: string) => {
    if (answered) return;
    setAnswer({ ok, label });
    if (ok) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setHost("cheer");
      sound.play("correct");
      setBurst((b) => b + 1);
    } else {
      setStreak(0);
      setHost("sad");
      sound.play("wrong");
    }
  };

  const nextQuestion = () => {
    setAnswer(null);
    resetMatch();
    if (index < TOTAL - 1) {
      setIndex((i) => i + 1);
      setHost("think");
    } else {
      setPhase("results");
      sound.play("applause");
      setConfetti((n) => n + 1);
    }
  };

  /* ----- Matching handlers ----- */
  const pickLeft = (i: number) => {
    if (answered || matchDone.includes(i)) return;
    setMatchLeft(i);
    sound.play("click");
  };

  const pickRight = (k: number) => {
    if (q.kind !== "match" || answered || matchLeft === null || rightDone.includes(k)) return;
    const order = q.pairs.map((_, j) => (j + 2) % q.pairs.length);
    if (order[k] === matchLeft) {
      const nextDone = [...matchDone, matchLeft];
      setMatchDone(nextDone);
      setRightDone([...rightDone, k]);
      setMatchLeft(null);
      sound.play("pop");
      if (nextDone.length === q.pairs.length) finish(matchMistakes === 0, "match");
    } else {
      setMatchMistakes((m) => m + 1);
      setWrongRight(k);
      setMatchLeft(null);
      sound.play("bonk");
      window.setTimeout(() => setWrongRight(null), 600);
    }
  };

  /* ----- Question bodies ----- */
  const renderBody = () => {
    if (q.kind === "mc") {
      return (
        <>
          {q.scenario && <p className="mt-5 rounded-2xl bg-gf-blue/10 p-4 text-lg font-semibold italic text-ink">📖 {q.scenario}</p>}
          <p className="mt-5 text-center font-display text-3xl leading-snug sm:text-4xl">{q.prompt}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isRight = i === q.answer;
              const isPick = answer?.label === String(i);
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={answered}
                  onClick={() => finish(isRight, String(i))}
                  className={cn("answer-tile", answered && isRight && "is-right", answered && isPick && !isRight && "is-wrong", answered && !isRight && !isPick && "is-dim")}
                >
                  <span className="letter">{"ABCD"[i]}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (q.kind === "tf") {
      const tfClass = (value: boolean) => {
        if (!answered) return "";
        if (q.answer === value) return "is-hit";
        if (answer?.label === String(value)) return "anim-shake";
        return "is-dim";
      };
      return (
        <>
          <p className="mt-5 text-center font-display text-3xl leading-snug sm:text-4xl">{q.prompt}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
            <button type="button" disabled={answered} onClick={() => finish(q.answer, "true")} className={cn("tf-btn tf-true", tfClass(true))}>
              ✔ TRUE
            </button>
            <button type="button" disabled={answered} onClick={() => finish(!q.answer, "false")} className={cn("tf-btn tf-false", tfClass(false))}>
              ✖ FALSE
            </button>
          </div>
        </>
      );
    }

    if (q.kind === "identify") {
      return (
        <>
          <p className="mt-5 text-center font-display text-3xl leading-snug sm:text-4xl">{q.prompt}</p>
          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-ink/10 bg-white shadow-inner">
            <div className="flex items-center gap-3 bg-gf-purple px-4 py-3 text-white">
              <span className="text-2xl" aria-hidden="true">
                📝
              </span>
              <span className="font-display text-lg">Untitled form</span>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-ink/10 p-3">
              {FORM_TOOLBAR.map((b) => {
                const isTarget = b.label === q.target;
                const isPick = answer?.label === b.label;
                return (
                  <button
                    key={b.label}
                    type="button"
                    disabled={answered}
                    onClick={() => finish(isTarget, b.label)}
                    className={cn("mock-btn", answered && isTarget && "is-right", answered && isPick && !isTarget && "is-wrong")}
                  >
                    <span aria-hidden="true">{b.icon}</span>
                    <span>{b.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2 p-5">
              <div className="h-3 w-2/3 rounded-full bg-ink/10" />
              <div className="h-3 w-1/2 rounded-full bg-ink/10" />
              <div className="h-10 w-full rounded-xl border-2 border-dashed border-ink/20" />
            </div>
          </div>
        </>
      );
    }

    // Matching question
    const order = q.pairs.map((_, j) => (j + 2) % q.pairs.length);
    return (
      <>
        <p className="mt-5 text-center font-display text-3xl leading-snug sm:text-4xl">{q.prompt}</p>
        <p className="mt-2 text-center font-semibold text-ink/70">Tap a feature, then tap its purpose.</p>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <p className="font-display text-sm uppercase tracking-wider text-ink/60">Feature</p>
            {q.pairs.map((p, i) => {
              const done = matchDone.includes(i);
              return (
                <button
                  key={p.feature}
                  type="button"
                  disabled={answered || done}
                  onClick={() => pickLeft(i)}
                  className={cn("answer-tile", done && "is-match", !done && matchLeft === i && "is-selected")}
                >
                  <span className="letter">{i + 1}</span>
                  <span>{p.feature}</span>
                  {done && <span className="ml-auto">✅</span>}
                </button>
              );
            })}
          </div>
          <div className="space-y-3">
            <p className="font-display text-sm uppercase tracking-wider text-ink/60">Purpose</p>
            {order.map((pairIdx, k) => {
              const done = rightDone.includes(k);
              return (
                <button
                  key={q.pairs[pairIdx].purpose}
                  type="button"
                  disabled={answered || done}
                  onClick={() => pickRight(k)}
                  className={cn("answer-tile", done && "is-match", wrongRight === k && "is-wrong")}
                >
                  <span className="letter">{String.fromCharCode(65 + k)}</span>
                  <span>{q.pairs[pairIdx].purpose}</span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const hostLine = !answered
    ? "Think carefully, then tap your answer!"
    : answer.ok
      ? "Correct! Great thinking, Form Master!"
      : "Oops! Read the explanation below.";

  return (
    <LevelFrame
      background="radial-gradient(circle at 50% -10%, rgba(255,230,140,0.35), transparent 45%), linear-gradient(180deg, #1a0b3d 0%, #3b0a4f 55%, #7a1d3a 100%)"
      decor={
        <>
          <div className="spotlight" style={{ left: "6%" }} aria-hidden="true" />
          <div className="spotlight" style={{ right: "6%", animationDelay: "-4s" }} aria-hidden="true" />
          <Decor
            items={[
              { e: "🏆", x: "3%", y: "30%", size: 40 },
              { e: "⭐", x: "94%", y: "20%", size: 32, delay: 1 },
              { e: "🎉", x: "91%", y: "74%", size: 36, delay: 2 },
              { e: "🎯", x: "4%", y: "82%", size: 34, delay: 0.5 },
            ]}
          />
        </>
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 text-white sm:px-6">
        <LevelHeader num={4} title="Digital Forms Challenge" emoji="🎯" color="#fbbc04" onCity={() => nav("city")} />

        {/* ---------- Intro ---------- */}
        {phase === "intro" && (
          <section className="fade-up grid items-center gap-6 lg:grid-cols-2">
            <div className="flex flex-col items-center gap-4">
              <Robot mood="wave" talking size={180} className="anim-bob" />
              <Bubble className="w-full">
                <p className="font-display text-xl sm:text-2xl">
                  Welcome to the Digital Forms Challenge! I'm Quizbot, your game show host. Answer carefully. Are you ready?
                </p>
              </Bubble>
            </div>
            <div className="card-kid space-y-4 p-6 text-ink sm:p-8">
              <span className="chip bg-gf-purple text-white">📖 Quick Review Before the Activity</span>
              <p className="font-display text-2xl sm:text-3xl">Remember Key Form Tools</p>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gf-purple/5 p-3 text-sm font-bold text-ink">
                <span>📋 <strong>Templates:</strong> Ready-made forms</span>
                <span>📤 <strong>Send:</strong> Share by link/email</span>
                <span>📊 <strong>Responses:</strong> Auto charts & answers</span>
                <span>⭐ <strong>Rating / MC:</strong> Question types</span>
              </div>
              <p className="font-display text-xl">🎬 Activity: Digital Forms Game Show</p>
              <ul className="space-y-1.5 text-base font-semibold">
                <li>🔘 Multiple-choice & scenario questions</li>
                <li>✔️ True or False & 🔗 Match feature to purpose</li>
                <li>👆 Find the correct Google Forms button</li>
              </ul>
              <p className="rounded-2xl bg-gf-yellow/25 p-3.5 text-sm font-bold sm:text-base">
                🏆 {TOTAL} questions • Score {PASS}% or more to earn your Form Master Certificate!
              </p>
              <Btn tone="red" size="xl" className="w-full" onClick={startGame}>
                🎬 Start the show!
              </Btn>
              {progress.bestScore.L4 !== undefined && <p className="text-center font-semibold text-ink/70">Your best score so far: {progress.bestScore.L4}%</p>}
            </div>
          </section>
        )}

        {/* ---------- Countdown ---------- */}
        {phase === "countdown" && (
          <section className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <p className="font-display text-xl uppercase tracking-[0.3em] text-gf-yellow">Get ready!</p>
            <p key={count} className="pop-in font-display text-[9rem] leading-none text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.3)]">
              {count > 0 ? count : "GO!"}
            </p>
          </section>
        )}

        {/* ---------- Play ---------- */}
        {phase === "play" && (
          <section className="fade-up space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <Scoreboard label="Score" value={`${score} / ${TOTAL}`} />
              <Scoreboard label="Question" value={`${index + 1} / ${TOTAL}`} />
              <Scoreboard label="Streak" value={`🔥 ${streak}`} />
            </div>
            <ProgressBar value={index + (answered ? 1 : 0)} max={TOTAL} color="#fbbc04" track="rgba(255,255,255,0.2)" height={14} />

            <div className="flex flex-col items-center gap-4 md:flex-row">
              <Robot mood={host} talking={!answered} size={110} className="shrink-0" />
              <Bubble className="w-full">
                <p className="font-display text-xl sm:text-2xl">{hostLine}</p>
              </Bubble>
            </div>

            <div key={index} className={cn("card-kid relative overflow-hidden p-6 text-ink sm:p-8", answer && !answer.ok && "anim-shake")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="chip">
                  Q{index + 1} • {kindLabel(q)}
                </span>
                {streak >= 2 && <span className="chip bg-gf-yellow text-ink">🔥 {streak} in a row!</span>}
              </div>

              {renderBody()}

              <StarBurst trigger={burst} />

              {answer && (
                <div className="mt-6 space-y-4">
                  {answer.ok ? (
                    <Feedback tone="good">🎉 Correct! +1 point</Feedback>
                  ) : (
                    <Feedback tone="bad">❌ Not quite! {revealFor(q)}</Feedback>
                  )}
                  <p className="rounded-2xl bg-ink/5 p-4 text-lg font-semibold">💡 {q.why}</p>
                  <div className="flex justify-end">
                    <Btn tone="yellow" size="lg" onClick={nextQuestion}>
                      {index < TOTAL - 1 ? "Next question ➡️" : "🏆 See my results"}
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------- Results ---------- */}
        {phase === "results" && (
          <section className="fade-up space-y-6">
            <div className="card-kid relative overflow-hidden p-6 text-center text-ink sm:p-10">
              <div className="anim-bob text-7xl" aria-hidden="true">
                {pass ? "🏆" : "💪"}
              </div>
              <h2 className="mt-2 font-display text-4xl">{pass ? "Champion of the Arena!" : "So close, Form Master!"}</h2>
              <p className="mt-2 font-display text-6xl text-gf-purple">
                {score} <span className="text-3xl text-ink/60">/ {TOTAL}</span>
              </p>
              <p className="font-display text-2xl">{pct}%</p>
              <div className="mx-auto mt-4 max-w-md">
                <ProgressBar value={pct} max={100} color={pass ? "#34a853" : "#ea4335"} track="#ece6fb" height={18} />
              </div>
              <p className="mt-4 text-lg font-semibold">
                {pass
                  ? "You scored 70% or more. Your Form Master Certificate is ready below!"
                  : `You need ${PASS}% for the Form Master Certificate. Play again and beat your score!`}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Btn tone="purple" size="lg" onClick={startGame}>
                  🔁 Play again
                </Btn>
                <Btn tone="blue" onClick={() => nav("final")} disabled={!progress.completed.L4}>
                  🏫 Classroom mission
                </Btn>
                <Btn tone="white" onClick={() => nav("city")}>
                  🏙️ City
                </Btn>
              </div>
            </div>

            {pass && (
              <div className="space-y-4">
                <div className="cert print-area mx-auto max-w-3xl rounded-[1.75rem] p-6 text-center text-ink shadow-2xl sm:p-10">
                  <p className="font-display text-sm uppercase tracking-[0.3em] text-gf-purple">Certificate of Achievement</p>
                  <h3 className="mt-2 font-display text-4xl sm:text-5xl">Form Master Certificate</h3>
                  <p className="mt-5 text-lg">This certifies that</p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    placeholder="Type your name here"
                    aria-label="Your name for the certificate"
                    className="no-print mx-auto mt-2 block w-full max-w-md border-b-4 border-gf-purple/40 bg-transparent text-center font-display text-3xl text-ink focus:border-gf-purple focus:outline-none"
                  />
                  <p className="print-only mt-2 font-display text-3xl">{name.trim() || "Form Master"}</p>
                  <p className="mt-5 text-lg">
                    has completed the <strong>Digital Forms Challenge</strong> with a score of <strong>{score} out of {TOTAL}</strong> ({pct}%).
                  </p>
                  <p className="mt-6 font-display text-xl">🎓 Quizbot, Game Show Host</p>
                  <p className="mt-1 text-sm text-ink/60">Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="no-print flex justify-center">
                  <Btn tone="green" onClick={() => window.print()}>
                    🖨️ Print or save certificate
                  </Btn>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      <Confetti trigger={confetti} />
    </LevelFrame>
  );
}

function Scoreboard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-white/25 bg-white/10 px-3 py-2 text-center backdrop-blur">
      <p className="font-display text-xs uppercase tracking-widest text-gf-yellow">{label}</p>
      <p className="font-display text-2xl font-semibold text-white sm:text-3xl">{value}</p>
    </div>
  );
}
