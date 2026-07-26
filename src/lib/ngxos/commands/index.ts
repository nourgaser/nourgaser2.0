import { registerCommand } from '../core/registry';
import { helpCommand } from './help';
import { pwdCommand } from './pwd';
import { lsCommand } from './ls';
import { cdCommand } from './cd';
import { clearCommand } from './clear';
import { themeCommand } from './theme';
import { neofetchCommand } from './neofetch';
import { exitCommand } from './exit';
import { poweroffCommand } from './poweroff';

let registered = false;

export function registerBaseCommands(): void {
  if (registered) {
    return;
  }

  registered = true;

  registerCommand(helpCommand);
  registerCommand(pwdCommand);
  registerCommand(lsCommand);
  registerCommand(cdCommand);
  registerCommand(clearCommand);
  registerCommand(themeCommand);
  registerCommand(neofetchCommand);
  registerCommand(exitCommand);
  registerCommand(poweroffCommand);
}
