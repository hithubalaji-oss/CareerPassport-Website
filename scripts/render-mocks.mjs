#!/usr/bin/env node
/**
 * Renders the product-screen mocks in scripts/mocks/ to public/assets/*.webp.
 *
 *   npm run render:mocks
 *
 * Each mock is a 1600×900 HTML page styled with the site's tokens and Google Fonts. It is
 * screenshotted by headless Chrome at 2× device scale (so the type stays crisp inside the
 * closing-section frame on a retina screen), then resized to 2000×1125 and encoded as WebP
 * with sharp, which Astro already ships in node_modules.
 *
 * The rendered files are committed: Vercel never runs this, it only serves public/. Re-run it
 * after editing a mock, and commit the new .webp alongside the .html.
 *
 * Needs Chrome on the machine. Set CHROME_BIN to point at it if it is not in one of the
 * usual places. Needs network access for the Google Fonts request, or the type falls back
 * to Helvetica and the letter-spacing reads wrong.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const mocksDir = join(here, 'mocks');
const outDir = join(root, 'public', 'assets');

const MOCKS = [
  { html: 'close-product-companies.html', out: 'close-product-companies.webp' },
  { html: 'close-product-partners.html', out: 'close-product-partners.webp' },
];
const SOURCE = { width: 1600, height: 900, scale: 2 };
const OUTPUT = { width: 2000, height: 1125, quality: 84 };

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    console.error('Chrome not found. Set CHROME_BIN to the browser executable and re-run.');
    process.exit(1);
  }
  return found;
}

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('sharp is not installed. Run `npm ci` first.');
    process.exit(1);
  }
  const chrome = findChrome();
  mkdirSync(outDir, { recursive: true });

  for (const { html, out } of MOCKS) {
    const src = join(mocksDir, html);
    if (!existsSync(src)) {
      console.error(`missing ${src}`);
      process.exit(1);
    }
    const png = join(tmpdir(), out.replace(/\.webp$/, '.png'));
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=${SOURCE.width},${SOURCE.height}`,
      `--force-device-scale-factor=${SOURCE.scale}`,
      // give the fonts time to arrive before the capture
      '--virtual-time-budget=8000',
      `--screenshot=${png}`,
      pathToFileURL(src).href,
    ];
    const run = spawnSync(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    if (run.status !== 0 || !existsSync(png)) {
      console.error(`Chrome failed on ${html}:\n${run.stderr}`);
      process.exit(1);
    }
    const dest = join(outDir, out);
    const info = await sharp(png)
      .resize(OUTPUT.width, OUTPUT.height)
      .webp({ quality: OUTPUT.quality })
      .toFile(dest);
    const kb = Math.round(statSync(dest).size / 1024);
    console.log(`  ${out}  ${info.width}×${info.height}  ${kb} KB`);
  }
  console.log('Rendered. Commit public/assets/*.webp with the mock sources.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
