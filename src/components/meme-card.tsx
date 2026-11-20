import Image from "next/image";
import type { Meme } from "@/lib/game";
import { Icon } from "./ui";

export function MemeCard({ meme, className = "", priority = false, compact = false }: { meme: Meme; className?: string; priority?: boolean; compact?: boolean }) {
  return <figure className={`meme-card ${meme.color} ${compact ? "compact" : ""} ${className}`}>
    <div className="meme-photo">
      <Image src={meme.image} alt={meme.alt} fill sizes={compact ? "220px" : "(max-width: 640px) 85vw, 420px"} priority={priority} style={{ objectFit: "cover", objectPosition: meme.position }} />
      {!compact && <span className="photo-label">REFERENCE MEME</span>}
    </div>
    <figcaption><span>{meme.name}</span><Icon name="spark" /></figcaption>
  </figure>;
}
