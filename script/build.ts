import { build as viteBuild } from 'vite';
import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function build() {
  try {
    console.log('🔨 Building client...');
    await viteBuild({
      root: path.resolve(rootDir, 'client'),
      build: {
        outDir: path.resolve(rootDir, 'dist/public'),
        emptyOutDir: true,
      },
    });
    console.log('✓ Client build complete');

    console.log('🔨 Bundling server...');
    await esbuild.build({
      entryPoints: [path.resolve(rootDir, 'server/index.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: path.resolve(rootDir, 'dist/index.cjs'),
      external: ['express', 'drizzle-orm', 'pg', '@replit/vite-plugin-cartographer'],
      format: 'cjs',
      sourcemap: false,
    });
    console.log('✓ Server bundle complete');

    console.log('✓ Build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
