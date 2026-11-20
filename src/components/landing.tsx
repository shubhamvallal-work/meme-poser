"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { memes } from "@/lib/game";
import { Button, Face, Icon } from "./ui";
import { MemeCard } from "./meme-card";

export const instructions = [
  { title: "MEET YOUR MEME.", text: "Choose how many memes to play in one set.", color: "pink", icon: "shuffle" as const },
  { title: "MAKE THAT FACE.", text: "Enable your camera once. Pose for each meme before the timer ends, or play untimed.", color: "lavender", icon: "camera" as const },
  { title: "OWN THE CHAOS.", text: "See your rounds ranked by expression match alongside your photos.", color: "orange", icon: "spark" as const },
];

export function HowToPlay() {
  return <div className="how-to-grid">{instructions.map((item, i) => <article key={item.title} className="how-to-item">
    <span className={`step-icon ${item.color}`}><Icon name={item.icon} /></span>
    <div><span className="step-label">STEP 0{i + 1}</span><h3>{item.title}</h3><p>{item.text}</p></div>
  </article>)}</div>;
}

export function Landing({ onPlay }: { onPlay: () => void }) {
  const reduced = useReducedMotion();
  const [tickerPaused, setTickerPaused] = useState(false);
  return <>
    <section className="landing-hero" aria-labelledby="hero-title">
      <motion.div className="hero-orbit orbit-one" aria-hidden="true" animate={reduced ? {} : { x: [0, -24, 0], y: [0, 18, 0] }} transition={{ duration: 4.5 }} /><motion.div className="hero-orbit orbit-two" aria-hidden="true" animate={reduced ? {} : { x: [0, 20, 0], y: [0, -14, 0] }} transition={{ duration: 4.5 }} />
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span className="tiny-star" aria-hidden="true">✳</span> VERY SERIOUS ABOUT BEING UNSERIOUS.</div>
        <h1 id="hero-title"><span>YOU VS.</span><span>THE <span className="headline-spark" aria-hidden="true">✳</span></span><motion.span className="headline-meme" initial={reduced ? false : { rotate: -5, x: -16, opacity: 0 }} animate={{ rotate: -2, x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 130, damping: 12 }}>MEME<span className="pink-period">.</span></motion.span></h1>
        <p className="hero-subtitle">Your face. Their meme.<br />Let&apos;s see who wins.</p>
        <Button onClick={onPlay} className="hero-cta">LET&apos;S GET SILLY <Icon name="spark" /></Button>
        <p className="hero-fineprint"><Icon name="check" /> No sign-up. No dignity required.</p>
      </div>
      <div className="hero-collage" aria-label="Iconic memes: Side-Eye Chloe, Disaster Girl, and Success Kid">
        <motion.div className="collage-doodle" aria-hidden="true" animate={reduced ? {} : { rotate: [8, -8, 8], y: [0, -8, 0] }} transition={{ duration: 4, repeat: 0 }}><Face /></motion.div>
        <motion.div className="collage-card collage-back" initial={reduced ? false : { opacity: 0, y: 40, rotate: -20 }} animate={{ opacity: 1, y: 0, rotate: -13 }} transition={{ type: "spring", delay: 0.18 }}><MemeCard meme={memes[1]} compact priority /></motion.div>
        <motion.div className="collage-card collage-main" initial={reduced ? false : { opacity: 0, y: 60, rotate: 15 }} animate={{ opacity: 1, y: 0, rotate: 7 }} whileHover={{ rotate: 2, y: -10 }} transition={{ type: "spring", stiffness: 130, damping: 16, delay: 0.1 }}><div className="tape" /><MemeCard meme={memes[0]} priority /></motion.div>
        <motion.div className="collage-card collage-small" initial={reduced ? false : { opacity: 0, y: 60, rotate: -20 }} animate={{ opacity: 1, y: 0, rotate: -9 }} transition={{ type: "spring", delay: 0.3 }}><MemeCard meme={memes[2]} compact priority /></motion.div>
        <div className="burst-sticker" aria-hidden="true"><span>100%<br />UNHINGED</span></div>
        <div className="handwritten collage-note" aria-hidden="true">this could be you.<svg viewBox="0 0 120 65" fill="none"><path d="M8 10c54-23 91 20 57 39m-6-16 3 22 24-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></div>
        <span className="little-star star-a" aria-hidden="true">✦</span><span className="little-star star-b" aria-hidden="true">✦</span>
      </div>
      <div className="hero-bottom"><span>A FACE-OFF WITH THE INTERNET.</span><span>EST. 2026 <span aria-hidden="true">↘</span></span></div>
    </section>
    <div className="ticker"><div className="ticker-track" aria-hidden="true" data-paused={tickerPaused}>{Array.from({ length: 4 }, (_, i) => <span key={i}>LESS SCROLLING <Icon name="spark" /> MORE LOL-ING <Icon name="spark" /> MAKE A FACE <Icon name="spark" /> MAKE IT WEIRD <Icon name="spark" /></span>)}</div>
      <button type="button" className="ticker-control" aria-label={tickerPaused ? "Resume scrolling banner" : "Pause scrolling banner"} onClick={() => setTickerPaused(!tickerPaused)}>
        <Icon name={tickerPaused ? "play" : "pause"} />
      </button>
    </div>
    <section id="how-it-works" className="how-it-works" aria-labelledby="how-heading"><div className="section-kicker"><h2 id="how-heading">THREE STEPS. ZERO CHILL.</h2><span>YOUR FACE IS THE CONTROLLER.</span></div><HowToPlay /></section>
  </>;
}
