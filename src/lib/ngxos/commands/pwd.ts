import type { CommandModule } from '../core/registry';
import { displayPath } from '../navigation/routes';

export const pwdCommand: CommandModule = {
  name: 'pwd',
  description: 'print the current directory',
  async run(_args, ctx) {
    return { lines: [{ kind: 'plain', text: displayPath(ctx.cwd) }] };
  },
};
