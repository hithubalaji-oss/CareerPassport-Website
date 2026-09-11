// @ts-check
import { defineConfig } from 'astro/config';
import { execSync } from 'node:child_process';

/* A build id the page can show. Vercel sets VERCEL_GIT_COMMIT_SHA; locally we ask git; and if
   neither answers, the build still succeeds with a placeholder rather than failing over a
   diagnostic label. It is read by src/scripts/diag.js and put on <html data-build>, so
   "is this phone actually on the new version?" is answerable by looking rather than guessing. */
const BUILD_ID = (() => {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (sha) return sha.slice(0, 7);
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return 'local'; }
})();

// Static output: three marketing pages, no server runtime. Every interaction on the site
// is local (scroll position, a mobile drawer, an email-capture state change), so there is
// nothing to render on demand.
export default defineConfig({
  site: 'https://careerpassport.ai',
  output: 'static',
  build: {
    // The scroll drivers are hand-tuned vanilla modules that read layout every frame.
    // Keeping them as separate files rather than inlined blobs keeps them debuggable
    // and lets the browser cache them across pages.
    inlineStylesheets: 'never',
  },
  vite: {
    define: { __CP_BUILD__: JSON.stringify(BUILD_ID) },
  },
});
