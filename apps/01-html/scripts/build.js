#!/usr/bin/env node
/**
 * Dependency-free static build for the HTML kit.
 *
 * Template syntax inside src/pages/*.html and partials:
 *   {{@layout "base"}}          → wrap page in src/layouts/base.html at {{content}}
 *   {{@var key "value"}}        → page variable, usable as {{key}} anywhere
 *   {{> components/sidebar}}    → inline src/components/sidebar.html (recursive)
 *
 * Output → dist/  (pages at root, assets under assets/, data under data/)
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const APP = path.resolve(__dirname, "..");
const SRC = path.join(APP, "src");
const DIST = path.join(APP, "dist");

/* ── helpers ─────────────────────────────────────────────────────────── */
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => (fs.mkdirSync(path.dirname(p), { recursive: true }), fs.writeFileSync(p, s));
const copy = (from, to) => (fs.mkdirSync(path.dirname(to), { recursive: true }), fs.copyFileSync(from, to));
const vendor = (spec) => require.resolve(spec, { paths: [APP] });

/* ── templating ──────────────────────────────────────────────────────── */
function extractVars(src) {
  const vars = {};
  src = src.replace(/\{\{@var\s+(\w+)\s+"([^"]*)"\}\}/g, (_, k, v) => {
    vars[k] = v;
    return "";
  });
  return { src, vars };
}

function expandIncludes(src, stack = []) {
  return src.replace(/\{\{>\s*([\w./-]+)\s*\}\}/g, (_, name) => {
    const rel = name.endsWith(".html") ? name : `${name}.html`;
    const file = path.join(SRC, rel);
    if (!fs.existsSync(file)) throw new Error(`Partial not found: ${rel}`);
    if (stack.includes(file)) throw new Error(`Circular include: ${rel}`);
    return expandIncludes(read(file), [...stack, file]);
  });
}

function renderPage(file) {
  let src = read(file);
  const layoutMatch = src.match(/\{\{@layout\s+"([^"]+)"\}\}/);
  const layoutName = layoutMatch ? layoutMatch[1] : "base";
  src = src.replace(/\{\{@layout\s+"[^"]+"\}\}/, "");

  const { src: body, vars } = extractVars(src);
  const content = expandIncludes(body.trim());

  let out = read(path.join(SRC, "layouts", `${layoutName}.html`));
  out = out.replace("{{content}}", () => content);
  out = expandIncludes(out);
  for (const [k, v] of Object.entries({ lang: "en", title: "", phS: "null", ...vars })) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  const leftover = out.match(/\{\{[^}>][^}]*\}\}/);
  if (leftover) throw new Error(`Unresolved token ${leftover[0]} in ${path.basename(file)}`);
  return out;
}

/* ── build ───────────────────────────────────────────────────────────── */
fs.rmSync(DIST, { recursive: true, force: true });

// 1. Pages
const pagesDir = path.join(SRC, "pages");
const pages = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".html"));
for (const page of pages) {
  write(path.join(DIST, page), renderPage(path.join(pagesDir, page)));
  console.log(`  page   ${page}`);
}

// 2. CSS via Tailwind CLI. Run the package's JS entry directly with node —
// spawning npx/npx.cmd fails on Windows (EINVAL: .cmd files need a shell
// since Node 20.12.2) and goes through an extra wrapper either way.
// The --require preload unescapes enhanced-resolve's `\0#` escapes for the
// `#` in this repo's parent dir (see unescape-hash-paths.cjs).
const tailwindBin = path.join(
  path.dirname(require.resolve("@tailwindcss/cli/package.json", { paths: [APP] })),
  "dist/index.mjs"
);
const css = spawnSync(
  process.execPath,
  [
    "--require",
    path.join(__dirname, "unescape-hash-paths.cjs"),
    tailwindBin,
    "-i",
    "src/css/main.css",
    "-o",
    "dist/assets/css/main.css",
    "--minify",
  ],
  { cwd: APP, stdio: "inherit" }
);
if (css.error) {
  console.error(css.error);
  process.exit(1);
}
if (css.status !== 0) process.exit(css.status ?? 1);
console.log("  css    assets/css/main.css");

// 3. JS + data (all of data/ — mockData.js, i18n.js, …)
copy(path.join(SRC, "js/app.js"), path.join(DIST, "assets/js/app.js"));
for (const f of fs.readdirSync(path.join(APP, "data"))) {
  copy(path.join(APP, "data", f), path.join(DIST, "data", f));
}
// Agent-facing metadata at the deployed site root (llms.txt convention).
const llms = path.resolve(APP, "../../llms.txt");
if (fs.existsSync(llms)) copy(llms, path.join(DIST, "llms.txt"));
console.log("  js     assets/js/app.js, data/");

// 4. Vendored runtime deps (no CDN, version-pinned by npm)
copy(vendor("alpinejs/dist/cdn.min.js"), path.join(DIST, "assets/vendor/alpine.min.js"));
copy(vendor("@alpinejs/focus/dist/cdn.min.js"), path.join(DIST, "assets/vendor/focus.min.js"));
copy(vendor("apexcharts/dist/apexcharts.min.js"), path.join(DIST, "assets/vendor/apexcharts.min.js"));
copy(
  vendor("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"),
  path.join(DIST, "assets/fonts/inter-latin-wght-normal.woff2")
);
console.log("  vendor alpine, focus, apexcharts, inter woff2");

// 5. Phosphor duotone icons → dist/assets/js/icons.js (window.PHOSPHOR_ICONS)
const ICONS_MAP = require(path.join(SRC, "js/icons-map.js"));
const phEntry = require.resolve("@phosphor-icons/core", { paths: [APP] });
let phRoot = path.dirname(phEntry);
while (!fs.existsSync(path.join(phRoot, "assets", "duotone")) && phRoot !== path.dirname(phRoot)) {
  phRoot = path.dirname(phRoot);
}
const { WEIGHTS: ICON_WEIGHTS = {}, ...ICON_KEYS } = ICONS_MAP;
const iconEntries = { duotone: {}, regular: {}, bold: {}, fill: {} };
for (const [key, phName] of Object.entries(ICON_KEYS)) {
  for (const weight of ["duotone", ...(ICON_WEIGHTS[key] ?? [])]) {
    // regular weight has no suffix: assets/regular/<name>.svg
    const file = path.join(
      phRoot,
      "assets",
      weight,
      weight === "regular" ? `${phName}.svg` : `${phName}-${weight}.svg`
    );
    if (!fs.existsSync(file))
      throw new Error(`Phosphor icon missing: ${phName}-${weight} (key "${key}")`);
    const svg = read(file);
    iconEntries[weight][key] = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  }
}
write(
  path.join(DIST, "assets/js/icons.js"),
  `/* Generated by scripts/build.js from @phosphor-icons/core. */\n` +
    `window.PHOSPHOR_ICONS=${JSON.stringify(iconEntries)};\n`
);
console.log(
  `  icons  ${Object.keys(iconEntries.duotone).length} phosphor icons (${Object.values(iconEntries).reduce((n, w) => n + Object.keys(w).length, 0)} weight entries)`
);

console.log(`\nBuilt ${pages.length} page(s) → ${path.relative(APP, DIST)}/`);
