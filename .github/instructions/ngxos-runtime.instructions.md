---
description: "Use when editing ngxos runtime Svelte or TypeScript files. Enforces progressive enhancement, explicit section-hook integration, minimal command/runtime modules, and no deferred advanced integrations unless requested."
name: "ngxos Runtime Rules"
applyTo: "src/components/svelte/ngxos/**/*.svelte, src/lib/ngxos/**/*.ts"
---
# ngxos Runtime Rules

- ngxos is optional enhancement; it must never make the base site required to run JavaScript.
- Interact with page content through explicit `data-ngx-*` hooks only.
- Keep command and runtime modules small, focused, and readable.
- Do not block normal browser navigation or text input behavior.
- Respect reduced-motion preferences for runtime effects.
- Avoid adding deferred features (integrations, realtime, advanced systems) unless explicitly requested.
- Follow `docs/architecture.md` and `.github/copilot-instructions.md` for all runtime decisions.
