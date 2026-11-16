import type { Measurements } from './types';

export interface Landmark { x: number; y: number; visibility?: number }
export interface ScanResult { landmarks: Landmark[]; estimate: Omit<Measurements, 'height'>; confidence: number; warning?: string }
// MediaPipe pose connections used for the skeleton overlay.
export const BONES: [number, number][] = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32], [0, 11], [0, 12]];

let landmarker: Promise<any> | null = null;
async function getLandmarker() {
  if (!landmarker) {
    landmarker = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
      const base = import.meta.env.BASE_URL;
      const fileset = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);
      return PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: `${base}mediapipe/models/pose_landmarker_lite.task` }, runningMode: 'IMAGE', numPoses: 1,
      });
    })();
    landmarker.catch(() => { landmarker = null; });
  }
  return landmarker;
}

/** Runs pose detection entirely in the browser; the photo never leaves the device. */
export async function scanPhoto(img: HTMLImageElement, heightCm: number): Promise<ScanResult> {
  const lm = await getLandmarker();
  const res = lm.detect(img);
  const pts: Landmark[] | undefined = res.landmarks?.[0];
  if (!pts) throw new Error('No person found. Try a well-lit, front-facing, full-body photo.');
  return { landmarks: pts, ...estimateFromLandmarks(pts, img.naturalWidth, img.naturalHeight, heightCm) };
}

export function estimateFromLandmarks(pts: Landmark[], w: number, h: number, heightCm: number) {
  const P = (i: number) => ({ x: pts[i].x * w, y: pts[i].y * h });
  const dist = (a: number, b: number) => Math.hypot(P(a).x - P(b).x, P(a).y - P(b).y);
  const need = [0, 11, 12, 23, 24, 27, 28];
  const confidence = Math.min(...need.map(i => pts[i].visibility ?? 1));
  if (confidence < 0.35) throw new Error('Could not see your full body clearly. Make sure head to feet are in frame.');
  // The user's entered height is the pixel→cm reference. Eye line sits ~93.6% of stature above the floor (heels).
  const eyeY = (P(2).y + P(5).y) / 2, floorY = (P(29).y + P(30).y) / 2;
  const pxHeight = (floorY - eyeY) / 0.936;
  if (pxHeight < h * 0.3) throw new Error('You appear too small in the frame. Use a closer full-body photo.');
  const cmPerPx = heightCm / pxHeight;
  const shoulderJoint = dist(11, 12) * cmPerPx, hipJoint = dist(23, 24) * cmPerPx;
  // Landmark ratios → circumferences (anthropometric approximations; front view only, so treat as an estimate).
  const shoulder = shoulderJoint * 1.17;
  const chest = shoulderJoint * 2.72;
  const hip = hipJoint * 3.95;
  const waist = 0.5 * (chest * 0.8 + hip * 0.82);
  const r = (v: number) => Math.round(v);
  // Posture sanity check: a wide stance or turned torso skews the ratios.
  const wide = dist(27, 28) > dist(23, 24) * 2.6 || Math.abs(P(11).y - P(12).y) > dist(11, 12) * 0.25;
  const warning = wide ? 'Your stance looks wide or tilted, so these numbers may be off. A straight, feet-together, front-facing photo works best.' : undefined;
  return { estimate: { chest: r(chest), waist: r(waist), hip: r(hip), shoulder: r(shoulder) }, confidence, warning };
}
