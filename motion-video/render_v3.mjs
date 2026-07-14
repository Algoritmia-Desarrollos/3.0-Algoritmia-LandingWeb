import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FPS = 60;
const SPEED = 1.2;              // playback speed multiplier
const W = 1080, H = 1080;
const sceneUrl = pathToFileURL(path.join(__dirname, 'v3.html')).href;
const outFile = path.join(__dirname, 'creative-studio-v3.mp4');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(sceneUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600); // decode webp/png + fonts

const DUR = await page.evaluate(() => window.__DUR);
const outDur = DUR / SPEED;
const totalFrames = Math.round(outDur * FPS);
console.log(`Rendering ${totalFrames} frames -> ${outDur.toFixed(1)}s @ ${FPS}fps (speed ${SPEED}x)`);

const ff = spawn(ffmpegPath, [
  '-y',
  '-f', 'image2pipe',
  '-framerate', String(FPS),
  '-i', '-',
  '-vf', 'format=yuv420p',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '17',
  '-movflags', '+faststart',
  outFile,
]);
ff.stderr.on('data', () => {});
const ffDone = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));

for (let f = 0; f < totalFrames; f++) {
  const tScene = (f / FPS) * SPEED;
  await page.evaluate((tt) => window.__render(tt), tScene);
  const buf = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 60 === 0) process.stdout.write(`\r  frame ${f}/${totalFrames}`);
}
ff.stdin.end();
process.stdout.write(`\r  frame ${totalFrames}/${totalFrames}\n`);
await ffDone;
await browser.close();
console.log('Done ->', outFile);
