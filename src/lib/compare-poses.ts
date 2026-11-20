export type Pose = {
  movements: Map<string, number>;
  tiltDegrees: number;
  turnDegrees: number;
  nodDegrees: number;
};

const regions = [
  { label: "Eyes & gaze", channels: /^eye/, tip: "Match the direction of the eyes and how wide they are." },
  { label: "Brows", channels: /^brow/, tip: "Look at the height and arch of each eyebrow." },
  { label: "Mouth & jaw", channels: /^(mouth|jaw)/, tip: "Match the lip shape and the gap between the teeth." },
];

function compareRegion(region: typeof regions[number], target: Pose, take: Pose) {
  let weightedError = 0;
  let total = 0;
  let peak = 0;
  let largestError = -1;
  let observation = "";
  for (const [name, expected] of target.movements) {
    if (!region.channels.test(name)) continue;
    const actual = take.movements.get(name);
    if (actual === undefined || !Number.isFinite(actual) || !Number.isFinite(expected)) {
      throw new Error("Incomplete expression measurement");
    }
    const activity = Math.max(expected, actual);
    // Keep the reference in charge of what defines the pose. A player's
    // extra movement still costs points, especially for a neutral target.
    peak = Math.max(peak, expected, actual * 0.65);
    const weight = 0.001 + expected ** 2 + 0.25 * actual ** 2;
    // Ignore tiny detector fluctuations. Scale the remaining difference to the
    // gesture's intensity so a missing half-smile still matters.
    const distance = Math.max(0, Math.abs(actual - expected) - 0.04) / Math.max(0.35, activity - 0.04);
    weightedError += weight * distance ** 2;
    if (weight * distance ** 2 > largestError) {
      largestError = weight * distance ** 2;
      const movement = name.replace(/([A-Z])/g, " $1").trim().toLowerCase();
      observation = `${movement} · meme ${expected.toFixed(2)} / you ${actual.toFixed(2)}`;
    }
    total += weight;
  }
  if (!total) throw new Error("Missing expression region");
  return {
    ...region,
    similarity: 1 - Math.min(1, Math.sqrt(weightedError / total)),
    weight: 0.08 + peak ** 2,
    observation,
  };
}

export function comparePoses(target: Pose, take: Pose) {
  const parts = regions.map(region => compareRegion(region, target, take));
  const difference = Math.abs(target.tiltDegrees - take.tiltDegrees) % 360;
  const tiltError = Math.min(difference, 360 - difference);
  const angles = [
    { label: "Tilt", difference: tiltError, expected: target.tiltDegrees, actual: take.tiltDegrees },
    { label: "Turn", difference: Math.abs(target.turnDegrees - take.turnDegrees), expected: target.turnDegrees, actual: take.turnDegrees },
    { label: "Nod", difference: Math.abs(target.nodDegrees - take.nodDegrees), expected: target.nodDegrees, actual: take.nodDegrees },
  ];
  const largest = angles.reduce((a, b) => a.difference >= b.difference ? a : b);
  const head = {
    label: "Head angle",
    similarity: 1 - Math.min(1, Math.max(0, largest.difference - 5) / 40),
    weight: 0.14 + 0.55 * Math.min(1, Math.max(...angles.map(a => Math.max(Math.abs(a.expected), Math.abs(a.actual)))) / 35),
    tip: { Tilt: "Tip your head toward the same shoulder as the meme.", Turn: "Match how far the face turns to the side.", Nod: "Match how far the chin points up or down." }[largest.label],
    observation: `${largest.label} · meme ${Math.round(largest.expected)}° / you ${Math.round(largest.actual)}°`,
  };
  const features = [...parts, head];
  const weight = features.reduce((sum, f) => sum + f.weight, 0);
  // A visible mismatch costs more than several small measurement differences.
  const error = Math.sqrt(features.reduce((sum, f) => sum + f.weight * (1 - f.similarity) ** 2, 0) / weight);
  const score = Math.round(100 * (1 - error));
  const loss = (f: typeof head) => f.weight * (1 - f.similarity) ** 2;
  const biggestMiss = features.reduce((a, b) => loss(a) >= loss(b) ? a : b);
  return {
    score,
    metrics: features.map(f => ({ label: f.label, value: Math.round(100 * f.similarity), observation: f.observation })),
    feedback: score >= 95 ? "You matched the main movements in this pose." : biggestMiss.tip,
  };
}
