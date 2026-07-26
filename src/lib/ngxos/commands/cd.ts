import type { CommandModule } from '../core/registry';
import { displayPath, listChildren, resolvePath, routeExists } from '../navigation/routes';
import { ngx } from '../core/store.svelte';
import { persistTerminalState } from '../core/kernel';

export const cdCommand: CommandModule = {
  name: 'cd',
  description: 'change directory, or jump to a section on this page',
  usage: 'cd <path|..|~|section>',
  async run(args, ctx) {
    const target = args[0];

    if (!target) {
      const children = listChildren(ctx.cwd);

      if (children.length === 0) {
        return { lines: [{ kind: 'plain', text: '(no subdirectories)' }] };
      }

      return {
        lines: [{ kind: 'plain', text: children.map((child) => `${child.name}/`).join('  ') }],
      };
    }

    const resolved = resolvePath(ctx.cwd, target);

    if (resolved && routeExists(resolved)) {
      if (resolved === ctx.cwd) {
        return { lines: [{ kind: 'plain', text: displayPath(ctx.cwd) }] };
      }

      // Real MPA navigation is about to tear this page down — flush the
      // terminal's open/minimized state so the next page's boot restores it.
      persistTerminalState();
      ctx.navigate(resolved);
      return;
    }

    // `cd` accepts a section by its (single-token) id, but also — as a
    // courtesy — by its human label, which may be multiple words
    // (`cd Project Showcase`). Route resolution above only ever tries a
    // single token (routes are single-segment by design), but the section
    // match joins every arg back into one string so a multi-word label
    // isn't silently truncated to its first word.
    const needle = args.join(' ').toLowerCase();
    const section = ctx.sections.find(
      (candidate) =>
        candidate.route === ctx.cwd &&
        (candidate.id.toLowerCase() === needle || candidate.label.toLowerCase() === needle)
    );

    if (section) {
      section.el.scrollIntoView({ behavior: ngx.reducedMotion ? 'auto' : 'smooth', block: 'start' });
      return { lines: [{ kind: 'plain', text: `jumped to ${section.label}` }] };
    }

    return { lines: [{ kind: 'error', text: `cd: no such directory or section: ${args.join(' ')}` }] };
  },
  complete(argIndex, partial, ctx) {
    if (argIndex !== 0) {
      return [];
    }

    // `cd` accepts far more than "children of cwd" — same-level dir names,
    // any root-level page from anywhere (absolute), `..`/`~`, and this
    // page's sections — so completion has to offer that whole union, not
    // just the one case (sections) it used to.
    const children = listChildren(ctx.cwd).map((child) => child.name);

    // Root pages in absolute form (`/about`, `/portfolio`, ...) so e.g.
    // `cd /hob<Tab>` reaches `/hobbies` from any page, not just from `~`.
    // Derived from routes.ts (root's own children), never hardcoded.
    const rootRoutes = listChildren('/').map((child) => `/${child.name}`);

    const shortcuts = ctx.cwd !== '/' ? ['..', '~'] : [];

    // Offered by id only, not label — the id is what `cd` matches as a
    // single token, so that's what a Tab-completed insert needs to be (the
    // label courtesy-match in `run()` is for typed-out input, not this).
    const sectionIds = ctx.sections
      .filter((section) => section.route === ctx.cwd)
      .map((section) => section.id);

    const needle = partial.toLowerCase();
    const candidates = Array.from(new Set([...children, ...rootRoutes, ...shortcuts, ...sectionIds]));

    return candidates.filter((candidate) => candidate.toLowerCase().startsWith(needle));
  },
};
