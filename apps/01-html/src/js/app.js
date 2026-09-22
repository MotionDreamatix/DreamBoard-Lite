/**
 * Alpine.js application layer.
 * Light UI state only (toggles, dropdowns, modals, tabs, charts) —
 * all business data comes from window.mockData (data/mockData.js).
 *
 * Loaded BEFORE alpine.min.js; everything is registered inside the
 * `alpine:init` event so Alpine picks it up during startup.
 */

/* ── Icon registry (Phosphor, duotone) ──────────────────────────────────
 * window.PHOSPHOR_ICONS is generated at build time from @phosphor-icons/core
 * by scripts/build.js (see src/js/icons-map.js). Referenced by name from
 * mockData (`icon: "cart"`) and rendered via `x-html="$icon()"`.
 * All icons are decorative → `aria-hidden="true"` is baked in.
 */
const iconSvg = (name, cls = "size-5", weight = "duotone") => {
  const icons = window.PHOSPHOR_ICONS ?? {};
  const inner = icons[weight]?.[name] ?? icons.duotone?.[name] ?? icons.duotone?.grid ?? "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="${cls}" aria-hidden="true">${inner}</svg>`;
};

/* ── Formatters (locale-aware, used by Alpine magics) ───────────────────
 * Intl instances are cached per (locale, kind) so switching
 * $store.i18n.locale re-renders every number/date/currency binding.
 */
const intlCache = {};
const intlFor = (kind) => {
  const locale = Alpine.store("i18n")?.locale ?? "en";
  const key = `${locale}:${kind}`;
  return (intlCache[key] ??= {
    currency: new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }),
    number: new Intl.NumberFormat(locale),
    compact: new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }),
    percent: new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }),
    date: new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }),
    datetime: new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    time: new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }),
  }[kind]);
};

const fmt = (value, format) => {
  if (format === "currency") return intlFor("currency").format(value);
  if (format === "percent") return intlFor("percent").format(value / 100);
  if (format === "compact") return intlFor("compact").format(value);
  if (format === "seconds") return `${value}s`;
  if (format === "duration") {
    const s = Math.round(value);
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  }
  return intlFor("number").format(value);
};

/* ── Badge variant map (status/variant key → Tailwind classes) ────────── */
const BADGE_VARIANTS = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  primary:
    "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  warning:
    "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  danger:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  info:
    "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
};
const badge = (variant) => BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.default;

/* Maps order/record status values → badge variants. */
const STATUS_VARIANTS = {
  paid: "success",
  delivered: "success",
  ready: "success",
  active: "success",
  "in stock": "success",
  pending: "warning",
  processing: "warning",
  "low stock": "warning",
  refunded: "info",
  scheduled: "info",
  inactive: "default",
  invited: "info",
  available: "success",
  running: "success",
  beta: "primary",
  paused: "warning",
  deprecated: "default",
  revoked: "danger",
  error: "danger",
  cancelled: "danger",
  "out of stock": "danger",
  failed: "danger",
};
const statusVariant = (status) => STATUS_VARIANTS[status] ?? "default";

/* Custom accent — derive a full --color-primary-* scale from one hex.
   Tints mix toward white, shades toward black (sRGB); 500 is the anchor.
   The scale is persisted to localStorage as JSON so the layout pre-paint
   script can restore it before first paint (no FOUC). */
const ACCENT_STEPS = [
  "50", "100", "200", "300", "400", "500",
  "600", "700", "800", "900", "950",
];

const normalizeHex = (v) => {
  const m = String(v).trim().match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  return ("#" + h.slice(0, 6)).toLowerCase();
};

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
    .join("");
const mixHex = (a, b, t) => {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
};

const accentScaleFromHex = (hex) => ({
  50: mixHex(hex, "#ffffff", 0.93),
  100: mixHex(hex, "#ffffff", 0.85),
  200: mixHex(hex, "#ffffff", 0.72),
  300: mixHex(hex, "#ffffff", 0.55),
  400: mixHex(hex, "#ffffff", 0.32),
  500: hex,
  600: mixHex(hex, "#000000", 0.15),
  700: mixHex(hex, "#000000", 0.32),
  800: mixHex(hex, "#000000", 0.48),
  900: mixHex(hex, "#000000", 0.62),
  950: mixHex(hex, "#000000", 0.8),
});

/* Picks a readable foreground for the generated 600 shade (buttons). */
const accentForeground = (hex) => {
  const [r, g, b] = hexToRgb(mixHex(hex, "#000000", 0.15));
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.45 ? "#0f172a" : "#ffffff";
};

/* Inline custom properties override the :root[data-accent] rules, so
   preset selection must remove them again. */
const applyAccentScale = (hex) => {
  const el = document.documentElement;
  const scale = accentScaleFromHex(hex);
  for (const step of ACCENT_STEPS)
    el.style.setProperty(`--color-primary-${step}`, scale[step]);
  el.style.setProperty("--color-primary-foreground", accentForeground(hex));
  return scale;
};

const clearAccentScale = () => {
  const el = document.documentElement;
  for (const step of ACCENT_STEPS)
    el.style.removeProperty(`--color-primary-${step}`);
  el.style.removeProperty("--color-primary-foreground");
};

const initialAccentHex = () => {
  try {
    return normalizeHex(localStorage.accentHex) || "#465fff";
  } catch (_) {
    return "#465fff";
  }
};

/* Alert variant map — classes + icon per variant key. */
const ALERT_VARIANTS = {
  info: {
    cls: "border-sky-200/70 bg-sky-50 text-sky-900 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
    icon: "info",
    iconCls: "text-sky-600 dark:text-sky-400",
  },
  success: {
    cls: "border-emerald-200/70 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    icon: "check",
    iconCls: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    cls: "border-amber-200/70 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    icon: "alert",
    iconCls: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    cls: "border-rose-200/70 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
    icon: "alert",
    iconCls: "text-rose-600 dark:text-rose-400",
  },
};
const alertVariant = (variant) => ALERT_VARIANTS[variant] ?? ALERT_VARIANTS.info;

const fmtDate = (iso) => intlFor("date").format(new Date(iso));
const fmtDateTime = (iso) => intlFor("datetime").format(new Date(iso));

/* Sparse time labels for live-chart x axes: one label per `every`-minute
 * wall-clock slot (first point in the slot), snapped to the slot start —
 * "14:00", "14:15"… Category axes ignore tickAmount, so density lives in
 * the labels themselves. Takes ms timestamps or ISO strings. */
const sparseTimeTicks = (points, every = 15) => {
  let last = -1;
  return points.map((p) => {
    const slot = Math.floor(new Date(p).getTime() / (every * 60000));
    if (slot === last) return "";
    last = slot;
    return intlFor("time").format(new Date(slot * every * 60000));
  });
};

/* ── File downloads — the baseline has no storage backend, so callers
   generate content client-side and hand it to the browser. Buyers wiring
   real storage (S3, their API) replace these call sites with a fetch →
   Blob of their file URL; the helper itself stays valid. */

const downloadFile = (name, content, mime = "text/plain") => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
};

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Reports page — generates a real file from the report's metadata. */
const reportDownload = (r) => {
  const csv = r.format === "CSV";
  const body = [
    `Report: ${r.name}`,
    `ID: ${r.id}`,
    `Range: ${r.range}`,
    `Created: ${r.created}`,
    `Format: ${r.format}`,
    `Size: ${r.size}`,
    `Status: ${r.status}`,
    "",
    "Demo export — point reportDownload() at your reporting API to serve real files.",
  ].join("\n");
  downloadFile(`${r.id}-${slugify(r.name)}.${csv ? "csv" : "txt"}`, body, csv ? "text/csv" : "text/plain");
};

/* Billing page — invoice list rows {id, date, amount, status}. */
const invoiceDownload = (inv) => {
  downloadFile(
    `${inv.id}.txt`,
    [
      `Invoice ${inv.id}`,
      `Date: ${inv.date}`,
      `Amount: ${fmt(inv.amount, "currency")}`,
      `Status: ${inv.status}`,
    ].join("\n"),
  );
};

/* Invoice page — full invoice text from d.pages.invoice.inv. */
const invoicePageDownload = () => {
  const inv = window.mockData.pages.invoice.inv;
  const sub = inv.items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = sub * inv.taxRate;
  downloadFile(
    `${inv.number}.txt`,
    [
      `INVOICE ${inv.number}`,
      `Status: ${inv.status}`,
      `Issued: ${inv.issued} — Due: ${inv.due}`,
      "",
      `From: ${inv.from.name}`,
      ...inv.from.lines,
      "",
      `To: ${inv.to.name}`,
      ...inv.to.lines,
      "",
      ...inv.items.map((i) => `${i.desc} — ${i.qty} × ${fmt(i.price, "currency")}`),
      "",
      `Subtotal: ${fmt(sub, "currency")}`,
      `Tax (${Math.round(inv.taxRate * 100)}%): ${fmt(tax, "currency")}`,
      `Total: ${fmt(sub + tax, "currency")}`,
      "",
      inv.note,
    ].join("\n"),
  );
};

/* ── ApexCharts shared helpers ────────────────────────────────────────── */
const cssVar = (name, fallback = "") =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Print always renders the light surface — dark ink is unreadable on
   paper and wastes toner. The darkMode store keeps its state; only the
   class is stripped for the print snapshot and restored afterwards. */
window.addEventListener("beforeprint", () => {
  document.documentElement.classList.remove("dark");
});
window.addEventListener("afterprint", () => {
  document.documentElement.classList.toggle("dark", !!Alpine.store("darkMode")?.on);
});

/* ApexCharts is vendored but ~930 KB — fewer than half the pages render
   a chart (statcard sparklines, chart pages). Load it lazily on first
   mount instead of eagerly in <head>: auth/utility pages never fetch it. */
let apexReady = null;
function ensureApex() {
  if (window.ApexCharts) return Promise.resolve();
  apexReady ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "assets/vendor/apexcharts.min.js";
    s.onload = resolve;
    s.onerror = () => {
      apexReady = null;
      reject(new Error("apexcharts.min.js failed to load"));
    };
    document.head.appendChild(s);
  });
  return apexReady;
}

/**
 * Mount an Apex chart and return a `remount()` that destroys + recreates it
 * (updateOptions merges shallowly and leaves stale colors, so re-theme =
 * rebuild). Instance + render promise live in plain closures — never on the
 * Alpine component (reactive proxies break apex's DOM cleanup). render()
 * mounts async, so remount awaits any in-flight mount before destroying.
 */
function mountChart(el, build) {
  let chart = null;
  let ready = Promise.resolve();
  let pending = true;
  /* Entrance-animation window: an updateOptions({}) refit while Apex is
     still drawing its first render snaps the chart to the final state
     and kills the animation. */
  let entering = false;
  const mount = () => {
    entering = true;
    ready = ensureApex()
      .then(() => {
        chart = new ApexCharts(el, build(Alpine.store("darkMode").on));
        return chart.render();
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => (entering = false), 1600);
      });
  };
  const render = () => {
    pending = false;
    mount();
  };
  /* x-cloak keeps the page display:none during Alpine's init walk — a
     chart rendered while hidden mounts at 0 width and gets no entrance
     animation (Apex only animates a visible first render). Defer the
     mount until the element has size; bounded so charts inside
     collapsed regions still mount after ~2s. */
  const whenVisible = (tries = 0) => {
    if (!el.isConnected || !pending) return;
    if (el.clientWidth > 0 || tries > 120) return render();
    requestAnimationFrame(() => whenVisible(tries + 1));
  };
  whenVisible();
  /* Apex deliberately defers its parent-resize refit (~1.5s) — too slow
     for the 200ms rail transition, and resize() isn't public in this
     build. Instead: stretch the SVG to the mount box in real time
     (preserveAspectRatio none → scales like the sidebar does), then run
     one real updateOptions refit once the size settles. */
  let refit = 0;
  /* Baseline at observe time: RO always fires an initial callback, and a
     refit there would land ~160ms into the entrance animation. Same for
     callbacks while `entering` — the svg-stretch still runs so the box
     scales, only the real updateOptions refit is deferred. */
  let lastW = el.clientWidth;
  let lastH = el.clientHeight;
  new ResizeObserver(() => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    const canvas = el.querySelector(".apexcharts-canvas");
    const svg = el.querySelector("svg");
    if (canvas && svg) {
      /* Apex SVGs carry no viewBox — width:100% alone only widens the
         viewport while the drawing keeps absolute coords. A viewBox at
         the current px dims makes the stretch actually scale content. */
      if (!svg.getAttribute("viewBox")) {
        svg.setAttribute(
          "viewBox",
          `0 0 ${svg.getAttribute("width")} ${svg.getAttribute("height")}`,
        );
      }
      canvas.style.width = "100%";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.setAttribute("preserveAspectRatio", "none");
    }
    clearTimeout(refit);
    const doRefit = () => {
      if (!chart) return;
      /* Mid-entrance resizes still need the refit — defer rather than
         drop, or the stretch shim would stay applied for good. */
      if (entering) {
        refit = setTimeout(doRefit, 400);
        return;
      }
      Promise.resolve(chart.updateOptions({}))
        .catch(() => {})
        .finally(() => {
          const s = el.querySelector("svg");
          s?.removeAttribute("viewBox");
          s?.removeAttribute("preserveAspectRatio");
          if (s) s.style.width = s.style.height = "";
          const c = el.querySelector(".apexcharts-canvas");
          if (c) c.style.width = "";
        });
    };
    refit = setTimeout(doRefit, 160);
  }).observe(el);
  const remount = async () => {
    pending = false;
    await ready;
    chart?.destroy();
    el.replaceChildren();
    mount();
  };
  return { remount, current: () => chart };
}

/** Theme-aware option base; rebuilt on dark-mode toggle via updateOptions. */
function chartBase(dark) {
  return {
    chart: {
      fontFamily: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
      toolbar: { show: false },
      animations: { enabled: !reduceMotion() },
      foreColor: dark ? cssVar("--color-slate-400", "#94a3b8") : cssVar("--color-slate-500", "#64748b"),
    },
    grid: {
      borderColor: dark
        ? cssVar("--color-slate-800", "#1e293b")
        : cssVar("--color-slate-200", "#e2e8f0"),
      strokeDashArray: 4,
    },
    tooltip: { theme: dark ? "dark" : "light" },
    dataLabels: { enabled: false },
  };
}

document.addEventListener("alpine:init", () => {
  /* ── Magics ───────────────────────────────────────────────────────── */
  Alpine.magic("icon", () => iconSvg);
  Alpine.magic("fmt", () => fmt);
  Alpine.magic("badge", () => badge);
  Alpine.magic("statusVariant", () => statusVariant);
  Alpine.magic("t", () => (key, vars) => Alpine.store("i18n").t(key, vars));

  /* ── Stores ───────────────────────────────────────────────────────── */

  // i18n — chrome-string dictionary from data/i18n.js (window.i18n).
  // `t()` reads `locale` reactively → every $t binding re-renders on switch.
  Alpine.store("i18n", {
    locale: document.documentElement.lang || window.i18n?.defaultLocale || "en",
    get locales() {
      return window.i18n?.locales ?? [];
    },
    get flags() {
      return window.i18n?.flags ?? {};
    },
    t(key, vars) {
      const dict = window.i18n?.dict ?? {};
      let s = dict[this.locale]?.[key] ?? dict[window.i18n?.defaultLocale ?? "en"]?.[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
      return s;
    },
    set(code) {
      this.locale = code;
      document.documentElement.lang = code;
      try {
        localStorage.lang = code;
      } catch (_) {}
    },
  });
  // Alias for imperative calls inside this file (toasts, announcements).
  const tt = (key, vars) => Alpine.store("i18n").t(key, vars);

  /* Live-API write-through — the ONE seam that knows the backend exists.
     Set by the fullstack loader overlay (window.DREAMBOARD_API); absent,
     every caller degrades to the static demo. POSTs alongside optimistic
     local mutations, attaching the session bearer token so protected
     endpoints work unchanged. Best-effort: a failure only loses
     persistence — the UI already updated. Swap this one function to
     adapt the kit to another backend (see the product-dev skill). */
  const apiPost = (path, body) => {
    if (!window.DREAMBOARD_API) return Promise.resolve(null);
    let token;
    try {
      token = JSON.parse(localStorage.getItem("dreamboard.session") || "{}").token;
    } catch {
      /* malformed session — send unauthenticated */
    }
    return fetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
    })
      .then((r) => (r.ok ? r.json().catch(() => null) : null))
      .catch(() => null);
  };

  /* Fold an updated user back into the stored session so the loader's
     contract merge — and the header — reflect it immediately. */
  const mergeSessionUser = (user) => {
    if (!user) return;
    try {
      const s = JSON.parse(localStorage.getItem("dreamboard.session") || "null");
      if (!s) return;
      s.user = { ...s.user, ...user };
      localStorage.setItem("dreamboard.session", JSON.stringify(s));
    } catch {
      /* malformed session — nothing to merge into */
    }
  };

  /* The raw JWT — for <a href>/window.open downloads, which can't attach
     the bearer header (the API accepts it as ?token= on those routes). */
  const sessionToken = () => {
    try {
      return JSON.parse(localStorage.getItem("dreamboard.session") || "{}").token || "";
    } catch {
      return "";
    }
  };

  /* Open an authenticated GET download (invoice PDFs, export files). */
  const openApiDownload = (path) =>
    window.open(`${path}?token=${encodeURIComponent(sessionToken())}`, "_blank");

  /* Authenticated DELETE — same session-bearer pattern as apiPost. */
  const apiDel = (path) => {
    if (!window.DREAMBOARD_API) return Promise.resolve(false);
    let token;
    try {
      token = JSON.parse(localStorage.getItem("dreamboard.session") || "{}").token;
    } catch {
      /* malformed session — send unauthenticated */
    }
    return fetch(path, {
      method: "DELETE",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok)
      .catch(() => false);
  };

  /* Re-pull the bootstrap contract after mutations whose result isn't
     locally computable (server-side deletes, syncs). Merges INTO the
     existing object — Alpine binds by identity, so reassigning
     window.mockData would orphan every live binding. */
  const reloadBootstrap = () => {
    if (!window.DREAMBOARD_API) return Promise.resolve();
    return fetch("/api/bootstrap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) Object.assign(window.mockData, data);
      })
      .catch(() => null);
  };

  // Axis label localizer for charts: month abbreviations and "Sep 1"-style
  // date labels are formatted via Intl in the active locale; anything else
  // goes through the dictionary.
  const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function tAxis(v) {
    const locale = Alpine.store("i18n").locale;
    const mi = MONTHS_EN.indexOf(v);
    if (mi >= 0) return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2024, mi, 1));
    const dm = v.match(/^([A-Z][a-z]{2}) (\d{1,2})$/);
    if (dm && MONTHS_EN.includes(dm[1])) {
      return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
        new Date(2024, MONTHS_EN.indexOf(dm[1]), Number(dm[2])),
      );
    }
    return tt(v);
  }

  // Dark mode — `<html class="dark">` is set by the inline head script
  // (FOUC-free); this store keeps the toggle button + class in sync.
  Alpine.store("darkMode", {
    on: document.documentElement.classList.contains("dark"),
    toggle() {
      this.on = !this.on;
      document.documentElement.classList.toggle("dark", this.on);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", this.on ? "#0f172a" : "#f8fafc");
      try {
        localStorage.theme = this.on ? "dark" : "light";
      } catch (_) {}
    },
  });

  // Sidebar — off-canvas on <lg, always visible on lg+.
  // `desktop` mirrors the lg breakpoint so `inert`/`x-trap` only apply
  // to the mobile drawer.
  const lgQuery = window.matchMedia("(min-width: 1024px)");
  const sidebarStore = Alpine.store("sidebar", {
    open: false,
    desktop: lgQuery.matches,
    // Icon-rail collapse (desktop) + open accordion groups persist across reloads.
    rail: (() => {
      try {
        return localStorage.sidebarRail === "1";
      } catch (_) {
        return false;
      }
    })(),
    railFlyout: null, // group label whose flyout is open in rail mode
    openGroups: (() => {
      try {
        return JSON.parse(localStorage.sidebarGroups || "{}");
      } catch (_) {
        return {};
      }
    })(),
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
    toggleRail() {
      this.rail = !this.rail;
      this.railFlyout = null;
      try {
        localStorage.sidebarRail = this.rail ? "1" : "0";
      } catch (_) {}
      /* Clip chart canvases for the duration of the padding transition —
         Apex's refit lags a frame behind the animation. */
      document.documentElement.classList.add("rail-anim");
      clearTimeout(this._railAnimT);
      this._railAnimT = setTimeout(
        () => document.documentElement.classList.remove("rail-anim"),
        260,
      );
    },
    flyoutTop: 0, // px offset of the open flyout inside <aside>
    flyoutEl: null, // trigger button, for focus return on Escape
    get railFlyoutGroup() {
      return (
        window.mockData.nav.find((g) => g.children && g.label === this.railFlyout) ?? null
      );
    },
    toggleFlyout(label, el) {
      if (this.railFlyout === label) {
        this.railFlyout = null;
        return;
      }
      this.openFlyout(label, el);
    },
    openFlyout(label, el) {
      clearTimeout(this._flyoutT); // cancel a pending close when switching groups
      const aside = document.getElementById("sidebar");
      this.flyoutTop = el.getBoundingClientRect().top - aside.getBoundingClientRect().top;
      this.flyoutEl = el;
      this.railFlyout = label;
    },
    /* Hover intent: pointer needs a beat to cross from rail to panel. */
    scheduleFlyoutClose() {
      clearTimeout(this._flyoutT);
      this._flyoutT = setTimeout(() => {
        this.railFlyout = null;
      }, 250);
    },
    cancelFlyoutClose() {
      clearTimeout(this._flyoutT);
    },
    toggleGroup(label) {
      // Accordion: opening a group collapses the others.
      this.openGroups = this.openGroups[label] ? {} : { [label]: true };
      try {
        localStorage.sidebarGroups = JSON.stringify(this.openGroups);
      } catch (_) {}
    },
    /* Plain top-level links collapse any open accordion group. */
    closeGroups() {
      this.openGroups = {};
      try {
        localStorage.sidebarGroups = "{}";
      } catch (_) {}
    },
    isGroupOpen(label) {
      return !!this.openGroups[label];
    },
  });
  lgQuery.addEventListener("change", (e) => {
    sidebarStore.desktop = e.matches;
    if (e.matches) sidebarStore.open = false;
  });

  // Accent — runtime --color-primary-* scale swap via <html data-accent="…">.
  // `current` is a preset key or `custom:#rrggbb`; charts watch it and
  // remount to pick up the new token values.
  Alpine.store("accent", {
    customHex: initialAccentHex(),
    current: (() => {
      const a = document.documentElement.dataset.accent;
      return a === "custom" ? `custom:${initialAccentHex()}` : a || "indigo";
    })(),
    get isCustom() {
      return this.current.startsWith("custom");
    },
    set(name) {
      this.current = name;
      document.documentElement.dataset.accent = name;
      clearAccentScale();
      try {
        localStorage.accent = name;
      } catch (_) {}
    },
    setCustom(hex) {
      const norm = normalizeHex(hex);
      if (!norm) return;
      this.customHex = norm;
      this.current = `custom:${norm}`;
      document.documentElement.dataset.accent = "custom";
      const scale = applyAccentScale(norm);
      try {
        localStorage.accent = "custom";
        localStorage.accentHex = norm;
        localStorage.accentScale = JSON.stringify(scale);
        localStorage.accentFg = accentForeground(norm);
      } catch (_) {}
    },
  });

  // Density — `data-density` is applied pre-paint by the layout script;
  // the store keeps the menu checkbox in sync and persists the choice.
  Alpine.store("density", {
    compact: document.documentElement.dataset.density === "compact",
    toggle() {
      this.compact = !this.compact;
      document.documentElement.dataset.density = this.compact ? "compact" : "comfortable";
      try {
        localStorage.density = this.compact ? "compact" : "comfortable";
      } catch (_) {}
    },
  });

  // Command palette — ⌘K / Ctrl+K global search over nav + account pages.
  // Store-level so the header trigger, keydown listener and teleported
  // dialog all share state across Alpine scopes.
  Alpine.store("palette", {
    open: false,
    query: "",
    active: 0,
    lastTrigger: null,
    get commands() {
      const d = window.mockData;
      const items = [];
      for (const n of d.nav) {
        if (n.children) n.children.forEach((c) => items.push({ label: c.label, href: c.href, group: n.label, icon: n.icon }));
        else items.push({ label: n.label, href: n.href, group: "Pages", icon: n.icon });
      }
      for (const m of d.userMenu) items.push({ label: m.label, href: m.href, group: "Account", icon: m.icon });
      return items.filter((i) => i.href.endsWith(".html"));
    },
    get results() {
      const q = this.query.trim().toLowerCase();
      return q
        ? this.commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q))
        : this.commands;
    },
    show(e) {
      this.lastTrigger = e?.currentTarget ?? null;
      this.query = "";
      this.active = 0;
      this.open = true;
    },
    hide() {
      this.open = false;
      this.lastTrigger?.focus();
    },
    onKey(e) {
      const len = this.results.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.active = len ? (this.active + 1) % len : 0;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.active = len ? (this.active - 1 + len) % len : 0;
      } else if (e.key === "Home") {
        e.preventDefault();
        this.active = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        this.active = Math.max(0, len - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = this.results[this.active];
        if (item) this.go(item);
      } else if (e.key === "Escape") {
        this.hide();
      }
      if (len)
        document.getElementById(`palette-opt-${this.active}`)?.scrollIntoView({ block: "nearest" });
    },
    go(item) {
      this.hide();
      location.href = item.href;
    },
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const p = Alpine.store("palette");
      p.open ? p.hide() : p.show();
    }
  });

  // Toasts — stacked live notifications, auto-dismiss after `ttl` ms.
  Alpine.store("toasts", {
    items: [],
    seq: 0,
    push({ title, body = "", variant = "default", ttl = 6000 }) {
      const id = ++this.seq;
      this.items.push({ id, title, body, variant });
      if (ttl > 0) setTimeout(() => this.dismiss(id), ttl);
      return id;
    },
    dismiss(id) {
      this.items = this.items.filter((t) => t.id !== id);
    },
  });

  /* ── Components ───────────────────────────────────────────────────── */

  /**
   * Dropdown — ARIA menu button pattern.
   * Button: ArrowDown/ArrowUp opens & focuses first/last item.
   * Menu: Arrow keys cycle, Home/End jump, Escape closes & refocuses
   * the trigger, Tab closes. `aria-expanded` is bound in markup.
   */
  Alpine.data("dropdown", () => ({
    open: false,
    /* Panels bind `:class="dropUp ? 'bottom-full mb-2' : 'top-full mt-2'"`.
       The main content column is overflow-x-clip, which computes
       overflow-y to clip too — a downward menu past the column's bottom
       edge is hard-cut. Flip up when there's no room below. */
    dropUp: false,
    items() {
      return [
        ...this.$refs.menu.querySelectorAll(
          '[role="menuitem"], a[href], button:not([disabled])'
        ),
      ];
    },
    toggle() {
      this.open ? this.close(false) : this.openMenu();
    },
    openMenu() {
      const r = this.$refs.trigger?.getBoundingClientRect();
      if (r) {
        const menuH = this.$refs.menu?.offsetHeight || 260;
        this.dropUp =
          window.innerHeight - r.bottom < menuH + 8 && r.top > menuH + 8;
      }
      this.open = true;
    },
    openAndFocus(position = "first") {
      this.openMenu();
      this.$nextTick(() => {
        const list = this.items();
        (position === "first" ? list[0] : list[list.length - 1])?.focus();
      });
    },
    close(refocus = true) {
      this.open = false;
      if (refocus) this.$refs.trigger?.focus();
    },
    onTriggerKeydown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.openAndFocus("first");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.openAndFocus("last");
      }
    },
    onMenuKeydown(e) {
      const list = this.items();
      const i = list.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        list[(i + 1) % list.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        list[(i - 1 + list.length) % list.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        list[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        list[list.length - 1]?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      } else if (e.key === "Tab") {
        this.close(false);
      }
    },
  }));

  /**
   * Modal — pair with `x-trap.noscroll="open"` (from @alpinejs/focus) on
   * the dialog element. Escape closes and returns focus to the trigger.
   */
  /**
   * Paginated list — pass a getter so filtered/computed lists stay live.
   * Usage: x-data="paginated(() => d.pages.orders.items, 5)" then iterate
   * `pageItems` and render the footer nav from `pages`/`pageWindow()`.
   */
  const paginatedBehavior = (itemsFn, perPage = 5) => {
    const comp = {
    perPage,
    page: 1,
    q: "",
    // Table-local compact density — the col-toggle menu item toggles
    // this; the page binds `dense && 'table-dense'` on the scroll wrap.
    dense: false,
    toggleDense() {
      this.dense = !this.dense;
    },
    sortKey: null,
    sortDir: "asc",
    _items: itemsFn,
    sort(key) {
      if (this.sortKey === key) this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
      else {
        this.sortKey = key;
        this.sortDir = "asc";
      }
      this.page = 1;
    },
    ariaSort(key) {
      return this.sortKey === key ? (this.sortDir === "asc" ? "ascending" : "descending") : null;
    },
    sortIcon(key) {
      return this.sortKey === key ? (this.sortDir === "asc" ? "arrowUp" : "arrowDown") : "sort";
    },
    get items() {
      let list = [...this._items()];
      const query = this.q.trim().toLowerCase();
      if (query) {
        list = list.filter((row) =>
          Object.values(row).some((v) => String(v).toLowerCase().includes(query))
        );
      }
      if (!this.sortKey) return list;
      const dir = this.sortDir === "asc" ? 1 : -1;
      return list.sort((a, b) => {
        const va = a[this.sortKey],
          vb = b[this.sortKey];
        const cmp =
          typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
        return cmp * dir;
      });
    },
    get pages() {
      return Math.max(1, Math.ceil(this.items.length / this.perPage));
    },
    get pageItems() {
      const p = Math.min(this.page, this.pages);
      return this.items.slice((p - 1) * this.perPage, p * this.perPage);
    },
    get from() {
      return this.items.length ? (Math.min(this.page, this.pages) - 1) * this.perPage + 1 : 0;
    },
    get to() {
      return Math.min(this.items.length, Math.min(this.page, this.pages) * this.perPage);
    },
    pageWindow() {
      const n = this.pages,
        p = Math.min(this.page, this.pages);
      if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
      if (p <= 3) return [1, 2, 3, 4, "…", n];
      if (p >= n - 2) return [1, "…", n - 3, n - 2, n - 1, n];
      return [1, "…", p - 1, p, p + 1, "…", n];
    },
    goto(n) {
      this.page = Math.min(Math.max(1, n), this.pages);
    },
    /* ── Row selection (bulk actions) — header checkbox toggles the
       visible page; indeterminate state is set by the caller via
       $el.indeterminate = someSelected. */
    selected: [],
    isSel(id) {
      return this.selected.includes(id);
    },
    toggleSel(id) {
      const i = this.selected.indexOf(id);
      i < 0 ? this.selected.push(id) : this.selected.splice(i, 1);
    },
    get allSelected() {
      return this.pageItems.length > 0 && this.pageItems.every((r) => this.selected.includes(r.id));
    },
    get someSelected() {
      return this.selected.length > 0 && !this.allSelected;
    },
    toggleAll() {
      const ids = this.pageItems.map((r) => r.id);
      this.selected = this.allSelected
        ? this.selected.filter((i) => !ids.includes(i))
        : [...new Set([...this.selected, ...ids])];
    },
    /* Column visibility — `hiddenCols` holds hidden column keys; header
       and body cells opt in via x-show="colShown('key')". */
    hiddenCols: [],
    colShown(key) {
      return !this.hiddenCols.includes(key);
    },
    toggleCol(key) {
      const i = this.hiddenCols.indexOf(key);
      i < 0 ? this.hiddenCols.push(key) : this.hiddenCols.splice(i, 1);
    },
    /* Expandable rows — render a detail <tr> under each data row, gated
       on isExpanded(row.id). */
    expanded: [],
    isExpanded(id) {
      return this.expanded.includes(id);
    },
    toggleExpand(id) {
      const i = this.expanded.indexOf(id);
      i < 0 ? this.expanded.push(id) : this.expanded.splice(i, 1);
    },
    /* CSV export — selected rows if any, else the whole filtered set
       (not just the visible page). Keys of the first row become columns. */
    exportCsv(name = "export.csv") {
      const rows = this.selected.length
        ? this.items.filter((r) => this.selected.includes(r.id))
        : this.items;
      if (!rows.length) return;
      const cols = Object.keys(rows[0]);
      const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
      const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      a.click();
      URL.revokeObjectURL(url);
    },
    init() {
      /* Merging this component into another x-data literal via object
         spread (`x-data="{ cols: [...], ...paginated(...) }"`) evaluates
         the getters once and copies static values — search, sort and
         pagination would freeze on page 1. Re-install the computed
         getters on the element's own data frame — the object Alpine
         resolves expressions against (`init`'s `this` is a different
         proxy). */
      const scope = this.$el._x_dataStack?.[0] ?? this;
      for (const key of [
        "items",
        "pages",
        "pageItems",
        "from",
        "to",
        "allSelected",
        "someSelected",
      ]) {
        Object.defineProperty(
          scope,
          key,
          Object.getOwnPropertyDescriptor(comp, key),
        );
      }
      // Filter/source list changed → clamp page into range, prune selection.
      this.$watch("items", () => {
        this.page = Math.min(this.page, this.pages);
        const ids = new Set(this.items.map((r) => r.id));
        this.selected = this.selected.filter((i) => ids.has(i));
      });
    },
    };
    return comp;
  };

  Alpine.data("paginated", paginatedBehavior);

  /* Dotted world map — helpers for components/world-map.html. SVG has
     no <template>, so land dots become one round-capped <path> and the
     country markers an x-html string. `countries` comes from the
     including scope: [{ name, code, lon, lat, users, share }]. */
  Alpine.data("worldMapView", () => ({
    worldDotsPath() {
      const { cols, dots } = window.worldMap;
      return dots
        .map((i) => `M${(i % cols) + 0.5} ${Math.floor(i / cols) + 0.5}h.01`)
        .join(" ");
    },
    worldMarkers() {
      return (this.countries ?? [])
        .map((c) => {
          const { x, y } = window.worldMap.project(c.lon, c.lat);
          return (
            `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.4" class="map-pulse" fill="currentColor" fill-opacity="0.35"/>` +
            `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1" fill="currentColor"/>`
          );
        })
        .join("");
    },
  }));

  const modalBehavior = () => ({
    open: false,
    lastTrigger: null,
    panelEl: null, // set via x-init on the dialog panel (x-teleport-safe)
    show(e) {
      this.lastTrigger = e?.currentTarget ?? null;
      this.open = true;
      // Move focus into the dialog explicitly — x-trap also does this,
      // but only once the element is visible (x-show), so we re-assert
      // it on the next tick to close the race. Alpine.nextTick keeps the
      // behavior usable as a nested property (cardM.show(...)) too.
      Alpine.nextTick(() => {
        this.panelEl
          ?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
          ?.focus();
      });
    },
    hide() {
      this.open = false;
      // Only refocus the trigger when it's still rendered — a menu item
      // that opened the dialog may be display:none once the menu closes.
      Alpine.nextTick(() => {
        if (this.lastTrigger?.offsetParent) this.lastTrigger.focus();
      });
    },
  });
  Alpine.data("modal", modalBehavior);

  /**
   * Tabs — ARIA APG pattern with roving tabindex.
   * ArrowLeft/Right cycle, Home/End jump; active tab has tabindex=0.
   */
  Alpine.data("tabs", (initial = 0) => ({
    active: initial,
    tabEls() {
      return [...this.$el.querySelectorAll('[role="tab"]')];
    },
    select(i) {
      this.active = i;
    },
    isActive(i) {
      return this.active === i;
    },
    onKeydown(e) {
      const tabs = this.tabEls();
      const i = tabs.indexOf(document.activeElement);
      let next = null;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        this.select(next);
        tabs[next]?.focus();
      }
    },
  }));

  /**
   * Select — styled replacement for native <select> (ARIA listbox pattern).
   * Button opens the list; highlight follows arrows via aria-activedescendant;
   * Enter/Space commits, Escape closes & refocuses, Tab commits & moves on.
   * A hidden <input> carries the value for real form submission.
   */
  Alpine.data("select", (options = [], initial = 0, onChange = null) => ({
    options,
    onChange,
    open: false,
    selected: initial,
    highlight: initial,
    toggle() {
      this.open ? this.close(false) : this.openList();
    },
    openList() {
      this.open = true;
      this.highlight = this.selected;
      this.$nextTick(() => this.$refs.list?.focus());
    },
    choose(i) {
      this.selected = i;
      this.onChange?.(this.options[i]);
      this.close();
    },
    close(refocus = true) {
      this.open = false;
      if (refocus) this.$refs.trigger?.focus();
    },
    move(delta) {
      const n = this.options.length;
      this.highlight = (this.highlight + delta + n) % n;
      this.$nextTick(() => {
        this.$refs.list
          ?.querySelector(`[data-opt="${this.highlight}"]`)
          ?.scrollIntoView({ block: "nearest" });
      });
    },
    onTriggerKeydown(e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.openList();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.openList();
        this.highlight = this.options.length - 1;
      }
    },
    onListKeydown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.move(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.move(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        this.highlight = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        this.highlight = this.options.length - 1;
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.choose(this.highlight);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      } else if (e.key === "Tab") {
        this.choose(this.highlight);
      }
    },
  }));

  /**
   * Accordion — single-open disclosure list (FAQ). Header buttons carry
   * aria-expanded/aria-controls; ArrowUp/Down + Home/End move focus
   * between headers per the W3C accordion pattern. Enter/Space is native.
   */
  Alpine.data("accordion", (initial = -1) => ({
    open: initial,
    isOpen(i) {
      return this.open === i;
    },
    toggle(i) {
      this.open = this.open === i ? -1 : i;
    },
    onKeydown(e) {
      const btns = [...this.$el.querySelectorAll("[data-acc-btn]")];
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      let n = null;
      if (e.key === "ArrowDown") n = (i + 1) % btns.length;
      else if (e.key === "ArrowUp") n = (i - 1 + btns.length) % btns.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = btns.length - 1;
      if (n !== null) {
        e.preventDefault();
        btns[n]?.focus();
      }
    },
  }));

  /**
   * Wizard — multi-step form shell. Steps are regions marked
   * data-step="n" inside the component root; required inputs are
   * validated natively before advancing. The stepper buttons can only
   * jump to completed or already-visited steps.
   */
  Alpine.data("wizard", (steps = []) => ({
    steps,
    step: 0,
    done: [],
    /* this.$el is element-scoped in Alpine — inside a step button's
       @click it would resolve to the button, not this component's root.
       Capture the real root once in init() where $el is the root. */
    init() {
      this._root = this.$el;
    },
    get last() {
      return this.steps.length - 1;
    },
    get current() {
      return this.steps[this.step];
    },
    valid() {
      const region = this._root.querySelector(`[data-step="${this.step}"]`);
      const bad = [
        ...(region?.querySelectorAll("input[required], select[required], textarea[required]") ?? []),
      ].filter((el) => !el.checkValidity());
      bad[0]?.reportValidity();
      return bad.length === 0;
    },
    next() {
      if (!this.valid()) return;
      if (!this.done.includes(this.step)) this.done.push(this.step);
      if (this.step < this.last) this.step++;
    },
    prev() {
      if (this.step > 0) this.step--;
    },
    goto(i) {
      if (i <= this.step || this.done.includes(i)) this.step = i;
    },
  }));

  /**
   * Mail inbox — filterable message list + reading pane. Selecting a
   * message marks it read; star toggles expose aria-pressed on buttons.
   */
  Alpine.data("mail", () => ({
    box: "inbox",
    ctx: null, // { x, y, m } — right-click context menu state
    ctxActions: [
      { key: "reply", label: "Reply", icon: "reply" },
      { key: "forward", label: "Forward", icon: "forward" },
      { key: "unread", label: "Mark as unread", icon: "envelopeOpen" },
      { key: "star", label: "Star", icon: "star" },
      { key: "archive", label: "Archive", icon: "archive" },
      { key: "delete", label: "Delete", icon: "trash", danger: true },
    ],
    openCtx(e, m) {
      const w = 200;
      const h = this.ctxActions.length * 36 + 16;
      this.ctx = {
        m,
        el: e.currentTarget, // Escape refocuses the triggering row
        x: Math.min(e.clientX, window.innerWidth - w - 8),
        y: Math.min(e.clientY, window.innerHeight - h - 8),
      };
      this.$nextTick(() => this.$refs.ctxMenu?.querySelector("button")?.focus());
    },
    ctxLabel(a) {
      return a.key === "star" && this.ctx?.m.starred ? tt("Unstar") : tt(a.label);
    },
    ctxRun(a) {
      const m = this.ctx?.m;
      this.ctx = null;
      if (!m) return;
      if (a.key === "reply") {
        this.openMsg(m);
        this.$nextTick(() => this.$refs.reply?.focus());
      } else if (a.key === "forward") {
        this.openMsg(m);
        Alpine.store("toasts").push({ title: tt("toastDemoAction"), variant: "info" });
      } else if (a.key === "unread") {
        m.unread = true;
      } else if (a.key === "star") {
        m.starred = !m.starred;
      } else {
        const i = this.msgs.indexOf(m);
        if (i > -1) this.msgs.splice(i, 1);
        if (this.selId === m.id) this.selId = this.list[0]?.id ?? null;
        Alpine.store("toasts").push({
          title: a.key === "archive" ? tt("toastArchived") : tt("toastDeleted"),
          variant: "success",
        });
      }
    },
    get msgs() {
      return this.d.pages.inbox.messages;
    },
    get list() {
      return this.box === "starred" ? this.msgs.filter((m) => m.starred) : this.msgs;
    },
    selId: null,
    get sel() {
      return this.list.find((m) => m.id === this.selId) ?? null;
    },
    openMsg(m) {
      this.selId = m.id;
      m.unread = false;
    },
    toggleStar(m) {
      m.starred = !m.starred;
    },
    get unread() {
      return this.msgs.filter((m) => m.unread).length;
    },
    init() {
      this.selId = this.list[0]?.id ?? null;
    },
  }));

  /**
   * File manager — folder drill-down with breadcrumb navigation.
   * `path` is the stack of folder ids from root ([] = root level).
   */
  Alpine.data("fileManager", () => ({
    path: [],
    get folders() {
      return this.d.pages.files.folders;
    },
    get files() {
      return this.d.pages.files.items;
    },
    folder(id) {
      return this.folders.find((f) => f.id === id) ?? null;
    },
    get crumbs() {
      return this.path.map((id) => this.folder(id)).filter(Boolean);
    },
    get here() {
      return this.path[this.path.length - 1] ?? null;
    },
    get foldersHere() {
      return this.folders.filter((f) => (f.parent ?? null) === this.here);
    },
    get filesHere() {
      return this.files.filter((f) => (f.folder ?? null) === this.here);
    },
    enter(id) {
      this.path.push(id);
    },
    goto(i) {
      this.path = this.path.slice(0, i);
    },
    /* Upload — real client-side add: the picker hands us File objects and
       rows land in the current folder. Storage seam: swap upload() for a
       FormData POST to your endpoint (S3/GCS/CDN), keep the row shape. */
    iconFor(name) {
      const ext = name.split(".").pop()?.toLowerCase() ?? "";
      return (
        {
          pdf: "filePdf", svg: "fileImg", png: "fileImg", jpg: "fileImg", jpeg: "fileImg", gif: "fileImg", webp: "fileImg",
          doc: "fileDoc", docx: "fileDoc", txt: "fileDoc", md: "fileDoc",
          zip: "fileZip", rar: "fileZip", gz: "fileZip",
          mp4: "fileVid", mov: "fileVid", webm: "fileVid",
          xls: "fileXls", xlsx: "fileXls", csv: "fileXls",
          mp3: "fileAudio", wav: "fileAudio", ogg: "fileAudio",
        }[ext] ?? "file"
      );
    },
    fmtSize(bytes) {
      if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
      if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
      return Math.max(1, Math.round(bytes / 1e3)) + " KB";
    },
    upload(e) {
      const list = [...(e.target.files ?? [])];
      if (!list.length) return;
      const today = new Date().toISOString().slice(0, 10);
      for (const f of list) {
        const row = {
          id: `d${Date.now()}-${f.name}`,
          name: f.name,
          icon: this.iconFor(f.name),
          size: this.fmtSize(f.size),
          modified: today,
          owner: window.mockData.user.name,
          folder: this.here,
          progress: 0,
          _enter: true,
        };
        this.files.unshift(row);
        /* Simulated ramp — the static edition has no storage backend.
           Buyers wiring real uploads drive row.progress from
           xhr.upload.onprogress (or a resumable client's callback) and
           clear it to null on completion — markup already reads it. */
        const tick = setInterval(() => {
          row.progress = Math.min(100, (row.progress ?? 0) + 8 + Math.random() * 10);
          if (row.progress >= 100) {
            clearInterval(tick);
            row.progress = null;
          }
        }, 90);
        setTimeout(() => delete row._enter, 350);
      }
      const folder = this.folder(this.here);
      if (folder) folder.files += list.length;
      e.target.value = "";
      Alpine.store("toasts").push({ title: tt("toastFilesUploaded", { count: list.length }), variant: "success" });
    },
    download(f) {
      downloadFile(
        f.name,
        `${f.name}\n\nDemo file content — point download() at your storage backend to serve the real file.`,
      );
    },
    remove(f) {
      const i = this.files.indexOf(f);
      if (i > -1) this.files.splice(i, 1);
      const folder = this.folder(f.folder);
      if (folder) folder.files = Math.max(0, folder.files - 1);
      Alpine.store("toasts").push({ title: tt("toastFileDeleted", { name: f.name }), variant: "success" });
    },
  }));

  /* Order detail — resolves ?id= against the orders list; drives the
     detail template + localized breadcrumbs on order.html. */
  /* Product detail — resolves ?id= against the catalog, same contract
     as orderDetail. */
  /* Product create/edit/delete — shared by the catalog list
     (products.html) and the detail template (product.html?id=…). The
     modal markup is the components/product-modal.html partial; it needs
     prodM, form, saveProduct(), deleteProduct(), categoryChoices() and
     statusChoices in scope. `onDelete` lets the detail page leave once
     its record is gone. */
  const productEditor = (onDelete = null) => ({
    prodM: modalBehavior(),
    form: { item: null, name: "", category: "", price: "", stock: "", status: "in stock" },
    statusChoices: ["in stock", "low stock", "out of stock"],
    categoryChoices() {
      return [...new Set(window.mockData.pages.products.items.map((p) => p.category))];
    },
    openProduct(p, e) {
      this.form = p
        ? { item: p, name: p.name, category: p.category, price: p.price, stock: p.stock, status: p.status }
        : { item: null, name: "", category: this.categoryChoices()[0] ?? "", price: "", stock: "", status: "in stock" };
      this.prodM.show(e);
    },
    saveProduct() {
      const f = this.form;
      const items = window.mockData.pages.products.items;
      if (!f.name.trim() || f.price === "" || f.stock === "") return;
      const data = {
        name: f.name.trim(),
        category: f.category,
        price: Number(f.price),
        stock: Number(f.stock),
        status: f.status,
      };
      if (f.item) {
        Object.assign(f.item, data);
        Alpine.store("toasts").push({ title: tt("toastProductUpdated"), variant: "success" });
      } else {
        const record = { id: `SKU-${String(Date.now()).slice(-6)}`, rating: "—", ...data, _enter: true };
        items.unshift(record);
        setTimeout(() => delete record._enter, 350);
        Alpine.store("toasts").push({ title: tt("toastProductAdded"), variant: "success" });
      }
      this.prodM.hide();
    },
    deleteProduct() {
      const items = window.mockData.pages.products.items;
      const i = items.indexOf(this.form.item);
      if (i > -1) items.splice(i, 1);
      this.prodM.hide();
      Alpine.store("toasts").push({ title: tt("toastProductDeleted"), variant: "success" });
      onDelete?.();
    },
  });

  Alpine.data("productsPage", () => ({
    cols: [
      { key: "name", label: "Product" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "stock", label: "Stock" },
      { key: "rating", label: "Rating" },
      { key: "status", label: "Status", sort: false },
    ],
    ...productEditor(),
    ...paginatedBehavior(() => window.mockData.pages.products.items, 5),
  }));

  Alpine.data("productDetail", () => ({
    id: new URLSearchParams(location.search).get("id") ?? "",
    get product() {
      return window.mockData.pages.products.items.find((p) => p.id === this.id) ?? null;
    },
    get crumbs() {
      return [
        { label: tt("products"), href: "products.html" },
        { label: this.product?.name ?? (this.id || "—") },
      ];
    },
    ...productEditor(() => (location.href = "products.html")),
  }));

  /* Billing — plan buttons navigate in-kit (pricing/members); the
     payment-method modal writes d.pages.billing.payment. Invoice row
     downloads go through the global invoiceDownload() helper. Billing
     provider seam: swap openPayment/savePayment for your Stripe/Paddle
     portal redirect. */
  Alpine.data("billingPage", () => ({
    payM: modalBehavior(),
    payForm: { brand: "", last4: "", expiry: "", holder: "" },
    openPayment(e) {
      const p = window.mockData.pages.billing.payment;
      this.payForm = { brand: p.brand, last4: p.last4, expiry: p.expiry, holder: p.holder };
      this.payM.show(e);
    },
    savePayment() {
      const f = this.payForm;
      Object.assign(window.mockData.pages.billing.payment, {
        brand: f.brand.trim() || "Card",
        last4: String(f.last4).replace(/\D/g, "").slice(-4) || f.last4.trim(),
        expiry: f.expiry.trim(),
        holder: f.holder.trim(),
      });
      this.payM.hide();
      Alpine.store("toasts").push({ title: tt("toastPaymentUpdated"), variant: "success" });
    },
  }));

  Alpine.data("orderDetail", () => ({
    id: new URLSearchParams(location.search).get("id") ?? "",
    get order() {
      return (
        window.mockData.pages.orders.items.find(
          (o) => o.id === this.id || o.id === `#${this.id}`
        ) ?? null
      );
    },
    get crumbs() {
      return [
        { label: tt("orders"), href: "orders.html" },
        { label: this.order?.id ?? (this.id || "—") },
      ];
    },
  }));

  /* User detail — resolves ?id= against the customers list; the orders
     table filters the shared orders collection by customer name. */
  Alpine.data("userDetail", () => ({
    id: new URLSearchParams(location.search).get("id") ?? "",
    get customer() {
      return window.mockData.pages.customers.items.find((c) => c.id === this.id) ?? null;
    },
    get orders() {
      return this.customer
        ? window.mockData.pages.orders.items.filter((o) => o.customer === this.customer.name)
        : [];
    },
    get avgOrder() {
      return this.customer && this.customer.orders ? this.customer.spent / this.customer.orders : 0;
    },
    get crumbs() {
      return [
        { label: tt("customers"), href: "customers.html" },
        { label: this.customer?.name ?? "—" },
      ];
    },
  }));

  /* Notifications inbox — operates on d.notifications directly so the
     header unread badge stays in sync. */
  Alpine.data("notificationsPage", () => ({
    items: window.mockData.notifications,
    filter: "all",
    get filtered() {
      return this.filter === "unread" ? this.items.filter((n) => n.unread) : this.items;
    },
    markRead(n) {
      n.unread = false;
      apiPost(`/api/notifications/${n.id}/read`);
    },
    markAll() {
      this.items.forEach((n) => (n.unread = false));
      apiPost("/api/notifications/read-all");
      Alpine.store("toasts").push({ title: tt("toastNotifRead"), variant: "success", ttl: 3000 });
    },
  }));

  /* Audit log — type-filter chips + timeline over paginated(). The type
     metadata (icon/variant/label) lives in d.pages.auditLog.types, so a
     buyer adds a category by adding one row to the contract. */
  Alpine.data("auditLog", () => {
    const comp = {
      typeFilter: "all",
      setType(key) {
        this.typeFilter = key;
        this.page = 1;
      },
      typeMeta(key) {
        return (
          window.mockData.pages.auditLog.types.find((t) => t.key === key) ??
          { icon: "info", variant: "default", label: key }
        );
      },
      get filteredEvents() {
        const evts = window.mockData.pages.auditLog.events;
        return this.typeFilter === "all"
          ? evts
          : evts.filter((e) => e.type === this.typeFilter);
      },
      // Day separator: render a header when the visible date changes.
      showDay(ev, i) {
        if (i === 0) return true;
        return ev.ts.slice(0, 10) !== this.pageItems[i - 1].ts.slice(0, 10);
      },
    };
    /* Assign AFTER comp exists — paginatedBehavior's spread evaluates its
       getters immediately (items → filteredEvents), so the source list
       must already be reachable. init() re-installs live getters on the
       Alpine data frame, so search/pagination stay reactive. */
    Object.assign(comp, paginatedBehavior(() => comp.filteredEvents, 8));
    return comp;
  });

  /* Account settings — "Personal information" save. Always echoes into
     the contract (demo feels alive: header, profile, field values update
     in place); in API mode the same payload POSTs to /api/users/me and
     the returned user folds back into the session. Mirrors the server-
     side mapping so both modes land in the same state. */
  Alpine.data("accountPage", () => ({
    delM: modalBehavior(),
    /* Change password — POSTs to /api/users/me/password, which verifies
       the current password before rehashing. Static mode: demo toast
       marks the seam (wire to your auth provider's credential update). */
    async updatePassword(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = await apiPost("/api/users/me/password", {
        current: fd.get("pw-current") ?? "",
        new: fd.get("pw-new") ?? "",
      });
      e.target.reset();
      if (res === null && !window.DREAMBOARD_API) {
        Alpine.store("toasts").push({ title: tt("toastDemoAction"), variant: "info" });
        return;
      }
      Alpine.store("toasts").push({
        title: tt(res?.ok ? "toastPasswordChanged" : "toastPasswordFailed"),
        variant: res?.ok ? "success" : "danger",
      });
    },
    /* Profile photo — reads the picked file as a data URL into
       d.user.photo so it renders anywhere the avatar does (header,
       profile, this card), and persists it via /api/users/me (photo
       field). A hosted deployment would swap in object storage and
       store the returned URL instead. */
    savePhoto(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        window.mockData.user.photo = reader.result;
        if (window.DREAMBOARD_API)
          apiPost("/api/users/me", {
            name: window.mockData.user.name,
            photo: reader.result,
          });
        Alpine.store("toasts").push({ title: tt("toastPhotoUpdated"), variant: "success", ttl: 3000 });
      };
      reader.readAsDataURL(file);
    },
    confirmDelete() {
      this.delM.hide();
      Alpine.store("toasts").push({ title: tt("toastAccountDeleted"), variant: "info" });
      setTimeout(() => (location.href = "signout.html"), 800);
    },
    async savePersonal(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const get = (k) => String(fd.get(k) ?? "").trim();
      const first = get("set-first");
      const last = get("set-last");
      const name = `${first} ${last}`.trim();
      const email = get("set-email");
      const phone = get("set-phone");
      const bio = String(fd.get("set-bio") ?? "");

      const d = window.mockData;
      const setField = (id, v) => {
        const f = d.pages.account.personalFields.find((x) => x.id === id);
        if (f) f.value = v;
      };
      if (name) {
        d.user.name = name;
        d.user.initials = name
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
      }
      if (email) d.user.email = email;
      setField("set-first", first);
      setField("set-last", last);
      setField("set-email", email);
      setField("set-phone", phone);
      d.pages.account.bio.value = bio;
      if (d.pages.profile) {
        d.pages.profile.phone = phone;
        d.pages.profile.bio = bio;
      }

      const res = await apiPost("/api/users/me", { name, email, phone, bio });
      if (res?.user) mergeSessionUser(res.user);
      Alpine.store("toasts").push({ title: tt("Profile updated"), variant: "success", ttl: 3000 });
    },
  }));

  /* Kanban board — HTML5 drag & drop for pointer users; focused cards
     move between columns with ArrowLeft/ArrowRight (announced via the
     `live` polite status region). */
  Alpine.data("kanban", () => ({
    cols: window.mockData.pages.tasks.columns,
    dragId: null,
    overCol: null,
    live: "",
    // Create/edit dialogs — section modal doubles for "New section"
    // (secForm.col null) and "Rename section" (secForm.col set).
    cardM: modalBehavior(),
    secM: modalBehavior(),
    cardForm: { colId: null, task: null, title: "", assignee: "", due: "", tag: "" },
    secForm: { col: null, title: "", color: "sky" },
    // Categorical section colors — token-based badge/dot/ring per key.
    secColorMap: {
      slate: { dot: "bg-slate-400", badge: "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300", ring: "ring-slate-400/70" },
      sky: { dot: "bg-sky-500", badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", ring: "ring-sky-400/70" },
      emerald: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", ring: "ring-emerald-400/70" },
      amber: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", ring: "ring-amber-400/70" },
      rose: { dot: "bg-rose-500", badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", ring: "ring-rose-400/70" },
      violet: { dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300", ring: "ring-violet-400/70" },
    },
    secColor(col) {
      return this.secColorMap[col.color] ?? this.secColorMap.slate;
    },
    secColorChoices: [
      { key: "slate", hex: "#94a3b8" },
      { key: "sky", hex: "#0ea5e9" },
      { key: "emerald", hex: "#10b981" },
      { key: "amber", hex: "#f59e0b" },
      { key: "rose", hex: "#f43f5e" },
      { key: "violet", hex: "#8b5cf6" },
    ],
    tagOptions() {
      const pool = window.mockData.pages.tasks.tagOptions ?? [];
      const seen = new Map(pool.map((o) => [o.tag, o.variant]));
      for (const c of this.cols) for (const t of c.items) if (!seen.has(t.tag)) seen.set(t.tag, t.tagVariant);
      return [...seen.entries()].map(([tag, variant]) => ({ tag, variant }));
    },
    assignees() {
      const pool = window.mockData.pages.tasks.assignees ?? [];
      return [...new Set([...pool, ...this.cols.flatMap((c) => c.items.map((t) => t.assignee))])].sort();
    },
    openCard(col, task, e) {
      const opts = this.tagOptions();
      this.cardForm = task
        ? { colId: col.id, task, title: tt(task.title), assignee: task.assignee, due: task.due, tag: task.tag }
        : { colId: col.id, task: null, title: "", assignee: this.assignees()[0] ?? "", due: new Date().toISOString().slice(0, 10), tag: opts[0]?.tag ?? "" };
      this.cardM.show(e);
    },
    saveCard() {
      const f = this.cardForm;
      const col = this.cols.find((c) => c.id === f.colId);
      if (!col || !f.title.trim()) return;
      const variant = this.tagOptions().find((o) => o.tag === f.tag)?.variant ?? "default";
      if (f.task) {
        Object.assign(f.task, { title: f.title.trim(), assignee: f.assignee, due: f.due, tag: f.tag, tagVariant: variant });
        apiPost("/api/tasks/save", { colId: f.colId, task: f.task });
        Alpine.store("toasts").push({ title: tt("toastTaskUpdated"), variant: "success" });
      } else {
        const task = { id: `TK-${Math.floor(1000 + Math.random() * 9000)}`, title: f.title.trim(), tag: f.tag, tagVariant: variant, assignee: f.assignee, due: f.due };
        col.items.push(task);
        apiPost("/api/tasks/save", { colId: f.colId, task });
        Alpine.store("toasts").push({ title: tt("toastTaskAdded"), variant: "success" });
      }
      this.cardM.hide();
    },
    deleteCard() {
      const f = this.cardForm;
      const col = this.cols.find((c) => c.id === f.colId);
      const i = col?.items.indexOf(f.task) ?? -1;
      if (i > -1) col.items.splice(i, 1);
      if (f.task?.id) apiPost("/api/tasks/delete", { colId: f.colId, taskId: f.task.id });
      this.cardM.hide();
      Alpine.store("toasts").push({ title: tt("toastTaskDeleted"), variant: "success" });
    },
    openSec(col, e) {
      this.secForm = { col, title: col ? tt(col.title) : "", color: col?.color ?? "sky" };
      this.secM.show(e);
    },
    saveSection() {
      const f = this.secForm;
      if (!f.title.trim()) return;
      if (f.col) {
        f.col.title = f.title.trim();
        f.col.color = f.color;
        apiPost("/api/tasks/section", { id: f.col.id, title: f.col.title, color: f.col.color });
        Alpine.store("toasts").push({ title: tt("toastSectionRenamed"), variant: "success" });
      } else {
        const col = { id: `col-${Date.now()}`, title: f.title.trim(), color: f.color, items: [] };
        this.cols.push(col);
        apiPost("/api/tasks/section", col);
        Alpine.store("toasts").push({ title: tt("toastSectionAdded"), variant: "success" });
      }
      this.secM.hide();
    },
    deleteSection(col) {
      const i = this.cols.indexOf(col);
      if (i > -1) this.cols.splice(i, 1);
      apiPost("/api/tasks/section/delete", { id: col.id });
      Alpine.store("toasts").push({ title: tt("toastSectionDeleted"), variant: "success" });
    },
    // Set before a keyboard move — the recreated card (x-init) reads the
    // flag and focuses itself, sidestepping x-for render timing races.
    wantFocus: null,
    start(ev, task) {
      this.dragId = task.id;
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", task.id);
    },
    drop(ev, col) {
      ev.preventDefault();
      this.moveTo(ev.dataTransfer.getData("text/plain") || this.dragId, col.id);
      this.dragId = null;
      this.overCol = null;
    },
    moveBy(task, dir) {
      const src = this.cols.findIndex((c) => c.items.includes(task));
      const dest = this.cols[src + dir];
      if (src > -1 && dest) {
        this.wantFocus = task.id;
        this.moveTo(task.id, dest.id);
      }
    },
    moveTo(taskId, colId) {
      let task = null;
      for (const c of this.cols) {
        const i = c.items.findIndex((t) => t.id === taskId);
        if (i > -1) {
          task = c.items.splice(i, 1)[0];
          break;
        }
      }
      const dest = this.cols.find((c) => c.id === colId);
      if (task && dest) {
        dest.items.push(task);
        this.live = tt("cardMoved", { title: tt(task.title), column: tt(dest.title) });
        apiPost("/api/tasks/move", { taskId, colId });
      }
    },
  }));

  /* OTP input — six single-digit boxes. Typing auto-advances, Backspace
     on an empty box steps back, arrows navigate, paste distributes. */
  Alpine.data("otpInput", () => ({
    digits: Array(6).fill(""),
    inputs() {
      return [...this.$refs.group.querySelectorAll("input")];
    },
    onInput(e, i) {
      const v = e.target.value.replace(/\D/g, "").slice(-1);
      this.digits[i] = v;
      e.target.value = v;
      if (v) this.inputs()[i + 1]?.focus();
    },
    onKeydown(e, i) {
      const list = this.inputs();
      if (e.key === "Backspace" && !this.digits[i]) list[i - 1]?.focus();
      else if (e.key === "ArrowLeft") list[i - 1]?.focus();
      else if (e.key === "ArrowRight") list[i + 1]?.focus();
    },
    onPaste(e) {
      e.preventDefault();
      const v = (e.clipboardData?.getData("text") ?? "").replace(/\D/g, "").slice(0, 6);
      [...v].forEach((ch, i) => (this.digits[i] = ch));
      this.inputs()[Math.min(v.length, 5)]?.focus();
    },
  }));

  /* ── Page-level data ──────────────────────────────────────────────── */

  // Shared page context: exposes mockData + helpers to every binding.
  Alpine.data("page", () => ({
    d: window.mockData,
    icon: iconSvg,
    fmt,
    fmtDate,
    fmtDateTime,
    badge,
    statusVariant,
    alertVariant,
    initials: (name) =>
      name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    unreadCount() {
      return this.d.notifications.filter((n) => n.unread).length;
    },
    // Runtime nav highlight — the current page is a location fact, not data.
    isCurrent(href) {
      const here = location.pathname.split("/").pop() || "index.html";
      return href.split("?")[0] === here;
    },
    /* Field validation-state styles — the class lookup lives here (not in
       mockData) so data stays presentation-free. */
    inputState(state) {
      return {
        error: "border-rose-500 focus:border-rose-500 dark:border-rose-500",
        success: "border-emerald-500 focus:border-emerald-500 dark:border-emerald-500",
        disabled: "opacity-60",
      }[state] ?? "";
    },
    hintState(state) {
      return {
        error: "text-rose-600 dark:text-rose-400",
        success: "text-emerald-700 dark:text-emerald-400",
        disabled: "text-slate-500 dark:text-slate-400",
      }[state] ?? "text-slate-500 dark:text-slate-400";
    },
  }));

  /* ── Charts (ApexCharts, vendored) ────────────────────────────────────
   * Components render into <div x-ref="chart"> containers and re-theme
   * themselves when the dark-mode store flips. Screen readers get an
   * sr-only data table next to each chart instead.
   */

  // KPI sparkline — mini area chart per stat card (`spark` in mockData).
  // Re-mounts on accent change; dark mode doesn't affect it (no text/grid).
  Alpine.data("sparkline", (points) => ({
    init() {
      const build = () => ({
        chart: {
          type: "area",
          height: 36,
          width: 96,
          sparkline: { enabled: true },
          animations: { enabled: !reduceMotion() },
        },
        series: [{ data: points }],
        stroke: { curve: "smooth", width: 2 },
        fill: {
          type: "gradient",
          gradient: { opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
        },
        colors: [cssVar("--color-primary-500", "#465fff")],
        tooltip: { enabled: false },
      });
      const { remount } = mountChart(this.$el, build);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
    },
  }));

  // Revenue area chart — finance style (dual series, gradient fill).
  Alpine.data("revenueChart", () => ({
    labels: window.mockData.revenueChart.labels, // sr-only table
    series: window.mockData.revenueChart.series, // sr-only table
    label: window.mockData.revenueChart.label,
    yAxisLabel: window.mockData.revenueChart.yAxisLabel,
    init() {
      const cfg = window.mockData.revenueChart;
      const build = (dark) => ({
        ...chartBase(dark),
        chart: { ...chartBase(dark).chart, type: "area", height: 310 },
        series: cfg.series.map((s) => ({ name: tt(s.name), data: s.data })),
        colors: [cssVar("--color-primary-500", "#465fff"), cssVar("--color-slate-400", "#94a3b8")],
        stroke: { curve: "smooth", width: 2.5 },
        fill: {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: dark ? 0.3 : 0.4, opacityTo: 0.02, stops: [0, 100] },
        },
        xaxis: {
          categories: cfg.labels.map(tAxis),
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { fontSize: "11px" } },
        },
        yaxis: {
          labels: { style: { fontSize: "11px" }, formatter: (v) => Math.round(v) },
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "12px",
          markers: { size: 5, shape: "circle" },
          itemMargin: { horizontal: 12 },
        },
        markers: { size: 0, hover: { size: 5 } },
      });
      // Keep the Apex instance + render promise in plain closures, NOT on
      // the Alpine component — reactive proxies around chart internals break
      // apex's DOM cleanup (listeners get removed from proxied elements).
      // updateOptions merges shallowly and leaves stale theme colors, so
      // re-theme = destroy + recreate. render() mounts async, so wait for
      // any in-flight mount before destroying or the old canvas lingers.
      const { remount } = mountChart(this.$refs.chart, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
    },
  }));

  // Orders bar chart — weekly column chart.
  Alpine.data("ordersChart", () => ({
    labels: window.mockData.ordersChart.labels, // sr-only table
    data: window.mockData.ordersChart.data, // sr-only table
    label: window.mockData.ordersChart.label,
    init() {
      const cfg = window.mockData.ordersChart;
      const build = (dark) => ({
        ...chartBase(dark),
        chart: { ...chartBase(dark).chart, type: "bar", height: 280 },
        series: [{ name: tt(cfg.label), data: cfg.data }],
        colors: [cssVar("--color-primary-500", "#465fff")],
        plotOptions: { bar: { borderRadius: 5, columnWidth: "45%" } },
        xaxis: {
          categories: cfg.labels.map(tAxis),
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { fontSize: "11px" } },
        },
        yaxis: { labels: { style: { fontSize: "11px" } } },
        legend: { show: false },
      });
      const { remount } = mountChart(this.$refs.chart, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
    },
  }));

  // Analytics traffic chart — dual-series area, same build as revenueChart.
  Alpine.data("trafficChart", () => ({
    labels: window.mockData.pages.analytics.traffic.labels, // sr-only table
    series: window.mockData.pages.analytics.traffic.series, // sr-only table
    label: window.mockData.pages.analytics.traffic.label,
    yAxisLabel: window.mockData.pages.analytics.traffic.yAxisLabel,
    init() {
      const cfg = window.mockData.pages.analytics.traffic;
      const build = (dark) => ({
        ...chartBase(dark),
        chart: { ...chartBase(dark).chart, type: "area", height: 310 },
        series: cfg.series.map((s) => ({ name: tt(s.name), data: s.data })),
        colors: [cssVar("--color-primary-500", "#465fff"), cssVar("--color-slate-400", "#94a3b8")],
        stroke: { curve: "smooth", width: 2.5 },
        fill: {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: dark ? 0.3 : 0.4, opacityTo: 0.02, stops: [0, 100] },
        },
        xaxis: {
          categories: cfg.labels.map(tAxis),
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { fontSize: "11px" } },
        },
        yaxis: {
          labels: { style: { fontSize: "11px" }, formatter: (v) => Math.round(v) },
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "12px",
          markers: { size: 5, shape: "circle" },
          itemMargin: { horizontal: 12 },
        },
        markers: { size: 0, hover: { size: 5 } },
      });
      const { remount } = mountChart(this.$refs.chart, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
    },
  }));

  // Analytics channels — donut chart of traffic sources.
  Alpine.data("channelsChart", () => ({
    labels: window.mockData.pages.analytics.channels.labels, // sr-only table
    data: window.mockData.pages.analytics.channels.data, // sr-only table
    label: window.mockData.pages.analytics.channels.label,
    init() {
      const cfg = window.mockData.pages.analytics.channels;
      const build = (dark) => ({
        ...chartBase(dark),
        chart: { ...chartBase(dark).chart, type: "donut", height: 268 },
        series: cfg.data,
        labels: cfg.labels.map(tt),
        colors: [
          cssVar("--color-primary-500", "#465fff"),
          cssVar("--color-primary-400", "#7c8eff"),
          cssVar("--color-primary-300", "#a3b2ff"),
          cssVar("--color-slate-400", "#94a3b8"),
          cssVar("--color-slate-300", "#cbd5e1"),
        ],
        stroke: { width: 0 },
        plotOptions: { pie: { donut: { size: "68%" } } },
        dataLabels: { enabled: false },
        legend: { position: "bottom", fontSize: "12px", markers: { size: 5, shape: "circle" }, itemMargin: { horizontal: 10, vertical: 4 } },
        tooltip: { y: { formatter: (v) => `${v}%` } },
      });
      const { remount } = mountChart(this.$refs.chart, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
    },
  }));

  /* Generic chart — type-dispatched ApexCharts builder for the showcase
     pages. Specs are plain data in mockData ({type, labels, series, …});
     apexSpec adds theme tokens + localization on top of chartBase(). */
  function apexSpec(cfg, dark) {
    const base = chartBase(dark);
    const P = [500, 400, 300, 600, 200].map((n) => cssVar(`--color-primary-${n}`));
    const SL = [400, 300].map((n) => cssVar(`--color-slate-${n}`));
    const h = cfg.height ?? 280;
    const cats = cfg.labels?.map(tAxis);
    const named = cfg.series?.map((sr) => ({ ...sr, name: sr.name ? tt(sr.name) : sr.name }));
    const legend = {
      fontSize: "12px",
      markers: { size: 5, shape: "circle" },
      itemMargin: { horizontal: 10, vertical: 4 },
    };
    const axes = {
      xaxis: {
        categories: cats,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: "11px" } },
      },
      yaxis: { labels: { style: { fontSize: "11px" } } },
    };
    const segColors = [P[0], P[1], P[2], SL[0], SL[1]];
    switch (cfg.type) {
      case "line":
      case "area":
        return {
          ...base,
          chart: { ...base.chart, type: cfg.type, height: h },
          series: named,
          colors: [P[0], SL[0]],
          stroke: { curve: "smooth", width: 2.5 },
          ...(cfg.type === "area" && {
            fill: { type: "gradient", gradient: { opacityFrom: dark ? 0.3 : 0.4, opacityTo: 0.02, stops: [0, 100] } },
          }),
          markers: cfg.live
            ? {
                size: 0,
                hover: { size: 5 },
                discrete: [
                  {
                    seriesIndex: 0,
                    dataPointIndex: cfg.series[0].data.length - 1,
                    size: 6,
                    fillColor: cssVar("--color-primary-500", "#465fff"),
                    strokeColor: cssVar("--color-primary-400", "#8b9eff"),
                  },
                ],
              }
            : { size: 0, hover: { size: 5 } },
          legend: { ...legend, position: "top", horizontalAlign: "right" },
          ...axes,
        };
      case "bar":
        return {
          ...base,
          chart: { ...base.chart, type: "bar", height: h },
          series: named,
          colors: (named?.length ?? 0) > 1 ? [P[0], SL[0]] : [P[0]],
          plotOptions: {
            bar: {
              borderRadius: 5,
              ...(cfg.horizontal
                ? { horizontal: true, barHeight: "55%" }
                : { columnWidth: "48%" }),
            },
          },
          legend: { ...legend, show: (named?.length ?? 0) > 1 },
          ...axes,
        };
      case "donut":
      case "pie":
        return {
          ...base,
          chart: { ...base.chart, type: cfg.type, height: h },
          series: cfg.series,
          labels: cfg.labels.map(tt),
          colors: segColors,
          stroke: { width: 0 },
          ...(cfg.type === "donut" && { plotOptions: { pie: { donut: { size: "68%" } } } }),
          legend: { ...legend, position: "bottom" },
        };
      case "radialBar":
        return {
          ...base,
          chart: { ...base.chart, type: "radialBar", height: h },
          series: cfg.series,
          labels: cfg.labels.map(tt),
          colors: [P[0], P[1], P[2]],
          plotOptions: {
            radialBar: {
              hollow: { size: "55%" },
              track: { background: dark ? cssVar("--color-slate-800", "#1e293b") : cssVar("--color-slate-200", "#e2e8f0") },
              dataLabels: { name: { fontSize: "11px" }, value: { fontSize: "18px", fontWeight: 700 } },
            },
          },
          legend: { ...legend, position: "bottom", show: cfg.series.length > 1 },
        };
      case "radar":
        return {
          ...base,
          chart: { ...base.chart, type: "radar", height: h },
          series: named,
          colors: [P[0], SL[0]],
          xaxis: { categories: cats },
          stroke: { width: 2 },
          markers: { size: 4 },
          fill: { opacity: 0.15 },
          legend: { ...legend, position: "bottom" },
        };
      case "heatmap":
        return {
          ...base,
          chart: { ...base.chart, type: "heatmap", height: h },
          series: named,
          colors: [P[0]],
          plotOptions: { heatmap: { shadeIntensity: 0.6, radius: 3 } },
          stroke: { width: 2, colors: [dark ? cssVar("--color-slate-900", "#0f172a") : "#ffffff"] },
          legend: { show: false },
          ...axes,
        };
      case "candlestick":
        return {
          ...base,
          chart: { ...base.chart, type: "candlestick", height: h },
          series: named,
          plotOptions: { candlestick: { colors: { upward: P[0], downward: SL[0] } } },
          xaxis: { type: "category", labels: { style: { fontSize: "11px" } } },
          yaxis: { labels: { style: { fontSize: "11px" } }, tooltip: { enabled: false } },
          legend: { show: false },
        };
      case "treemap":
        return {
          ...base,
          chart: { ...base.chart, type: "treemap", height: h },
          series: named,
          colors: segColors,
          plotOptions: { treemap: { distributed: true } },
          legend: { show: false },
        };
      case "rangeBar":
        return {
          ...base,
          chart: { ...base.chart, type: "rangeBar", height: h },
          series: named,
          colors: [P[0]],
          plotOptions: { bar: { horizontal: true, barHeight: "55%", borderRadius: 5 } },
          xaxis: { labels: { style: { fontSize: "11px" } } },
          yaxis: { labels: { style: { fontSize: "11px" } } },
          legend: { show: false },
        };
      case "polarArea":
        return {
          ...base,
          chart: { ...base.chart, type: "polarArea", height: h },
          series: cfg.series,
          labels: cfg.labels.map(tt),
          colors: segColors,
          stroke: { width: 1, colors: [dark ? cssVar("--color-slate-900", "#0f172a") : "#ffffff"] },
          fill: { opacity: 0.85 },
          legend: { ...legend, position: "bottom" },
        };
      case "scatter":
        return {
          ...base,
          chart: { ...base.chart, type: "scatter", height: h },
          series: named,
          colors: [P[0], SL[0]],
          markers: { size: 5 },
          xaxis: { tickAmount: 8, labels: { style: { fontSize: "11px" } } },
          yaxis: { labels: { style: { fontSize: "11px" } } },
          legend: { ...legend, position: "top", horizontalAlign: "right" },
        };
      default:
        return base;
    }
  }

  // Charts showcase — one card = one `apexChart(spec)` from mockData.
  Alpine.data("apexChart", (cfg) => ({
    cfg,
    /* sr-only table cell: flatten Apex datum shapes to readable text. */
    cellText(v) {
      if (v == null) return "";
      if (Array.isArray(v)) return v.map((n) => this.cellText(n)).join(" – ");
      if (typeof v === "object" && v.y != null) return `${v.x ?? ""}: ${this.cellText(v.y)}`;
      return String(v);
    },
    init() {
      if (cfg.type === "world") return; // dotted map renders via worldMapView
      const build = (dark) => apexSpec(cfg, dark);
      const { remount } = mountChart(this.$refs.chart, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
    },
  }));

  // Realtime — rolling live chart + counter + event feed. Chart lives in a
  // closure; the interval keeps pushing into reactive `points`/`feed`.
  // Realtime CLASSIC — rolling live chart + counter + event feed. Chart lives in a
  // closure; the interval keeps pushing into reactive `points`/`feed`.
  Alpine.data("realtimeClassic", () => ({
    activeNow: window.mockData.pages.realtime.activeNow,
    points: [...window.mockData.pages.realtime.perMinute],
    feed: window.mockData.pages.realtime.feed.map((e) => ({ ...e, time: "just now" })),
    init() {
      const cfg = window.mockData.pages.realtime;
      const xlabels = cfg.perMinute.map((_, i) => {
        const ago = cfg.perMinute.length - 1 - i;
        return ago === 0 ? "now" : `-${ago}m`;
      });
      const build = (dark) => ({
        ...chartBase(dark),
        chart: { ...chartBase(dark).chart, type: "area", height: 240 },
        series: [{ name: tt("Active users"), data: [...this.points] }],
        colors: [cssVar("--color-primary-500", "#465fff")],
        stroke: { curve: "smooth", width: 2.5 },
        /* Ripple/glow endpoint — only the newest sample carries a marker
           (discrete marker; .live-chart on the mount animates it). */
        markers: {
          size: 0,
          hover: { size: 5 },
          discrete: [
            {
              seriesIndex: 0,
              dataPointIndex: cfg.perMinute.length - 1,
              size: 6,
              fillColor: cssVar("--color-primary-500", "#465fff"),
              strokeColor: cssVar("--color-primary-400", "#8b9eff"),
            },
          ],
        },
        fill: {
          type: "gradient",
          gradient: { opacityFrom: dark ? 0.3 : 0.4, opacityTo: 0.02, stops: [0, 100] },
        },
        xaxis: {
          categories: xlabels,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { show: false },
        },
        yaxis: { labels: { style: { fontSize: "11px" } } },
        legend: { show: false },
      });
      const { remount, current } = mountChart(this.$refs.chart, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
      const pool = cfg.feedPool;
      setInterval(() => {
        const drift = Math.round((Math.random() - 0.45) * 24);
        this.activeNow = Math.max(80, this.activeNow + drift);
        this.points = [...this.points.slice(1), this.activeNow];
        current()?.updateSeries([{ data: [...this.points] }], !reduceMotion());
        if (pool.length && Math.random() < 0.6) {
          const evt = pool[Math.floor(Math.random() * pool.length)];
          this.feed = [{ ...evt, time: "just now" }, ...this.feed].slice(0, 8);
        }
      }, 2500);
    },
  }));

  // Multi-series by design (users + events): the endpoint markers ride each
  // series' tail and are rebuilt via updateOptions every tick — Apex never
  // removes stale discrete-marker DOM, so redrawPaths must be true.
  Alpine.data("realtime", () => ({
    activeNow: window.mockData.pages.realtime.activeNow,
    eventsNow: window.mockData.pages.realtime.eventsNow,
    delta: 0,
    points: [...window.mockData.pages.realtime.perMinute],
    events: [...window.mockData.pages.realtime.eventsPerMinute],
    // ISO stamp per point — feeds both sparse x labels and the tooltip.
    stamps: window.mockData.pages.realtime.perMinute.map(
      (_, i) =>
        new Date(
          Date.now() - (window.mockData.pages.realtime.perMinute.length - 1 - i) * 60000,
        ).toISOString(),
    ),
    feed: window.mockData.pages.realtime.feed.map((e) => ({ ...e, time: "just now" })),
    init() {
      const cfg = window.mockData.pages.realtime;
      const fills = () => [
        cssVar("--color-primary-500", "#465fff"),
        cssVar("--color-slate-400", "#94a3b8"),
      ];
      const strokes = () => [
        cssVar("--color-primary-400", "#8b9eff"),
        cssVar("--color-slate-300", "#cbd5e1"),
      ];
      /* Ripple/glow endpoint per series — discrete markers are
         per-seriesIndex; a trailing null gets no marker. */
      const endMarkers = () => {
        const f = fills();
        const s = strokes();
        return [this.points, this.events].flatMap((data, i) => {
          const idx = data.length - 1;
          if (idx < 0 || data[idx] == null) return [];
          return [{ seriesIndex: i, dataPointIndex: idx, size: 6, fillColor: f[i], strokeColor: s[i] }];
        });
      };
      const build = (dark) => ({
        ...chartBase(dark),
        chart: { ...chartBase(dark).chart, type: "area", height: 240 },
        series: [
          { name: tt("Active users"), data: [...this.points] },
          { name: tt("Events"), data: [...this.events] },
        ],
        colors: fills(),
        stroke: { curve: "smooth", width: 2.5 },
        markers: { size: 0, hover: { size: 5 }, discrete: endMarkers() },
        fill: {
          type: "gradient",
          gradient: { opacityFrom: dark ? 0.3 : 0.4, opacityTo: 0.02, stops: [0, 100] },
        },
        xaxis: {
          categories: sparseTimeTicks(this.stamps),
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { hideOverlappingLabels: true, rotate: 0, style: { fontSize: "11px" } },
          tooltip: { enabled: false },
        },
        /* Integer counts only — Apex emits fraction ticks (0.5, 1.5);
           blank non-integer labels instead of rounding into 1,1,2,2. */
        yaxis: {
          min: 0,
          decimalsInFloat: 0,
          labels: { style: { fontSize: "11px" }, formatter: (v) => (Number.isInteger(v) ? String(v) : "") },
        },
        legend: { position: "top", horizontalAlign: "right", fontSize: "12px", markers: { size: 5, shape: "circle" } },
        /* Sparse categories leave most x labels empty — the tooltip
           header shows the point's full timestamp instead. */
        tooltip: {
          theme: dark ? "dark" : "light",
          x: { formatter: (v, { dataPointIndex } = {}) => fmtDateTime(this.stamps[dataPointIndex]) },
        },
      });
      const { remount, current } = mountChart(this.$refs.chart, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
      const pool = cfg.feedPool;
      setInterval(() => {
        const drift = Math.round((Math.random() - 0.45) * 24);
        const prev = this.activeNow;
        this.activeNow = Math.max(80, this.activeNow + drift);
        this.eventsNow = Math.max(200, this.eventsNow + Math.round((Math.random() - 0.5) * 40));
        this.delta = this.activeNow - prev;
        this.points = [...this.points.slice(1), this.activeNow];
        this.events = [...this.events.slice(1), this.eventsNow];
        this.stamps = [...this.stamps.slice(1), new Date().toISOString()];
        /* Series + categories + markers must move together — a stale
           category count parks endpoint markers at wrong x slots, and
           without redrawPaths old markers never leave the DOM. */
        current()?.updateOptions(
          {
            series: [
              { name: tt("Active users"), data: [...this.points] },
              { name: tt("Events"), data: [...this.events] },
            ],
            xaxis: { categories: sparseTimeTicks(this.stamps) },
            markers: { size: 0, hover: { size: 5 }, discrete: endMarkers() },
            tooltip: {
              x: { formatter: (v, { dataPointIndex } = {}) => fmtDateTime(this.stamps[dataPointIndex]) },
            },
          },
          true,
          !reduceMotion(),
        );
        if (pool.length && Math.random() < 0.6) {
          const evt = pool[Math.floor(Math.random() * pool.length)];
          this.feed = [{ ...evt, time: "just now" }, ...this.feed].slice(0, 8);
        }
      }, 2500);
    },
  }));

  // Calendar — Monday-first month grid. `weeks` is a flat list of cells the
  // template chunks into rows; events are matched per-cell by ISO date.
  Alpine.data("calendar", () => ({
    cfg: window.mockData.pages.calendar,
    events: window.mockData.pages.calendar.events.map((e) => ({ ...e })),
    year: 0,
    month: 0,
    cells: [],
    form: { title: "", date: "", variant: "primary" },
    // Edit dialog — changing `date` is how events move between days.
    editM: modalBehavior(),
    edit: null, // {id, title, date, variant} — working copy of the event
    init() {
      const [y, m] = this.cfg.initialMonth.split("-").map(Number);
      this.year = y;
      this.month = m - 1;
      this.build();
    },
    iso(y, m, d) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    },
    todayIso() {
      const t = new Date();
      return this.iso(t.getFullYear(), t.getMonth(), t.getDate());
    },
    monthLabel() {
      return new Date(this.year, this.month, 1).toLocaleDateString(Alpine.store("i18n").locale, { month: "long", year: "numeric" });
    },
    // Locale-aware weekday names (Mon-first) via Intl — replaces cfg.weekdays.
    weekdayNames() {
      const f = new Intl.DateTimeFormat(Alpine.store("i18n").locale, { weekday: "short" });
      return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i))); // Jan 1 2024 = Monday
    },
    build() {
      const first = new Date(this.year, this.month, 1);
      const offset = (first.getDay() + 6) % 7; // Monday-first
      const base = new Date(this.year, this.month, 1 - offset);
      const today = this.todayIso();
      this.cells = Array.from({ length: 42 }, (_, i) => {
        const dt = new Date(base);
        dt.setDate(base.getDate() + i);
        const iso = this.iso(dt.getFullYear(), dt.getMonth(), dt.getDate());
        return {
          iso,
          day: dt.getDate(),
          inMonth: dt.getMonth() === this.month,
          isToday: iso === today,
          events: this.events.filter((e) => e.date === iso),
        };
      });
    },
    weeks() {
      const w = [];
      for (let i = 0; i < 6; i++) w.push(this.cells.slice(i * 7, i * 7 + 7));
      return w;
    },
    shift(dir) {
      const dt = new Date(this.year, this.month + dir, 1);
      this.year = dt.getFullYear();
      this.month = dt.getMonth();
      this.build();
    },
    goToday() {
      const t = new Date();
      this.year = t.getFullYear();
      this.month = t.getMonth();
      this.build();
    },
    upcoming() {
      const today = this.todayIso();
      return this.events
        .filter((e) => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);
    },
    addEvent() {
      if (!this.form.title.trim() || !this.form.date) return;
      const ev = { id: `e${Date.now()}`, date: this.form.date, title: this.form.title.trim(), variant: this.form.variant };
      this.events.push(ev);
      apiPost("/api/calendar/event", ev);
      Alpine.store("toasts").push({
        title: tt("toastEventAdded"),
        body: `${this.form.title.trim()} · ${fmtDate(this.form.date)}`,
        variant: "success",
      });
      this.form = { title: "", date: "", variant: "primary" };
      this.build();
    },
    openEdit(ev, e) {
      this.edit = { ...ev };
      this.editM.show(e);
    },
    saveEdit() {
      const ev = this.events.find((x) => x.id === this.edit?.id);
      if (!ev || !this.edit.title.trim() || !this.edit.date) return;
      Object.assign(ev, { title: this.edit.title.trim(), date: this.edit.date, variant: this.edit.variant });
      apiPost("/api/calendar/event", ev);
      this.editM.hide();
      Alpine.store("toasts").push({ title: tt("toastEventUpdated"), variant: "success" });
      this.build();
    },
    deleteEvent() {
      const i = this.events.findIndex((x) => x.id === this.edit?.id);
      if (i > -1) this.events.splice(i, 1);
      if (this.edit?.id) apiPost("/api/calendar/event/delete", { id: this.edit.id });
      this.editM.hide();
      Alpine.store("toasts").push({ title: tt("toastEventDeleted"), variant: "success" });
      this.build();
    },
  }));

  /* ── AI Suite ─────────────────────────────────────────────────────── */

  /**
   * AI chat — conversation rail + thread + composer.
   * Assistant replies "stream" in via a typewriter interval; typing state
   * gates the composer. Keep timers in plain fields, not reactive proxies.
   */
  Alpine.data("aiChat", () => ({
    cfg: window.mockData.pages.aiChat,
    convos: window.mockData.pages.aiChat.conversations.map((c) => ({ ...c })),
    threads: {},
    active: null,
    draft: "",
    q: "",
    typing: false,
    streamTimer: null,
    ctx: null, // { x, y, c } — conversation right-click menu state
    ctxActions: [
      { key: "pin", label: "Pin", icon: "pin" },
      { key: "unread", label: "Mark as unread", icon: "envelopeOpen" },
      { key: "delete", label: "Delete", icon: "trash", danger: true },
    ],
    init() {
      for (const [k, v] of Object.entries(this.cfg.threads)) {
        this.threads[k] = v.map((m) => ({ ...m }));
      }
      if (this.convos.length) this.select(this.convos[0].id);
    },
    destroy() {
      clearInterval(this.streamTimer);
    },
    thread() {
      return this.threads[this.active] ?? [];
    },
    filteredConvos() {
      const q = this.q.trim().toLowerCase();
      return this.convos.filter((c) => !q || c.title.toLowerCase().includes(q));
    },
    /** Minimal markdown: escape, then **bold** and newlines. */
    md(t) {
      const esc = String(t)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
    },
    activeConvo() {
      return this.convos.find((c) => c.id === this.active);
    },
    select(id) {
      this.active = id;
      const c = this.activeConvo();
      if (c) c.unread = false;
      this.scroll();
    },
    /* Conversation context menu — right-click / context-menu key on a
       rail item (same pattern as the mail inbox). */
    openCtx(e, c) {
      const w = 200;
      const h = this.ctxActions.length * 36 + 16;
      this.ctx = {
        c,
        el: e.currentTarget, // Escape refocuses the triggering row
        x: Math.min(e.clientX, window.innerWidth - w - 8),
        y: Math.min(e.clientY, window.innerHeight - h - 8),
      };
      this.$nextTick(() => this.$refs.ctxMenu?.querySelector("button")?.focus());
    },
    ctxLabel(a) {
      if (a.key === "pin") return tt(this.ctx?.c.pinned ? "Unpin" : "Pin");
      if (a.key === "unread") return tt(this.ctx?.c.unread ? "Mark as read" : "Mark as unread");
      return tt(a.label);
    },
    ctxRun(a) {
      const c = this.ctx?.c;
      this.ctx = null;
      if (!c) return;
      if (a.key === "pin") {
        c.pinned = !c.pinned;
        apiPost("/api/chat/conversations/save", c);
      } else if (a.key === "unread") {
        c.unread = !c.unread;
        apiPost("/api/chat/conversations/save", c);
      } else if (a.key === "delete") {
        const i = this.convos.indexOf(c);
        if (i > -1) this.convos.splice(i, 1);
        delete this.threads[c.id];
        if (this.active === c.id) this.active = this.convos[0]?.id ?? null;
        apiPost("/api/chat/conversations/delete", { id: c.id });
        Alpine.store("toasts").push({ title: tt("Conversation deleted"), variant: "success" });
      }
    },
    newChat() {
      const id = "c" + Date.now();
      const convo = {
        id,
        title: "New conversation",
        model: this.cfg.models[0].name,
        updated: "Now",
        preview: "—",
        pinned: false,
        unread: false,
      };
      this.convos.unshift(convo);
      this.threads[id] = [];
      this.select(id);
      apiPost("/api/chat/conversations", convo);
      this.$nextTick(() => this.$refs.composer?.focus());
    },
    now() {
      return intlFor("time").format(new Date());
    },
    scroll() {
      this.$nextTick(() => {
        const el = this.$refs.messages;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    send(text = this.draft) {
      const t = String(text).trim();
      if (!t || this.typing) return;
      if (!this.active) this.newChat(); // minimal seed starts with zero convos
      const convo = this.activeConvo();
      if (convo?.title === "New conversation") convo.title = t.slice(0, 42) + (t.length > 42 ? "…" : "");
      if (convo) convo.preview = t.slice(0, 60);
      this.thread().push({ role: "user", text: t, time: this.now(), tokens: Math.ceil(t.length / 4) });
      this.draft = "";
      this.scroll();
      apiPost("/api/chat/messages", { conversationId: this.active, text: t, time: this.now() })
        .then((r) => this.respond(r?.assistantMsg));
    },
    respond(serverMsg) {
      this.typing = true;
      this.scroll();
      const full = serverMsg?.text ?? this.cfg.replies[Math.floor(Math.random() * this.cfg.replies.length)];
      setTimeout(() => {
        const msg = { role: "assistant", text: "", time: serverMsg?.time ?? this.now(), tokens: serverMsg?.tokens ?? 0 };
        this.thread().push(msg);
        this.scroll();
        let i = 0;
        this.streamTimer = setInterval(() => {
          i += 3 + Math.floor(Math.random() * 4);
          msg.text = full.slice(0, i);
          if (i >= full.length) {
            clearInterval(this.streamTimer);
            this.streamTimer = null;
            msg.tokens = Math.ceil(full.length / 4);
            this.typing = false;
            if (this.activeConvo()) this.activeConvo().preview = full.slice(0, 60);
            if (this.activeConvo()) this.activeConvo().updated = "Now";
          }
          this.scroll();
        }, 24);
      }, 600);
    },
    regenerate() {
      const t = this.thread();
      if (this.typing || !t.length) return;
      if (t[t.length - 1].role === "assistant") t.pop();
      Alpine.store("toasts").push({ title: tt("toastRegenerating"), variant: "info", ttl: 2500 });
      apiPost("/api/chat/messages", { conversationId: this.active, regenerate: true })
        .then((r) => this.respond(r?.assistantMsg));
    },
    copy(m) {
      navigator.clipboard?.writeText(m.text);
      Alpine.store("toasts").push({ title: tt("toastCopied"), variant: "success", ttl: 2500 });
    },
    soon(feature) {
      Alpine.store("toasts").push({ title: feature, body: tt("toastDemoAction"), variant: "info" });
    },
  }));

  /* Agents — pause/resume toggle with toast feedback. */
  Alpine.data("aiAgents", () => ({
    cfg: window.mockData.pages.aiAgents,
    get items() {
      return this.cfg.items;
    },
    agentM: modalBehavior(),
    form: { item: null, name: "", desc: "", icon: "robot", schedule: "" },
    iconChoices: ["robot", "tag", "mail", "alert", "wallet", "file", "users", "bolt", "brain", "wand"],
    openAgent(a, e) {
      this.form = a
        ? { item: a, name: tt(a.name), desc: tt(a.desc), icon: a.icon, schedule: a.schedule }
        : { item: null, name: "", desc: "", icon: "robot", schedule: "" };
      this.agentM.show(e);
    },
    saveAgent() {
      const f = this.form;
      if (!f.name.trim()) return;
      if (f.item) {
        Object.assign(f.item, { name: f.name.trim(), desc: f.desc.trim(), icon: f.icon, schedule: f.schedule.trim() || f.item.schedule });
        Alpine.store("toasts").push({ title: tt("toastAgentUpdated"), variant: "success" });
      } else {
        this.items.unshift({ id: `a${Date.now()}`, name: f.name.trim(), desc: f.desc.trim(), icon: f.icon, status: "paused", runs: 0, success: 100, lastRun: "—", schedule: f.schedule.trim() || "Manual" });
        Alpine.store("toasts").push({ title: tt("toastAgentAdded"), variant: "success" });
      }
      this.agentM.hide();
    },
    deleteAgent() {
      const i = this.items.indexOf(this.form.item);
      if (i > -1) this.items.splice(i, 1);
      this.agentM.hide();
      Alpine.store("toasts").push({ title: tt("toastAgentDeleted"), variant: "success" });
    },
    toggle(a) {
      if (a.status === "error") return;
      a.status = a.status === "running" ? "paused" : "running";
      Alpine.store("toasts").push({
        title: `${a.name} ${tt(a.status === "running" ? "toastResumed" : "toastPaused")}`,
        variant: a.status === "running" ? "success" : "warning",
        ttl: 3000,
      });
    },
  }));

  /* Prompt library — category filter + copy-to-clipboard. */
  Alpine.data("aiPrompts", () => ({
    cfg: window.mockData.pages.aiPrompts,
    cat: "All",
    promptM: modalBehavior(),
    form: { item: null, title: "", desc: "", category: "", prompt: "" },
    openPrompt(p, e) {
      this.form = p
        ? { item: p, title: tt(p.title), desc: tt(p.desc), category: p.category, prompt: p.prompt }
        : { item: null, title: "", desc: "", category: this.cfg.categories[1] ?? "", prompt: "" };
      this.promptM.show(e);
    },
    savePrompt() {
      const f = this.form;
      if (!f.title.trim() || !f.prompt.trim()) return;
      if (f.item) {
        Object.assign(f.item, { title: f.title.trim(), desc: f.desc.trim(), category: f.category, prompt: f.prompt.trim() });
        Alpine.store("toasts").push({ title: tt("toastPromptUpdated"), variant: "success" });
      } else {
        this.cfg.items.unshift({ id: `p${Date.now()}`, title: f.title.trim(), desc: f.desc.trim(), category: f.category, prompt: f.prompt.trim(), uses: 0 });
        Alpine.store("toasts").push({ title: tt("toastPromptAdded"), variant: "success" });
      }
      this.promptM.hide();
    },
    deletePrompt() {
      const i = this.cfg.items.indexOf(this.form.item);
      if (i > -1) this.cfg.items.splice(i, 1);
      this.promptM.hide();
      Alpine.store("toasts").push({ title: tt("toastPromptDeleted"), variant: "success" });
    },
    filtered() {
      return this.cat === "All" ? this.cfg.items : this.cfg.items.filter((p) => p.category === this.cat);
    },
    copy(p) {
      navigator.clipboard?.writeText(p.prompt);
      Alpine.store("toasts").push({ title: tt("toastPromptCopied"), body: p.title, variant: "success", ttl: 2500 });
    },
  }));

  /* Models — star a default model. */
  Alpine.data("aiModels", () => ({
    items: window.mockData.pages.aiModels.items.map((m) => ({ ...m })),
    setDefault(m) {
      this.items.forEach((x) => (x.default = x === m));
      Alpine.store("toasts").push({ title: tt("toastDefaultModel", { name: m.name }), variant: "success", ttl: 3000 });
    },
  }));

  /* Component explorer (explorer.html) — label/file/contract filter and
     copy-include-snippet for the partial showcase cards. */
  Alpine.data("explorer", () => ({
    q: "",
    items: window.mockData.ui.explorer,
    filtered() {
      const q = this.q.trim().toLowerCase();
      if (!q) return this.items;
      return this.items.filter((e) =>
        [e.label, e.file, e.binds].some((v) => v.toLowerCase().includes(q)),
      );
    },
    find(id) {
      return this.items.find((e) => e.id === id);
    },
    has(id) {
      return this.filtered().some((e) => e.id === id);
    },
    /* Category heading visibility — hidden when the filter removes every
       card of that category. */
    catHas(cat) {
      return this.filtered().some((e) => e.cat === cat);
    },
    copy(e) {
      navigator.clipboard?.writeText(e.snippet);
      Alpine.store("toasts").push({
        title: tt("toastCopied"),
        body: e.snippet,
        variant: "success",
        ttl: 2500,
      });
    },
  }));

  /* Token-usage area chart — remounts on theme + accent like other charts. */
  Alpine.data("usageChart", () => ({
    labels: window.mockData.pages.aiUsage.chart.labels,
    init() {
      const build = (dark) => ({
        chart: {
          type: "area",
          height: 320,
          toolbar: { show: false },
          fontFamily: "inherit",
          animations: { enabled: !reduceMotion() },
        },
        series: [{ name: tt("Tokens (thousands)"), data: window.mockData.pages.aiUsage.chart.series }],
        colors: [cssVar("--color-primary-500", "#465fff")],
        stroke: { curve: "smooth", width: 2 },
        /* Live endpoint marker — same ripple contract as realtime. */
        markers: {
          size: 0,
          hover: { size: 5 },
          discrete: [
            {
              seriesIndex: 0,
              dataPointIndex: this.labels.length - 1,
              size: 6,
              fillColor: cssVar("--color-primary-500", "#465fff"),
              strokeColor: cssVar("--color-primary-400", "#8b9eff"),
            },
          ],
        },
        fill: {
          type: "gradient",
          gradient: { opacityFrom: dark ? 0.25 : 0.35, opacityTo: 0.02, stops: [0, 100] },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: this.labels,
          labels: { style: { colors: cssVar("--chart-axis", "#64748b") } },
          axisBorder: { show: false },
          axisTicks: { show: false },
          tooltip: { enabled: false },
        },
        yaxis: {
          labels: { style: { colors: cssVar("--chart-axis", "#64748b") } },
        },
        grid: {
          borderColor: cssVar("--chart-grid", "#e2e8f0"),
          strokeDashArray: 4,
        },
        tooltip: { theme: dark ? "dark" : "light" },
      });
      const { remount } = mountChart(this.$el, build);
      this.$watch("$store.darkMode.on", remount);
      this.$watch("$store.accent.current", remount);
      this.$watch("$store.i18n.locale", remount);
    },
  }));

  /* API keys — create/copy/revoke, all with toast feedback. */
  Alpine.data("aiKeys", () => ({
    cfg: window.mockData.pages.aiKeys,
    items: window.mockData.pages.aiKeys.items.map((k) => ({ ...k })),
    create() {
      const rand = Math.random().toString(36).slice(2, 6);
      const key = {
        id: "k" + Date.now(),
        name: "New key",
        prefix: "tk_live_" + rand,
        created: new Date().toISOString().slice(0, 10),
        lastUsed: "Never",
        scopes: ["chat"],
        status: "active",
      };
      this.items.unshift(key);
      apiPost("/api/keys/create", key);
      Alpine.store("toasts").push({
        title: tt("toastKeyCreated"),
        body: tt("toastKeyCreatedBody"),
        variant: "success",
      });
    },
    copy(k) {
      navigator.clipboard?.writeText(k.prefix + "••••••••");
      Alpine.store("toasts").push({ title: tt("toastKeyCopied"), body: k.name, variant: "success", ttl: 2500 });
    },
    revoke(k) {
      k.status = "revoked";
      apiPost("/api/keys/revoke", { id: k.id });
      Alpine.store("toasts").push({ title: tt("toastRevoked", { name: k.name }), variant: "warning", ttl: 3500 });
    },
  }));

  /* Members — invite via modal, remove, both with toasts. */
  Alpine.data("aiMembers", () => ({
    cfg: window.mockData.pages.aiMembers,
    items: window.mockData.pages.aiMembers.items.map((m) => ({ ...m })),
    form: { email: "", role: "Member" },
    invite() {
      const email = this.form.email.trim();
      if (!email) return;
      const role = this.form.role;
      const name = email
        .split("@")[0]
        .split(/[._-]/)
        .map((p) => p[0]?.toUpperCase() + p.slice(1))
        .join(" ");
      this.items.push({ name: name || email, email, role, status: "invited", lastActive: "—" });
      apiPost("/api/members/invite", { email, role });
      Alpine.store("toasts").push({ title: tt("toastInviteSent"), body: email, variant: "success" });
      this.form = { email: "", role: "Member" };
    },
    remove(m) {
      this.items = this.items.filter((x) => x !== m);
      apiPost("/api/members/remove", { email: m.email });
      Alpine.store("toasts").push({ title: tt("toastMemberRemoved", { name: m.name }), variant: "warning", ttl: 3500 });
    },
  }));

  /* Date picker — input + popover month grid (APG date-picker dialog
     pattern). Roving tabindex across cells: arrows move days,
     PageUp/PageDown shift months, Home/End week edges, Esc closes. */
  Alpine.data("datePicker", (getVal = null, setVal = null) => ({
    open: false,
    iso: "",
    year: 0,
    month: 0,
    cells: [],
    focus: 0,
    // Optional external binding: getVal/setVal wire the picker to a form
    // field (e.g. datePicker(() => cardForm.due, (v) => cardForm.due = v)).
    getVal,
    setVal,
    val() {
      return this.getVal?.() ?? this.iso;
    },
    init() {
      const t = new Date();
      this.year = t.getFullYear();
      this.month = t.getMonth();
      this.build();
    },
    isoOf(y, m, d) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    },
    todayIso() {
      const t = new Date();
      return this.isoOf(t.getFullYear(), t.getMonth(), t.getDate());
    },
    display() {
      if (!this.val()) return "";
      return new Intl.DateTimeFormat(Alpine.store("i18n").locale, { dateStyle: "medium" }).format(
        new Date(this.val() + "T00:00:00"),
      );
    },
    fullDate(c) {
      return new Intl.DateTimeFormat(Alpine.store("i18n").locale, { dateStyle: "full" }).format(
        new Date(c.iso + "T00:00:00"),
      );
    },
    monthLabel() {
      return new Date(this.year, this.month, 1).toLocaleDateString(Alpine.store("i18n").locale, {
        month: "long",
        year: "numeric",
      });
    },
    weekdayNames() {
      const f = new Intl.DateTimeFormat(Alpine.store("i18n").locale, { weekday: "narrow" });
      return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i)));
    },
    build() {
      const first = new Date(this.year, this.month, 1);
      const offset = (first.getDay() + 6) % 7;
      const base = new Date(this.year, this.month, 1 - offset);
      const today = this.todayIso();
      this.cells = Array.from({ length: 42 }, (_, i) => {
        const dt = new Date(base);
        dt.setDate(base.getDate() + i);
        const iso = this.isoOf(dt.getFullYear(), dt.getMonth(), dt.getDate());
        return { iso, day: dt.getDate(), inMonth: dt.getMonth() === this.month, isToday: iso === today };
      });
    },
    weeks() {
      const w = [];
      for (let i = 0; i < 6; i++) w.push(this.cells.slice(i * 7, i * 7 + 7));
      return w;
    },
    shift(dir) {
      const dt = new Date(this.year, this.month + dir, 1);
      this.year = dt.getFullYear();
      this.month = dt.getMonth();
      this.build();
    },
    openMenu() {
      const anchor = this.val() ? new Date(this.val() + "T00:00:00") : new Date();
      this.year = anchor.getFullYear();
      this.month = anchor.getMonth();
      this.build();
      const want = this.val() || this.todayIso();
      this.focus = Math.max(0, this.cells.findIndex((c) => c.iso === want));
      this.open = true;
      this.$nextTick(() => this.$refs.grid?.querySelector('[tabindex="0"]')?.focus());
    },
    pick(c) {
      if (this.setVal) this.setVal(c.iso);
      else this.iso = c.iso;
      this.open = false;
      this.$refs.input?.focus();
    },
    cellCls(c) {
      if (c.iso === this.val()) return "bg-primary-600 font-semibold text-white";
      if (!c.inMonth)
        return "text-slate-300 hover:bg-slate-100 dark:text-slate-600 dark:hover:bg-slate-800";
      if (c.isToday)
        return "font-semibold text-primary-600 ring-1 ring-inset ring-primary-300 hover:bg-primary-50 dark:text-primary-400 dark:ring-primary-800 dark:hover:bg-primary-500/10";
      return "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";
    },
    refocus() {
      this.$nextTick(() => this.$refs.grid?.querySelector(`[data-i="${this.focus}"]`)?.focus());
    },
    onGridKeydown(e) {
      const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
      if (d != null) {
        e.preventDefault();
        this.focus = Math.min(41, Math.max(0, this.focus + d));
        this.refocus();
      } else if (e.key === "PageDown") {
        e.preventDefault();
        this.shift(1);
        this.refocus();
      } else if (e.key === "PageUp") {
        e.preventDefault();
        this.shift(-1);
        this.refocus();
      } else if (e.key === "Home") {
        e.preventDefault();
        this.focus -= this.focus % 7;
        this.refocus();
      } else if (e.key === "End") {
        e.preventDefault();
        this.focus += 6 - (this.focus % 7);
        this.refocus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.open = false;
        this.$refs.input?.focus();
      }
    },
  }));

  /* Tags input — chips + inline text input; Enter/comma commits,
     Backspace on empty draft pops the last tag. */
  Alpine.data("tagsInput", (seed = []) => ({
    tags: [...seed],
    draft: "",
    add() {
      const v = this.draft.trim().replace(/,+$/, "");
      if (v && !this.tags.includes(v)) this.tags.push(v);
      this.draft = "";
    },
    remove(i) {
      this.tags.splice(i, 1);
    },
    onKey(e) {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        this.add();
      } else if (e.key === "Backspace" && !this.draft && this.tags.length) {
        this.tags.pop();
      }
    },
  }));

  /* Dropzone — drag/drop + file-input fallback; files list stays local
     (no real upload in the kit). */
  Alpine.data("dropzone", () => ({
    files: [],
    over: false,
    add(list) {
      for (const f of list ?? [])
        if (!this.files.some((x) => x.name === f.name && x.size === f.size))
          this.files.push({ name: f.name, size: f.size });
    },
    remove(i) {
      this.files.splice(i, 1);
    },
    fmtSize(n) {
      if (n < 1024) return `${n} B`;
      if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
      return `${(n / 1048576).toFixed(1)} MB`;
    },
  }));

  /* Tooltip — open state for hover/focus panels. */
  Alpine.data("tooltip", () => ({ open: false }));

  /* Auth — signin/signup forms + the signout page. Two paths:
     - static edition (no window.DREAMBOARD_API): the form's native GET to
       index.html proceeds unchanged — the demo behavior buyers see.
     - fullstack (DREAMBOARD_API set by the API loader overlay): POST to
       /api/auth/*, persist {token,user} in localStorage.dreamboard.session,
       then redirect. Inline errors via `error` + role="alert". */
  Alpine.data("auth", (mode = "signin") => ({
    mode,
    pending: false,
    error: "",
    sent: false, // forgot/resend: mail dispatched
    done: false, // reset: password updated — verify: email confirmed
    token: "", // reset/verify link token from ?token=
    init() {
      this.token = new URLSearchParams(location.search).get("token") ?? "";
      if (
        window.DREAMBOARD_API &&
        (this.mode === "signin" || this.mode === "signup") &&
        localStorage.getItem("dreamboard.session")
      )
        location.replace("index.html");
      if (this.mode === "signout") this.signout();
      if (this.mode === "verify") this.verifyFromUrl();
    },
    sessionEmail() {
      try {
        return JSON.parse(localStorage.getItem("dreamboard.session"))?.user?.email;
      } catch {
        return null;
      }
    },
    async post(url, body) {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const known = {
          "invalid credentials": "Invalid email or password.",
          "an account with this email already exists":
            "An account with this email already exists",
          "invalid or expired token": "This link is invalid or has expired — request a new one.",
          "invalid or expired code": "That code is invalid or has expired — request a new one.",
        };
        throw new Error(
          known[data.detail] ??
            (typeof data.detail === "string"
              ? data.detail
              : tt("Something went wrong — try again.")),
        );
      }
      return data;
    },
    async submit(e) {
      if (!window.DREAMBOARD_API) return; // demo: let the GET form proceed
      e.preventDefault();
      const fd = new FormData(e.target);
      this.pending = true;
      this.error = "";
      try {
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? fd.get("new-password") ?? "");
        let url = "/api/auth/signin";
        let body = { email, password };
        if (this.mode === "signup") {
          url = "/api/auth/signup";
          body = { name: String(fd.get("name") ?? "").trim(), email, password };
        } else if (this.mode === "forgot") {
          url = "/api/auth/forgot";
          body = { email };
        } else if (this.mode === "reset") {
          const confirm = String(fd.get("confirm-password") ?? "");
          if (password !== confirm)
            throw new Error(tt("Passwords don't match."));
          if (!this.token) throw new Error(tt("This link is missing its token."));
          url = "/api/auth/reset";
          body = { token: this.token, password };
        } else if (this.mode === "otp") {
          url = "/api/auth/otp/verify";
          body = {
            email: this.sessionEmail() ?? window.mockData?.user?.email ?? "",
            code: [...e.target.querySelectorAll("input[inputmode='numeric']")]
              .map((i) => i.value)
              .join(""),
          };
        }
        const data = await this.post(url, body);
        if (this.mode === "forgot") {
          this.sent = true;
        } else if (this.mode === "reset") {
          this.done = true;
        } else {
          localStorage.setItem(
            "dreamboard.session",
            JSON.stringify({ token: data.token, user: data.user }),
          );
          location.href = "index.html";
        }
      } catch (err) {
        this.error = err.message || tt("Something went wrong — try again.");
      } finally {
        this.pending = false;
      }
    },
    /* Social/SSO sign-in — THE seam for OAuth providers (Keycloak, Auth0,
       Clerk, Supabase…). Pages call socialAuth(provider) and nothing
       else; swap this one method for your provider's redirect/popup flow.
       Defaults: static edition demos a sign-in; fullstack surfaces a
       "not wired" hint until you connect yours. */
    socialAuth(p) {
      if (window.DREAMBOARD_API) {
        Alpine.store("toasts").push({
          title: tt("ssoSeamTitle", { name: p.name }),
          body: tt("ssoSeamBody"),
          variant: "info",
        });
        return;
      }
      Alpine.store("toasts").push({ title: tt("toastSignedInWith", { name: p.name }), variant: "success", ttl: 2500 });
      location.href = "index.html";
    },
    // verify-email page: arriving via ?token= auto-confirms; the resend
    // link mails a fresh link to the session/demo persona.
    async verifyFromUrl() {
      if (!this.token || !window.DREAMBOARD_API) return;
      try {
        await this.post("/api/auth/verify", { token: this.token });
        this.done = true;
      } catch (err) {
        this.error = err.message;
      }
    },
    async resend() {
      if (!window.DREAMBOARD_API) return;
      const email = this.sessionEmail() ?? window.mockData?.user?.email;
      if (!email) return;
      this.pending = true;
      this.error = "";
      try {
        const url = this.mode === "otp" ? "/api/auth/otp/request" : "/api/auth/verify/resend";
        await this.post(url, { email });
        this.sent = true;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.pending = false;
      }
    },
    signout() {
      localStorage.removeItem("dreamboard.session");
      apiPost("/api/auth/signout");
    },
  }));
});
