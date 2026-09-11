// @ts-check
import { defineConfig } from 'astro/config';

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
});
