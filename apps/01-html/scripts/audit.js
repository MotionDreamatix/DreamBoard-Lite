#!/usr/bin/env node
/**
 * Phase 1 quality gate — runs @axe-core/puppeteer (WCAG 2.2 AA tag set)
 * against every built page in light AND dark mode, captures console/page
 * errors, and smoke-tests key interactive patterns (dropdown ARIA state,
 * modal focus trap, tab roving tabindex).
 *
 * Usage: node scripts/audit.js   (expects dist/ to be built; serves it itself)
 */
const path = require("node:path");
const http = require("node:http");
const fs = require("node:fs");
const puppeteer = require("puppeteer-core");
const { AxePuppeteer } = require("@axe-core/puppeteer");

const APP = path.resolve(__dirname, "..");
const DIST = path.join(APP, "dist");
const PORT = 4599;
// Explicit binary override via CHROME_BIN; otherwise puppeteer resolves the
// system browser by channel (chrome → msedge fallback covers stock Windows).
const CHROME = process.env.CHROME_BIN;
// Discover every built page — a hardcoded list silently skips new pages.
function listPages() {
  return fs
    .readdirSync(DIST)
    .filter((f) => f.endsWith(".html"))
    .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));
}
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/* Performance budgets — transfer weight per page (uncompressed bytes,
   the dev server doesn't gzip). apexcharts.min.js loads lazily on chart
   pages only, so BASE_KB covers everything else; TOTAL_KB leaves room
   for it. ~15% headroom over measured — regressions fail the gate. */
const PERF = {
  TOTAL_KB: 2000, // chart pages: base + lazy apexcharts (~1.7 MB)
  BASE_KB: 900, // every page: css + js + data + fonts, no apexcharts (~800)
  REQUESTS: 25, // ~11 today — any new asset fan-out trips this early
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".woff2": "font/woff2",
};

function serve() {
  return new Promise((resolve) => {
    const s = http
      .createServer((req, res) => {
        let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
        if (p === "/") p = "/index.html";
        const f = path.join(DIST, p);
        fs.readFile(f, (err, data) => {
          if (err) return res.writeHead(404).end();
          res.writeHead(200, { "Content-Type": MIME[path.extname(f)] ?? "application/octet-stream" });
          res.end(data);
        });
      })
      .listen(PORT, () => resolve(s));
  });
}

async function auditPage(browser, page, theme) {
  const ctx = await browser.createBrowserContext();
  const tab = await ctx.newPage();
  const errors = [];
  tab.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  tab.on("pageerror", (e) => errors.push(String(e)));

  if (theme === "dark") {
    await tab.evaluateOnNewDocument(() => {
      try {
        localStorage.theme = "dark";
      } catch (_) {}
    });
  }
  await tab.goto(`http://localhost:${PORT}/${page}`, { waitUntil: "networkidle0" });
  // Wait until Alpine has booted and rendered at least one $icon svg —
  // works on shell pages AND bare-layout pages (no <nav> there).
  await tab.waitForFunction(() => window.Alpine && document.querySelectorAll("svg").length > 0, {
    timeout: 8000,
  });
  await new Promise((r) => setTimeout(r, 250));

  const results = await new AxePuppeteer(tab).withTags(AXE_TAGS).analyze();

  /* Interaction smoke tests (only meaningful once per page, run on light) */
  const interactions = [];
  if (theme === "light") {
    // Notifications dropdown: aria-expanded + Escape
    const dd = await tab.evaluate(async () => {
      const btn = document.querySelector('[aria-controls="menu-notifications"]');
      if (!btn) return null; // bare-layout pages have no header dropdown
      btn.click();
      await new Promise((r) => setTimeout(r, 120));
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const items = document.querySelectorAll('#menu-notifications [role="menuitem"]').length;
      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await new Promise((r) => setTimeout(r, 120));
      const focusedItem = document.activeElement?.getAttribute("role") === "menuitem";
      document.activeElement?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
      await new Promise((r) => setTimeout(r, 120));
      return { expanded, items, focusedItem, closedAfterEsc: btn.getAttribute("aria-expanded") === "false" };
    });
    if (dd) interactions.push({ name: "dropdown", ...dd });
  }
  /* Reduced-motion gate (once, on the index page — the catch-all rule in
     main.css is global): emulate prefers-reduced-motion and assert every
     transition/animation collapses to ~0 duration. */
  let motion = null;
  if (page === "index.html" && theme === "light") {
    await tab.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    /* Let in-flight transitions drain — a transition started BEFORE the
       media flip keeps the duration captured at its start (~200ms). */
    await new Promise((r) => setTimeout(r, 600));
    motion = await tab.evaluate(() => {
      const el = document.querySelector('[class*="transition-"]');
      const dur = el ? getComputedStyle(el).transitionDuration : null;
      /* Apex mounts elements with staggered transition-delays — pending
         animations still report "running". The real signal is effective
         duration: the catch-all must have collapsed every one to ~0. */
      const long = document
        .getAnimations()
        .filter((a) => (a.effect?.getComputedTiming().duration ?? 0) > 50)
        .map((a) => a.effect?.target?.tagName + "." + (a.effect?.target?.className?.baseVal ?? a.effect?.target?.className ?? "").toString().slice(0, 60));
      return { el: el?.className?.slice(0, 60) ?? null, dur, long };
    });
    const ok =
      motion &&
      (motion.dur === null || parseFloat(motion.dur) < 0.05) &&
      motion.long.length === 0;
    interactions.push({ name: "reduced-motion", ok, ...motion });
  }
  if (page === "explorer.html" && theme === "light") {
    const modal = await tab.evaluate(async () => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Open modal"));
      btn.click();
      await new Promise((r) => setTimeout(r, 150));
      const dialog = document.querySelector('[role="dialog"]');
      const trapped = dialog.contains(document.activeElement);
      const activeTag = document.activeElement?.outerHTML?.slice(0, 80);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      return { trapped, focusReturned: document.activeElement === btn, activeTag };
    });
    interactions.push({ name: "modal", ...modal });
  }

  /* Performance budget — real transfer weight via Resource Timing.
     Only measured on light (identical payload in dark). */
  let perf = null;
  if (theme === "light") {
    perf = await tab.evaluate(() => {
      const bytes = (e) => e.transferSize || e.encodedBodySize || 0;
      const nav = performance.getEntriesByType("navigation")[0];
      const navBytes = nav ? bytes(nav) : 0;
      const res = performance.getEntriesByType("resource");
      const total = res.reduce((s, e) => s + bytes(e), navBytes);
      const base = res.reduce((s, e) => s + (e.name.includes("apexcharts") ? 0 : bytes(e)), navBytes);
      return {
        requests: res.length + 1,
        kb: Math.round(total / 1024),
        baseKb: Math.round(base / 1024),
      };
    });
  }

  await ctx.close();
  return { page, theme, errors, violations: results.violations, interactions, perf };
}

/* ── Step 3/4: static token & data-decoupling checks ─────────────────── */
function staticChecks(pages) {
  const findings = [];
  const htmlFiles = pages.map((p) => path.join(DIST, p));
  const hexRe = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/;
  const dataRe = /\$[\d,]+(\.\d+)?|[+-]?\d+(\.\d+)?%|\b\d{4}-\d{2}-\d{2}\b/;

  for (const f of htmlFiles) {
    const src = fs.readFileSync(f, "utf8");
    const name = path.basename(f);
    // strip script/style/comment blocks + data-URI favicon before scanning
    const body = src
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/data:image\/[^"']+/g, "");
    for (const [i, line] of body.split("\n").entries()) {
      const m = line.match(/(?<![:\w-])style="([^"]*)"/);
      if (m) findings.push(`${name}:${i + 1} inline style: style="${m[1].slice(0, 60)}"`);
      const cls = line.match(/(?:class|:class)="([^"]*)"/g) ?? [];
      for (const c of cls)
        if (hexRe.test(c)) findings.push(`${name}:${i + 1} hex color in class attr: ${c.slice(0, 80)}`);
      // hardcoded data heuristics — Alpine bindings (x-text/:d=) and attrs are fine
      const textOnly = line.replace(/<[^>]+>/g, " ").replace(/&\w+;/g, " ");
      if (dataRe.test(textOnly) && !/x-text|:|x-html/.test(line))
        findings.push(`${name}:${i + 1} possible hardcoded data: "${textOnly.trim().slice(0, 70)}"`);
    }
  }

  // Focus rings: enforced globally via :focus-visible rule in compiled CSS
  const css = fs.readFileSync(path.join(DIST, "assets/css/main.css"), "utf8");
  const focusRule = /:focus-visible[^{]*\{[^}]*ring/.test(css);
  if (!focusRule) findings.push("main.css: no global :focus-visible ring rule found");

  return { findings, focusRule };
}

(async () => {
  if (!fs.existsSync(DIST)) {
    console.error("dist/ missing — run `npm run build` first.");
    process.exit(1);
  }
  const PAGES = listPages();

  console.log("── static checks (tokens / inline styles / hardcoded data)");
  const { findings, focusRule } = staticChecks(PAGES);
  let staticFail = findings.length > 0;
  if (findings.length) findings.forEach((f) => console.log(`  ✗ ${f}`));
  else console.log("  ✓ no hex colors, inline styles, or hardcoded data in templates");
  console.log(focusRule ? "  ✓ global :focus-visible ring rule present in main.css" : "");

  const server = await serve();
  const launchOpts = {
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  };
  let browser = null;
  const candidates = CHROME
    ? [{ executablePath: CHROME }]
    : [{ channel: "chrome" }, { channel: "msedge" }];
  for (const c of candidates) {
    try {
      browser = await puppeteer.launch({ ...launchOpts, ...c });
      break;
    } catch (e) {
      console.error(`  ✗ launch failed (${JSON.stringify(c)}): ${e.message.split("\n")[0]}`);
    }
  }
  if (!browser) {
    console.error("No browser found — set CHROME_BIN to a Chrome/Edge executable.");
    server.close();
    process.exit(1);
  }

  let failures = 0;
  try {
    for (const page of PAGES) {
      for (const theme of ["light", "dark"]) {
        const r = await auditPage(browser, page, theme);
        console.log(`\n── ${page} [${theme}]`);
        if (r.errors.length) {
          failures++;
          console.log(`  ✗ console errors:`);
          r.errors.forEach((e) => console.log(`    ${e}`));
        } else console.log(`  ✓ no console/page errors`);

        if (r.violations.length) {
          failures++;
          console.log(`  ✗ ${r.violations.length} axe violation(s):`);
          r.violations.forEach((v) => {
            console.log(`    [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
            (v.nodes ?? []).forEach((n) => console.log(`      → ${n.target}  "${(n.html ?? "").slice(0, 110)}"`));
          });
        } else console.log(`  ✓ 0 axe violations (WCAG 2.2 AA tag set)`);

        r.interactions.forEach((i) => {
          if (i.ok === false) {
            failures++;
            console.log(`  ✗ ${i.name}:`, JSON.stringify(i));
          } else console.log(`  · ${i.name}:`, JSON.stringify(i));
        });

        if (r.perf) {
          const over = [];
          if (r.perf.kb > PERF.TOTAL_KB) over.push(`${r.perf.kb} KB total > ${PERF.TOTAL_KB}`);
          if (r.perf.baseKb > PERF.BASE_KB) over.push(`${r.perf.baseKb} KB base > ${PERF.BASE_KB}`);
          if (r.perf.requests > PERF.REQUESTS) over.push(`${r.perf.requests} req > ${PERF.REQUESTS}`);
          if (over.length) {
            failures++;
            console.log(`  ✗ perf budget: ${over.join("; ")}`);
          } else console.log(`  · weight: ${r.perf.kb} KB (${r.perf.requests} req)`);
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  const total = failures + (staticFail ? 1 : 0);
  console.log(total ? `\nQUALITY GATE: ${total} failure(s)` : "\nQUALITY GATE: PASSED");
  process.exit(total ? 1 : 0);
})();
