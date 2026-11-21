"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const cues = {
  click: [740],
  start: [330, 440, 660],
  tick: [550],
  capture: [880, 440],
  victory: [659, 784, 1047],
  finish: [440, 554, 660, 880],
};
export type PlaySound = (cue: keyof typeof cues) => void;

export function useGameAudio() {
  const [enabled, setEnabled] = useState(true);
  const context = useRef<AudioContext | null>(null);
  const muted = useRef(false);
  const music = useRef<HTMLAudioElement | null>(null);

  const startMusic = useCallback(() => {
    if (muted.current || document.hidden) return;
    if (!music.current) {
      music.current = new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/arcade-loop.wav`);
      music.current.loop = true;
      music.current.volume = 0.48;
    }
    if (music.current.paused) void music.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    function followVisibility() {
      if (document.hidden) music.current?.pause();
      else if (music.current) startMusic();
    }
    document.addEventListener("click", startMusic);
    document.addEventListener("keydown", startMusic);
    document.addEventListener("visibilitychange", followVisibility);
    return () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("keydown", startMusic);
      document.removeEventListener("visibilitychange", followVisibility);
      music.current?.pause();
      music.current = null;
      if (context.current) void context.current.close().catch(() => {});
      context.current = null;
    };
  }, [startMusic]);

  const play = useCallback<PlaySound>((cue) => {
    if (muted.current || !window.AudioContext) return;
    try {
      const audio = context.current ??= new AudioContext();
      if (audio.state !== "running") void audio.resume().catch(() => {});
      const duration = cue === "tick" ? 0.045 : 0.075;
      cues[cue].forEach((frequency, index) => {
        const start = audio.currentTime + index * duration;
        const oscillator = audio.createOscillator();
        const envelope = audio.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = frequency;
        if (cue === "click") {
          oscillator.frequency.setValueAtTime(frequency, start);
          oscillator.frequency.exponentialRampToValueAtTime(380, start + 0.035);
        }
        envelope.gain.setValueAtTime(0.001, start);
        envelope.gain.exponentialRampToValueAtTime(cue === "click" ? 0.045 : 0.09, start + 0.008);
        envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
        oscillator.connect(envelope).connect(audio.destination);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
        oscillator.start(start);
        oscillator.stop(start + duration);
      });
    } catch { /* Audio availability never blocks a round. */ }
  }, []);

  useEffect(() => {
    function clickSound(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest('button, a[href], input[type="checkbox"], summary, [role="option"]');
      if (control && !control.matches(':disabled, [aria-disabled="true"], [data-own-sound]')) play("click");
    }
    document.addEventListener("click", clickSound, true);
    return () => document.removeEventListener("click", clickSound, true);
  }, [play]);

  function toggle() {
    muted.current = !muted.current;
    setEnabled(!muted.current);
    if (muted.current) {
      music.current?.pause();
      if (context.current) void context.current.close().catch(() => {});
      context.current = null;
    } else {
      startMusic();
      play("tick");
    }
  }

  return { enabled, play, toggle };
}
