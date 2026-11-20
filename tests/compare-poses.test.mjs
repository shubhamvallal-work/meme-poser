import assert from "node:assert/strict";
import test from "node:test";
import { comparePoses } from "../src/lib/compare-poses.ts";
import { hasVisibleDetail } from "../src/lib/face-visibility.ts";

test("underexposure, isolated highlights and flat face crops do not qualify", () => {
  const sample = brightness => Uint8ClampedArray.from({ length: 64 * 64 * 4 },
    (_, i) => i % 4 === 3 ? 255 : brightness(Math.floor(i / 4)));
  assert.equal(hasVisibleDetail(sample(i => i % 31), 64), false);
  assert.equal(hasVisibleDetail(sample(i => i % 20 === 0 ? 255 : 8), 64), false);
  assert.equal(hasVisibleDetail(sample(i => 110 + i % 8), 64), false);
  assert.equal(hasVisibleDetail(sample(i => 18 + i % 74), 64), true);
});

function pose(smile = 0, brow = 0, gaze = 0, tiltDegrees = 0) {
  return {
    movements: new Map([["mouthSmileLeft", smile], ["mouthSmileRight", smile],
      ["browInnerUp", brow], ["eyeLookOutLeft", gaze]]),
    tiltDegrees, turnDegrees: 0, nodDegrees: 0,
  };
}

test("a defining smile earns more credit as the player approaches it", () => {
  const target = pose(0.8);
  const scores = [0, 0.3, 0.55, 0.8].map(s => comparePoses(target, pose(s)).score);
  assert.equal(scores.at(-1), 100);
  assert.ok(scores[0] < 50);
  assert.ok(scores.every((v, i) => !i || v > scores[i - 1]));
  assert.match(comparePoses(target, pose()).feedback, /lip/);
});

test("the right eyes, brows and tilt contribute independently", () => {
  const target = pose(0, 0.8, 0.75, 25);
  for (const mismatch of [pose(0, 0, 0.75, 25), pose(0, 0.8, 0, 25), pose(0, 0.8, 0.75, -25)]) {
    const result = comparePoses(target, mismatch);
    assert.ok(result.score < 95);
    assert.equal(result.metrics.filter(m => m.value < 100).length, 1);
  }
});

test("small measurement noise stays close, and extra movements cost points", () => {
  const neutral = pose();
  assert.equal(comparePoses(neutral, pose(0.03, 0.02, 0.01, 3)).score, 100);
  assert.ok(comparePoses(neutral, pose(0.9)).score < 50);
});
  
test("a head turned the other way or a raised chin affects the score", () => {
  const target = { ...pose(), turnDegrees: 27, nodDegrees: -17 };
  assert.equal(comparePoses(target, target).score, 100);
  for (const take of [{ ...target, turnDegrees: -27 }, { ...target, nodDegrees: 22 }]) {
    const result = comparePoses(target, take);
    assert.ok(result.score < 75);
    assert.match(result.metrics.at(-1).observation, /meme .*° \/ you .*°/);
    assert.deepEqual(result, comparePoses(target, take));
  }
});
