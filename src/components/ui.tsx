import { useEffect, useId, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { levelMeta } from "../data/content";
import { cn } from "../utils/cn";
import { sound } from "../lib/audio";

/* ============================================================
   Buttons
   ============================================================ */
export type Tone = "purple" | "blue" | "green" | "yellow" | "red" | "teal" | "white" | "dark";

const TONES: Record<Tone, { bg: string; shadow: string; text: string }> = {
  purple: { bg: "#673ab7", shadow: "#4a2690", text: "#ffffff" },
  blue: { bg: "#4285f4", shadow: "#2a64c9", text: "#ffffff" },
  green: { bg: "#34a853", shadow: "#1e7d3b", text: "#ffffff" },
  yellow: { bg: "#fbbc04", shadow: "#b98500", text: "#24163f" },
  red: { bg: "#ea4335", shadow: "#a92b20", text: "#ffffff" },
  teal: { bg: "#00a6a6", shadow: "#00706f", text: "#ffffff" },
  white: { bg: "#ffffff", shadow: "#bfb3dd", text: "#24163f" },
  dark: { bg: "#2d1d55", shadow: "#120a24", text: "#ffffff" },
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Btn({ tone = "purple", size = "md", className, style, children, onPointerDown, ...rest }: BtnProps) {
  const t = TONES[tone];
  const vars = { "--c": t.bg, "--shadow": t.shadow, "--t": t.text, color: t.text } as CSSProperties;
  return (
    <button
      type="button"
      {...rest}
      onPointerDown={(e) => {
        if (!rest.disabled) sound.play("click");
        onPointerDown?.(e);
      }}
      className={cn("btn3d", size === "sm" && "btn3d-sm", size === "lg" && "btn3d-lg", size === "xl" && "btn3d-xl", className)}
      style={{ ...vars, ...style }}
    >
      {children}
    </button>
  );
}

/** Small pill toggle used for music and sound effects. */
export function Toggle({
  icon,
  label,
  on,
  onToggle,
  compact = false,
}: {
  icon: string;
  label: string;
  on: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={`${label}: ${on ? "on" : "off"}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 font-display font-semibold transition",
        compact ? "px-2.5 py-1.5 text-sm" : "px-4 py-2 text-base",
        on ? "border-white bg-white text-ink" : "border-white/40 bg-white/10 text-white"
      )}
    >
      <span aria-hidden="true">{icon}</span>
      <span className={compact ? "hidden md:inline" : ""}>
        {label}: {on ? "On" : "Off"}
      </span>
      <span className={cn("h-3 w-3 rounded-full", on ? "bg-gf-green" : "bg-white/40")} aria-hidden="true" />
    </button>
  );
}

/* ============================================================
   Speech bubble + robot guide
   ============================================================ */
export function Bubble({ children, className, side = "left" }: { children: ReactNode; className?: string; side?: "left" | "right" }) {
  return <div className={cn("bubble", side === "right" && "bubble-right", className)}>{children}</div>;
}

export type RobotMood = "happy" | "wave" | "think" | "cheer" | "sad";

/** Byte, the friendly robot guide (pure SVG). */
export function Robot({ mood = "happy", size = 150, talking = false, className }: { mood?: RobotMood; size?: number; talking?: boolean; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const bodyId = `rbody-${uid}`;
  const visorId = `rvisor-${uid}`;
  const eye = "#7ef0ff";
  const openEyes = mood !== "sad" && mood !== "cheer";
  const mouthPath = mood === "cheer" ? "M80 126 Q100 152 120 126 Z" : "M84 126 Q100 142 116 126";

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={Math.round(size * 1.1)}
      className={cn("overflow-visible", className)}
      role="img"
      aria-label="Byte, the robot guide"
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a58bff" />
          <stop offset="1" stopColor="#5b2fc4" />
        </linearGradient>
        <linearGradient id={visorId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a2475" />
          <stop offset="1" stopColor="#140b2c" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="213" rx="60" ry="7" fill="rgba(36,22,63,0.25)" />
      {/* antenna */}
      <line x1="100" y1="24" x2="100" y2="46" stroke="#24163f" strokeWidth="6" strokeLinecap="round" />
      <circle className="robot-antenna" cx="100" cy="16" r="13" fill="#fbbc04" stroke="#24163f" strokeWidth="5" />
      {/* ears */}
      <rect x="16" y="84" width="22" height="40" rx="10" fill="#4285f4" stroke="#24163f" strokeWidth="5" />
      <rect x="162" y="84" width="22" height="40" rx="10" fill="#4285f4" stroke="#24163f" strokeWidth="5" />
      {/* head + visor */}
      <rect x="34" y="46" width="132" height="112" rx="40" fill={`url(#${bodyId})`} stroke="#24163f" strokeWidth="6" />
      <rect x="56" y="76" width="88" height="62" rx="26" fill={`url(#${visorId})`} />
      {/* eyes */}
      {openEyes ? (
        <g>
          <circle className="robot-eye" cx="83" cy="104" r="11" fill={eye} />
          <circle className="robot-eye" cx="117" cy="104" r="11" fill={eye} />
          <circle cx="86" cy="100" r="3.5" fill="#ffffff" />
          <circle cx="120" cy="100" r="3.5" fill="#ffffff" />
        </g>
      ) : mood === "cheer" ? (
        <g fill="none" stroke={eye} strokeWidth="6" strokeLinecap="round">
          <path d="M70 108 Q83 90 96 108" />
          <path d="M104 108 Q117 90 130 108" />
        </g>
      ) : (
        <g fill="none" stroke={eye} strokeWidth="6" strokeLinecap="round">
          <path d="M72 96 L94 104" />
          <path d="M106 104 L128 96" />
        </g>
      )}
      <circle cx="66" cy="126" r="7" fill="#ff8fb1" opacity="0.75" />
      <circle cx="134" cy="126" r="7" fill="#ff8fb1" opacity="0.75" />
      {/* mouth */}
      {mood === "sad" ? (
        <>
          <path d="M86 136 Q100 124 114 136" fill="none" stroke={eye} strokeWidth="5" strokeLinecap="round" />
          <circle cx="78" cy="122" r="4" fill={eye} />
        </>
      ) : mood === "think" ? (
        <path d="M88 132 Q96 126 102 132 T116 132" fill="none" stroke={eye} strokeWidth="5" strokeLinecap="round" />
      ) : (
        <path
          className={talking ? "robot-talk" : undefined}
          d={mouthPath}
          fill={mood === "cheer" ? "#ff6b8b" : "none"}
          stroke={eye}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* body */}
      <rect x="62" y="160" width="76" height="46" rx="18" fill="#34a853" stroke="#24163f" strokeWidth="6" />
      <circle cx="100" cy="183" r="9" fill="#fbbc04" stroke="#24163f" strokeWidth="3" />
      <rect x="32" y="166" width="30" height="16" rx="8" fill="#5b2fc4" stroke="#24163f" strokeWidth="5" />
      <g className={mood === "wave" || mood === "cheer" ? "robot-wave" : undefined}>
        <rect x="138" y="166" width="30" height="16" rx="8" fill="#5b2fc4" stroke="#24163f" strokeWidth="5" />
      </g>
      {mood === "think" && (
        <text x="160" y="50" fontSize="30" fontWeight="700" fill="#fbbc04" fontFamily="Fredoka, sans-serif">
          ?
        </text>
      )}
      {mood === "cheer" && (
        <g fill="#fbbc04">
          <path d="M18 50 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" />
          <path d="M180 70 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />
        </g>
      )}
    </svg>
  );
}

/* ============================================================
   Stars, progress, badges
   ============================================================ */
export function Stars({ count, total = 3, className }: { count: number; total?: number; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)} role="img" aria-label={`${count} out of ${total} stars`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn("text-4xl transition", i < count ? "pop-in star-glow" : "opacity-30 grayscale")}
          style={{ animationDelay: `${i * 0.15}s` }}
          aria-hidden="true"
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  color = "#34a853",
  track = "rgba(255,255,255,0.35)",
  height = 14,
  className,
}: {
  value: number;
  max: number;
  color?: string;
  track?: string;
  height?: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full", className)}
      style={{ height, background: track }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: color }}>
        <div className="shine absolute inset-0" />
      </div>
    </div>
  );
}

export function BadgeMedal({ emoji, name, earned }: { emoji: string; name: string; earned: boolean }) {
  return (
    <div className={cn("flex w-28 flex-col items-center gap-2 rounded-3xl p-3 text-center transition", earned ? "bg-white shadow-xl" : "bg-white/15")}>
      <span
        className={cn(
          "grid h-16 w-16 place-items-center rounded-full text-3xl",
          earned ? "anim-bob bg-gf-yellow shadow-lg" : "bg-white/20 text-white/70 grayscale"
        )}
        aria-hidden="true"
      >
        {earned ? emoji : "?"}
      </span>
      <span className={cn("font-display text-sm font-semibold leading-tight", earned ? "text-ink" : "text-white/80")}>{name}</span>
    </div>
  );
}

/* ============================================================
   Feedback banners, steps, decor
   ============================================================ */
export function Feedback({ tone, children, className }: { tone: "good" | "bad" | "info"; children: ReactNode; className?: string }) {
  const palette = {
    good: "bg-gf-green text-white",
    bad: "bg-gf-red text-white",
    info: "bg-gf-blue text-white",
  };
  return (
    <div role="status" aria-live="polite" className={cn("pop-in rounded-2xl px-5 py-4 text-lg font-bold shadow-lg", palette[tone], className)}>
      {children}
    </div>
  );
}

export function Steps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2" aria-label="Level steps">
      {labels.map((label, i) => (
        <li key={label} className="flex items-center gap-2" aria-current={i === current ? "step" : undefined}>
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full font-display text-base font-semibold transition",
              i < current ? "bg-gf-green text-white" : i === current ? "scale-110 bg-gf-yellow text-ink shadow-lg" : "bg-white/30 text-white"
            )}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span className={cn("font-display text-sm font-semibold", i === current ? "text-white" : "text-white/80")}>{label}</span>
          {i < labels.length - 1 && <span className="mx-1 hidden h-1 w-6 rounded bg-white/40 sm:block" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export function Decor({ items }: { items: { e: string; x: string; y: string; size?: number; delay?: number }[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((it, i) => (
        <span
          key={i}
          className="anim-float absolute select-none opacity-75"
          style={{ left: it.x, top: it.y, fontSize: it.size ?? 40, animationDelay: `${it.delay ?? 0}s` }}
        >
          {it.e}
        </span>
      ))}
    </div>
  );
}

export function LevelFrame({ background, decor, children, className }: { background: string; decor?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("relative min-h-dvh overflow-hidden pb-8", className)} style={{ background }}>
      {decor}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

const NUM_TO_BUILDING: Record<number, "L1" | "L2" | "L3" | "L4" | "final" | "reflect"> = {
  1: "L1",
  2: "L2",
  3: "L3",
  4: "L4",
  5: "final",
  6: "reflect",
};

export function LevelHeader({
  num,
  title,
  emoji,
  color,
  onCity,
  children,
}: {
  num: number;
  title: string;
  emoji: string;
  color: string;
  onCity: () => void;
  children?: ReactNode;
}) {
  const bId = NUM_TO_BUILDING[num] ?? "L1";
  const meta = levelMeta(bId);
  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => sound.playBuilding(bId)}
            title="Tap to hear this building's special sound!"
            aria-label={`Play Level ${num} building sound`}
            className="anim-bob grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-4xl shadow-xl transition hover:scale-105"
            style={{ background: color }}
          >
            {emoji}
          </button>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/85">Level {num}</p>
            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl" style={{ textShadow: "0 3px 0 rgba(36,22,63,0.35)" }}>
              {title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {children}
          <Btn tone="white" size="sm" onClick={onCity}>
            🏙️ City
          </Btn>
        </div>
      </header>
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-white/40 bg-white/95 px-4 py-2.5 text-ink shadow-md"
        role="region"
        aria-label={`Level ${num} learning objective`}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gf-purple px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
          🎯 Learning Objective
        </span>
        <p className="flex-1 text-sm font-bold sm:text-base">{meta.objective}</p>
      </div>
    </div>
  );
}

/* ============================================================
   Effects: confetti, star bursts, floating text, modal
   ============================================================ */
interface ConfettiPiece {
  id: number;
  left: number;
  dx: number;
  delay: number;
  dur: number;
  color: string;
  w: number;
  h: number;
  round: boolean;
}

const CONFETTI_COLORS = ["#673ab7", "#4285f4", "#34a853", "#fbbc04", "#ea4335", "#ff7eb6", "#00bcd4"];

/** Full-screen confetti. Change `trigger` (any new number) to fire it again. */
export function Confetti({ trigger, count = 90 }: { trigger: number; count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const next: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      dx: (Math.random() - 0.5) * 260,
      delay: Math.random() * 0.5,
      dur: 2.2 + Math.random() * 1.6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 7 + Math.random() * 7,
      h: 12 + Math.random() * 10,
      round: Math.random() > 0.6,
    }));
    setPieces(next);
    const t = window.setTimeout(() => setPieces([]), 4200);
    return () => window.clearTimeout(t);
  }, [trigger, count]);

  if (pieces.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={`${trigger}-${p.id}`}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? "50%" : "3px",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              "--dx": `${p.dx}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Stars that burst outwards from the centre of the nearest positioned parent. */
export function StarBurst({ trigger }: { trigger: number }) {
  if (trigger === 0) return null;
  return (
    <div key={trigger} className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <span
            key={i}
            className="burst-star"
            style={{ "--tx": `${Math.cos(a) * 120}px`, "--ty": `${Math.sin(a) * 120}px` } as CSSProperties}
          >
            {i % 2 === 0 ? "⭐" : "✨"}
          </span>
        );
      })}
    </div>
  );
}

/** Text that floats up and fades. Render with a new `key` each time you want it to play. */
export function FloatMsg({ text, className }: { text: string; className?: string }) {
  return <div className={cn("float-up-msg font-display text-2xl font-bold", className)}>{text}</div>;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn("pop-in relative max-h-[90dvh] w-full overflow-y-auto rounded-[2rem] bg-white p-6 text-ink shadow-2xl", maxWidth)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/10 text-xl font-bold hover:bg-ink/20"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */
/** Returns true once, a moment after mount. Used to animate charts from zero. */
export function useReady(delay = 60): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
  return ready;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
