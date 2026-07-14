import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sceneUrl = pathToFileURL(path.join(__dirname, 'final.html')).href;
const times = process.argv.slice(2).map(Number);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
await page.goto(sceneUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

for (const t of times) {
  await page.evaluate((tt) => window.__render(tt), t);
  const name = `preview_${String(t).replace('.', '_')}.png`;
  await page.screenshot({ path: path.join(__dirname, name) });
  console.log('saved', name);
}
await browser.close();
