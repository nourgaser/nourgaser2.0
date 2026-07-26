import type { CommandModule } from '../core/registry';
import { closeTerminal } from '../core/kernel';

export const exitCommand: CommandModule = {
  name: 'exit',
  description: 'close the terminal',
  async run() {
    closeTerminal();
  },
};
