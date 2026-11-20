"use client";

import { useSearchParams } from "next/navigation";
import { MemeMatch } from "@/components/meme-match";
import { memes } from "@/lib/game";

export function HomeClient() {
  const id = useSearchParams().get("meme");
  return <MemeMatch firstMeme={memes.find(item => item.id === id)} />;
}
