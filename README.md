# MemeMatch

A responsive expression-matching game built with Next.js App Router, TypeScript, Tailwind CSS 4, and Motion. Camera capture is local to the browser; expression scoring runs on the device.

## Run locally

Use Node.js 20.9 or later (verified with Node 26.13.1).

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Use `npm run build` followed by `npm start` to serve the production build. Use HTTPS on your public host so mobile browsers can request camera access.

## Checks

```bash
npm run lint
npm run typecheck
node --experimental-strip-types --test tests/*.mjs
npm run build
```

## What is implemented

- Landing page with the requested palette, local Space Grotesk / DM Sans fonts, animated headline, spring interactions, meme collage, and background shapes.
- A 121-meme face deck includes recent reactions, Indian memes, brainrot and classics. Each playable photo passed a single-face check with the bundled model. Each round shows the meme name and a pose prompt.
- Final Boss sets the deck to 15 rounds. Every round auto-captures after three seconds. The boss score averages the usual score with the weakest metric.
- Browser-local live camera preview, a real captured snapshot, a responsive comparison layout, a timer dropdown (3, 5, 10, 15 or 30 seconds, or manual capture), pause/resume, manual capture, and automatic capture. Opening an informational dialog pauses the countdown.
- Local MediaPipe expression comparison, metric bars, finite confetti, and a highest-first recap for sets of 3, 5, 10, 15 or 20 rounds. Endless reshuffles after each full deck and offers Stop game from the first round. Stopping returns home before the first photo, or shows rankings once a photo has been captured.
- Result card with the captured camera snapshot, with local 1080×1080 PNG export and native file sharing.
- Meme-wall picker and native modal instructions with Escape dismissal and focus containment.
- Reduced-motion support, keyboard focus styles, a skip link, screen-change focus management, image descriptions, and countdown announcements.

## Current boundaries

The app requests front-camera access only after the player selects **Enable Camera**. The browser displays the permission request. Video stays on the device; a captured JPEG exists only in the app's active memory and is discarded when the player leaves the set and its results or the page refreshes. Players can explicitly save or share a PNG. MemeMatch does not upload the photo.

The bundled MediaPipe Face Landmarker measures blendshape coefficients in the meme and the captured photo. The game compares movement intensity in the eyes, brows and mouth, and measures eyelid opening, lip gap, head tilt, turn and nod. Reference movements drive a weighted error calculation, with tolerance for small differences. Scores are game points out of 100. The result card shows the measured differences behind the score. Captures with multiple detected faces stay unscored. A missing photo, unreadable face, or model error yields an unscored card. Model source: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task. The local /vision-wasm files come from the pinned @mediapipe/tasks-vision package.

Every expanded result has Share Card and Save PNG actions. Game state is kept in memory, so refresh returns to the landing page. Gameplay is a typed state machine within the `/` App Router route; browser history is not used for rounds.

## Manual smoke test

1. Select **LET'S GET SILLY**. Check the defaults of 10 rounds and 15 seconds, then try a three-round set.
2. Select **Start Game**, enable the camera, and capture round one. Check that the next meme name and directions appear while the same camera preview continues.
3. Pause and resume round two. Let the countdown expire and check that the third round starts, then capture it and check the leaderboard lists all three rounds, highest score first.
4. Check that the top result card is already expanded and select another ranked row to see its card inline.
5. Try a three-round set with Manual selected with camera permission denied. Verify that Capture stays disabled and the game explains how to restore access. Allow the camera and finish the same round.
6. Repeat at 390px and 320px widths. Check that the name, hint, both previews and shutter fit together in portrait and landscape. Navigate with Tab/Enter/Space, then enable the operating system's reduced-motion preference and repeat.

## Source map

| File | Purpose |
| --- | --- |
| `src/app/page.tsx` | App Router entry point |
| `src/app/layout.tsx` | Metadata and self-hosted fonts |
| `src/app/globals.css` | Tailwind theme, art direction, responsive layouts, accessibility styles |
| `src/app/icon.svg` | Custom smile favicon |
| `src/components/meme-match.tsx` | Game controller, navigation, dialogs, screen transitions |
| `src/components/landing.tsx` | Landing collage and reusable how-to-play content |
| `src/components/game-screens.tsx` | Reveal, live camera capture, challenge, score, comparison, countdown, and confetti |
| `src/components/meme-card.tsx` | Shared reference card with optimized images |
| `src/components/ui.tsx` | Buttons, icons, illustrated face, native dialog |
| `src/lib/game.ts` | Meme catalog, discriminated game states, guarded reducer and ranking |
| `public/memes/` | Bundled meme reference images |
| `public/fonts/` | Local fonts and their SIL Open Font License files |

Root configuration includes `package.json`, its lockfile, `tsconfig.json`, ESLint and PostCSS configuration, `.gitignore`, and Next-generated `next-env.d.ts` / `AGENTS.md`. No `modern-web-guidance` installation was found in the supplied workspace or installed skill directories.

## Assets

Fonts: [DM Sans](https://fonts.google.com/specimen/DM+Sans) and [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk), distributed under the included SIL Open Font Licenses.

The Memegen expressions use local copies of blank images from the [Memegen template catalog](https://api.memegen.link/templates). The original references are [Side-Eye Chloe](https://i.imgflip.com/7h6g4.jpg), [Disaster Girl](https://i.imgflip.com/23ls.jpg), and [Success Kid](https://i.imgflip.com/1bhk.jpg).

The additional reference crops are bundled locally. Each new template has its source URL in `src/lib/reaction-catalog.ts`. Recent formats include [More Like a Quesadilla](https://knowyourmeme.com/memes/more-like-a-quesadilla-guy) and [Tiptoeing in My Jordans](https://knowyourmeme.com/memes/ai-rumpelstiltskin-tip-toein-in-my-jordans). Sources include [Speed Trying Not to Laugh](https://imgflip.com/memetemplate/567871380/my-mom-is-kinda-homeless), [The Rock](https://imgflip.com/memetemplate/382693394/The-Rock), [Sigma Stare](https://imgflip.com/memetemplate/530480815/Sigma-stare), [Raju](https://imgflip.com/memetemplate/337735007/Hera-Pheri), [Aayein?](https://imgflip.com/memetemplate/481561824/Confused-Indian-Boy), and [Jethalal Surprised](https://imgflip.com/memetemplate/352962271/Jethalal-Surprised). Original image rights remain with their respective owners.
