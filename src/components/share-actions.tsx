"use client";

import { useEffect, useState } from "react";
import { type Meme, type Result } from "@/lib/game";
import { challengeLink, renderShareCard } from "@/lib/share-card";
import { Button } from "./ui";

type Export = { file: File; href: string; link: string | null };

export function ShareActions({ meme, result }: { meme: Meme; result: Result }) {
  const [card, setCard] = useState<Export | null>(null);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    let active = true;
    let href: string | undefined;
    const link = challengeLink(meme.id);
    renderShareCard(meme, result, link).then(file => {
      if (!active) return;
      href = URL.createObjectURL(file);
      setCard({ file, href, link });
    }).catch(() => { if (active) setFailed(true); });
    return () => {
      active = false;
      if (href) URL.revokeObjectURL(href);
    };
  }, [meme, result, attempt]);

  async function share() {
    if (!card || sharing) return;
    const payload: ShareData = {
      files: [card.file],
      title: "MemeMatch · " + meme.name,
      text: result.score === null ? "Try my " + meme.name + " challenge!" :
        "I scored " + result.score + "/100 on " + meme.name + ". Your turn!",
      ...(card.link && { url: card.link }),
    };
    setMessage("");
    try {
      if (!navigator.share || !navigator.canShare?.(payload)) {
        setMessage("Save the PNG below, then attach it in WhatsApp or Instagram.");
        return;
      }
      setSharing(true);
      await navigator.share(payload);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setMessage("Sharing was unavailable. Save the PNG and attach it in your app.");
      }
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    if (!card?.link) return;
    try {
      await navigator.clipboard.writeText(card.link);
      setMessage("Challenge link copied. Paste it with your card.");
    } catch {
      setMessage("Copy this challenge link: " + card.link);
    }
  }

  return <div className="card-export">
    <div className="card-export-controls">
      {failed ? <Button onClick={() => { setFailed(false); setAttempt(a => a + 1); }}>Retry PNG export</Button> :
        <Button variant="lime" onClick={share} disabled={!card || sharing}>
          {card ? "SHARE CARD" : "PREPARING PNG…"}
        </Button>}
      {card && <a className="text-button" href={card.href} download={card.file.name}>Save PNG</a>}
      {card?.link && <button type="button" className="text-button" onClick={copyLink}>Copy challenge link</button>}
    </div>
    <p role="status">{failed ? "The card image could not be prepared." : message ||
      (card?.link ? "Includes a link to play this meme." : "")}</p>
  </div>;
}
