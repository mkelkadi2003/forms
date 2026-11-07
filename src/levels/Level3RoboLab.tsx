import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { NEW_RESPONSES, ROBO_ACTIVITIES, ROBOLAB_FORM_GUIDE, SAMPLE_RESPONSES, TEMPLATES, type SampleResponse } from "../data/content";
import { useGame, type Screen } from "../state/GameContext";
import { sound } from "../lib/audio";
import { Bubble, Btn, Confetti, Decor, Feedback, LevelFrame, LevelHeader, Modal, Robot, useReady } from "../components/ui";
import { cn } from "../utils/cn";

type QType = "short" | "mc" | "rating";
interface FormQ {
  id: number;
  type: QType;
  text: string;
  options: string[];
}
interface Draft {
  title: string;
  description: string;
  questions: FormQ[];
}

const STARTER: Draft = {
  title: "Event Feedback",
  description: "",
  questions: [{ id: 1, type: "short", text: "What did you think of the event?", options: [] }],
};

const DEMO_LINK = "practice-link/robochallenge-feedback";
const MISSION_TITLES = ["Choose a Template", "Customize Your Form", "Publish & Share", "Review Responses"];
const MISSION_LINES = [
  "ROBOT ALERT! The RoboChallenge school event needs your help! The organizers want to know what students thought about the event. Your mission is to create a feedback form.",
  "Now customize your form! Change the title, write a description, add a multiple-choice question and a rating question. Then preview it!",
  "Your form is ready! Publish it and share it using the safe method your teacher approves.",
  "Responses are coming in! Let's review them together. Which robotics activity is the most popular?",
];
const MOODS = ["wave", "think", "cheer", "happy"] as const;
const ACTIVITY_COLORS = ["#34a853", "#4285f4", "#fbbc04", "#ea4335"];
const RATING_COLORS = ["#ea4335", "#f29900", "#fbbc04", "#7cb342", "#34a853"];

let idCounter = 10;
const nextId = () => {
  idCounter += 1;
  return idCounter;
};

export default function Level3RoboLab({ nav }: { nav: (s: Screen) => void }) {
  const { progress, setMissionDone, completeLevel, addBadge } = useGame();
  const [mission, setMission] = useState(() => {
    const firstOpen = progress.missions.findIndex((m) => !m);
    return firstOpen === -1 ? 3 : firstOpen;
  });
  const [draft, setDraft] = useState<Draft>(STARTER);
  const [templateId, setTemplateId] = useState<string | null>(progress.missions[0] ? "feedback" : null);
  const [wrongTpl, setWrongTpl] = useState<string | null>(null);
  const [tplMsg, setTplMsg] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const [previewed, setPreviewed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [respTab, setRespTab] = useState<"questions" | "responses">("questions");
  const [responses, setResponses] = useState<SampleResponse[]>(SAMPLE_RESPONSES);
  const [newIndex, setNewIndex] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [guideIdx, setGuideIdx] = useState<number>(0);

  const mcOk = draft.questions.some((q) => q.type === "mc" && q.text.trim() !== "" && q.options.filter((o) => o.trim() !== "").length >= 2);
  const ratingOk = draft.questions.some((q) => q.type === "rating" && q.text.trim() !== "");
  const checks = [
    { label: 'Title is “RoboChallenge”', ok: draft.title.trim().toLowerCase() === "robochallenge" },
    { label: "Description has 10 or more letters", ok: draft.description.trim().length >= 10 },
    { label: "Multiple-choice question with 2+ options", ok: mcOk },
    { label: "Rating-scale question added", ok: ratingOk },
    { label: "Form previewed", ok: previewed },
  ];
  const editorReady = checks.every((c) => c.ok);
  const allMissions = progress.missions.every(Boolean);

  // Play the attention-grabbing Robot Alert sound when the Robot Alert mission appears
  useEffect(() => {
    if (mission !== 0) return;
    const t = window.setTimeout(() => sound.play("alert"), 320);
    return () => window.clearTimeout(t);
  }, [mission]);

  /* ----- Mission 1 ----- */
  const chooseTemplate = (id: string) => {
    if (id !== "feedback") {
      sound.play("alert");
      setWrongTpl(id);
      setTplMsg("Almost! Look for the template that collects what people THINK about an event.");
      return;
    }
    setTplMsg("");
    if (templateId !== id) setDraft(STARTER);
    setTemplateId(id);
    setMissionDone(0, true);
    sound.play("fanfare");
    setConfetti((n) => n + 1);
  };

  /* ----- Mission 2 ----- */
  const openPreview = () => {
    setEditorTab("preview");
    setPreviewed(true);
    sound.play("pop");
  };

  /* ----- Mission 3 ----- */
  const finishShare = () => {
    setPublished(true);
    setShareOpen(false);
    setMissionDone(2, true);
    sound.play("fanfare");
    setConfetti((n) => n + 1);
  };

  const copyDemo = () => {
    try {
      void navigator.clipboard.writeText(DEMO_LINK).catch(() => undefined);
    } catch {
      /* clipboard not available in this browser */
    }
    setCopied(true);
    sound.play("click");
  };

  /* ----- Mission 4 ----- */
  const openResponses = () => {
    setRespTab("responses");
    setMissionDone(3, true);
    sound.play("ding");
  };

  const addResponse = () => {
    const next = NEW_RESPONSES[newIndex % NEW_RESPONSES.length];
    setResponses((r) => [...r, { ...next, who: `Robo Fan #${r.length + 1}` }]);
    setNewIndex((i) => i + 1);
    sound.play("pop");
  };

  const claimBadge = () => {
    completeLevel("L3");
    addBadge("robo");
    sound.play("badge");
    setConfetti((n) => n + 1);
  };

  return (
    <LevelFrame
      background="linear-gradient(160deg, #0b2a6f 0%, #1a56c4 50%, #23a6c1 100%)"
      decor={
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
            aria-hidden="true"
          />
          <Decor
            items={[
              { e: "⚙️", x: "3%", y: "22%", size: 44 },
              { e: "🔧", x: "93%", y: "14%", size: 34, delay: 1 },
              { e: "💡", x: "91%", y: "62%", size: 40, delay: 2 },
              { e: "🧩", x: "3%", y: "78%", size: 36, delay: 0.5 },
            ]}
          />
        </>
      }
    >
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pt-6 text-white sm:px-6">
        <LevelHeader num={3} title="RoboChallenge Form Design Lab" emoji="🤖" color="#fbbc04" onCity={() => nav("city")}>
          <span className="chip bg-white text-ink">Missions done: {progress.missions.filter(Boolean).length}/4</span>
        </LevelHeader>

        {/* Learning simulation banner */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gf-yellow px-5 py-3 font-bold text-ink shadow-lg">
          <span className="text-2xl" aria-hidden="true">
            🧪
          </span>
          <p className="flex-1 text-base sm:text-lg">
            LEARNING SIMULATION – practice only. You will create your real Google Form at <strong>forms.google.com</strong> during class.
          </p>
        </div>

        {/* Mission tabs */}
        <nav className="grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="RoboLab missions">
          {MISSION_TITLES.map((title, i) => {
            const done = progress.missions[i];
            const unlocked = i === 0 || progress.missions[i - 1] || done;
            const active = mission === i;
            return (
              <button
                key={title}
                type="button"
                disabled={!unlocked}
                onClick={() => setMission(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "rounded-2xl border-4 px-3 py-3 text-left font-display transition",
                  active ? "border-gf-yellow bg-white text-ink shadow-xl" : "border-white/30 bg-white/15 text-white hover:bg-white/25",
                  !unlocked && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="block text-sm font-semibold">
                  Mission {i + 1} {done ? "✅" : unlocked ? "" : "🔒"}
                </span>
                <span className="block text-base leading-tight sm:text-lg">{title}</span>
              </button>
            );
          })}
        </nav>

        {/* Flashing ROBOT ALERT banner on Mission 1 */}
        {mission === 0 && (
          <div className="alert-light flex flex-wrap items-center justify-between gap-3 rounded-3xl border-4 border-white bg-gf-red px-5 py-3.5 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="anim-bob text-3xl" aria-hidden="true">
                🚨
              </span>
              <div>
                <p className="font-display text-xl font-bold uppercase tracking-wider sm:text-2xl">ROBOT ALERT! Incoming Mission!</p>
                <p className="text-sm font-semibold text-white/90 sm:text-base">
                  The RoboChallenge school event needs your help to build a feedback form!
                </p>
              </div>
            </div>
            <Btn tone="yellow" size="sm" onClick={() => sound.play("alert")}>
              🔊 Sound Alert
            </Btn>
          </div>
        )}

        {/* Interactive Form Parts Explainer (Explain the things in the form first!) */}
        <section className="card-kid p-5 text-ink sm:p-6" aria-label="Google Form parts explanation">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="chip bg-gf-purple text-white">📖 Explain the Parts of a Google Form First</span>
            <span className="text-xs font-bold text-ink/70 sm:text-sm">Tap any part below to explain what it does before doing the activity!</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROBOLAB_FORM_GUIDE.map((g, i) => (
              <button
                key={g.part}
                type="button"
                onClick={() => {
                  sound.play("pop");
                  setGuideIdx(i);
                }}
                className={cn(
                  "rounded-2xl border-2 px-3 py-2 font-display text-xs font-bold transition sm:text-sm",
                  guideIdx === i ? "border-gf-purple bg-gf-purple text-white shadow-md" : "border-ink/15 bg-ink/5 text-ink hover:bg-gf-purple/10"
                )}
              >
                {g.emoji} {g.part}
              </button>
            ))}
          </div>
          <div key={guideIdx} className="pop-in mt-3 grid gap-3 rounded-2xl border-2 border-gf-purple/25 bg-gf-purple/10 p-4 md:grid-cols-2">
            <div>
              <p className="font-display text-base font-bold text-gf-purple sm:text-lg">
                {ROBOLAB_FORM_GUIDE[guideIdx].emoji} What is {ROBOLAB_FORM_GUIDE[guideIdx].part}?
              </p>
              <p className="mt-1 text-sm font-bold text-ink sm:text-base">{ROBOLAB_FORM_GUIDE[guideIdx].whatItDoes}</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="font-display text-xs font-bold uppercase tracking-wider text-gf-blue">🎮 How we use it in our activity</p>
              <p className="mt-1 text-sm font-bold text-ink sm:text-base">{ROBOLAB_FORM_GUIDE[guideIdx].howToUse}</p>
            </div>
          </div>
        </section>

        {/* Robot guide */}
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Robot mood={MOODS[mission]} talking size={110} className="shrink-0" />
          <Bubble className="w-full text-ink">
            <p className="font-display text-xl sm:text-2xl">{MISSION_LINES[mission]}</p>
          </Bubble>
        </div>

        {/* ---------- Mission 1: templates ---------- */}
        {mission === 0 && (
          <section className="fade-up card-kid p-6 text-ink sm:p-8">
            <div className="mb-4 rounded-2xl border-l-8 border-gf-purple bg-gf-purple/10 p-4">
              <p className="font-display text-lg font-bold text-gf-purple">📖 Explain First: What is a Template?</p>
              <p className="mt-1 text-base font-semibold text-ink">
                A <strong>template</strong> is a ready-made form design in the Google Forms Template Gallery. Instead of starting from a blank page, we pick{" "}
                <strong>Event Feedback</strong> to ask students what they thought about the RoboChallenge event!
              </p>
            </div>
            <span className="chip bg-gf-green text-white">🎮 Activity 1: Pick the Correct Template</span>
            <h2 className="mt-2 font-display text-3xl">Mission 1: Choose a template</h2>
            <p className="mt-1 text-lg font-semibold text-ink/75">Click the template that collects what people think about an event.</p>
            {tplMsg && (
              <Feedback tone="bad" className="mt-4">
                {tplMsg}
              </Feedback>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {TEMPLATES.map((t) => {
                const chosen = templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => chooseTemplate(t.id)}
                    onAnimationEnd={() => setWrongTpl(null)}
                    className={cn(
                      "group flex flex-col items-start gap-2 rounded-3xl border-4 p-4 text-left transition hover:-translate-y-1 hover:shadow-xl",
                      chosen ? "glow-good border-gf-green bg-gf-green/10 shadow-xl" : "border-gf-blue/20 bg-white",
                      wrongTpl === t.id && "anim-shake border-gf-red"
                    )}
                  >
                    <span className="text-5xl transition group-hover:scale-110" aria-hidden="true">
                      {t.emoji}
                    </span>
                    <span className="font-display text-xl leading-tight">{t.name}</span>
                    <span className="text-sm font-semibold text-ink/70">{t.blurb}</span>
                  </button>
                );
              })}
            </div>
            {templateId === "feedback" && (
              <div className="mt-6 space-y-4">
                <Feedback tone="good">🎉 Template selected: Event Feedback! Great choice, Form Master!</Feedback>
                <div className="flex justify-end">
                  <Btn tone="green" size="lg" onClick={() => setMission(1)}>
                    Next: Customize ➡️
                  </Btn>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ---------- Mission 2: customize ---------- */}
        {mission === 1 && (
          <section className="fade-up grid gap-6 lg:grid-cols-[1fr_19rem]">
            <div className="card-kid overflow-hidden text-ink">
              <div className="h-3 bg-gf-purple" />
              <div className="space-y-5 p-5 sm:p-6">
                <div className="rounded-2xl border-l-8 border-gf-blue bg-gf-blue/10 p-4">
                  <p className="font-display text-lg font-bold text-gf-blue">📖 Explain First: Parts Inside the Form Editor</p>
                  <ul className="mt-1.5 grid gap-1.5 text-sm font-bold text-ink sm:grid-cols-2">
                    <li>🏷️ <strong>Title:</strong> Top heading (type <em>RoboChallenge</em>)</li>
                    <li>📝 <strong>Description:</strong> Explains why we need answers</li>
                    <li>🔘 <strong>Multiple Choice:</strong> Pick 1 favorite robotics activity</li>
                    <li>⭐ <strong>Rating Scale & 👀 Preview:</strong> Rate 1–5 stars & test the form!</li>
                  </ul>
                </div>
                <div className="flex gap-2 rounded-2xl bg-ink/5 p-1" role="tablist" aria-label="Editor view">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={editorTab === "edit"}
                    onClick={() => setEditorTab("edit")}
                    className={cn(
                      "flex-1 rounded-xl px-4 py-2 font-display text-lg transition",
                      editorTab === "edit" ? "bg-white font-semibold text-gf-purple shadow" : "text-ink/70"
                    )}
                  >
                    ✏️ Edit form
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={editorTab === "preview"}
                    onClick={openPreview}
                    className={cn(
                      "flex-1 rounded-xl px-4 py-2 font-display text-lg transition",
                      editorTab === "preview" ? "bg-white font-semibold text-gf-purple shadow" : "text-ink/70"
                    )}
                  >
                    👀 Preview form
                  </button>
                </div>

                {editorTab === "edit" ? <EditorPanel draft={draft} setDraft={setDraft} /> : <FormPreview draft={draft} />}
              </div>
            </div>

            <aside className="card-kid h-fit p-5 text-ink">
              <p className="font-display text-xl">✅ Mission checklist</p>
              <ul className="mt-4 space-y-3">
                {checks.map((c) => (
                  <li key={c.label} className={cn("flex items-start gap-3 rounded-2xl p-3 font-semibold", c.ok ? "bg-gf-green/15" : "bg-ink/5")}>
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white",
                        c.ok ? "bg-gf-green" : "bg-ink/25"
                      )}
                      aria-hidden="true"
                    >
                      {c.ok ? "✓" : ""}
                    </span>
                    <span>{c.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {editorReady ? (
                  <Btn
                    tone="green"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setMissionDone(1, true);
                      setMission(2);
                    }}
                  >
                    Next: Publish ➡️
                  </Btn>
                ) : (
                  <p className="text-sm font-semibold text-ink/70">Finish every checklist item to unlock the next mission.</p>
                )}
              </div>
              <details className="mt-5 rounded-2xl bg-gf-blue/10 p-3 text-sm font-semibold">
                <summary className="cursor-pointer font-display text-base">💡 Need help?</summary>
                <p className="mt-2">Try the suggested questions in the “Add a question” box. Type your own answer choices, too!</p>
              </details>
            </aside>
          </section>
        )}

        {/* ---------- Mission 3: publish & share ---------- */}
        {mission === 2 && (
          <section className="fade-up grid gap-6 md:grid-cols-[1.1fr_1fr]">
            <div className="card-kid space-y-4 p-6 text-ink sm:p-8">
              <span className="chip">Form ready</span>
              <h2 className="font-display text-3xl">{draft.title || "Untitled form"}</h2>
              <p className="text-lg">{draft.description || "No description yet."}</p>
              <p className="font-semibold text-ink/70">{draft.questions.length} questions • Answers go to the Responses tab</p>
              <Btn tone="green" size="xl" onClick={() => setShareOpen(true)}>
                🚀 Send / Publish
              </Btn>
              {published && (
                <div className="space-y-4">
                  <Feedback tone="good">🎉 Published! Your form is ready to share (simulation).</Feedback>
                  <div className="flex justify-end">
                    <Btn tone="blue" onClick={() => setMission(3)}>
                      Next: Responses ➡️
                    </Btn>
                  </div>
                </div>
              )}
            </div>
            <div className="card-kid space-y-4 p-6 text-ink sm:p-8">
              <p className="font-display text-2xl">📣 How forms are shared</p>
              <p className="text-lg">Google Forms can be shared with others using supported sharing options, such as email or a link.</p>
              <div className="rounded-2xl bg-gf-blue/10 p-4 font-semibold">
                🔒 This is a safe classroom simulation. No real emails are sent and no student email addresses are collected.
              </div>
              <p className="font-semibold text-ink/75">In class, your teacher will show you the approved sharing method.</p>
            </div>
          </section>
        )}

        {/* ---------- Mission 4: responses ---------- */}
        {mission === 3 && (
          <section className="fade-up space-y-6">
            <div className="card-kid p-4 text-ink">
              <p className="font-display text-lg font-bold text-gf-purple">📖 Explain First: What is the Responses Tab?</p>
              <p className="mt-1 text-sm font-semibold text-ink/85 sm:text-base">
                Next to the <strong>Questions</strong> tab is the <strong>📊 Responses</strong> tab. Google Forms automatically counts every student’s answer and turns them into a{" "}
                <strong>Bar Chart</strong> (for favorite activities) and a <strong>Pie Chart</strong> (for star ratings)! Now click <strong>Responses</strong> below to try it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-2xl bg-white/15 p-1.5" role="tablist" aria-label="Form tabs">
              <button
                type="button"
                role="tab"
                aria-selected={respTab === "questions"}
                onClick={() => setRespTab("questions")}
                className={cn("flex-1 rounded-xl px-4 py-2 font-display text-lg", respTab === "questions" ? "bg-white text-ink shadow" : "text-white/90")}
              >
                ❓ Questions
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={respTab === "responses"}
                onClick={openResponses}
                className={cn("flex-1 rounded-xl px-4 py-2 font-display text-lg", respTab === "responses" ? "bg-white text-ink shadow" : "text-white/90")}
              >
                📊 Responses ({responses.length})
              </button>
            </div>

            {respTab === "questions" ? (
              <div className="card-kid space-y-4 p-6 text-ink sm:p-8">
                <p className="font-display text-2xl">{draft.title || "RoboChallenge"}</p>
                <ol className="list-decimal space-y-2 pl-6 text-lg font-semibold">
                  {draft.questions.map((q) => (
                    <li key={q.id}>
                      {q.text || "Untitled question"}{" "}
                      <span className="text-ink/60">({q.type === "mc" ? "multiple choice" : q.type === "rating" ? "rating" : "short answer"})</span>
                    </li>
                  ))}
                </ol>
                <Btn tone="purple" size="lg" onClick={openResponses}>
                  📊 Open the Responses tab
                </Btn>
              </div>
            ) : (
              <ResponsesView responses={responses} onAdd={addResponse} />
            )}

            {allMissions && !progress.completed.L3 && (
              <div className="card-kid pop-in space-y-3 p-6 text-center text-ink sm:p-8">
                <div className="anim-bob text-6xl" aria-hidden="true">
                  🏅
                </div>
                <h3 className="font-display text-3xl">All 4 missions complete!</h3>
                <p className="text-lg font-semibold">Claim your badge to open the Game Show Arena.</p>
                <Btn tone="yellow" size="xl" onClick={claimBadge}>
                  🏅 Claim your badge
                </Btn>
              </div>
            )}

            {progress.completed.L3 && (
              <div className="card-kid pop-in space-y-4 p-6 text-center text-ink sm:p-8">
                <p className="text-5xl" aria-hidden="true">
                  🤖🏅
                </p>
                <h3 className="font-display text-3xl">Badge earned: RoboChallenge Form Creator!</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <Btn tone="red" size="lg" onClick={() => nav("L4")}>
                    🎯 Next: Game Show Arena
                  </Btn>
                  <Btn tone="white" onClick={() => nav("city")}>
                    🏙️ City
                  </Btn>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Share dialog (simulation only) */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="🚀 Share your form (practice)" maxWidth="max-w-3xl">
        <p className="text-lg font-semibold">Google Forms can be shared with others using supported sharing options, such as email or a link.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-gf-blue/10 p-5">
            <p className="font-display text-xl">📧 Email</p>
            <p className="mt-1 text-sm font-semibold text-ink/75">Your teacher sends the form to the approved class list only.</p>
            <Btn tone="blue" className="mt-4 w-full" onClick={finishShare}>
              Send practice email
            </Btn>
          </div>
          <div className="rounded-3xl bg-gf-green/10 p-5">
            <p className="font-display text-xl">🔗 Link</p>
            <p className="mt-1 text-sm font-semibold text-ink/75">Your teacher shares one safe class link.</p>
            <p className="mt-3 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm">{DEMO_LINK}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn tone="white" size="sm" onClick={copyDemo}>
                {copied ? "✅ Copied (practice)" : "📋 Copy link"}
              </Btn>
              <Btn tone="green" size="sm" onClick={finishShare}>
                Share link
              </Btn>
            </div>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-gf-yellow/25 p-4 text-sm font-semibold">
          🔒 Safe classroom simulation: no real emails are sent and no student email addresses are collected.
        </p>
      </Modal>

      <Confetti trigger={confetti} />
    </LevelFrame>
  );
}

/* ============================================================
   Simulated form editor
   ============================================================ */
function EditorPanel({ draft, setDraft }: { draft: Draft; setDraft: Dispatch<SetStateAction<Draft>> }) {
  const addQuestion = (type: QType, text = "", options: string[] = ["Option 1", "Option 2"]) => {
    const q: FormQ = { id: nextId(), type, text, options: type === "mc" ? options : [] };
    setDraft((d) => ({ ...d, questions: [...d.questions, q] }));
    sound.play("pop");
  };

  const replaceQuestion = (next: FormQ) => {
    setDraft((d) => ({ ...d, questions: d.questions.map((q) => (q.id === next.id ? next : q)) }));
  };

  const removeQuestion = (id: number) => {
    setDraft((d) => ({ ...d, questions: d.questions.filter((q) => q.id !== id) }));
  };

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="font-display text-sm font-semibold uppercase tracking-wider text-gf-purple">Form title</span>
        <input
          value={draft.title}
          maxLength={40}
          placeholder="Type your form title"
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="mt-1 w-full rounded-2xl border-4 border-gf-purple/20 bg-white px-4 py-3 font-display text-3xl text-ink focus:border-gf-purple focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="font-display text-sm font-semibold uppercase tracking-wider text-gf-purple">Form description</span>
        <textarea
          value={draft.description}
          rows={3}
          maxLength={200}
          placeholder="Tell people why their answers matter. For example: Help us plan the next robot event!"
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          className="mt-1 w-full resize-none rounded-2xl border-4 border-gf-purple/20 bg-white px-4 py-3 text-lg font-semibold text-ink focus:border-gf-purple focus:outline-none"
        />
      </label>

      <div className="space-y-4">
        {draft.questions.map((q, i) => (
          <QuestionEditor key={q.id} index={i} q={q} onChange={replaceQuestion} onDelete={() => removeQuestion(q.id)} />
        ))}
      </div>

      <div className="rounded-2xl bg-gf-blue/10 p-4">
        <p className="font-display text-lg">➕ Add a question</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn tone="blue" size="sm" onClick={() => addQuestion("mc")}>
            🔘 Multiple choice
          </Btn>
          <Btn tone="green" size="sm" onClick={() => addQuestion("rating")}>
            ⭐ Rating scale
          </Btn>
          <Btn tone="white" size="sm" onClick={() => addQuestion("short")}>
            ✏️ Short answer
          </Btn>
        </div>
        <p className="mt-4 text-sm font-bold text-ink/70">💡 Suggested questions (tap to add):</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="chip-btn" onClick={() => addQuestion("mc", "What was your favorite robotics activity?", [...ROBO_ACTIVITIES])}>
            What was your favorite robotics activity?
          </button>
          <button type="button" className="chip-btn" onClick={() => addQuestion("rating", "How would you rate the event?")}>
            How would you rate the event?
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionEditor({ index, q, onChange, onDelete }: { index: number; q: FormQ; onChange: (next: FormQ) => void; onDelete: () => void }) {
  const label = q.type === "mc" ? "Multiple choice" : q.type === "rating" ? "Rating scale" : "Short answer";
  const setOption = (i: number, value: string) => onChange({ ...q, options: q.options.map((o, j) => (j === i ? value : o)) });
  const addOption = () => onChange({ ...q, options: [...q.options, `Option ${q.options.length + 1}`] });
  const removeOption = (i: number) => onChange({ ...q, options: q.options.filter((_, j) => j !== i) });

  return (
    <div className="rounded-3xl border-4 border-gf-purple/15 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="chip">
          Question {index + 1} • {label}
        </span>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete question ${index + 1}`}
          className="rounded-full bg-gf-red/10 px-3 py-1 text-sm font-bold text-gf-red hover:bg-gf-red/20"
        >
          🗑️ Delete
        </button>
      </div>
      <input
        value={q.text}
        placeholder="Type your question here"
        onChange={(e) => onChange({ ...q, text: e.target.value })}
        className="mt-3 w-full rounded-xl border-2 border-ink/15 px-3 py-2 text-lg font-semibold text-ink focus:border-gf-blue focus:outline-none"
      />

      {q.type === "mc" && (
        <div className="mt-3 space-y-2">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gf-blue" aria-hidden="true" />
              <input
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => setOption(i, e.target.value)}
                className="flex-1 rounded-lg border-2 border-ink/10 px-3 py-1.5 font-semibold text-ink focus:border-gf-blue focus:outline-none"
              />
              {q.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  aria-label={`Remove option ${i + 1}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink/60 hover:bg-ink/10"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {q.options.length < 5 && (
            <button type="button" onClick={addOption} className="text-sm font-bold text-gf-blue hover:underline">
              + Add option
            </button>
          )}
        </div>
      )}

      {q.type === "short" && <div className="mt-3 border-b-2 border-dashed border-ink/30 px-1 py-2 font-semibold text-ink/50">Short answer text</div>}
      {q.type === "rating" && (
        <div className="mt-3 flex gap-1 text-3xl" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n}>⭐</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Interactive preview (what respondents will see)
   ============================================================ */
function FormPreview({ draft }: { draft: Draft }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-4">
      <p className="chip">👀 Preview – this is what people will see</p>
      <div className="rounded-3xl border-4 border-gf-purple/20 bg-gf-purple/5 p-4 sm:p-6">
        <div className="space-y-5 rounded-2xl border-t-[12px] border-gf-purple bg-white p-5 shadow-md sm:p-7">
          <h3 className="break-words font-display text-3xl">{draft.title || "Untitled form"}</h3>
          {draft.description && <p className="text-lg font-semibold text-ink/80">{draft.description}</p>}

          {draft.questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl border-2 border-ink/10 p-4">
              <p className="font-display text-xl">
                {i + 1}. {q.text || "Untitled question"}
              </p>

              {q.type === "short" && (
                <input
                  value={texts[q.id] ?? ""}
                  onChange={(e) => setTexts((t) => ({ ...t, [q.id]: e.target.value }))}
                  placeholder="Your answer"
                  className="mt-3 w-full border-b-2 border-gf-blue/40 bg-transparent px-1 py-2 text-lg text-ink focus:border-gf-blue focus:outline-none"
                />
              )}

              {q.type === "mc" && (
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, j) => (
                    <label key={j} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-lg hover:bg-gf-blue/10">
                      <input
                        type="radio"
                        name={`preview-q-${q.id}`}
                        checked={picks[q.id] === j}
                        onChange={() => setPicks((p) => ({ ...p, [q.id]: j }))}
                        className="h-5 w-5 accent-gf-blue"
                      />
                      <span>{opt || `Option ${j + 1}`}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "rating" && (
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={q.text || "Rating"}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={(picks[q.id] ?? 0) === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => setPicks((p) => ({ ...p, [q.id]: n }))}
                      className={cn("text-4xl transition hover:scale-110", (picks[q.id] ?? 0) >= n ? "" : "opacity-40 grayscale")}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2">
            {submitted ? (
              <Feedback tone="good">✅ Thank you! This is only practice, so your answers were not saved.</Feedback>
            ) : (
              <Btn tone="blue" onClick={() => setSubmitted(true)}>
                Submit
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Responses tab: summary, bar chart, pie chart, list
   ============================================================ */
function ResponsesView({ responses, onAdd }: { responses: SampleResponse[]; onAdd: () => void }) {
  const total = responses.length;
  const avg = total ? responses.reduce((s, r) => s + r.rating, 0) / total : 0;
  const byActivity = ROBO_ACTIVITIES.map((a) => ({ label: a, value: responses.filter((r) => r.activity === a).length }));
  const topActivity = byActivity.reduce((best, cur) => (cur.value > best.value ? cur : best), byActivity[0]);
  const byRating = [1, 2, 3, 4, 5].map((n) => ({
    label: `${n} ⭐`,
    value: responses.filter((r) => r.rating === n).length,
    color: RATING_COLORS[n - 1],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="Responses" value={String(total)} />
        <SummaryTile label="Average rating" value={`${avg.toFixed(1)} ⭐`} />
        <SummaryTile label="Top activity" value={topActivity.label} small />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-kid p-5 text-ink sm:p-6">
          <p className="font-display text-xl">Favorite robotics activity</p>
          <BarChart data={byActivity} colors={ACTIVITY_COLORS} />
        </div>
        <div className="card-kid p-5 text-ink sm:p-6">
          <p className="font-display text-xl">Event ratings</p>
          <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
            <PieChart data={byRating} />
            <ul className="space-y-1.5 text-base font-semibold">
              {byRating.map((d) => (
                <li key={d.label} className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                  {d.label}: {d.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card-kid p-5 text-ink sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-xl">Individual responses</p>
          <p className="text-sm font-semibold text-ink/70">Practice data only: no names or email addresses</p>
        </div>
        <ul className="mt-3 max-h-60 divide-y divide-ink/10 overflow-y-auto pr-2">
          {responses.map((r, i) => (
            <li key={`${r.who}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-base">
              <span className="font-bold">{r.who}</span>
              <span className="font-semibold">{r.activity}</span>
              <span aria-label={`${r.rating} stars`}>{"⭐".repeat(r.rating)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/15 p-4">
        <p className="font-semibold">Google Forms organizes responses automatically. Watch the charts update!</p>
        <Btn tone="green" onClick={onAdd}>
          📥 Simulate a new response
        </Btn>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-3xl bg-white p-4 text-center text-ink shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{label}</p>
      <p className={cn("font-display font-semibold text-gf-purple", small ? "text-lg sm:text-xl" : "text-3xl")}>{value}</p>
    </div>
  );
}

function BarChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const ready = useReady(80);
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="mt-4 flex h-72 items-end justify-around gap-3">
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full w-full max-w-28 flex-col items-center justify-end">
          <span className="font-display text-xl font-semibold">{d.value}</span>
          <div
            className="bar-transition mt-1 w-full rounded-t-2xl"
            style={{ height: ready ? `${d.value ? Math.max(8, (d.value / max) * 180) : 0}px` : "0px", background: colors[i % colors.length] }}
            aria-label={`${d.label}: ${d.value}`}
          />
          <span className="mt-2 text-center text-sm font-bold leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const ready = useReady(80);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 90;
  const cy = 90;
  const r = 80;
  let angle = -Math.PI / 2;

  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const frac = d.value / total;
      const start = angle;
      const end = angle + frac * Math.PI * 2;
      angle = end;
      return { ...d, frac, path: frac >= 0.999 ? null : arcPath(cx, cy, r, start, end) };
    });

  return (
    <svg viewBox="0 0 180 180" className="h-48 w-48 shrink-0" role="img" aria-label="Pie chart of event ratings">
      {ready && total > 0 && (
        <g key={total} className="pie-in">
          {slices.map((s) =>
            s.path ? (
              <path key={s.label} d={s.path} fill={s.color} stroke="#ffffff" strokeWidth="3" />
            ) : (
              <circle key={s.label} cx={cx} cy={cy} r={r} fill={s.color} />
            )
          )}
        </g>
      )}
    </svg>
  );
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const x0 = cx + r * Math.cos(start);
  const y0 = cy + r * Math.sin(start);
  const x1 = cx + r * Math.cos(end);
  const y1 = cy + r * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}
