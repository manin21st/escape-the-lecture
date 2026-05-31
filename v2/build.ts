import { build } from 'bun';
import { existsSync, mkdirSync } from 'fs';

if (!existsSync('./dist')) mkdirSync('./dist');

const result = await build({
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  target: 'browser',
  minify: false,
  naming: {
    entry: 'bundle.js',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

if (!result.success) {
  console.error('Build failed:');
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await Bun.write('./dist/index.html', Bun.file('./public/index.html'));
console.log('Build complete — dist/bundle.js + dist/index.html');
