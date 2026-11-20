import { verdict, type Meme, type Result } from "./game";

export function challengeLink(id: string): string | null {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_GAME_URL || window.location.origin);
    const host = url.hostname;
    if (url.protocol !== "https:" || !host.includes(".") ||
        /(?:^|\.)(?:localhost|local|test)$/.test(host) ||
        /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|169\.254\.|0\.)/.test(host)) return null;
    const link = new URL("/", url.origin);
    link.searchParams.set("meme", id);
    return link.href;
  } catch {
    return null;
  }
}

async function loadImage(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

export async function renderShareCard(meme: Meme, result: Result, link: string | null) {
  const [reference, pose] = await Promise.all([
    loadImage(meme.image),
    loadImage(result.snapshot),
    document.fonts.ready,
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const ink = "#202020";
  const font = getComputedStyle(document.querySelector("h1") ?? document.body).fontFamily;
  function label(value: string, x: number, baseline: number, size: number, maxWidth = 960) {
    if (!ctx) return;
    ctx.fillStyle = ink;
    ctx.font = "700 " + size + "px " + font;
    ctx.fillText(value, x, baseline, maxWidth);
  }
  ctx.fillStyle = "#D7FC57";
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = ink;
  ctx.fillRect(36, 40, 1018, 1008);
  ctx.fillStyle = "#fafaf7";
  ctx.fillRect(28, 28, 1016, 1008);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.strokeRect(28, 28, 1016, 1008);
  label("MemeMatch", 62, 112, 62);
  if (meme.boss) label("FINAL BOSS", 728, 108, 38, 288);
  label(meme.name, 62, 195, 56);
  for (const [index, image] of [reference, pose].entries()) {
    const x = 62 + index * 496;
    ctx.fillStyle = "#A58BFF";
    ctx.fillRect(x, 238, 460, 460);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const [px, py] = (index === 0 ? meme.position ?? "50% 50%" : "50% 50%").split(" ").map(parseFloat);
    ctx.drawImage(image, (image.naturalWidth - side) * px / 100,
      (image.naturalHeight - side) * py / 100, side, side, x, 238, 460, 460);
    ctx.strokeRect(x, 238, 460, 460);
    label(index === 0 ? "THE MEME" : "YOUR TAKE", x, 745, 30);
  }
  ctx.fillStyle = "#FF6B9B";
  ctx.fillRect(62, 785, 956, 110);
  ctx.strokeRect(62, 785, 956, 110);
  label(result.score === null ? "UNSCORED" : result.score + " / 100 PTS", 82, 861, 66);
  label(result.score === null ? "Your turn to strike a pose." : verdict(result.score).title, 62, 957, 39);
  if (link) label(link, 62, 1007, 27);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
    png => png ? resolve(png) : reject(new Error("PNG export failed")), "image/png"
  ));
  return new File([blob], "memematch-" + meme.id + ".png", { type: "image/png" });
}
