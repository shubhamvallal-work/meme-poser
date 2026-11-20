// Sample the central face, excluding the corners of the bounding rectangle.
// All thresholds are on the 0–255 scale of the captured (sRGB) image.
export function hasVisibleDetail(rgba: Uint8ClampedArray, size: number) {
  const histogram = new Uint32Array(256);
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (((x + 0.5) / size - 0.5) ** 2 + ((y + 0.5) / size - 0.5) ** 2 > 0.25) continue;
      const i = (y * size + x) * 4;
      const brightness = Math.round(0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]);
      histogram[brightness]++;
      count++;
    }
  }
  const percentile = (fraction: number) => {
    let cumulative = 0;
    for (let i = 0; i < histogram.length; i++) {
      cumulative += histogram[i];
      if (cumulative >= count * fraction) return i;
    }
    return 255;
  };
  const high = percentile(0.85);
  return high >= 48 && high - percentile(0.15) >= 18;
}
