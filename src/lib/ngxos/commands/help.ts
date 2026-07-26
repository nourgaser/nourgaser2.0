import type { CommandModule, TermLine } from '../core/registry';
import { listCommands } from '../core/registry';

export const helpCommand: CommandModule = {
  name: 'help',
  description: 'list available commands',
  async run() {
    const lines: TermLine[] = listCommands()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((command) => ({ kind: 'plain', text: `${command.name} — ${command.description}` }));

    return { lines };
  },
};
