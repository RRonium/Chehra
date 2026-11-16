// Copies MediaPipe's WASM runtime into public/ so pose detection runs fully offline from our own origin.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
const src = 'node_modules/@mediapipe/tasks-vision/wasm';
const dest = 'public/mediapipe/wasm';
if (existsSync(src)) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log('Copied MediaPipe WASM to', dest);
}
