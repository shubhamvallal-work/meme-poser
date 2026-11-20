import { MemeMatch } from "@/components/meme-match";
import { memes } from "@/lib/game";

export default async function Home({ searchParams }: { searchParams: Promise<{ meme?: string | string[] }> }) {
  const { meme } = await searchParams;
  return <MemeMatch firstMeme={memes.find(item => item.id === meme)} />;
}
