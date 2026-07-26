# ngxos Implementation Plan — nourgaser.com

## Context

The base site (about, portfolio, business, hobbies, resume) is live, fact-checked, and complete — it is **Phase 1: done** and must not be regressed. ngxos — the client-side engine that "haunts" the site when powered on — is ~0% implemented: `src/lib/ngxos/` and `src/components/svelte/ngxos/` contain only `.gitkeep` files. This plan turns the vision (docs/architecture.md + `.github` instruction files + `docs/design/` mockups, corrected by Nour) into a phased build.

**Vision invariants:**
- **OFF = today's site.** Zero visual/behavioral delta when off; zero JS dependency for base function.
- **ON adds:** sitewide Vimium-style keyboard nav, the floating rounded terminal, animated glowing theme-colored borders on base panels, unified swatch-driven theming — and is designed for open-ended growth (long-term: extractable engine, hence the strict explicit-hook contract).
- **Explicit contract only:** ngxos reads `data-ngx-*` (plus native `<a href>`/`<button>` for hint targets — see §3), and writes exactly: `data-ngxos` + `data-theme` on `<html>`, `data-ngx-focused` on the focused section.
- **CSS does the visuals; JS flips attributes.** Respect `prefers-reduced-motion` everywhere.
- **House rules:** stack fixed (Astro/Svelte 5/TS/Bun/MDX/handwritten CSS), no new frameworks/libs/test frameworks, small focused modules, base = sharp geometry + cosmic palette, ngxos = rounded + glowing + electric palette, restraint ("not every element glows").

**Decisions confirmed by Nour (binding):**
1. The empty box in `docs/design/theme/*.png` is a meaningless wireframe placeholder — ignore it.
2. Terminal nav tree = **real routes only** (`/`, `/about`, `/portfolio`, `/portfolio/:slug`, `/hobbies`, `/business`, `/resume`). Mockups' `contact_me`/`experience` are vision references, not spec.
3. Custom display font = far-future roadmap only (needs extraction from Figma first); no tasks now.
4. v1 = the core four systems only, but **later phases planned in equal detail** (below), not hand-waved.

**Ground truth to build on (verified):** the `data-ngx-*` hooks are already in markup sitewide (25× section/label, 13× focusable, 10× route, values data-driven from `src/data/pages/*.ts`); `src/styles/themes.css` ships 4 themes (`default`/`vgcolors`/`ubuntu`/`fedora`) keyed by `[data-theme]` on `<html>` — currently unreachable (hardcoded `default`, no persistence, no switcher), all glows `none`, all accents identical gray; the activation rule `[data-ngxos="on"] [data-ngx-focusable="true"]` already exists at `themes.css:142`; `tokens.css` pre-stages terminal dimensions and z-indexes; `animations.css` pre-stages unused `glow-pulse`/`cursor-blink`/`scanline` keyframes. Site is a static MPA (no View Transitions) → **all runtime state must cross navigations via localStorage**. Collision points: `PortfolioProjectEnhancer.svelte` has a window-level ArrowLeft/Right keydown with unconditional `preventDefault` (guards editable targets only) and a hand-rolled SPA swap of `<main>` on `/portfolio/*` that fires no events.

---

## 1. Runtime architecture

```
<html data-theme="…" data-ngxos="on"|absent>   ← inline head script restores pre-paint
  MainLayout.astro
    …existing static site (untouched)…
    <footer> power button (data-ngx-command="power", hidden until JS boot)
    <NgxosRoot client:idle />                   ← single island, always mounted
```

**Modules** (fills the existing skeleton; deviations from architecture.md listed in §11):

| Path | Responsibility |
|---|---|
| `src/lib/ngxos/core/kernel.ts` | Boot orchestration: discovery, registration, listeners, power transitions, error boundary |
| `src/lib/ngxos/core/store.svelte.ts` | **Svelte 5 runes** (`$state`), importable from plain TS. State: `poweredOn`, `theme`, `mode` (`normal\|hints\|terminal`), `terminal {open, minimized}`, `focusedSectionId`, `reducedMotion`, `route` |
| `src/lib/ngxos/core/events.ts` | Typed helpers over `CustomEvent` on `document`: `ngxos:boot/power-on/power-off/theme-change/section-focus/terminal-open/content-swapped` — framework-free bus, also the enhancer↔ngxos channel |
| `src/lib/ngxos/core/registry.ts` | Command registry (name/alias map) only. No plugin registry in v1 |
| `src/lib/ngxos/core/persist.ts` | Namespaced storage (`ngx.power`, `ngx.theme`, `ngx.terminal`, later `ngx.history`, `ngx.games.chf`); every access try/catch with in-memory fallback |
| `src/lib/ngxos/core/shell.ts` | Terminal exec loop: parse → resolve → `run(args, ctx)` → render; owns history + program mode (§4.6) |
| `src/lib/ngxos/navigation/routes.ts` | VFS-lite tree of real routes |
| `src/lib/ngxos/navigation/section-registry.ts` | DOM discovery of `[data-ngx-section]`; re-scan on `ngxos:content-swapped` |
| `src/lib/ngxos/navigation/keybinds.ts` | Single window keydown listener, mode dispatch, guards |
| `src/lib/ngxos/navigation/hints.ts` | Hint target collection + prefix-free label allocation |
| `src/lib/ngxos/effects/themes.ts` | Theme registry `[{id, label}]` only — colors stay in CSS |
| `src/lib/ngxos/effects/power.ts` | Attribute application, `pageshow` (bfcache) re-sync |
| `src/lib/ngxos/effects/motion.ts` | Reduced-motion detection |
| `src/lib/ngxos/utils/strings.ts` | ASCII wordmark, help text |
| `src/lib/ngxos/commands/*.ts` | One file per command: `help, pwd, ls, cd, clear, theme, neofetch` |

**Svelte components** (`src/components/svelte/ngxos/`): `NgxosRoot.svelte`, `TerminalWindow.svelte`, `TerminalLine.svelte`, `HintOverlay.svelte`, `HelpOverlay.svelte`, `StatusHint.svelte`. Terminal + hint chunks **dynamically imported on first power-on** so OFF-state cost ≈ island shell only.

**Core types** (architecture.md references but never defines these — this fixes that):

```ts
interface SectionRecord { id: string; label: string; route: string; el: HTMLElement; focusable: boolean }
type TermLine =
  | { kind: 'plain' | 'accent' | 'error'; text: string }
  | { kind: 'ascii'; text: string }
  | { kind: 'swatch-row' }                      // renders via per-theme --swatch-N CSS vars
  | { kind: 'kv'; key: string; value: string }  // neofetch rows
interface CommandResult { lines: TermLine[] }
interface TerminalIO {
  print(line: TermLine): void; clear(): void;
  readLine(opts?: { prompt?: string; signal?: AbortSignal }): Promise<string>;
  readKey(opts?: { signal?: AbortSignal }): Promise<string>;  // raw mode, Phase 3
}
interface CommandContext {
  cwd: string; sections: SectionRecord[];
  navigate(path: string): void;                 // real MPA navigation
  emit: typeof emit; io: TerminalIO;
}
interface CommandModule {
  name: string; aliases?: string[]; description: string; usage?: string;
  run(args: string[], ctx: CommandContext): Promise<CommandResult | void>;
}
```

## 2. Kernel, activation, persistence

- **Mount:** `<NgxosRoot client:idle />` in `MainLayout.astro` — pure enhancement, off the critical path; re-hydrates on every MPA page load.
- **Power-on UX** (no UI exists today — three paths):
  1. **Footer power button** beside "Powered by ngxos" — `<button data-ngx-command="power" hidden>` styled with the shield glyph; kernel removes `hidden` on boot, so JS-disabled pages are byte-identical to today.
  2. **`~` keybinding** toggles power anywhere (ignition listener installed even when off; ~10 passive lines).
  3. **`?ngxos=on` URL param** for shareable demo links (read at boot, persisted, then ignored).
- **Semantics:** `data-ngxos="on"` on `<html>`; **absent** when off (keeps the OFF CSS surface literally empty). Power-off reverts `data-theme` to `default` — theme choice is an ngxos feature; OFF must equal today's site. Chosen theme is remembered and restored on next power-on.
- **FOUC avoidance:** tiny (~12-line) inline `<script>` in `MainLayout.astro` `<head>` reads `ngx.power`/`ngx.theme` and stamps both `<html>` attributes before paint; try/catch → default/off is always safe.
- **Boot:** detect reduced-motion → discover sections (document order of `[data-ngx-section]`, labels from `data-ngx-label`, route from nearest `[data-ngx-route]` or `location.pathname`) → build route tree → register commands → install keydown dispatcher → emit `ngxos:boot` → if on, dynamic-import ON bundle, emit `ngxos:power-on`. `pageshow` re-syncs after bfcache. Entire boot wrapped in an error boundary: a broken ngxos leaves the base site untouched.

## 3. Vimium-style keyboard navigation

- **Modes:** `normal` → `hints` → `terminal`, one window keydown listener dispatching by mode. Hard guards before dispatch: bail on `event.defaultPrevented`, editable targets (INPUT/TEXTAREA/SELECT/contentEditable), unowned modifier combos; never `preventDefault` an unhandled key. ngxos binds **no arrow keys** in normal mode → structurally cannot fight the gallery enhancer.
- **Normal mode:** `j`/`k` next/prev section (sets `data-ngx-focused="true"`, scrollIntoView smooth/auto per reduced-motion, emits `ngxos:section-focus`); `gg`/`G` first/last (timeout for `gg`); `f` hint mode; `Enter` focuses first link/button in focused section (scoped hints = Phase 2); `/` or `Shift+Space` terminal; `~` power; `?` help overlay; `Esc` clear/close.
- **Hint mode:** targets = visible in-viewport `a[href]` + `button` (+ `[data-ngx-focusable]` sections), minus `[data-ngx-hint="false"]`. Prefix-free home-row labels (`asdfghjkl`, Vimium allocation). Badges in `HintOverlay.svelte` at `--z-overlay`. Typing narrows; unique match `.click()`s (native behavior, no URL inference); `Esc` cancels; dismissed on scroll/resize (no live repositioning in v1).
- **"No DOM inference" reconciliation (document in architecture.md):** the rule bars deriving *meaning/structure* from markup shape — section identity/labels/routes stay `data-ngx-*`-driven. Native `<a href>`/`<button>` are themselves explicit semantic contracts; discovering "this is clickable" is not inference, and requiring opt-in on every link would poison markup and hurt portability. Semantic interactive-element discovery is allowed **for hint targets only**, with `data-ngx-hint="false"` opt-out.
- **Discoverability:** `StatusHint.svelte` — one-line dismissable corner hint (`? keys · / terminal`) when on, dismissal persisted; `?` opens `HelpOverlay.svelte` listing keybindings + registered commands (reads the registry → stays true automatically).
- **Enhancer coexistence — the only existing file edited** (`src/components/svelte/PortfolioProjectEnhancer.svelte`, two small edits):
  1. After a successful SPA swap in `navigateTo()`, dispatch `ngxos:content-swapped`; `section-registry.ts` re-scans (fixes stale sections/hints after project switches). Chosen over MutationObserver/pushState-wrapping: smallest explicit contract, either side works without the other.
  2. Early `if (event.defaultPrevented) return;` in its `handleKeydown` (courtesy for capture-phase consumers; the editable guard already protects the terminal's real `<input>`).

## 4. Terminal

- **Chrome** (per `docs/design/terminals/*.png`): rounded (`--radius-md`), fixed top-right, `--terminal-width/height`, `--z-terminal`. Title bar: shield badge left; `guest@ngxos:<path>` breadcrumb center (`~` for `/`); hamburger (menu: theme list w/ swatch previews, help, power off) + collapse chevron right. Body: scrollback of `TermLine`s + prompt `[guest@ngxos <cwd>]$` with a **real `<input>`** — gets browser editing/IME/screen-reader behavior free, passes the enhancer's editable guard, and auto-suppresses ngxos normal-mode keys.
- **Shell loop:** Enter → echo → whitespace-split parse (no quoting v1) → registry resolve → `run` → append lines. Unknown command → error suggesting `help`. In-memory ↑/↓ history (persisted Phase 2). `Esc` minimizes back to normal mode. Tab completion Phase 2; v1 `cd` with no args prints the candidate list (mockup's completion row as output, interactive later).
- **VFS-lite** (real routes only): `~` → `about`, `portfolio` → 20 project slugs, `hobbies`, `business`, `resume`. `pwd` prints cwd; `ls` lists child routes as dirs + current page's sections (from `data-ngx-label`) as files; `cd <route>` = **real MPA navigation** (terminal-open state persists → reopens on next page with fresh prompt/cwd; scrollback intentionally doesn't survive navigation in v1); `cd <section>` on the current page scrolls to it.
- **`neofetch`:** ASCII wordmark (hand-made plain-text block in `utils/strings.ts`, styled after `docs/design/logo/ngxos_ascii.svg`) + `kv` column (OS `ngxos release 1.0`, Kernel = astro/svelte versions baked at build, Shell, Resolution = live window size, Theme, playful CPU/GPU/Memory) + `swatch-row` from the current theme's `--swatch-0..5`.
- **Window states v1:** open/closed, minimized, fixed position. Draggable + position persistence = Phase 2.
- **Mobile (recommendation):** hide terminal + keyboard-nav layer below 768px / coarse pointers in v1 — keyboard-first UX on touch is worse than none; power/themes/glow still work on mobile so ON stays visible. Revisit in Phase 2.
- **§4.6 Interactive program interface — designed in v1, exercised in Phase 3:** a long-running command is just an async `run` looping on `await ctx.io.readLine()/readKey()`. While a read is outstanding the shell is in program mode: prompt hidden/replaced, input routed to the pending read, `Ctrl+C` aborts the signal → command unwinds → shell prints `^C` and restores prompt. This is exactly the seam CMD Hero Fights needs. v1 wires `readLine` only; `readKey` raw mode lands with Phase 3a.

## 5. Theme engine

**Single source of truth stays `src/styles/themes.css`.** Work items (verified against `docs/design/theme|terminals/*.png`):
1. **Fill real per-theme accents** — all 4 themes currently ship identical gray `--text-accent`; mockups show warm amber (default), neon cyan+magenta (vgcolors), orange (ubuntu), blue (fedora). Sample from PNGs; also `--border-terminal` and `--bg-terminal*` tints (vgcolors terminal body is dark violet).
2. **Fill glows honestly** — `default` may legitimately stay `none`-ish (mockup shows plain warm borders; restraint is valid); vgcolors gets visible cyan glow; ubuntu/fedora subtle. The vgcolors gradient terminal frame (cyan→violet→magenta) is a Phase 2 refinement; v1 uses solid `--border-terminal`.
3. **Add `--swatch-0..5` per theme** — neofetch row + hamburger previews bind to these; zero color duplication in TS (`effects/themes.ts` is only `[{id, label}]`).
4. **Normalize variable coverage** — `default` defines vars the other 3 omit (currently accidental `:root` fallback); give all four the full set deliberately.

**`theme` command:** bare → list ids w/ current marked + per-theme swatch rows; `theme <id>` → validate, set `data-theme`, persist, emit `ngxos:theme-change`. Same from hamburger menu. Restore handled by the M1 head script.

## 6. Animated borders / activation visuals

New **`src/styles/ngxos.css`** (imported with the others): move the existing `[data-ngxos="on"]` rule out of `themes.css:142` so the OFF stylesheet surface is exactly the base site and every ON rule lives in one file.
- **Revise the shipped rule** (it currently outlines *every* focusable): powered-on → faint accent border tint on focusable sections (a whisper that ngxos is awake); **only `[data-ngx-focused="true"]`** gets `--glow-focus` + the pre-staged `glow-pulse` keyframe.
- Terminal/hints/status hint = electric palette + rounded; base containers keep sharp geometry — glow and border-color only, never shape.
- `prefers-reduced-motion: reduce` → no pulse (static glow ok), instant scrolls, no scanline/cursor-blink later.
- **`data-ngx-focusable` cleanup (small markup task): invert the default** — every `data-ngx-section` is traversable/glow-eligible unless `data-ngx-focusable="false"`. Fixes the inconsistent 13-of-25 coverage with a near-zero diff. Audit and mark `false` only where landing is pointless (pure banner heroes, decorative wrappers); `portfolio-header/content/showcase`, `business-summary`, `core-expertise`, `resume-links/preview`, `portfolio-${category}` are all real destinations → focusable.

## 7. Hook contract (the whole portability surface — keep it this small)

| Hook | Direction | Meaning |
|---|---|---|
| `data-ngx-section` / `-label` / `-route` | authored → read | existing, unchanged |
| `data-ngx-focusable="false"` | authored → read | opt out of traversal/glow (sections focusable by default) |
| `data-ngx-command="power"` | authored → read | footer power button binding |
| `data-ngx-hint="false"` | authored → read | exclude an element from hint mode |
| `data-ngx-focused="true"` | **written by ngxos** | current section focus; CSS glow hook |
| `data-ngxos`, `data-theme` on `<html>` | written by ngxos | power + theme |
| `ngxos:content-swapped` event | site → ngxos | any script replacing content must dispatch it |

`data-ngx-kind` / `data-ngx-theme-scope` stay documented-but-unused. This table + event names goes into architecture.md as the canonical contract section.

---

## 8. Phasing

### Phase 1 — Foundation: DONE
Record as such in architecture.md. Remaining gaps (unreachable themes, gray accents, glows `none`, focusable inconsistency) are absorbed into v1 milestones. Blog doesn't exist and blocks nothing.

### Phase v1 — Core four systems (5 milestones, each independently shippable)

**M1 — Kernel + power + persistence.** `core/{kernel,store.svelte,events,persist,registry}.ts`, `effects/power.ts`, `NgxosRoot.svelte`; `MainLayout.astro`: head script + footer button + island mount.
*Done when:* `~`/button/`?ngxos=on` toggle `data-ngxos`; state survives navigation, no FOUC; JS-disabled site unchanged (no visible button); `bun run build` clean; a thrown boot error leaves the site working.

**M2 — Terminal core.** (deps: M1) `core/shell.ts`, `navigation/{routes,section-registry}.ts`, `commands/{help,pwd,ls,cd,clear}.ts`, `TerminalWindow/TerminalLine.svelte`, terminal CSS. `TerminalIO` defined, `readLine` wired.
*Done when:* `/` opens terminal; 5 commands work on real routes; `cd about` navigates and terminal reopens with correct cwd; Esc minimizes; arrows in the input never trigger the gallery.

**M3 — Theme engine + neofetch.** (deps: M2) `themes.css` fill/normalize, `effects/themes.ts`, `commands/{theme,neofetch}.ts`, ASCII wordmark, hamburger menu.
*Done when:* all 4 themes reachable via command + menu, visually matching mockups within reason; choice persists; power-off reverts to default; neofetch renders wordmark + kv + swatches in every theme.

**M4 — Keyboard navigation.** (deps: M1; M2 for `/`) `navigation/{keybinds,hints}.ts`, `HintOverlay/HelpOverlay/StatusHint.svelte`, the two-line enhancer edit.
*Done when:* j/k/gg/G traverse every page; `f` hints hit all visible links/buttons and activate; `?` shows live bindings + commands; typing in inputs never triggers nav; after a portfolio SPA swap, sections/hints reflect the new page; gallery arrows still work.

**M5 — Activation visuals + contract cleanup.** (deps: M3+M4) `src/styles/ngxos.css` (moved + revised rules), focusable audit across 8 pages, architecture.md revisions (§11).
*Done when:* powered-on shows restrained tint + single-section glow per theme; reduced-motion = static glow; OFF pixel-identical to pre-ngxos; Lighthouse on `/` within noise of baseline.

### Phase 2 — Polish
- Draggable terminal (pointer events on title bar, viewport clamping, position persisted in `ngx.terminal`) + minimize/expand transitions (CSS, reduced-motion aware).
- Tab completion for `cd`/`theme` (cycle candidates; upgrade `cd`'s candidate row to the mockup's interactive highlighted menu via `readKey`).
- Command history persistence (`ngx.history`, capped ~100).
- Boot sequence animation (`BootSequence.svelte`: brief typed boot log on power-on; skipped under reduced-motion; any-key skippable).
- vgcolors gradient terminal frame (pseudo-element gradient border) + optional per-theme scanline/cursor-blink from pre-staged keyframes.
- Scoped hints: `Enter` on focused section → hint mode limited to that section.
- Mobile revisit: decide whether a tap-friendly launcher/terminal is worth building.
*Done when:* each item passes the §9 recipes; no new hooks added.

### Phase 3 — CMD Hero Fights (TS port; not C++/WASM — the originals are simple 2020-era CLI games, a TS port is smaller, debuggable, and bundles cleanly)
- **3a — Program runtime hardening:** wire `readKey` raw mode, program-mode prompt handling, `Ctrl+C` abort, busy indicator. Smoke-tested with a throwaway `guess` number game (can ship as an easter egg).
- **3b — Port:** fetch the original C++ sources (Nour's GitHub: `CMD-Hero-Fights-V1`, `CMD-Hero-Fights-With-Classes`) as reference; reimplement game loop/state (hero, enemies, combat menu, progression) in `commands/games/cmd-hero-fights/`, **lazy-loaded on first run**; rendering = `TermLine` prints + `readKey` menus; saves in `ngx.games.chf`.
- **3c — Feel pass:** pacing, ASCII flourish, theme-aware accents in game output.
*Done when:* `cmdherofights` (alias `chf`) is playable start-to-finish, survives quit/restart, and base bundle size is unchanged when never launched.

### Phase 4 — Integrations & far future
- **Spotify / presence** per architecture.md's deferred spec; first work item = the hosting decision (static nginx → client-side third-party API vs. tiny external worker). `src/lib/ngxos/integrations/` created only then.
- **Custom display font:** blocked on extraction from Figma → test → decide. Roadmap line only.
- **Blog** joins the VFS when a blog collection exists; possible `open`/fuzzy-find commands.
- **Portability groundwork:** just the discipline of keeping §7's contract table current — no packaging tasks.

---

## 9. Verification (no test frameworks by house rule — manual recipes per milestone)

1. **Build gate:** `bun run build` clean; `bun run dev` console error-free on all 8 routes.
2. **JS-disabled walk:** every route identical to today; no power button; no layout shift.
3. **OFF-parity:** JS on, power off → screenshot spot-check `/`, `/portfolio`, a project page vs. production.
4. **Keyboard walkthrough** (on `/`, `/portfolio/<slug>`, `/resume`): `~` on → j/k all sections → gg/G → `f` + activate a link → `/` → `ls`, `cd portfolio`, `cd <slug>`, `neofetch`, `theme vgcolors`, `clear`, `help` → Esc → confirm nav keys inert while typing in the terminal input.
5. **SPA-swap check:** switch projects via tab links, then j/k + `f` must match new content; gallery arrows still work.
6. **Persistence matrix:** toggle power/theme/terminal, hard-navigate, reload, back/forward (bfcache) — consistent, no FOUC (CPU-throttle to expose flashes).
7. **Storage-blocked run:** localStorage blocked → site works, ngxos degrades to session-only, no exceptions.
8. **Reduced-motion run:** no pulse, instant scrolls, static glow only.
9. **Mobile run:** narrow + touch emulation — no terminal; power/theme/glow work; mobile `<details>` nav unaffected.
10. **Perf spot-check:** Lighthouse on `/` before M1 vs. after M5 within noise; network tab confirms terminal chunk absent until power-on.

## 10. Risks & edge cases

- **SPA swap staleness** → `ngxos:content-swapped` contract; documented so future swapping scripts know to dispatch it.
- **Keydown conflicts** → enhancer owns arrows, ngxos owns letters/`/`/`~`/Esc; both guard editable targets; ngxos also respects `defaultPrevented` + modifiers.
- **Focus traps** → terminal never traps Tab; Esc always exits any mode; hint mode consumes only label chars + Esc.
- **FOUC** → inline head script pre-paint; default/off always renderable.
- **Storage unavailable** → try/catch + memory fallback in `persist.ts`; never escapes boot.
- **Hint drift on scroll/resize** → dismiss, don't reposition (v1).
- **z-index** → terminal 200, overlays 300; verify mobile nav stays below.
- **Double boot** → module-level guard (mirrors the enhancer's `mounted` pattern).
- **Bundle creep** → dynamic-import discipline: OFF cost = island shell; game chunk loads only on launch.

## 11. Explicit revisions to `docs/architecture.md` (apply in M5)

1. Stale token examples (`--bg-0/--accent-0/--glow-0`) → shipped names (`--bg-page/--text-accent/--glow-*`).
2. Phase 1 marked done; phase table replaced by §8.
3. `SectionRecord`/`CommandResult`/`CommandContext` defined (§1).
4. New sections: persistence & FOUC (§2), Vimium hint mode + inference reconciliation (§3), interactive program interface + CMD Hero Fights phase (§4.6/Ph3), hook contract table (§7).
5. Store = Svelte 5 runes, not `svelte/store`; component list trimmed (no `CommandPalette`; `BootSequence` → Phase 2; `PowerEffects` → pure CSS); `focus-map.ts` → `hints.ts`; `plugins` registry dropped from v1.
6. Terminal nav = real routes only; mockups' `contact_me`/`experience` noted as explicit non-goals.
7. Activation semantics revised: glow on focused section only, faint tint elsewhere (supersedes `themes.css:142`); `data-ngx-focusable` becomes opt-out.

## Critical files

- `src/layouts/MainLayout.astro` — inline restore script, island mount, footer power button (only base-markup change besides the focusable audit)
- `src/styles/themes.css` — accents/glows/swatches/coverage; activation rule moves to new `src/styles/ngxos.css`
- `src/lib/ngxos/core/kernel.ts` — new; everything hangs off it
- `src/components/svelte/PortfolioProjectEnhancer.svelte` — two-line coordination edit only
- `docs/architecture.md` — §11 revisions; canonical home of the hook contract
