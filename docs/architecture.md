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

Common attributes include:

* `data-ngx-section`
* `data-ngx-label`
* `data-ngx-focusable`
* `data-ngx-route`
* `data-ngx-kind`
* `data-ngx-command`
* `data-ngx-theme-scope`

These attributes allow ngxos to interact with SSR content without relying on fragile DOM inference.

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

Example:

```css
:root {
  --bg-0: #0a0b14;
  --bg-1: #101427;
  --text-0: #f5f7ff;
  --text-1: #b8c2ff;
  --accent-0: #58e1ff;
  --accent-1: #b06cff;
  --glow-0: 0 0 24px color-mix(in srgb, var(--accent-0) 45%, transparent);
}
```

---

## Power State

Activation indicator applied at the root element.

Example:

```html
<html data-ngxos="on">
```

CSS reacts to activation:

```css
[data-ngxos="on"] [data-ngx-focusable="true"] {
  outline: 1px solid color-mix(in srgb, var(--accent-0) 60%, transparent);
  box-shadow: var(--glow-0);
}
```

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

## Phase 1 — Foundation

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
