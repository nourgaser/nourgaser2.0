---
description: "Use when writing CSS, implementing layouts, choosing colors, applying typography, or building any visual component for nourgaser.com. Enforces Figma-first pixel-faithful design implementation."
name: "Design & Visual Rules"
applyTo: "src/styles/**/*.css, src/components/**/*.astro, src/components/**/*.svelte"
---
# Design & Visual Rules

## MANDATORY: Consult Design Before Writing Visual Code

Before writing any CSS, layout, or visual markup:

1. **Open Figma via MCP** — use `mcp_com_figma_mcp_get_design_context` or `mcp_com_figma_mcp_get_screenshot` to inspect the exact frame or component.
2. **Fallback** — check `docs/design/` screenshots if MCP is unavailable:
   - `docs/design/pages/` — page layouts
   - `docs/design/theme/` — color palettes and themes
   - `docs/design/terminals/` — terminal UI
   - `docs/design/font/` — typography
   - `docs/design/logo/` — branding
3. If neither source is accessible, **stop and ask the user**.

## CSS Rules

- Use CSS variables and design tokens from `src/styles/tokens.css` and `src/styles/themes.css`.
- Never hardcode colors, spacing, or font sizes that should come from tokens.
- Do not introduce utility frameworks (no Tailwind, no Bootstrap).
- Write handcrafted CSS that matches the Figma design exactly.
- Support `prefers-reduced-motion` for all animations.

## Design Fidelity

- The Figma file is the requirement. Match it **exactly**: colors, spacing, font weights, layout structure.
- Deviating from the design (e.g. rounding colors, simplifying layouts, switching fonts) is a bug.
- The design is intentionally unconventional and artistic — do not normalize or sanitize it.

> Figma file: <https://www.figma.com/design/YYUSem7sKafNpikrZdCth9/nourgaser.com?t=EQzNu3XrrNRlZfL0-0>
