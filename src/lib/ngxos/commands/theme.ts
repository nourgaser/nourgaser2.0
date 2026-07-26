import type { CommandModule, TermLine } from '../core/registry';
import { themes, isThemeId, applyThemeChoice } from '../effects/themes';
import { ngx } from '../core/store.svelte';

export const themeCommand: CommandModule = {
  name: 'theme',
  description: 'list themes, or switch with `theme <id>`',
  usage: 'theme [id]',
  async run(args) {
    const target = args[0];

    if (!target) {
      const lines: TermLine[] = [];

      for (const theme of themes) {
        const current = theme.id === ngx.theme;
        lines.push({
          kind: current ? 'accent' : 'plain',
          text: current ? `* ${theme.id} — ${theme.label} (current)` : `  ${theme.id} — ${theme.label}`,
        });
        lines.push({ kind: 'swatch-row', theme: theme.id });
      }

      return { lines };
    }

    if (!isThemeId(target)) {
      return {
        lines: [
          {
            kind: 'error',
            text: `theme: unknown theme '${target}' — valid: ${themes.map((theme) => theme.id).join(', ')}`,
          },
        ],
      };
    }

    applyThemeChoice(target);

    return { lines: [{ kind: 'plain', text: `theme set to ${target}` }] };
  },
  complete(argIndex, partial) {
    if (argIndex !== 0) {
      return [];
    }

    return themes.map((theme) => theme.id).filter((id) => id.startsWith(partial));
  },
};
