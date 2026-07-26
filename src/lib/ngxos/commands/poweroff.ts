import type { CommandModule } from '../core/registry';
import { powerOff } from '../core/kernel';

export const poweroffCommand: CommandModule = {
  name: 'poweroff',
  description: 'power off ngxos',
  async run(_args, ctx) {
    ctx.io.print({ kind: 'plain', text: 'ngxos: powering off…' });
    powerOff();
  },
};
