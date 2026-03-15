---
description: "Use when editing Astro pages, layouts, components, or MDX content for nourgaser.com. Enforces SSR-first portfolio architecture, semantic SEO HTML, and explicit data-ngx hooks from docs/architecture.md."
name: "Astro Portfolio Rules"
applyTo: "src/pages/**/*.astro, src/layouts/**/*.astro, src/components/astro/**/*.astro, src/content/**/*.mdx"
---
# Astro Portfolio Rules

- Treat Astro as the source of truth for routing, page structure, content rendering, and SEO.
- Keep pages fully usable without JavaScript.
- Use semantic HTML and descriptive headings.
- Add explicit `data-ngx-*` attributes for meaningful sections. Do not rely on DOM inference.
- Keep dependencies minimal and avoid introducing new frameworks.
- Follow `docs/architecture.md` and `.github/copilot-instructions.md` when tradeoffs appear.

## Visual Implementation

- **Before writing any layout, spacing, color, or structural HTML**, consult the Figma design file via MCP or `docs/design/pages/` screenshots.
- If MCP is unavailable and the in-repo design references are ambiguous, incomplete, or visually unclear, ask the user for screenshots before implementing.
- Match the Figma design pixel-faithfully. Do not substitute colors, fonts, or layout with generic alternatives.
- The design is the requirement. Deviating from it is a bug.

## Content

- **Before writing any project, skill, or portfolio content**, read the legacy data at `legacy/nourgaser.github.io/public/data/`.
- Port project metadata from `data.json` files into MDX frontmatter — do not fabricate content.
- The legacy `dirs.json` lists all projects by slug; each slug has a `data.json` with title, description, tags, URLs, and media.
