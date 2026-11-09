import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

// The portfolio deploys only works/. Keep editable source and development dependencies outside it.
const project = resolve(import.meta.dirname, '..');
const portfolio = resolve(project, '../..');
const built = join(project, 'site');
const destination = join(portfolio, 'works/sixhours');
await readFile(join(portfolio, 'static-build.js'), 'utf8');
await readFile(join(built, 'index.html'), 'utf8'); // Fail before touching a previous export.
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(built, destination, { recursive: true });
const original = await readFile(join(built, 'index.html'), 'utf8');
const html = original.replace('<head>', '<head>\n  <base href="/sixhours/">\n  <meta name="robots" content="noindex, nofollow">');
await writeFile(join(destination, 'index.html'), html);
await cp(join(project, 'LICENSE'), join(destination, 'LICENSE'));
await cp(join(project, 'PORTFOLIO.md'), join(destination, 'README.md'));
console.log('Exported the static Sixhours demo to works/sixhours/; source stays in demo-sources/sixhours/.');
