import type { CommandModule, TermLine } from '../core/registry';
import { listChildren } from '../navigation/routes';

export const lsCommand: CommandModule = {
  name: 'ls',
  description: 'list child pages and the current page\'s sections',
  async run(_args, ctx) {
    const lines: TermLine[] = [];

    for (const child of listChildren(ctx.cwd)) {
      lines.push({ kind: 'accent', text: `${child.name}/` });
    }

    // Listed by id — that's the addressable name `cd` actually accepts as a
    // single token. The label (which may be multiple words) is appended as
    // an annotation; `kv` is the cheapest existing TermLine kind that gives
    // the id and the label distinct treatment without a new line kind.
    for (const section of ctx.sections) {
      if (section.route === ctx.cwd) {
        const value = section.label === section.id ? '' : `— ${section.label}`;
        lines.push({ kind: 'kv', key: section.id, value });
      }
    }

    if (lines.length === 0) {
      lines.push({ kind: 'plain', text: '(empty)' });
    }

    return { lines };
  },
};
