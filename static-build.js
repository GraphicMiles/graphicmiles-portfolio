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
    "node_modules",
    ".git",
    ".vercel",
    "generate.py",
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

console.log("Static build complete -> dist/");
