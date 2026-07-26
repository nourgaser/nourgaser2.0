import type { CommandModule } from '../core/registry';

export const clearCommand: CommandModule = {
  name: 'clear',
  description: 'clear the terminal scrollback',
  async run(_args, ctx) {
    ctx.io.clear();
  },
};
