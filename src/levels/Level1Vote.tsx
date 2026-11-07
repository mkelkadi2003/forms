import { useState } from "react";
import { FORM_PARTS_L1, LIKE_CHOICES, VOTE_OPTIONS } from "../data/content";
import { useGame, type Screen, type VoteOption } from "../state/GameContext";
import { sound } from "../lib/audio";
import { Bubble, Btn, Confetti, Decor, Feedback, FloatMsg, LevelFrame, LevelHeader, Robot, Steps, useReady } from "../components/ui";
import { cn } from "../utils/cn";

const STEP_LABELS = ["1. Explain Form", "2. Vote Activity", "3. Live Results", "4. Compare Forms", "5. Quick Quiz"];
const LINES = [
  "First, let's learn what an online form is and explore the parts inside it! Then answer the warm-up question below.",
  "Activity Time! Vote for your favorite school activity! Click one option. Each student votes once.",
  "Look! The online form counted our votes automatically and built this bar chart!",
  "Now let's compare! Tap each card to flip it and learn the difference between Paper Forms and Online Forms.",
  "Activity Time! Use what we just learned to answer this quick question.",
];
const MOODS = ["think", "happy", "cheer", "happy", "think"] as const;

const PAPER_POINTS = ["Answers must be counted manually.", "Paper can get lost.", "Sharing takes more time."];
const ONLINE_POINTS = [
  "Answers are collected automatically.",
  "Results can be viewed quickly.",
  "Forms are easy to share.",
  "People can respond from different devices.",
];

export default function Level1Vote({ nav }: { nav: (s: Screen) => void }) {
  const { progress, castVote, completeLevel, addBadge } = useGame();
  const [step, setStep] = useState(0);
  const [activePart, setActivePart] = useState<string>("title");
  const [exploredParts, setExploredParts] = useState<string[]>(["title"]);
  const [likes, setLikes] = useState<string[]>([]);
  const [myVote, setMyVote] = useState<VoteOption | null>(null);
  const [flips, setFlips] = useState({ paper: false, online: false });
  const [quizPick, setQuizPick] = useState<"paper" | "online" | null>(null);
  const [solved, setSolved] = useState(false);
  const [confetti, setConfetti] = useState(0);

  const selectPart = (id: string) => {
    sound.play("pop");
    setActivePart(id);
    setExploredParts((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const vote = (opt: VoteOption) => {
    if (myVote) return;
    setMyVote(opt);
    castVote(opt);
    sound.play("vote");
    window.setTimeout(() => setStep(2), 1300);
  };

  const answer = (choice: "paper" | "online") => {
    if (solved) return;
    setQuizPick(choice);
    if (choice === "online") {
      setSolved(true);
      completeLevel("L1");
      addBadge("vote");
      sound.play("fanfare");
      setConfetti((n) => n + 1);
    } else {
      sound.play("wrong");
    }
  };

  const currentPart = FORM_PARTS_L1.find((p) => p.id === activePart) ?? FORM_PARTS_L1[0];

  return (
    <LevelFrame
      background="linear-gradient(170deg, #0b6b2e 0%, #34a853 45%, #b9e46b 100%)"
      decor={
        <Decor
          items={[
            { e: "🗳️", x: "3%", y: "18%", size: 46 },
            { e: "⭐", x: "93%", y: "12%", size: 34, delay: 1 },
            { e: "📊", x: "90%", y: "56%", size: 44, delay: 2 },
            { e: "✅", x: "4%", y: "72%", size: 40, delay: 0.5 },
            { e: "🎉", x: "52%", y: "93%", size: 36, delay: 1.5 },
          ]}
        />
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 sm:px-6">
        <LevelHeader num={1} title="Mystery Voting Show" emoji="🗳️" color="#fbbc04" onCity={() => nav("city")}>
          <span className="chip bg-white/90 text-ink">
            🗳️ Votes so far: {progress.votes.games + progress.votes.computers + progress.votes.science + progress.votes.art}
          </span>
        </LevelHeader>

        <Steps labels={STEP_LABELS} current={step} />

        {/* Robot guide */}
        <section className="flex flex-col items-center gap-4 md:flex-row">
          <Robot mood={MOODS[step]} talking size={120} className="shrink-0" />
          <Bubble className="w-full">
            <p className="font-display text-xl font-semibold sm:text-2xl">{LINES[step]}</p>
          </Bubble>
        </section>

        {/* Step 0: Explain what an Online Form is + Warm-Up */}
        {step === 0 && (
          <div className="fade-up space-y-6">
            {/* Interactive Explanation of the Form */}
            <div className="card-kid p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="chip bg-gf-purple text-white">📖 Step 1: Explain the Form First</span>
                <span className="text-sm font-bold text-ink/70">
                  Explored: {exploredParts.length} / {FORM_PARTS_L1.length} parts
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl">What is an Online Form?</h2>
              <p className="mt-1 text-base font-semibold text-ink/80 sm:text-lg">
                An <strong>online form</strong> is a digital page on a computer, tablet, or phone that asks questions and collects people’s answers automatically.{" "}
                <strong>Tap each part of the form below to see what it does!</strong>
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_1fr]">
                {/* Visual Diagram of an Online Form */}
                <div className="rounded-3xl border-4 border-gf-purple/25 bg-gf-purple/5 p-4">
                  <div className="overflow-hidden rounded-2xl border-t-[10px] border-gf-purple bg-white p-4 shadow-md space-y-3">
                    <button
                      type="button"
                      onClick={() => selectPart("title")}
                      className={cn(
                        "w-full rounded-xl border-2 p-3 text-left transition",
                        activePart === "title" ? "border-gf-purple bg-gf-purple/10 ring-2 ring-gf-purple" : "border-ink/10 hover:bg-ink/5"
                      )}
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gf-purple">🏷️ 1. Form Title & Description</span>
                      <p className="font-display text-xl font-bold text-ink">Favorite School Activity Poll</p>
                      <p className="text-xs font-semibold text-ink/70">Tell us which school activity you love most!</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectPart("question")}
                      className={cn(
                        "w-full rounded-xl border-2 p-3 text-left transition",
                        activePart === "question" ? "border-gf-blue bg-gf-blue/10 ring-2 ring-gf-blue" : "border-ink/10 hover:bg-ink/5"
                      )}
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gf-blue">❓ 2. The Question</span>
                      <p className="font-display text-lg font-bold text-ink">What is your favorite school activity?</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectPart("options")}
                      className={cn(
                        "w-full rounded-xl border-2 p-3 text-left transition",
                        activePart === "options" ? "border-gf-green bg-gf-green/10 ring-2 ring-gf-green" : "border-ink/10 hover:bg-ink/5"
                      )}
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gf-green">🔘 3. Answer Choices (Options)</span>
                      <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-sm font-bold text-ink">
                        <span className="rounded-lg bg-white px-2 py-1 shadow-sm">○ 🎮 Playing games</span>
                        <span className="rounded-lg bg-white px-2 py-1 shadow-sm">○ 💻 Using computers</span>
                        <span className="rounded-lg bg-white px-2 py-1 shadow-sm">○ 🔬 Science</span>
                        <span className="rounded-lg bg-white px-2 py-1 shadow-sm">○ 🎨 Art & drawing</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectPart("submit")}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border-2 p-3 text-left transition",
                        activePart === "submit" ? "border-gf-yellow bg-gf-yellow/25 ring-2 ring-gf-yellow" : "border-ink/10 hover:bg-ink/5"
                      )}
                    >
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-ink/70">📤 4. Submit & Auto Results</span>
                        <p className="text-sm font-bold text-ink">Saves your vote & updates the chart!</p>
                      </div>
                      <span className="rounded-xl bg-gf-purple px-3 py-1.5 font-display text-sm font-bold text-white shadow">Submit</span>
                    </button>
                  </div>
                </div>

                {/* Explanation Card + 4 Part Buttons */}
                <div className="flex flex-col justify-between gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    {FORM_PARTS_L1.map((p) => {
                      const isSel = p.id === activePart;
                      const seen = exploredParts.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPart(p.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left font-display text-sm font-semibold transition",
                            isSel ? "border-gf-purple bg-gf-purple text-white shadow-md" : "border-ink/15 bg-white text-ink hover:bg-gf-purple/5"
                          )}
                        >
                          <span className="text-xl" aria-hidden="true">
                            {p.emoji}
                          </span>
                          <span className="flex-1 leading-tight">{p.part}</span>
                          {seen && <span aria-hidden="true">{isSel ? "👀" : "✓"}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div key={currentPart.id} className="pop-in rounded-3xl border-4 border-gf-purple/25 bg-gf-purple/10 p-5">
                    <p className="font-display text-xl font-bold text-gf-purple">
                      {currentPart.emoji} {currentPart.part}
                    </p>
                    <p className="mt-2 text-lg font-bold text-ink">{currentPart.whatItIs}</p>
                    <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-gf-blue">{currentPart.example}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warm-up discussion + Start Voting Activity button */}
            <div className="card-kid p-6 text-center sm:p-8">
              <span className="chip bg-gf-green text-white">💬 Class Warm-Up</span>
              <p className="mt-2 font-display text-2xl sm:text-3xl">Have you ever answered an online quiz or survey?</p>
              <p className="mt-1 text-lg font-semibold text-ink/70">What did you like about it? Tap all that apply.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {LIKE_CHOICES.map((choice) => {
                  const on = likes.includes(choice);
                  return (
                    <button
                      key={choice}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setLikes((prev) => (on ? prev.filter((x) => x !== choice) : [...prev, choice]))}
                      className={cn(
                        "rounded-full border-4 px-5 py-2.5 font-display text-lg font-semibold transition hover:-translate-y-1",
                        on ? "border-gf-green bg-gf-green text-white" : "border-gf-purple/20 bg-white text-ink"
                      )}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              {likes.length > 0 && <Feedback tone="good" className="mx-auto mt-5 max-w-xl">🌟 Great thinking! Now let's try our live class voting form!</Feedback>}
              <div className="mt-6 flex justify-center">
                <Btn tone="green" size="xl" onClick={() => setStep(1)}>
                  🗳️ Let's vote! (Start Activity)
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: vote */}
        {step === 1 && (
          <div className="card-kid fade-up p-6 sm:p-8">
            <div className="mb-3 flex justify-center">
              <span className="chip bg-gf-green text-white">🎮 Interactive Activity 1: Live Class Poll</span>
            </div>
            <p className="text-center font-display text-3xl sm:text-4xl">What is your favorite school activity?</p>
            <p className="mt-1 text-center text-lg font-semibold text-ink/70">Click ONE option to vote.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {VOTE_OPTIONS.map((o) => {
                const picked = myVote === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={myVote !== null}
                    onClick={() => vote(o.id)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 rounded-3xl border-4 p-4 text-center font-display text-lg font-semibold transition sm:text-xl",
                      picked ? "scale-105 text-white shadow-2xl" : "bg-white text-ink shadow-[0_8px_0_rgba(36,22,63,0.12)] hover:-translate-y-1",
                      myVote && !picked && "opacity-40"
                    )}
                    style={picked ? { background: o.color, borderColor: o.color } : { borderColor: o.color }}
                  >
                    <span className="text-5xl transition group-hover:scale-110" aria-hidden="true">
                      {o.emoji}
                    </span>
                    {o.label}
                    {picked && <FloatMsg text="+1 vote!" />}
                  </button>
                );
              })}
            </div>
            {myVote && <Feedback tone="good" className="mt-6">✅ Your vote is counted! Here come the results...</Feedback>}
          </div>
        )}

        {/* Step 2: results chart */}
        {step === 2 && (
          <div className="card-kid fade-up p-6 sm:p-8">
            <p className="text-center font-display text-3xl">📊 Class results</p>
            <VoteChart votes={progress.votes} highlight={myVote} />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Btn
                tone="yellow"
                onClick={() => {
                  setMyVote(null);
                  setStep(1);
                }}
              >
                🙋 Next student votes
              </Btn>
              <Btn tone="green" size="lg" onClick={() => setStep(3)}>
                ➡️ Compare paper and online forms
              </Btn>
            </div>
          </div>
        )}

        {/* Step 3: paper vs online flip cards (Explain first!) */}
        {step === 3 && (
          <div className="fade-up space-y-6">
            <div className="card-kid p-4 text-center">
              <span className="chip bg-gf-purple text-white">📖 Step 2: Explain & Compare</span>
              <p className="mt-1 font-display text-xl text-ink">
                Why do we use <strong>Online Forms</strong> instead of <strong>Paper Forms</strong>? Flip both cards to learn!
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <FlipCard
                emoji="📄"
                label="Paper Forms"
                color="#4285f4"
                flipped={flips.paper}
                onFlip={() => setFlips((f) => ({ ...f, paper: !f.paper }))}
                items={PAPER_POINTS}
              />
              <FlipCard
                emoji="💻"
                label="Online Forms"
                color="#34a853"
                flipped={flips.online}
                onFlip={() => setFlips((f) => ({ ...f, online: !f.online }))}
                items={ONLINE_POINTS}
              />
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="font-display text-xl text-white drop-shadow">
                {flips.paper && flips.online ? "Great! You learned both methods. Ready for the quick activity?" : "Tap both cards to flip them over."}
              </p>
              <Btn tone="green" size="lg" disabled={!(flips.paper && flips.online)} onClick={() => setStep(4)}>
                ❓ Quick question
              </Btn>
            </div>
          </div>
        )}

        {/* Step 4: quick question */}
        {step === 4 && (
          <div className="fade-up space-y-6">
            <div className="card-kid p-6 sm:p-8">
              <div className="mb-3 flex justify-center">
                <span className="chip bg-gf-green text-white">🎮 Activity 2: Quick Check</span>
              </div>
              <p className="text-center font-display text-3xl sm:text-4xl">Which method makes collecting answers faster?</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => answer("paper")}
                  className={cn("answer-tile justify-center text-2xl", quizPick === "paper" && !solved && "is-wrong")}
                >
                  <span className="text-3xl" aria-hidden="true">
                    📄
                  </span>
                  Paper Forms
                </button>
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => answer("online")}
                  className={cn("answer-tile justify-center text-2xl", solved && "is-right")}
                >
                  <span className="text-3xl" aria-hidden="true">
                    💻
                  </span>
                  Online Forms
                </button>
              </div>
              <div className="mt-6 space-y-3">
                {quizPick === "paper" && !solved && <Feedback tone="bad">Not quite! Paper answers must be counted by hand. Try again!</Feedback>}
                {solved && <Feedback tone="good">⭐ Correct! Online forms collect answers automatically, so results show up quickly!</Feedback>}
              </div>
            </div>

            {solved && (
              <div className="card-kid pop-in p-6 text-center sm:p-8">
                <div className="mx-auto mb-2 w-fit text-6xl anim-bob" aria-hidden="true">
                  🏅
                </div>
                <h2 className="font-display text-3xl">Badge earned: Vote Master!</h2>
                <p className="mt-2 text-lg font-semibold text-ink/75">You finished the Mystery Voting Show. Trivia Tower is now open!</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Btn tone="purple" size="lg" onClick={() => nav("L2")}>
                    🏰 Next: Trivia Tower
                  </Btn>
                  <Btn tone="white" onClick={() => nav("city")}>
                    🏙️ Back to City
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Confetti trigger={confetti} />
    </LevelFrame>
  );
}

/* ---------- Animated bar chart of class votes ---------- */
function VoteChart({ votes, highlight }: { votes: Record<VoteOption, number>; highlight: VoteOption | null }) {
  const ready = useReady(80);
  const total = VOTE_OPTIONS.reduce((sum, o) => sum + votes[o.id], 0);
  const max = Math.max(1, ...VOTE_OPTIONS.map((o) => votes[o.id]));
  const leader = VOTE_OPTIONS.reduce((a, b) => (votes[b.id] > votes[a.id] ? b : a));

  return (
    <div className="mt-6">
      <div className="grid grid-cols-4 items-end gap-3 rounded-3xl bg-gradient-to-b from-gf-blue/5 to-gf-purple/10 px-3 pb-2 pt-6 sm:gap-6" style={{ height: 270 }}>
        {VOTE_OPTIONS.map((o) => {
          const count = votes[o.id];
          const pct = total ? Math.round((count / total) * 100) : 0;
          const barHeight = ready ? Math.max(10, (count / max) * 150) : 10;
          const you = highlight === o.id;
          return (
            <div key={o.id} className="flex h-full flex-col items-center justify-end">
              <span className="font-display text-2xl font-semibold">{count}</span>
              <span className="text-sm font-bold text-ink/70">{pct}%</span>
              <div
                className="bar-transition mt-1 w-full max-w-24 rounded-t-2xl"
                style={{
                  height: `${barHeight}px`,
                  background: `linear-gradient(180deg, ${o.color}, ${o.color}bb)`,
                  boxShadow: you ? "0 0 0 4px #24163f" : "inset 0 -6px 0 rgba(0,0,0,0.08)",
                }}
                aria-label={`${o.label}: ${count} votes`}
              />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-3 px-3 pt-3 sm:gap-6">
        {VOTE_OPTIONS.map((o) => (
          <div key={o.id} className="flex flex-col items-center text-center">
            <span className="text-3xl" aria-hidden="true">
              {o.emoji}
            </span>
            <span className="text-sm font-bold leading-tight sm:text-base">{o.label}</span>
            {highlight === o.id && <span className="chip mt-1 bg-ink text-white">You!</span>}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-semibold text-ink/80">
        Total votes: <strong>{total}</strong> • Most popular right now: <strong>{leader.emoji} {leader.label}</strong>
      </p>
    </div>
  );
}

/* ---------- Flip card for the paper vs online comparison ---------- */
function FlipCard({
  emoji,
  label,
  color,
  flipped,
  onFlip,
  items,
}: {
  emoji: string;
  label: string;
  color: string;
  flipped: boolean;
  onFlip: () => void;
  items: string[];
}) {
  return (
    <div className="w-full" style={{ height: 340 }}>
      <button type="button" onClick={onFlip} aria-pressed={flipped} aria-label={`${label} card. Tap to flip.`} className="flip-wrap block h-full w-full text-left">
        <div className={cn("flip-inner", flipped && "is-flipped")}>
          <div className="flip-face card-kid flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ borderTop: `12px solid ${color}` }}>
            <span className="anim-bob text-7xl" aria-hidden="true">
              {emoji}
            </span>
            <p className="font-display text-3xl">{label}</p>
            <span className="chip">👆 Tap to flip</span>
          </div>
          <div className="flip-face flip-back card-kid flex flex-col justify-center p-6" style={{ borderTop: `12px solid ${color}` }}>
            <p className="font-display text-2xl">
              {emoji} {label}
            </p>
            <ul className="mt-4 space-y-3 text-lg font-semibold">
              {items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-gf-green" aria-hidden="true">
                    ✔
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <span className="chip mt-5 self-start">↩ Tap to flip back</span>
          </div>
        </div>
      </button>
    </div>
  );
}
