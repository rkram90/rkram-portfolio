// Post-build steps for static hosting on Cloudflare Pages.
// - Copies the prerendered /404 route to /404.html so unknown paths get the 404 page with HTTP 404.
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const out = 'dist/rkram-portfolio/browser';
const notFound = join(out, '404', 'index.html');

if (!existsSync(notFound)) {
  console.error(`postbuild: ${notFound} not found — is the /404 route prerendered?`);
  process.exit(1);
}

copyFileSync(notFound, join(out, '404.html'));
console.log('postbuild: wrote 404.html');
