import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function pwaManifestPlugin() {
  return {
    name: 'pwa-manifest-plugin',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const assetsDir = path.resolve(distDir, 'assets');
      const swPath = path.resolve(distDir, 'sw.js');

      if (fs.existsSync(assetsDir) && fs.existsSync(swPath)) {
        const files = fs.readdirSync(assetsDir);
        const assetPaths = files
          .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
          .map((f) => `/assets/${f}`);

        let swContent = fs.readFileSync(swPath, 'utf-8');
        const injectString = `const PRECACHE_ASSETS = ${JSON.stringify(
          ['/', '/index.html', '/manifest.webmanifest', '/manifest.json', '/icon.svg', ...assetPaths],
          null,
          2
        )};`;
        swContent = swContent.replace(/const PRECACHE_ASSETS = \[[\s\S]*?\];/, injectString);
        fs.writeFileSync(swPath, swContent);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pwaManifestPlugin()],
});
