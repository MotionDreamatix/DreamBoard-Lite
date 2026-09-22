# AGENTS.md — Working inside DreamBoard

Conventions for AI coding assistants (and humans) extending this kit.
Follow these and changes stay consistent with the codebase — and pass
the audit gate.

Your package's directory layout and commands are in `README.md`. If it
includes the fullstack overlays (`apps/04-*`, `apps/05-*`) or
`packages/api`, those directories ship their own AGENTS.md files with
stack-specific contracts — read them before touching backend or Docker
code.

## The data contract (mockData → your API)

Every dynamic value renders from one object — `mockData.js` (the path
per edition is in `README.md`). The object shape *is* the API
contract: stable `id`s, ISO dates, status enums. Wire a backend by
keeping the shape:

```js
fetch("/api/bootstrap")
  .then((r) => r.json())
  .then((data) => {
    window.mockData = data;
    window.dispatchEvent(new Event("mockdata:ready"));
  });
```

Field conventions: `icon` is a semantic key from the icon map;
`status`/`variant` map to badge styles; dates are ISO strings formatted
by `fmtDate()`; currency by `fmt(v, 'currency')`. Keep numeric fields
numeric — sorting and formatting depend on it. Nav items in `d.nav`
appear in the sidebar and command palette automatically.

## Non-negotiable rules

1. **Zero hardcoded data.** All labels, rows, and metrics render from
   `mockData` or the i18n dictionary — never inline strings.
2. **i18n for every user-facing string.** English msgids are the keys;
   add German in `dict.de` (English falls back to the key).
3. **No hex colors, no `style=""`, no hardcoded accent palettes.** Use
   `primary-*` utilities — they map to CSS variables in
   `packages/tailwind-config/theme.css`. Dynamic bound styles (e.g.
   widths) are permitted.
4. **Accessibility is a contract.** Icon-only buttons need
   `aria-label`; disclosures need `aria-expanded`/`aria-controls`;
   modals need focus trap + Escape; scrollable table wrappers need
   `tabindex="0"`. Match existing pages — the audit enforces them.
5. **Vendored assets only.** Never add CDN `<script>`/`<link>` tags —
   vendor through npm + the build.
6. **UI state stays in components** — stores, magics, hooks, contexts.
   Business logic belongs in the data layer, not the view.

## HTML edition — templating

```
{{@layout "base"}}       wrap page in src/layouts/base.html at {{content}}
{{@var title "…"}}       page variable → {{title}} anywhere in the page
{{> components/sidebar}} inline a partial (recursive)
```

Partials are scope-aware: they bind Alpine variables from the element
they're inlined into. Each partial documents its contract in a leading
comment. Never object-spread an `Alpine.data` component with getters
into an x-data literal — spread freezes getters as static values.

## Adding a page (HTML edition)

1. `src/pages/foo.html` with `{{@layout "base"}}` + `{{@var title "…"}}`.
2. Add `pages.foo` data to `data/mockData.js`.
3. Add a `d.nav` entry `{ label, icon, href: "foo.html" }` (icon key
   must exist in `src/js/icons-map.js`).
4. Add de translations for new msgids in `data/i18n.js`.
5. `npm run build` + `npm run audit` — must pass clean, both themes.

## Verify

```bash
npm run build          # rebuild the edition(s) in this package
npm run audit          # or audit:html / audit:react — WCAG 2.2 AA gate
```

Fullstack packages: `docker compose exec api python -m pytest -q`
locks the API contract; each overlay's `scripts/probe-persist.cjs`
verifies writes end-to-end.
