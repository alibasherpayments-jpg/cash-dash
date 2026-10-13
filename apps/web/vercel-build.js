const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[vercel-build] 1. Linking node_modules/.pnpm to root...');
try {
  const pnpmRoot = path.resolve(__dirname, '../../node_modules/.pnpm');
  const pnpmLocal = path.resolve(__dirname, 'node_modules/.pnpm');
  if (!fs.existsSync(pnpmLocal) && fs.existsSync(pnpmRoot)) {
    fs.symlinkSync(pnpmRoot, pnpmLocal, 'junction');
    console.log('[vercel-build] ✓ Linked node_modules/.pnpm');
  }
} catch (e) {
  console.warn('[vercel-build] Warning linking .pnpm:', e.message);
}

console.log('[vercel-build] 2. Running next build...');
const nextBin = require.resolve('next/dist/bin/next');
execSync(`node "${nextBin}" build`, { stdio: 'inherit' });

console.log('[vercel-build] 3. Linking apps/web/.next...');
try {
  const appsWebDir = path.resolve(__dirname, 'apps/web');
  if (!fs.existsSync(appsWebDir)) {
    fs.mkdirSync(appsWebDir, { recursive: true });
  }
  const nestedNext = path.resolve(appsWebDir, '.next');
  if (!fs.existsSync(nestedNext)) {
    try {
      fs.symlinkSync('../.next', nestedNext, 'junction');
    } catch {
      fs.cpSync(path.resolve(__dirname, '.next'), nestedNext, { recursive: true });
    }
    console.log('[vercel-build] ✓ Linked apps/web/.next');
  }
} catch (e) {
  console.warn('[vercel-build] Warning linking apps/web/.next:', e.message);
}

console.log('[vercel-build] ✓ Build finished successfully!');
