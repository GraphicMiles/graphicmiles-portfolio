const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");

function rm(p) {
    fs.rmSync(p, { recursive: true, force: true });
}

function copy(src, dest) {
    const st = fs.statSync(src);
    if (st.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
            copy(path.join(src, name), path.join(dest, name));
        }
        return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

const skip = new Set([
    "dist",
    "works",
    "node_modules",
    ".git",
    ".vercel",
    "static-build.js",
    "package.json",
    "package-lock.json",
    "vercel.json"
]);

rm(dist);
fs.mkdirSync(dist, { recursive: true });

for (const name of fs.readdirSync(root)) {
    if (skip.has(name) || name.startsWith(".")) continue;
    copy(path.join(root, name), path.join(dist, name));
}

// Portfolio works (self-contained static apps) live under dist/<slug>/ so they
// serve at /<slug>. index.html is their entry point, not a directory index.
for (const slug of fs.existsSync(path.join(root, "works")) ? fs.readdirSync(path.join(root, "works")) : []) {
    const src = path.join(root, "works", slug);
    if (!fs.statSync(src).isDirectory() || !fs.existsSync(path.join(src, "index.html"))) continue;
    copy(src, path.join(dist, slug));
}

console.log("Static build complete -> dist/");
