import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const W = 1080, H = 1080;
const sceneUrl = pathToFileURL(path.join(__dirname, 'scene.html')).href;
const outFile = path.join(__dirname, 'creative-studio-demo.mp4');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(sceneUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400); // let webp images decode

const DUR = await page.evaluate(() => window.__DUR);
const totalFrames = Math.round(DUR * FPS);
console.log(`Rendering ${totalFrames} frames (${DUR}s @ ${FPS}fps) -> ${path.basename(outFile)}`);

// ffmpeg reads raw PNG frames from stdin
const ff = spawn(ffmpegPath, [
  '-y',
  '-f', 'image2pipe',
  '-framerate', String(FPS),
  '-i', '-',
  '-vf', 'format=yuv420p',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '18',
  '-movflags', '+faststart',
  outFile,
]);
ff.stderr.on('data', () => {}); // silence progress
const ffDone = new Promise((res, rej) => {
  ff.on('close', code => code === 0 ? res() : rej(new Error('ffmpeg exit ' + code)));
});

for (let f = 0; f < totalFrames; f++) {
  const t = f / FPS;
  await page.evaluate((tt) => window.__render(tt), t);
  const buf = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) {
    await new Promise(r => ff.stdin.once('drain', r));
  }
  if (f % 30 === 0) process.stdout.write(`\r  frame ${f}/${totalFrames}`);
}
ff.stdin.end();
process.stdout.write(`\r  frame ${totalFrames}/${totalFrames}\n`);
await ffDone;
await browser.close();
console.log('Done ->', outFile);
