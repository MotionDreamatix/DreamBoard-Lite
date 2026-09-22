#!/usr/bin/env node
/**
 * Dev server: static file server for dist/ + watch-rebuild on changes
 * in src/ and data/. Zero dependencies — Node core modules only.
 */
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawnSync } = require("node:child_process");

const APP = path.resolve(__dirname, "..");
const DIST = path.join(APP, "dist");
const PORT = process.env.PORT || 4400;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

/* ── rebuild (debounced) ─────────────────────────────────────────────── */
let timer = null;
function rebuild(reason = "") {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const t = Date.now();
    const r = spawnSync("node", [path.join(__dirname, "build.js")], {
      cwd: APP,
      stdio: "pipe",
    });
    if (r.status === 0) {
      console.log(`[dev] rebuilt in ${Date.now() - t}ms ${reason}`);
    } else {
      console.error(`[dev] build failed:\n${r.stdout}${r.stderr}`);
    }
  }, 120);
}

/* ── static server ───────────────────────────────────────────────────── */
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (urlPath === "/") urlPath = "/index.html";
  const file = path.join(DIST, urlPath);
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`[dev] serving dist/ → http://localhost:${PORT}`);
  rebuild("initial");
  for (const dir of ["src", "data"]) {
    fs.watch(path.join(APP, dir), { recursive: true }, (_e, f) =>
      rebuild(`(${dir}/${f ?? "?"})`)
    );
  }
});
