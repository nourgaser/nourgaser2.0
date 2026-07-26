# nourgaser.com Architecture Specification

## Overview

This document formalizes the architecture, structure, and design principles of the **nourgaser.com** portfolio system and the **ngxos runtime layer**.

The project is structured as a **static/SSR-first portfolio website enhanced by a client-side runtime system** that augments the site with terminal interaction, keyboard navigation, dynamic theming, and system-like visual effects.

The system consists of two primary layers:

1. **Portfolio Layer** — the core website content, rendered server-side for performance and SEO.
2. **ngxos Runtime Layer** — an optional client-side enhancement system that transforms the site into an interactive operating-system-like experience.

The architecture prioritizes:

* performance
* simplicity
* progressive enhancement
* minimal framework overhead
* long-term extensibility

---

## Final Stack

## Core

* Astro
* Svelte
* TypeScript
* Bun
* MDX

## Styling

* Handwritten CSS
* CSS variables for theming
* Scoped component styles where appropriate
* Minimal global design token system

## Content

* Astro pages for structure
* MDX for blog and long-form portfolio content
* Typed local configuration/data files

## Deployment

* Static-first Astro deployment
* SSR endpoints added only when necessary
* Realtime features integrated later through separate services

---

## Architectural Philosophy

The system consists of **two conceptual layers**.

## Layer 1: Portfolio Layer

This layer represents the canonical website.

Characteristics:

* server-rendered or statically generated
* search engine indexable
* fully functional without JavaScript
* accessible and conventional
* minimal cognitive overhead

The portfolio layer communicates:

* identity and biography
* professional work
* projects and research
* interests and hobbies
* business activity
* blog and writing
* contact information

This layer must remain **fully usable even if ngxos fails to load**.

---

## Layer 2: ngxos Runtime Layer

The **ngxos runtime** is an optional enhancement system implemented entirely on the client.

It introduces:

* a terminal overlay
* keyboard navigation
* command execution
* visual activation states
* theme control
* interactive widgets
* realtime features (future)
* music integration (future)

When activated, ngxos transforms the site into an **operating-system-like environment layered on top of the existing site structure**.

The base site remains intact.

---

## High-Level Application Structure

## Responsibilities of Astro

Astro controls:

* routing
* page generation
* static rendering
* SSR when required
* SEO metadata
* blog rendering
* portfolio/project pages
* base HTML structure
* semantic section containers
* structural hooks for ngxos

Astro acts as the **content platform and document generator**.

---

## Responsibilities of Svelte

Svelte powers the interactive runtime layer.

Responsibilities include:

* terminal overlay UI
* command system
* keyboard navigation system
* theme switching
* runtime activation state
* powered-on visual effects
* client-side state management
* future realtime widgets
* future Spotify integration

Svelte components are mounted as **Astro islands**.

---

## Project Folder Structure

```bash
src/
  assets/
    images/
    icons/
    textures/

  components/
    astro/
      Layout.astro
      SiteHead.astro
      Hero.astro
      SectionShell.astro
      ProjectCard.astro
      BlogCard.astro
      SkillBlock.astro

    svelte/
      ngxos/
        NgxosRoot.svelte
        TerminalOverlay.svelte
        TerminalWindow.svelte
        CommandPalette.svelte
        PowerEffects.svelte
        KeyboardNavigator.svelte
        StatusBar.svelte
        BootSequence.svelte

  content/
    blog/
      first-post.mdx
    projects/
      project-one.mdx
      project-two.mdx

  data/
    site.ts
    projects.ts
    hobbies.ts
    skills.ts
    business.ts
    commands.ts
    routes.ts
    themes.ts

  layouts/
    MainLayout.astro
    BlogLayout.astro
    ProjectLayout.astro

  lib/
    ngxos/
      core/
        kernel.ts
        registry.ts
        store.ts
        events.ts
        config.ts

      commands/
        help.ts
        ls.ts
        pwd.ts
        cd.ts
        neofetch.ts
        theme.ts

      navigation/
        focus-map.ts
        keybinds.ts
        routes.ts
        section-registry.ts

      effects/
        power-state.ts
        neon-outline.ts
        themes.ts
        motion.ts

      integrations/
        spotify.ts
        presence.ts
        games.ts

      utils/
        dom.ts
        strings.ts
        fuzzy.ts

  pages/
    index.astro
    about.astro
    projects.astro
    business.astro
    hobbies.astro
    blog/
      index.astro
      [slug].astro
    portfolio/
      index.astro
      [slug].astro

  styles/
    global.css
    reset.css
    tokens.css
    themes.css
    animations.css
```

This structure ensures:

* clear separation between Astro and ngxos concerns
* maintainable project growth
* potential future extraction of ngxos into a reusable runtime system

---

## Content Architecture

## Top-Level Pages

Primary routes:

* `/`
* `/about`
* `/projects`
* `/hobbies`
* `/business`
* `/portfolio`
* `/blog`

Each route exists as a canonical location for content.

---

## Homepage

The homepage functions as a **curated overview**.

Recommended sections:

* Hero
* Who Am I
* Featured Projects
* Skills Overview
* Hobbies
* Business / Professional Work
* Latest Writing
* Contact Links

Each section links to deeper dedicated pages.

---

## Astro Page Contract for ngxos

Each meaningful section exposes stable runtime hooks.

Example:

```html
<section
  id="projects"
  data-ngx-section="projects"
  data-ngx-label="Projects"
  data-ngx-focusable="true"
  data-ngx-route="/projects"
>
```

These attributes allow ngxos to interact with SSR content without relying on fragile DOM inference.

### Canonical hook contract

| Attribute | Written by | Meaning |
| --- | --- | --- |
| `data-ngx-section` | Astro (authored) | Stable id for a section/panel; read by ngxos for navigation, focus, and the activation frame. |
| `data-ngx-label` | Astro (authored) | Human-readable label for the section (terminal nav, `ls`, hints). |
| `data-ngx-route` | Astro (authored) | Canonical route this section belongs to, for the terminal's route/nav commands. |
| `data-ngx-focusable="false"` | Astro (authored) | Opt out of keyboard-navigation traversal. |
| `data-ngx-frame` | Astro (authored) | Opt **in** to the animated neon activation frame (see `src/styles/ngxos.css`); presence = frame it. Authored directly on the exact leaf-level bordered content box (a hobby card, an about "box", a business panel, a portfolio card, a project header, a home site-map tile). Never on page-level `<main>` wrappers, `[data-ngx-section]` group containers, `PageHero`'s banner section, or the site header/footer. |
| `data-ngx-hint="false"` | Astro (authored) | Opt out of hint-mode collection. |
| `data-ngx-command="power"` | Astro (authored) | Marks the power toggle control (the footer shield button). |
| `data-ngx-ui` | Svelte/ngxos (authored on ngxos's own chrome) | Identifies ngxos's own UI (e.g. the terminal), so hint collection and section registries skip it. |
| `data-ngx-slot="theme-dock"` | Astro (authored) | Empty placeholder element a layout can include to receive an ngxos widget inline (the mobile theme dock relocates into it on mount via `appendChild`; if absent, the widget falls back to its standalone fixed position). |
| `data-ngx-focused="true"` | ngxos (written at runtime) | Set on the currently focused section by the keyboard-navigation system; drives the brighter/faster activation frame. |
| `data-ngxos` + `data-theme` on `<html>` | ngxos (written at runtime) | Power state (`"on"`) and active theme (`default`, `vgcolors`, `ubuntu`, `fedora`). |

Any script that replaces page content in place (e.g. an SPA-style
enhancer) must dispatch a `ngxos:content-swapped` document event afterward
so ngxos can re-scan for hooks — the portfolio project-detail enhancer
(`PortfolioProjectEnhancer.svelte`) does this today.

Additional notes:

* The terminal's nav tree only ever lists real routes (`data-ngx-route`
  values from authored pages) — no synthetic/virtual entries.
* Client-side runtime state is modeled with Svelte 5 runes (not classic
  Svelte stores).
* Activation visuals, in one line: every `[data-ngx-frame]` box gets a
  subtle traveling neon frame; the focused panel's box(es) are brighter and faster;
  under `prefers-reduced-motion` the frame is always static.

---

## Core ngxos Runtime Design

ngxos behaves as a lightweight client runtime system.

## Kernel

The kernel initializes the system.

Responsibilities:

* boot sequence
* runtime initialization
* module registration
* document attachment
* metadata discovery
* global event bus exposure

File location:

```bash
src/lib/ngxos/core/kernel.ts
```

---

## Store

Global client state using Svelte stores.

State examples:

* poweredOn
* terminalOpen
* terminalMinimized
* currentTheme
* currentRoute
* focusedSection
* keyboardMode
* reducedMotion
* presenceEnabled
* spotifyConnected

---

## Registry

Central registry for:

* commands
* routes
* sections
* keybindings
* plugins

Enables commands such as `ls`, `cd`, and navigation discovery.

---

## Event Bus

Simple runtime event system.

Example events:

* `ngxos:boot`
* `ngxos:power-on`
* `ngxos:power-off`
* `ngxos:route-change`
* `ngxos:section-focus`
* `ngxos:theme-change`
* `ngxos:terminal-open`

---

## Svelte Component Model

## NgxosRoot.svelte

Top-level runtime component responsible for:

* system initialization
* mounting overlays
* managing runtime state
* coordinating subsystems

---

## TerminalOverlay.svelte

Wrapper for the terminal UI system.

---

## TerminalWindow.svelte

Implements:

* draggable window
* minimization
* command history
* command execution interface

---

## KeyboardNavigator.svelte

Handles:

* keyboard shortcuts
* navigation modes
* section traversal

---

## PowerEffects.svelte

Controls visual activation states and CSS attributes.

---

## StatusBar.svelte

Optional persistent runtime indicator.

---

## BootSequence.svelte

Optional visual startup sequence.

---

## Command System Design

Each command module follows a shared interface.

```ts
type CommandContext = {
  currentRoute: string;
  sections: SectionRecord[];
  navigate: (path: string) => void;
  emit: (event: string, payload?: unknown) => void;
};

type CommandModule = {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  run: (args: string[], ctx: CommandContext) => Promise<string | CommandResult>;
};
```

Initial commands:

* help
* ls
* pwd
* cd
* clear
* theme
* neofetch

Future commands:

* whoami
* open
* projects
* blog
* spotify
* online
* poke
* play

---

## Keyboard Navigation Model

Keyboard interaction complements normal navigation.

Recommended features:

* global shortcut to focus terminal
* keyboard navigation mode
* section traversal
* route navigation shortcuts

Example mappings:

* `/` or `Shift+Space` → focus terminal
* `j` / `k` → next / previous section
* `gg` → top of page
* `G` → bottom of page
* `Enter` → activate element
* `Esc` → exit keyboard mode

Keyboard behavior never overrides input fields.

---

## Visual System Design

## Global Tokens

Defined in `tokens.css`.

Includes:

* spacing scale
* radius system
* borders
* shadows
* typography scale
* animation durations
* z-index layers

---

## Theme Tokens

Defined in `themes.css`.

Includes:

* backgrounds
* text colors
* accent colors
* neon/glow colors
* panel colors

Example (shipped names, from `src/styles/themes.css`):

```css
[data-theme="vgcolors"] {
  --bg-page:      #0a0b14;
  --bg-terminal:  #1f1b36;
  --text-primary: #ffffff;
  --text-accent:  #22d3e3;
  --glow-accent:  0 0 12px color-mix(in srgb, #22d3e3 45%, transparent);
  --glow-focus:   0 0 8px color-mix(in srgb, #22d3e3 55%, transparent);

  /* ngxos activation-frame stops (src/styles/ngxos.css) */
  --ngx-frame-a:    #22d3e3;
  --ngx-frame-b:    #7c5fd0;
  --ngx-frame-c:    #c4537c;
  --ngx-frame-glow: color-mix(in srgb, #22d3e3 40%, transparent);
}
```

---

## Power State

Activation indicator applied at the root element.

Example:

```html
<html data-ngxos="on">
```

CSS reacts to activation. All powered-on visual rules live in
`src/styles/ngxos.css` (imported once, after `themes.css`, in
`MainLayout.astro`):

```css
[data-ngxos="on"] [data-ngx-frame],
[data-ngxos="on"] .ngxos-terminal {
  position: relative;
}

[data-ngxos="on"] [data-ngx-frame] {
  border-color: transparent; /* the ring replaces the static border */
}

[data-ngxos="on"] [data-ngx-frame]::after,
[data-ngxos="on"] .ngxos-terminal::after {
  background: conic-gradient(from var(--ngx-angle, 0deg), /* ... */);
  animation: ngx-frame-spin var(--ngx-frame-duration, 10s) linear infinite;
}

[data-ngxos="on"] [data-ngx-focused="true"] [data-ngx-frame]::after,
[data-ngxos="on"] [data-ngx-focused="true"][data-ngx-frame]::after {
  --ngx-frame-opacity: 0.9;
  --ngx-frame-duration: 5s;
}
```

`data-ngx-frame` is an **opt-in** hook (presence = frame it), authored
directly on the exact leaf-level bordered content box — a hobby card, an
about "box", a business panel, a portfolio card, a project header, a home
site-map tile. It is never placed on semantic wrappers: page `<main>`s,
`[data-ngx-section]` group/container elements, `PageHero`'s banner
section, or the site header/footer. Where a section container happens to
have several bordered children (e.g. business's "Core Expertise" grid,
the portfolio category grid), the frame goes on each child card, not the
enclosing section — one frame level only, the innermost bordered one.
Framed boxes and the terminal window get a slow, animated "traveling neon
border" — a bright segment orbiting a faint ring over the box's own
former border line, built from a rotating `conic-gradient` masked down to
a thin ring (`mask-composite: exclude`) sitting at the border's own
position; the box's static `border-color` is dimmed to transparent so the
ring **is** the border while powered on, not a second line next to it.
All framed boxes stay subtly ringed to give the page a sense of life; the
box(es) inside the currently `data-ngx-focused="true"` section are
brighter and revolve faster, and the terminal sits in between. Frame
colors come from per-theme `--ngx-frame-a/-b/-c` + `--ngx-frame-glow`
variables. `@property --ngx-angle` is registered behind an
`@supports at-rule(@property)` guard so the angle animates smoothly where
supported and simply renders as a static faint ring everywhere else.
Under `prefers-reduced-motion: reduce`, the rotation is disabled
everywhere and only the static ring/glow remains — no exceptions.

An earlier version of this rule applied a single outline/box-shadow to
*every* `[data-ngx-focusable="true"]` element (later, every
`[data-ngx-section]` unless opted out), including invisible full-width
wrappers (page `<main>`s, hero strips) and non-bordered semantic section
containers — both produced stray bare edges floating in empty space. The
model was flipped to the current opt-in `[data-ngx-frame]` hook so the
frame only ever lands exactly on real bordered content boxes.

Visual effects should primarily rely on CSS rather than JavaScript mutation.

---

## MDX and Content Collections

MDX powers:

* blog posts
* project deep dives
* long-form writing

Content collections maintain structured content.

Collections:

* blog
* projects

Example metadata:

Blog fields:

* title
* description
* pubDate
* updatedDate
* tags
* draft

Project fields:

* title
* description
* role
* stack
* featured
* status
* links
* coverImage

---

## Routing Strategy

Canonical routes:

* `/about`
* `/projects`
* `/projects/[slug]`
* `/portfolio`
* `/portfolio/[slug]`
* `/hobbies`
* `/business`
* `/blog`
* `/blog/[slug]`

URL structure remains stable and predictable.

---

## Progressive Enhancement Rules

### Rule 1

Every page must function without ngxos.

### Rule 2

Failure of ngxos must not break the site.

### Rule 3

ngxos interacts with pages only through explicit hooks.

### Rule 4

Visual effects must respect reduced-motion preferences.

### Rule 5

Terminal and keyboard systems must not block standard navigation.

---

## Realtime and Multiplayer Plan

Realtime features are deferred.

Integration boundary exists in:

```bash
src/lib/ngxos/integrations/
```

Example interface:

```ts
type PresenceProvider = {
  connect(): Promise<void>;
  disconnect(): void;
  getUsers(): Promise<OnlineUser[]>;
  poke(userId: string): Promise<void>;
};
```

Possible backend options:

* WebSocket server
* Supabase realtime
* Cloudflare Durable Objects
* custom Bun service

---

## Spotify Integration Plan

Spotify integration remains optional.

Structure:

* integration module
* terminal command

If authentication is unavailable, commands return informative responses.

---

## CSS Strategy

Global styles include:

* reset.css
* tokens.css
* themes.css
* global.css
* animations.css

Component styles may exist locally where appropriate.

Naming conventions prioritize readability and semantics.

---

## Build Phases

## Phase 1 — Foundation ✅ done

* homepage
* about page
* projects index and detail
* hobbies page
* business page
* portfolio section
* blog system
* base styling
* MDX pipeline
* ngxos hooks in markup

---

## Phase 2 — ngxos Core

* runtime kernel
* terminal overlay
* command registry
* base commands
* keyboard navigation
* power activation
* visual activation effects

---

## Phase 3 — Polish

* tab completion
* draggable terminal
* animations and transitions
* boot sequence
* command history

---

## Phase 4 — Advanced Systems

* realtime presence
* multiplayer terminal games
* Spotify integration
* plugin architecture

---

## Concrete v1 Decisions

Astro responsibilities:

* pages
* layouts
* content collections
* SEO
* static rendering

Svelte responsibilities:

* ngxos runtime
* terminal UI
* keyboard navigation
* dynamic theme control
* activation effects

TypeScript responsibilities:

* command system
* registries
* configuration
* integrations

Bun responsibilities:

* package management
* development scripts
* local tooling

MDX responsibilities:

* blog content
* project documentation

---

## Suggested Initial Implementation

Initial milestone:

1. homepage
2. about page
3. projects index and detail
4. blog index and one post
5. section hooks (`data-ngx-*`)
6. ngxos root component
7. terminal activation shortcut
8. basic commands (`help`, `ls`, `pwd`, `cd`)
9. power-on visual toggle
10. section keyboard navigation

This slice validates the architecture quickly.

---

## Final Architecture Statement

The system is defined as:

**A static/SSR-first Astro portfolio enhanced by a Svelte-powered client runtime called ngxos that attaches to semantic section containers and augments them with terminal interaction, keyboard navigation, theme control, and system-like visual effects.**

This architecture prioritizes performance, progressive enhancement, maintainability, and experiential design.
