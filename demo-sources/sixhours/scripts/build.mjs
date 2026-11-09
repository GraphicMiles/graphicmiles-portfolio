import { build } from 'esbuild';
import { policyLabels } from '../src/domain/delivery.js';
import { readFile, writeFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve, join, relative, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'site');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(root, 'public'), output, { recursive: true });
const sourceHTML = await readFile(join(root, 'src/index.html'), 'utf8');
const pageHTML = sourceHTML.replace(/(<span data-policy="(\w+)">)[^<]*(<\/span>)/g, (match, open, key, close) => policyLabels[key] ? `${open}${policyLabels[key]}${close}` : match);
await writeFile(join(output, 'index.html'), pageHTML);
const cssFiles = ['tokens', 'base', 'layout', 'components', 'commerce', 'views'];
const css = (await Promise.all(cssFiles.map(name => readFile(join(root, `src/styles/${name}.css`), 'utf8')))).join('\n');
await writeFile(join(output, 'styles.css'), css);
await build({ entryPoints: [join(root, 'src/app.js')], bundle: true, outfile: join(output, 'app.js'), format: 'iife', target: 'es2020', minify: false, legalComments: 'eof', logLevel: 'info' });

// The modular source and site folder are the maintainable build. This extra HTML
// export embeds every asset so Arena's network-isolated file viewer also works.
const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? listFiles(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
}
const assetMap = new Map();
for (const file of await listFiles(join(root, 'public'))) {
  if (!mime[extname(file)]) continue;
  const path = relative(join(root, 'public'), file).replaceAll('\\', '/');
  assetMap.set(path, `data:${mime[extname(file)]};base64,${(await readFile(file)).toString('base64')}`);
}
function inlineAssets(text) {
  for (const [path, data] of assetMap) text = text.replaceAll(path, data);
  return text;
}
let html = await readFile(join(output, 'index.html'), 'utf8');
html = html.replace(/\s*<link rel="preload"[^>]+>/g, '');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${inlineAssets(css)}\n</style>`);
html = html.replace('<script defer src="app.js"></script>', '');
html = inlineAssets(html);
const js = inlineAssets(await readFile(join(output, 'app.js'), 'utf8')).replace(/<\/script/gi, '<\\/script');
html = html.replace('</body>', () => `<script>\n${js}\n</script>\n</body>`);
// Include the actual third-party license notices in the standalone distribution.
const licenseNotices = {};
for (const file of await readdir(join(root, 'public/licenses'))) licenseNotices[file] = await readFile(join(root, 'public/licenses', file), 'utf8');
const licenseJSON = JSON.stringify(licenseNotices).replaceAll('<', '\\u003c');
html = html.replace('</body>', () => `<script type="application/json" id="asset-licenses">${licenseJSON}</script>\n</body>`);
await writeFile(join(root, 'six-preview.html'), html);
console.log(`Built site/ and six-preview.html (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB). No framework or backend.`);
