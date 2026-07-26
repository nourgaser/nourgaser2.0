# ngxos — Implementation Status & Roadmap

Last updated: 2026-07-26. Companion to `docs/architecture.md` (the spec, including
the canonical hook-contract table) and the original phased plan. This file records
what is actually built, the decisions made along the way, and what remains.

## Status: v1 complete (plus most of Phase 2 pulled forward)

The core four systems are implemented and working:

### 1. Kernel / power / persistence
- Single island `<NgxosRoot client:idle />` in `MainLayout.astro`; `src/lib/ngxos/core/`
  (`kernel`, `store.svelte` (Svelte 5 runes), `events`, `persist`, `registry`, `shell.svelte`).
- Power on: footer shield button (the decorative shield IS the button — easter egg,
  lights up with theme accent when on), `Ctrl+`` ` ignition (powers on + opens terminal),
  or `?ngxos=on`. Power off: shield click or `poweroff` command.
- State crosses MPA navigations via localStorage (`ngx.power`, `ngx.theme`,
  `ngx.terminal` incl. position/size, `ngx.history`) with a pre-paint inline script in
  `MainLayout.astro` `<head>` (no FOUC). Scrollback persists per-tab in sessionStorage
  (`ngx.scrollback`, capped 200). Storage failures degrade to in-memory silently.

### 2. Terminal
- `TerminalWindow.svelte` + `core/shell.svelte.ts`: floating rounded window, draggable
  (title bar), resizable (bottom-right handle, min 360×240), position/size persisted,
  fully closes (no minimized state) via chevron/Esc/`exit`; reopens with `Ctrl+`` ` or `/`.
- Commands (`src/lib/ngxos/commands/`): `help`, `pwd`, `ls`, `cd`, `clear`, `theme`,
  `neofetch`, `exit`, `poweroff`. VFS = real routes only (root pages + 20 portfolio slugs
  passed from the layout at build time); `cd` navigates for real, matches section ids
  case-insensitively (labels joined-args courtesy), scrolls to sections on-page.
- zsh-style Tab completion: menu-select (highlighted candidate, Tab/Shift+Tab cycle,
  arrows navigate, Enter accepts without submitting), per-command `complete()` hook;
  `cd` offers cwd children + absolute root routes + `..`/`~` + section ids.
- Readline niceties: ↑/↓ history (persisted), Alt+Backspace / Alt+Left / Alt+Right word
  ops (arrows preventDefaulted vs browser history nav). Native caret (`caret-color`
  accent) — a custom block-cursor overlay was built and **deliberately reverted**
  (unverifiable scroll-sync; see Decisions).
- Hidden on mobile/coarse pointers; a ThemeDock (swatch row) renders inline in the
  footer instead, via the `data-ngx-slot="theme-dock"` placeholder.

### 3. Keyboard navigation (Vimium layer)
- `navigation/keybinds.ts` single dispatcher with strict guards (defaultPrevented,
  editable targets, modifiers). `j`/`k` section traversal (sets `data-ngx-focused`),
  `gg`/`G`, `f` hint mode (`navigation/hints.ts` + `HintOverlay.svelte`, prefix-free
  home-row labels over visible links/buttons, `data-ngx-ui` chrome excluded),
  `Enter` activate, `?` help overlay (live keybindings + commands), `Esc`.
- `PortfolioProjectEnhancer.svelte` coordination: dispatches `ngxos:content-swapped`
  after its SPA swap; respects `event.defaultPrevented`. Section registry re-scans on
  that event.

### 4. Themes + activation visuals
- 4 themes in `src/styles/themes.css` (`default`/`vgcolors`/`ubuntu`/`fedora`), colors
  pixel-sampled from `docs/design/` mockups; powered-ON default overrides scoped under
  `[data-ngxos="on"][data-theme="default"]` so the OFF site is untouched. `--swatch-0..5`
  and `--ngx-frame-*` vars per theme. Theme switching: `theme` command, terminal
  hamburger menu, mobile ThemeDock; persisted; reverts to default on power-off.
- `src/styles/ngxos.css`: ALL powered-on rules. Traveling-neon frame (conic-gradient
  comet ring, ~56° arc, 3px band, masked pseudo-element, `@property` angle animation
  with @supports fallback) on opt-in `[data-ngx-frame]` leaf cards only + the terminal;
  desynced via nth-child phase/duration variants; focused section's cards brighter/faster;
  ring REPLACES the static border while on (border-color transparent); vgcolors is a
  cyan→violet→magenta mixture; reduced-motion = static ring.
- Base-site extras added along the way: nav current-page indicator (`aria-current`,
  JS-free).

## Key decisions (don't re-litigate without cause)
- **Store**: Svelte 5 runes (`.svelte.ts`), not `svelte/store`.
- **Terminal nav tree**: real routes only; mockups' `contact_me`/`experience` are
  non-goals.
- **Frames**: opt-in `data-ngx-frame` on the smallest bordered leaf units only; never
  header/footer/`<main>`/heroes/group wrappers ("no major semantic sections").
- **Hint targets**: native `a[href]`/`button` discovery is allowed (documented
  exception to the no-DOM-inference rule); everything structural stays `data-ngx-*`.
- **Cursor**: native caret. The mirror-overlay block cursor was reverted — horizontal
  scroll sync couldn't be verified; revisit only with live-browser testing.
- **Keybinding**: `Ctrl+`` ` (Backquote) is the terminal toggle and ignition; `~` was
  removed. `/` also opens the terminal in normal mode.
- **Mobile**: no terminal/keyboard layer; power + themes + frames still work.

## Future work (in rough order)

1. **Verify the frame-animation fix on home** (fixed at end of session, needs a browser
   check): frozen comets were caused by `calc()` multiplication of unregistered custom
   properties in `animation-delay`/`duration` — replaced with literal negative delays
   per nth-child variant in `ngxos.css`. If any card is still frozen, that's the place
   to look. (The neofetch logo was also finished: two-tone weave in `utils/strings.ts`
   — bright shield badge over a dim full-rectangle wordmark texture per
   `docs/design/logo/ngxos_ascii.svg`; segments rendered in `TerminalLine.svelte`.)
2. **Phase 2 remainders**: boot-sequence animation (`BootSequence.svelte`, typed boot
   log, reduced-motion skip); scoped hints (`Enter` on focused section → hints limited
   to it); spatial (row-aware) arrow navigation in the completion menu (currently
   prev/next fallback); optional scanline/cursor-blink theme effects.
3. **Phase 3 — CMD Hero Fights**: wire `readKey` raw mode + `Ctrl+C` abort in
   `core/shell.svelte.ts` (the `TerminalIO` program interface is designed and
   `readLine` is wired); smoke-test with a tiny `guess` game; then TS-port the original
   C++ CLI games (github.com/nourgaser: `CMD-Hero-Fights-V1`,
   `CMD-Hero-Fights-With-Classes`) as `commands/games/cmd-hero-fights/`, lazy-loaded,
   saves in `ngx.games.chf`.
4. **Phase 4 / far future**: Spotify/presence integrations (first decide hosting:
   client-side API vs external worker; create `src/lib/ngxos/integrations/` only then);
   custom display font (blocked on extraction from Figma); blog in the VFS when a blog
   collection exists; portability = keep the contract table in architecture.md current.

## Verification (no test framework by design)
`bun run build` must stay clean. Manual recipes: JS-disabled walk (site identical, no
power affordance beyond the inert shield), OFF-parity vs production, keyboard
walkthrough (`Ctrl+`` `, j/k/gg/G/f/?, terminal commands), SPA-swap check on portfolio
project switches, persistence matrix (navigate/reload/bfcache), storage-blocked run,
reduced-motion run, mobile run (dock in footer), Lighthouse spot-check + terminal chunk
absent until power-on.
