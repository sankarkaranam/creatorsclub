// Usage: node render.mjs <url> <outDir> <fps> [times...]
// With times: renders only those seconds (preview stills). Without: renders every frame of window.DURATION.
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire('/Users/sankarkaranam/Projects/OruMind/CreatorsClub/relaydm/node_modules/.pnpm/playwright@1.64.1/node_modules/playwright/package.json');
const { chromium } = require('playwright');

const [url, out, fpsArg = '30', ...times] = process.argv.slice(2);
const fps = +fpsArg;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
if (errors.length) console.log('page errors:', errors.slice(0, 5));

const shots = times.length ? times.map(Number) : Array.from({ length: Math.round((await page.evaluate(() => window.DURATION)) * fps) }, (_, i) => i / fps);
const t0 = Date.now();
for (let i = 0; i < shots.length; i++) {
  await page.evaluate((t) => window.renderAt(t), shots[i]);
  const name = times.length ? `t${String(shots[i]).replace('.', '_')}.jpg` : `${String(i).padStart(5, '0')}.jpg`;
  await page.screenshot({ path: `${out}/${name}`, type: 'jpeg', quality: 92 });
  if (!times.length && i % 150 === 0) console.log(`frame ${i}/${shots.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
console.log(`done: ${shots.length} frame(s) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await browser.close();
