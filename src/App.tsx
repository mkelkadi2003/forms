import { useCallback, useEffect, useRef, useState } from "react";
import { GameProvider, useGame, type LevelId, type Screen } from "./state/GameContext";
import { sound } from "./lib/audio";
import { Dock, TeacherPanel, TopBar } from "./components/Chrome";
import Welcome from "./screens/Welcome";
import City from "./screens/City";
import Level1Vote from "./levels/Level1Vote";
import Level2Trivia from "./levels/Level2Trivia";
import Level3RoboLab from "./levels/Level3RoboLab";
import Level4Arena from "./levels/Level4Arena";
import FinalMission from "./levels/FinalMission";
import Reflection from "./levels/Reflection";

/** Order used by the left/right arrow keys (teacher navigation). */
const NAV_ORDER: Screen[] = ["city", "L1", "L2", "L3", "L4", "final", "reflect"];

function Shell() {
  const { isUnlocked, progress, markStarted } = useGame();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [wipeKey, setWipeKey] = useState(0);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const timer = useRef<number | null>(null);

  /** Moves to a section with a short wipe transition and plays the building's special sound. */
  const go = useCallback(
    (target: Screen) => {
      setTeacherOpen(false);
      if (target === screen) return;
      if (target !== "welcome" && target !== "city" && !isUnlocked(target as LevelId)) {
        sound.play("alert");
        return;
      }
      if (target !== "welcome" && target !== "city") {
        sound.playBuilding(target as LevelId);
      } else {
        sound.play("whoosh");
      }
      setWipeKey((k) => k + 1);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setScreen(target);
        window.scrollTo(0, 0);
        timer.current = null;
      }, 320);
    },
    [screen, isUnlocked]
  );

  const start = () => {
    markStarted();
    go("city");
  };

  // Browsers only allow sound after a user gesture: unlock audio on the first click or key press.
  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Teacher-friendly keyboard navigation: ← and → move between sections, Esc closes the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "Escape") {
        setTeacherOpen(false);
        return;
      }
      if (document.querySelector('[role="dialog"]')) return;
      const idx = NAV_ORDER.indexOf(screen);
      if (idx === -1) return;
      if (e.key === "ArrowRight" && idx < NAV_ORDER.length - 1) go(NAV_ORDER[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) go(NAV_ORDER[idx - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, go]);

  return (
    <div className="min-h-dvh">
      {screen !== "welcome" && <TopBar onHome={() => go("city")} onTeacher={() => setTeacherOpen(true)} />}

      <main key={screen} className="screen-enter">
        {screen === "welcome" && <Welcome onStart={start} hasProgress={progress.started} />}
        {screen === "city" && <City onEnter={go} />}
        {screen === "L1" && <Level1Vote nav={go} />}
        {screen === "L2" && <Level2Trivia nav={go} />}
        {screen === "L3" && <Level3RoboLab nav={go} />}
        {screen === "L4" && <Level4Arena nav={go} />}
        {screen === "final" && <FinalMission nav={go} />}
        {screen === "reflect" && <Reflection nav={go} />}
      </main>

      {wipeKey > 0 && <div key={wipeKey} className="wipe-overlay" aria-hidden="true" />}

      {screen !== "welcome" && <Dock current={screen} onGo={go} />}
      <TeacherPanel open={teacherOpen} onClose={() => setTeacherOpen(false)} onGo={go} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
