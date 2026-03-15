# AI Development Instructions and Guardrails

## nourgaser.com Portfolio + ngxos Runtime

This document defines **instructions and guardrails for AI coding agents** working on this repository.

It must be injected into AI prompts when generating or modifying code.

The purpose is to ensure that all generated code remains consistent with the **architecture, philosophy, and constraints of the project**.

The project is intentionally **small, handcrafted, experimental, and artistic**. It is not a commercial product and must not be treated like one.

---

## Project Overview

This repository implements the **nourgaser.com personal portfolio website** and the **ngxos runtime layer**.

The system consists of two layers:

### Portfolio Layer

* static/SSR-first website
* SEO-friendly and accessible
* usable with JavaScript disabled
* written primarily in **Astro**

### ngxos Runtime Layer

* client-side enhancement system
* written primarily in **Svelte**
* provides terminal UI, keyboard navigation, and runtime effects
* progressively enhances the portfolio layer

The base site must remain **fully functional without ngxos**.

ngxos is an enhancement, not a dependency.

---

## Core Technology Stack

AI agents must use the following stack.

Core tools:

* Astro
* Svelte
* TypeScript
* Bun (strict no NodeJS policy)
* MDX

Styling:

* handwritten CSS
* CSS variables
* minimal global design tokens

Do **not introduce additional frameworks** unless explicitly instructed.

---

## Architecture Constraints

All implementation must follow the architecture described in:

```bash
docs/architecture.md
```

Important architectural rules:

### Astro responsibilities

Astro owns:

* routing
* page structure
* layouts
* SSR/static generation
* SEO metadata
* content rendering
* semantic HTML containers

### Svelte responsibilities

Svelte owns:

* ngxos runtime
* terminal UI
* keyboard navigation
* theme runtime
* visual activation states
* command system

### Content system

Content must be written in:

* MDX
* Astro pages

Do not create CMS integrations or database dependencies.

---

## Design Source of Truth

> **MANDATORY**: Before implementing or modifying any visual element, layout, color, spacing, typography, or component appearance, AI agents **must** consult the design sources below. Do not guess, invent, or normalize visual decisions.

The design is defined in the **Figma project**.

### Required Workflow for Visual Work

1. **Open the Figma file via MCP** (`mcp_com_figma_mcp_get_design_context` or `mcp_com_figma_mcp_get_screenshot`) and inspect the relevant frame/component.
2. If MCP is unavailable, **check `docs/design/`** for committed screenshots and references.
3. Only proceed with implementation once you have confirmed the visual intent from those sources.
4. If neither source is accessible, **stop and ask the user** rather than guessing.

### Figma File

> <https://www.figma.com/design/YYUSem7sKafNpikrZdCth9/nourgaser.com?t=EQzNu3XrrNRlZfL0-0>

### Fallback

* `docs/design/pages/` — page-level screenshots
* `docs/design/theme/` — theme/color references
* `docs/design/terminals/` — terminal UI references
* `docs/design/font/` — typography references
* `docs/design/logo/` — logo and branding

---

## Legacy Site Reference

The old website lives at `legacy/nourgaser.github.io/` and is the **primary source of truth for content** — projects, skills, and portfolio entries.

AI agents must consult this before writing any content:

* `legacy/nourgaser.github.io/public/data/dirs.json` — index of all portfolio projects
* `legacy/nourgaser.github.io/public/data/<slug>/data.json` — per-project metadata (title, description, tags, URLs, media)
* `legacy/nourgaser.github.io/public/data/<slug>/media/` — screenshots and videos for each project
* `legacy/nourgaser.github.io/index.html` — full original page structure and existing copy

When porting content to the new site:

* Use the legacy `data.json` files as the source for MDX frontmatter (title, description, tags, stack, links).
* Do **not** invent, fabricate, or assume skills/projects that are not present in the legacy data.
* Preserve the original project descriptions and notes faithfully; expand only when explicitly asked.

The legacy site is a **reference only** — do not copy its code, dependencies, or structure.

---

The project intentionally uses:

* unconventional layout
* unusual color palettes
* stylized typography
* experimental UI elements

The goal is **pixel-faithful reproduction** of the Figma design. Do not normalize, simplify, or sanitize it.

---

## Implementation Philosophy

The implementation must follow these principles.

### 1. Simplicity

Prefer:

* fewer files
* small modules
* readable code
* minimal abstraction

Avoid:

* complex architecture
* unnecessary dependency injection
* large configuration layers

---

### 2. Performance

The site must be **extremely fast**.

Key rules:

* prefer static rendering
* minimize JavaScript
* hydrate only where necessary
* avoid large dependencies
* avoid unnecessary client bundles

Astro should output **mostly static HTML**.

---

### 3. SEO

The portfolio layer must be **search engine friendly**.

Requirements:

* semantic HTML
* descriptive headings
* metadata support
* structured content

Blog posts and projects must be **crawlable without JavaScript**.

---

### 4. Progressive Enhancement

ngxos must never be required for the site to function.

If JavaScript fails:

* pages must still load
* links must still work
* content must still be readable

ngxos features must attach to **existing semantic containers**.

---

### 5. Accessibility

Despite experimental visuals, the site must remain accessible.

Requirements:

* semantic HTML
* reasonable contrast
* keyboard navigability
* reduced motion support

Do not break standard browser navigation behavior.

---

### 6. Artistic Freedom

The project intentionally embraces:

* unusual layouts
* neon/glow visuals
* unconventional UI elements
* playful terminal interactions

AI agents must **not attempt to sanitize or corporate-ify the design**.

The goal is **creative expression**.

---

### 7. Minimalism

The project avoids engineering overhead.

The following are intentionally excluded:

* test frameworks
* heavy CI systems
* complex state management frameworks
* large UI libraries
* Tailwind or utility CSS frameworks
* enterprise patterns

Keep the codebase **small and understandable**.

---

## Explicit Non-Goals

AI agents must **not introduce**:

* Redux
* Zustand
* MobX
* Tailwind
* Bootstrap
* Material UI
* component libraries
* CSS-in-JS frameworks
* backend frameworks
* database systems
* ORM layers
* microservices
* GraphQL
* test frameworks
* enterprise architecture patterns

This is a **personal creative project**, not a product platform.

---

## ngxos Runtime Guidelines

ngxos is a **client-side runtime layer**.

It behaves like a lightweight operating system that attaches to the page.

Key components include:

* terminal overlay
* command system
* keyboard navigation
* runtime visual activation
* theme control

ngxos must:

* attach to semantic containers
* never break normal navigation
* degrade gracefully

---

## Data Hooks

Astro pages must expose structured hooks for ngxos.

Example:

```html
<section
  data-ngx-section="projects"
  data-ngx-label="Projects"
  data-ngx-focusable="true"
  data-ngx-route="/projects"
>
```

These attributes allow ngxos to discover sections safely.

Do **not rely on DOM structure inference**.

Always use explicit attributes.

---

## Command System Rules

Commands must be:

* small modules
* stateless where possible
* registered in a command registry

Example commands:

* help
* ls
* pwd
* cd
* clear
* theme
* neofetch

Command modules must follow the shared interface defined in the architecture document.

---

## Keyboard Navigation Rules

Keyboard shortcuts must:

* not override text inputs
* not block browser navigation
* remain discoverable

Example shortcuts:

* `/` focus terminal
* `j` next section
* `k` previous section
* `gg` top
* `G` bottom

Keyboard navigation must be **optional**.

---

## Styling Guidelines

Styling must use:

* handwritten CSS
* CSS variables
* design tokens

Files include:

```bash
styles/
  reset.css
  tokens.css
  themes.css
  global.css
  animations.css
```

Avoid:

* utility frameworks
* CSS-in-JS
* large styling abstractions

Visual effects should primarily rely on **CSS**, not JavaScript.

---

## Animation Guidelines

Animations should be:

* subtle
* GPU-friendly
* optional

Support:

```css
prefers-reduced-motion
```

Heavy animation libraries must not be introduced.

---

## Content Guidelines

Blog posts and project pages must be written in **MDX**.

Content collections must remain simple.

front-matter should include structured fields such as:

* title
* description
* date
* tags
* stack
* status

Do not introduce CMS or database systems.

---

## Code Generation Standards

When generating code, AI agents must:

* produce TypeScript
* prefer functional modules
* avoid excessive abstraction
* avoid long files
* keep modules focused

Code must remain readable and maintainable by humans.

---

## Allowed Dependencies

Dependencies should remain minimal.

Acceptable examples:

* Astro integrations
* small utility libraries
* lightweight UI helpers

Large frameworks must not be added.

---

## File Modification Rules

AI agents must:

* respect the existing folder structure
* not reorganize directories unnecessarily
* avoid renaming core modules
* avoid rewriting working systems

When modifying files:

* preserve intent
* keep changes minimal

---

## Commit Scope Expectations

Each change should aim to:

* solve a single problem
* add one feature
* improve a specific component

Avoid large sweeping changes unless explicitly requested.

---

## Code Style Preferences

Preferred characteristics:

* descriptive variable names
* minimal comments unless necessary
* consistent formatting
* modern TypeScript syntax

Avoid:

* clever hacks
* unnecessary metaprogramming
* premature optimization

---

## Phase Execution Plan

AI agents should prioritize implementation in the following order.

### Phase 1 — Portfolio Foundation

Implement:

* homepage
* about page
* projects index
* project detail page
* blog index
* blog post page
* layout system
* styling system
* MDX content pipeline
* semantic section hooks

---

### Phase 2 — ngxos Core

Implement:

* ngxos root runtime
* terminal overlay
* command registry
* help, ls, pwd, cd commands
* keyboard navigation
* power-on state
* runtime theme switching

---

### Phase 3 — Interaction Polish

Implement:

* draggable terminal
* tab completion
* command history
* boot animation
* visual activation effects
* refined keyboard navigation

---

## AI Behavior Guidelines

AI agents must:

* follow the architecture document
* respect project philosophy
* generate minimal code
* avoid unnecessary complexity
* prefer readability

If uncertainty exists:

* favor simpler solutions
* avoid adding dependencies
* ask for clarification rather than guessing large changes.

---

## Final Principle

The project is **a personal creative portfolio**, not a product.

The objective is:

* expressive design
* interesting interactions
* technical elegance
* fast performance
* maintainable code

AI-generated code must support these goals without introducing unnecessary engineering overhead.
