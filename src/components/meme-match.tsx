"use client";

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { buildDeck, gameReducer, memes, pickMeme, type Meme } from "@/lib/game";
import { scoreExpression } from "@/lib/score-expression";
import { Landing, HowToPlay } from "./landing";
import { PoseScreen, RecapScreen, RevealScreen } from "./game-screens";
import { Button, Dialog, Icon } from "./ui";
import { MemeCard } from "./meme-card";

export function MemeMatch({ firstMeme }: { firstMeme?: Meme }) {
  const [state, dispatch] = useReducer(gameReducer, firstMeme ? { screen: "reveal", meme: firstMeme } : { screen: "landing" });
  const [dialog, setDialog] = useState<"how" | "memes" | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const reduced = useReducedMotion();
  const currentId = "meme" in state ? state.meme.id : undefined;
  const activeMeme = state.screen === "pose" ? state.meme : undefined;
  const reshuffle = state.screen === "pose" && state.endless && (state.rounds.length + 1) % state.deck.length === 0;
  const generation = useRef(0);
  const capture = useCallback(async (snapshot: string) => {
    if (!activeMeme) return;
    const token = generation.current;
    // Keep the shutter confirmation visible even when scoring finishes immediately.
    const [result] = await Promise.all([
      scoreExpression(activeMeme, snapshot),
      new Promise<void>(resolve => window.setTimeout(resolve, 800)),
    ]);
    if (activeMeme.boss && result.score !== null && result.metrics.length) {
      const weakest = Math.min(...result.metrics.map(metric => metric.value));
      result.score = Math.round((result.score + weakest) / 2);
      result.feedback = "Final Boss: your weakest category counts for half the score. " + (result.feedback ?? "");
    }
    if (token !== generation.current) return;
    const nextDeck = reshuffle ? buildDeck(pickMeme(activeMeme.id), memes.length) : undefined;
    dispatch({ type: "capture", memeId: activeMeme.id, result, nextDeck });
  }, [activeMeme, reshuffle]);
  const choose = (meme: Meme) => { generation.current++; setDialog(null); dispatch({ type: "choose", meme }); };
  const goHome = () => { generation.current++; dispatch({ type: "home" }); };
  const next = () => choose(pickMeme(currentId));

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [state.screen, currentId]);

  return <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 240, damping: 24 }}>
    <a className="skip-link" href="#main-content">Skip to game</a>
    <div className="app-shell" data-screen={state.screen}>
      <header className="site-header"><button className="brand" aria-label="MemeMatch home" onClick={goHome}><Icon name="smile" /><span>meme<span className="brand-light">match</span></span><sup>®</sup></button><span className="header-caption">THE INTERNET IS YOUR MIRROR.</span><nav aria-label="Main navigation"><button type="button" onClick={() => setDialog("how")}>How to play</button><button type="button" onClick={() => setDialog("memes")}>Meme wall <span aria-hidden="true">✦</span></button><Button variant="lime" onClick={next} className="nav-play">LET&apos;S PLAY <Icon name="play" /></Button></nav></header>
      <main id="main-content" ref={mainRef} tabIndex={-1} aria-label={state.screen === "landing" ? "MemeMatch home" : `MemeMatch ${state.screen} screen`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={state.screen} initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: reduced ? 0 : 0.18 }}>
            {state.screen === "landing" && <Landing onPlay={next} />}
            {state.screen === "reveal" && <RevealScreen meme={state.meme} onStart={(first, count, seconds, boss) => dispatch({ type: "start", seconds, endless: count === "endless", deck: buildDeck(first, count === "endless" ? memes.length : count, boss) })} onShuffle={next} />}
            {state.screen === "pose" && <PoseScreen onExit={goHome} meme={state.meme} duration={state.seconds} round={state.rounds.length + 1} total={state.endless ? null : state.deck.length} finishing={!!state.finishing} onFinish={scoringMemeId => dispatch({ type: "finish", scoringMemeId })} suspended={dialog !== null} onCapture={capture} />}
            {state.screen === "recap" && <RecapScreen rounds={state.rounds} onPlay={next} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="site-footer"><span>MADE FOR YOUR WEIRD SIDE. <Icon name="heart" /></span><span className="footer-camera"><span className="status-badge">CAMERA LOCAL</span> Expressions scored on this device.</span><span className="footer-copyright">© 2026 MEMEMATCH</span></footer>
    </div>
    {dialog && <Dialog title={dialog === "how" ? "A FACE-OFF. IN THREE ACTS." : "PICK YOUR ALTER EGO."} onClose={() => setDialog(null)}>{dialog === "how" ? <><HowToPlay /><p className="dialog-note">Camera capture is live and happens only after you select Enable Camera. Snapshots stay in this browser for the active game. The game compares your gaze, brows, mouth and head angle with the meme. When a pose cannot be measured, the round stays unscored.</p><Button onClick={() => setDialog(null)}>GOT IT <Icon name="spark" /></Button></> : <><p className="wall-intro">Pick a face from the {memes.length}-meme library.</p><div className="meme-wall">{memes.map((meme) => <button type="button" key={meme.id} onClick={() => choose(meme)} aria-label={`Play ${meme.name}`}><MemeCard meme={meme} compact /><span>{meme.difficulty}</span></button>)}</div></>}</Dialog>}
  </MotionConfig>;
}
