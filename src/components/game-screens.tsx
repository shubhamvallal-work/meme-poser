"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { bossRounds, bossSeconds, type Meme, type Result, type RoundResult, verdict } from "@/lib/game";
import { Button, Icon } from "./ui";
import { MemeCard } from "./meme-card";
import { ShareActions } from "./share-actions";

import { ArcadeSelect } from "./arcade-select";
import type { PlaySound } from "./game-audio";

type RoundCount = number | "endless";
const roundOptions = [
  ...[3, 5, 10, 15, 20].map(value => ({ value, label: String(value) })),
  { value: "endless" as const, label: "Endless 🥵" },
];
const captureOptions = [
  ...[3, 5, 10, 15, 30].map(value => ({ value, label: value + " seconds" })),
  { value: 0, label: "Manual" },
];

export function RevealScreen({ onStart }: { onStart: (count: RoundCount, seconds: number, boss: boolean) => void }) {
  const [count, setCount] = useState<number | "endless">(10);
  const [seconds, setSeconds] = useState(15);
  const [boss, setBoss] = useState(false);
  const rounds = boss ? bossRounds : count;
  const captureSeconds = boss ? bossSeconds : seconds;
  return <section className="game-stage reveal-stage">
    <div className="screen-heading"><h1>GAME <span className="text-pink">SETUP.</span></h1></div>
    <div className="setup-card">
      <div className="session-options">
        <ArcadeSelect id="round-count" label="Rounds" options={roundOptions} value={rounds} disabled={boss} onChange={setCount} />
        <ArcadeSelect id="capture-seconds" label="Auto-capture" options={captureOptions} value={captureSeconds} disabled={boss} onChange={setSeconds} />
      </div>
      <fieldset className="game-modes">
        <legend>Round options</legend>
        <label><input type="checkbox" role="switch" checked={boss} onChange={e => setBoss(e.target.checked)} />
          <span><strong>Final Boss</strong><small>Play {bossRounds} rounds at {bossSeconds} seconds each. The final round uses stricter scoring.</small></span>
        </label>
      </fieldset>
      <Button data-own-sound className="start-game" onClick={() => onStart(rounds, captureSeconds, boss)}>START GAME <Icon name="play" /></Button>
      {rounds === "endless" && <p className="round-note">Stop anytime to see your completed rounds ranked.</p>}
    </div>
  </section>;
}

function CapturedPortrait({ snapshot }: { snapshot: string }) {
  return <div className="camera-snapshot">
    <Image src={snapshot} alt="Your captured MemeMatch selfie" fill unoptimized sizes="(max-width: 600px) 40vw, 220px" style={{ objectFit: "cover" }} />
  </div>;
}

type CameraState = "idle" | "requesting" | "ready" | "blocked" | "unavailable" | "insecure";

const cameraHelp: Record<Exclude<CameraState, "ready">, string> = {
  idle: "Enable your front camera to play. Photos stay on this device.",
  requesting: "Allow camera access in your browser to begin.",
  blocked: "Allow camera access in site settings, then retry.",
  unavailable: "Check that a camera is connected and available, then retry.",
  insecure: "Open MemeMatch over HTTPS to use this device’s camera.",
};

export function PoseScreen({ soundToggle, playSound, onExit, meme, round, total, duration, suspended, finishing, onFinish, onCapture }: { soundToggle: ReactNode; playSound: PlaySound; onExit: () => void; meme: Meme; round: number; total: number | null; finishing: boolean; onFinish: (scoringMemeId?: string) => void; duration: number; suspended: boolean; onCapture: (snapshot: string) => void }) {
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [shutter, setShutter] = useState<{ memeId: string; photo: string } | null>(null);
  const frozenPhoto = shutter?.memeId === meme.id ? shutter.photo : null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestId = useRef(0);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => () => {
    requestId.current++;
    stopCamera();
  }, []);

  async function enableCamera() {
    const video = videoRef.current;
    if (!window.isSecureContext) {
      setCameraState("insecure");
      return;
    }
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      return;
    }
    const attempt = ++requestId.current;
    stopCamera();
    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      if (requestId.current !== attempt) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      stream.getVideoTracks()[0].onended = () => {
        if (requestId.current === attempt) {
          stopCamera();
          setCameraState("unavailable");
        }
      };
      await video.play();
      if (requestId.current === attempt && stream.active) setCameraState("ready");
    } catch (error) {
      if (requestId.current !== attempt) return;
      stopCamera();
      setCameraState(error instanceof DOMException && error.name === "NotAllowedError" ? "blocked" : "unavailable");
    }
  }

  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (cameraState !== "ready" || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || streamRef.current?.getVideoTracks()[0]?.readyState !== "live" || !video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1280 / video.videoWidth);
    canvas.width = Math.max(1, Math.floor(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.floor(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL("image/jpeg", 0.9);
    setShutter({ memeId: meme.id, photo });
    return photo;
  }, [cameraState, meme.id]);

  return <section className="game-stage pose-stage">
    <header className="screen-heading pose-heading">
      <div className="round-toolbar">
        <div className="round-progress" role="status" aria-atomic="true">
          <strong>ROUND {round} {total === null ? "· ENDLESS" : `OF ${total}`}{meme.boss && " · FINAL BOSS"}</strong>
          {total !== null && <progress aria-label="Current round" value={round} max={total} aria-valuetext={`Round ${round} of ${total}`} />}
        </div>
        {soundToggle}
        {total === null ? <button type="button" className="finish-set" disabled={finishing} onClick={() => {
          requestId.current++;
          stopCamera();
          onFinish(frozenPhoto ? meme.id : undefined);
        }}>{finishing ? "Finishing…" : "Stop game"}</button> :
          <button type="button" className="pose-exit" aria-label="Exit game and return home" onClick={onExit}><Icon name="close" /></button>}
      </div>
      <h1>{meme.name}</h1>
      <p>{meme.prompt}</p>
      <div className="pose-tip"><Icon name="spark" /><span><strong>Hint</strong> · {meme.tip}</span></div>
    </header>
    <div className="pose-layout">
      <div className="pose-panel"><div className="panel-heading">THE MEME</div><MemeCard meme={meme} /></div>
      <div className="versus-badge" aria-hidden="true">VS.</div>
      <div className="pose-panel">
        <div className="panel-heading">YOUR CAMERA</div>
        <div className="live-camera">
          <video ref={videoRef} autoPlay muted playsInline aria-label="Live front camera preview" />
          {cameraState !== "ready" ? <div className="camera-action">
            <Button className="camera-button" variant="lime" disabled={cameraState === "requesting" || cameraState === "insecure"} onClick={enableCamera}>
              <Icon name="camera" />{cameraState === "requesting" ? "CONNECTING…" : cameraState === "blocked" || cameraState === "unavailable" ? "TRY AGAIN" : "ENABLE CAMERA"}
            </Button>
            <p role="status">{cameraHelp[cameraState]}</p>
          </div> : frozenPhoto ? <>
            <Image src={frozenPhoto} fill unoptimized alt="Your captured pose" style={{ objectFit: "cover" }} />
            <strong className="shutter-label" role="status">Photo captured ✓</strong>
          </> : <span className="face-frame" aria-hidden="true" />}
        </div>
      </div>
    </div>
    <RoundControls playSound={playSound} key={meme.id} duration={duration} cameraState={cameraState} suspended={suspended} onCapture={onCapture} captureSnapshot={captureSnapshot} />
  </section>;
}

function RoundControls({ playSound, duration: limit, cameraState, suspended, onCapture, captureSnapshot }: {
  playSound: PlaySound;
  duration: number;
  cameraState: CameraState;
  suspended: boolean;
  onCapture: (snapshot: string) => void;
  captureSnapshot: () => string | null;
}) {
  const [seconds, setSeconds] = useState(limit);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(limit * 1000);
  const captured = useRef(false);
  const [checking, setChecking] = useState(false);
  const reduced = useReducedMotion();
  const timed = limit > 0;
  const [frameError, setFrameError] = useState(false);
  const capture = useCallback(() => {
    if (captured.current || cameraState !== "ready") return;
    let snapshot: string | null = null;
    try { snapshot = captureSnapshot(); } catch { /* A video track can end during a draw. */ }
    if (!snapshot) {
      setFrameError(true);
      return;
    }
    captured.current = true;
    setFrameError(false);
    setChecking(true);
    onCapture(snapshot);
  }, [cameraState, captureSnapshot, onCapture]);

  useEffect(() => {
    if (!timed || paused || suspended || checking || frameError || cameraState !== "ready") return;
    const deadline = performance.now() + remaining.current;
    const display = window.setInterval(() => {
      setSeconds(Math.max(0, Math.ceil((deadline - performance.now()) / 1000)));
    }, 100);
    const shutter = window.setTimeout(() => {
      window.clearInterval(display);
      setSeconds(0);
      capture();
    }, remaining.current);
    return () => {
      window.clearInterval(display);
      window.clearTimeout(shutter);
      remaining.current = Math.max(0, deadline - performance.now());
    };
  }, [timed, paused, suspended, checking, frameError, cameraState, capture]);

  const lastTick = useRef(0);
  useEffect(() => {
    if (cameraState === "ready" && !paused && !suspended && !checking && !frameError &&
      seconds > 0 && seconds <= 3 && seconds !== lastTick.current) {
      lastTick.current = seconds;
      playSound("tick");
    }
  }, [cameraState, paused, suspended, checking, frameError, seconds, playSound]);

  return <div className="capture-controls"><div className="countdown-wrap">{timed ? <><motion.span aria-hidden="true" className={`countdown ${seconds <= 3 ? "urgent" : ""}`} key={seconds} initial={reduced ? false : { scale: 1.25 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>{String(seconds).padStart(2, "0")}</motion.span><div><strong>{paused ? "ON PAUSE" : "SECONDS LEFT"}</strong><button className="text-button pause-button" disabled={checking || frameError || cameraState !== "ready"} onClick={() => setPaused(!paused)} type="button"><Icon name={paused ? "play" : "pause"} />{paused ? "Resume" : "Pause timer"}</button></div><span className="sr-only" role="status">{paused ? "Timer paused" : seconds <= 5 || seconds === limit ? `${seconds} seconds remaining` : "Timer running"}</span></> : <><Icon name="smile" /><div><strong>TAKE YOUR TIME</strong><p>No timer. Just vibes.</p></div></>}</div><Button data-own-sound disabled={checking || cameraState !== "ready"} onClick={capture} variant="pink" className="capture-button"><Icon name="camera" /> {checking ? "SCORING…" : frameError ? "RETRY CAPTURE" : "CAPTURE MY FACE"}</Button><p className="capture-note">{frameError ? "No camera frame arrived. Try capturing again." : timed && cameraState !== "ready" ? "The timer starts when your camera is ready." : timed ? "Auto-captures when the timer ends." : "Capture whenever you feel ready."}</p></div>
}

function Confetti() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <motion.i key={i} style={{ left: `${(i * 37) % 100}%`, background: ["#D7FC57", "#FF6B9B", "#A58BFF", "#FFB547"][i % 4], borderRadius: i % 3 === 0 ? "50%" : "0" }} initial={{ y: -40, opacity: 1, rotate: i * 30 }} animate={{ y: [0, 520 + (i % 4) * 70], x: [(i % 2 ? -1 : 1) * 40, (i % 2 ? 1 : -1) * 70], opacity: [1, 1, 0], rotate: i * 30 + 270 }} transition={{ duration: 2.6 + (i % 3) * 0.3, delay: (i % 7) * 0.07, ease: "easeOut" }} />)}</div>;
}

function ResultCard({ result, meme }: { result: Result; meme: Meme }) {
  return <div className="share-card">
    <div className="share-card-header">
      <strong>{meme.name}</strong>
      <span className="pill pink">{result.score === null ? "Unscored" : `${result.score} / 100 pts`}</span>
    </div>
    <div className="share-comparison">
      <div><MemeCard meme={meme} /><span className="comparison-label">THE MEME</span></div>
      <span className="share-vs" aria-hidden="true">VS.</span>
      <div><CapturedPortrait snapshot={result.snapshot} /><span className="comparison-label">YOUR TAKE</span></div>
    </div>
    <div className="share-card-footer"><strong>{result.score === null ? "UNSCORED" : verdict(result.score).title}</strong></div>
    {result.reason && <p>{result.reason}</p>}
    {result.feedback && <p>{result.feedback}</p>}
    {result.metrics.map(metric => <div key={metric.label} className="metric">
      <div><span>{metric.label}</span><strong>{metric.value}%</strong></div>
      <div className="metric-track"><div className="lavender" style={{ width: metric.value + "%" }} /></div>
    </div>)}
    {result.score !== null && <details className="score-evidence"><summary>How was this scored?</summary><p>The game compares visible movements in both photos. Bigger movements count more. Below is the largest measured difference in each category. Movement intensity runs from 0 to 1.</p><ul>{result.metrics.map(metric => <li key={metric.label}>{metric.observation}</li>)}</ul></details>}
    <ShareActions meme={meme} result={result} />
  </div>;
}

export function RecapScreen({ rounds, onPlay }: { rounds: RoundResult[]; onPlay: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(rounds[0].round);
  return <section className="game-stage">
    <Confetti />
    <div className="screen-heading">
      <span className="eyebrow">{rounds.length} {rounds.length === 1 ? "ROUND" : "ROUNDS"} COMPLETE</span>
      <h1>THE <span className="text-lavender">RANKINGS.</span></h1>
      <p>Open a round to compare your pose and see what counted toward the match.</p>
    </div>
    <ol className="rankings">
      {rounds.map(({ round, meme, result }, index) => <li key={round}>
        <button type="button" aria-expanded={expanded === round} onClick={() => setExpanded(expanded === round ? null : round)}>
          <span className="rank-place">{result.score === null ? "—" : `#${index + 1}`}</span>
          <Image src={meme.image} width={58} height={58} alt="" />
          <span><small>ROUND {round}{meme.boss && " · FINAL BOSS"}</small><strong>{meme.name}</strong></span>
          <b>{result.score === null ? "Unscored" : `${result.score} pts`}</b>
        </button>
        {expanded === round && <ResultCard meme={meme} result={result} />}
      </li>)}
    </ol>
    <div className="result-actions"><Button onClick={onPlay}>PLAY ANOTHER SET</Button></div>
  </section>;
}
