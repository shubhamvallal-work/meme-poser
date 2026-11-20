"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export function Icon({ name, className = "" }: { name: "spark" | "camera" | "smile" | "close" | "download" | "shuffle" | "pause" | "play" | "check" | "heart"; className?: string }) {
  const paths: Record<typeof name, ReactNode> = {
    spark: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />,
    camera: <><path d="M8 6 9.5 3h5L16 6h4a2 2 0 0 1 2 2v11H2V8a2 2 0 0 1 2-2Z" /><circle cx="12" cy="12" r="4" /></>,
    smile: <><circle cx="12" cy="12" r="10" /><path d="M8 8v2m8-2v2M7 14q5 7 10 0" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" /></>,
    shuffle: <><path d="m3 5 4 0 10 14h4m-4-4 4 4-4 3M3 19h4l3-4m4-6 3-4h4m-4-3 4 3-4 4" /></>,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    play: <path d="m7 3 15 9-15 9Z" />,
    check: <path d="m4 12 5 5L20 6" />,
    heart: <path d="M12 21 3 12C-3 5 6-1 12 6c6-7 15-1 9 6Z" />,
  };
  return <svg aria-hidden="true" className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function Button({ children, className = "", variant = "dark", ...props }: HTMLMotionProps<"button"> & { variant?: "dark" | "light" | "pink" | "lime" }) {
  return <motion.button type="button" whileHover={{ y: -3, rotate: -1 }} whileTap={{ y: 3, scale: 0.97 }} transition={{ type: "spring", stiffness: 450, damping: 22 }} className={`arcade-button button-${variant} ${className}`} {...props}>{children}</motion.button>;
}

export function Face({ className = "", cheeky = false }: { className?: string; cheeky?: boolean }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="80" fill="currentColor" stroke="#202020" strokeWidth="5" /><g stroke="#202020" strokeWidth="7" strokeLinecap="round"><path d={cheeky ? "m48 61 23 7m37-7 23-7" : "M59 53v22m62-22v22"} /><path d="M45 102q45 58 90 0" /></g></svg>;
}

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);
  return <dialog ref={ref} className="arcade-dialog" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="dialog-title">
    <div className="dialog-content">
      <button type="button" onClick={onClose} className="icon-button dialog-close" aria-label="Close dialog"><Icon name="close" /></button>
      <span className="eyebrow">A LITTLE LESS SERIOUS. A LOT MORE SILLY.</span>
      <h2 id="dialog-title">{title}</h2>
      {children}
    </div>
  </dialog>;
}
