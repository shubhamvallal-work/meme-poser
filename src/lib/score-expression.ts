import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import type { Meme, Result } from "./game";
import { comparePoses, type Pose } from "./compare-poses";
import { hasVisibleDetail } from "./face-visibility";

class CaptureQualityError extends Error {}

let model: Promise<FaceLandmarker> | undefined;
const references = new Map<string, Pose | null>();

async function loadModel() {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const files = await FilesetResolver.forVisionTasks("/vision-wasm");
  return FaceLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: "/face_landmarker.task" },
    runningMode: "IMAGE",
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    numFaces: 2,
  });
}

async function measure(detector: FaceLandmarker, src: string, cameraCapture = false) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const detection = detector.detect(image);
  const categories = detection.faceBlendshapes[0]?.categories;
  const face = detection.faceLandmarks[0];
  if (detection.faceLandmarks.length > 1) {
    throw new CaptureQualityError(cameraCapture ? "More than one face visible. Try again with just you in the frame." : "This reference has more than one possible face.");
  }
  const rotation = detection.facialTransformationMatrixes[0]?.data;
  if (!rotation || rotation.length !== 16 || !rotation.every(Number.isFinite)) return null;
  if (!categories?.length || !face?.[263] || !face[33]) return null;
  // Outer eye corners, measured in pixels to account for non-square photos.
  const dx = (face[263].x - face[33].x) * image.naturalWidth;
  const dy = (face[263].y - face[33].y) * image.naturalHeight;
  if (Math.hypot(dx, dy) < 3) return null;
  if (cameraCapture) {
    const xs = face.map(point => point.x * image.naturalWidth);
    const ys = face.map(point => point.y * image.naturalHeight);
    const left = Math.min(...xs), top = Math.min(...ys);
    const width = Math.max(...xs) - left, height = Math.max(...ys) - top;
    if (Math.hypot(dx, dy) < 24 || width < image.naturalWidth * 0.08) {
      throw new CaptureQualityError("Move closer so your eyes and mouth are clearly visible.");
    }
    const sample = document.createElement("canvas");
    sample.width = sample.height = 64;
    const ctx = sample.getContext("2d");
    if (!ctx) throw new Error("Image sampling unavailable");
    ctx.drawImage(image, left + width * 0.17, top + height * 0.18, width * 0.66, height * 0.66, 0, 0, 64, 64);
    if (!hasVisibleDetail(ctx.getImageData(0, 0, 64, 64).data, 64)) {
      throw new CaptureQualityError("Too little detail on your face to score. Try a light in front of you.");
    }
  }
  // Apertures are distances relative to the width of the same feature.
  // This keeps a close-up comparable to a smaller face in the frame.
  const distance = (a: number, b: number) => Math.hypot(
    (face[a].x - face[b].x) * image.naturalWidth,
    (face[a].y - face[b].y) * image.naturalHeight,
  );
  const aperture = (top: number, bottom: number, left: number, right: number) =>
    Math.min(1, distance(top, bottom) / Math.max(1, distance(left, right)));
  const movements = new Map(categories.map(c => [c.categoryName, c.score]));
  movements.set("mouthLipGap", aperture(13, 14, 61, 291));
  movements.set("eyeOpeningLeft", aperture(386, 374, 362, 263));
  movements.set("eyeOpeningRight", aperture(159, 145, 33, 133));
  // The third column of MediaPipe's column-major matrix is the face's
  // forward direction. Using its direction cancels the face scale.
  return {
    movements,
    tiltDegrees: Math.atan2(dy, dx) * 180 / Math.PI,
    turnDegrees: Math.atan2(rotation[8], rotation[10]) * 180 / Math.PI,
    nodDegrees: Math.atan2(rotation[9], Math.hypot(rotation[8], rotation[10])) * 180 / Math.PI,
  };
}

export async function scoreExpression(meme: Meme, snapshot: string): Promise<Result> {
  const unscored = (reason: string): Result => ({ snapshot, score: null, reason, metrics: [] });
  try {
    model ??= loadModel().catch(error => { model = undefined; throw error; });
    const detector = await model;
    let reference = references.get(meme.id);
    if (reference === undefined) {
      reference = await measure(detector, meme.image);
      references.set(meme.id, reference);
    }
    if (!reference) return unscored("The meme has no readable human face for comparison.");
    const pose = await measure(detector, snapshot, true);
    if (!pose) return unscored("No clear face in your photo. Face the camera in good light and try again.");

    return { snapshot, ...comparePoses(reference, pose) };
  } catch (error) {
    if (error instanceof CaptureQualityError) return unscored(error.message);
    return unscored("Expression analysis was unavailable for this round.");
  }
}
