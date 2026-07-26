// VFS-lite of the site's real routes. Modeled as a small tree so the
// terminal's `cd`/`ls`/`pwd` commands can navigate it without ever inventing
// a page that doesn't exist. Portfolio project slugs arrive at runtime
// (see `initRoutes`) since they come from the content collection.
export interface RouteNode {
  name: string;
  path: string;
  children: RouteNode[];
}

function makeNode(name: string, path: string, children: RouteNode[] = []): RouteNode {
  return { name, path, children };
}

const root: RouteNode = makeNode('~', '/', [
  makeNode('about', '/about'),
  makeNode('portfolio', '/portfolio'),
  makeNode('hobbies', '/hobbies'),
  makeNode('business', '/business'),
  makeNode('resume', '/resume'),
]);

export function initRoutes(projectSlugs: string[]): void {
  const portfolio = root.children.find((node) => node.name === 'portfolio');

  if (!portfolio) {
    return;
  }

  portfolio.children = projectSlugs.map((slug) => makeNode(slug, `/portfolio/${slug}`));
}

// Strips a single trailing slash (root stays `/`) so URLs coming from
// `location.pathname` line up with the slash-free paths modeled above and
// with the `data-ngx-route` attributes already used across the pages.
export function normalizeRoutePath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function findNode(path: string): RouteNode | undefined {
  const normalized = normalizeRoutePath(path);

  if (normalized === '/' || normalized === '') {
    return root;
  }

  const segments = normalized.split('/').filter(Boolean);
  let node = root;

  for (const segment of segments) {
    const next = node.children.find((child) => child.name === segment);

    if (!next) {
      return undefined;
    }

    node = next;
  }

  return node;
}

export function routeExists(path: string): boolean {
  return findNode(path) !== undefined;
}

export function listChildren(path: string): RouteNode[] {
  return findNode(path)?.children ?? [];
}

// `/` displays as `~`, everything else keeps its path with a `~` prefix,
// e.g. `/portfolio` -> `~/portfolio`.
export function displayPath(path: string): string {
  const normalized = normalizeRoutePath(path);

  return normalized === '/' || normalized === '' ? '~' : `~${normalized}`;
}

function parentOf(path: string): string {
  const normalized = normalizeRoutePath(path);
  const segments = normalized.split('/').filter(Boolean);

  segments.pop();

  return segments.length ? `/${segments.join('/')}` : '/';
}

// Resolves a `cd` argument against a starting directory. Supports `~`, `/`,
// `..`, plain child names, and slash-joined paths (relative or absolute).
// Returns `undefined` when the result doesn't name a real route.
export function resolvePath(cwd: string, arg: string): string | undefined {
  const trimmed = arg.trim();

  if (!trimmed || trimmed === '.') {
    return routeExists(cwd) ? normalizeRoutePath(cwd) : undefined;
  }

  if (trimmed === '~') {
    return '/';
  }

  if (trimmed === '/') {
    return '/';
  }

  let base = trimmed.startsWith('/') ? '/' : normalizeRoutePath(cwd);
  const segments = trimmed.split('/').filter(Boolean);

  for (const segment of segments) {
    if (segment === '~') {
      base = '/';
      continue;
    }

    if (segment === '..') {
      base = parentOf(base);
      continue;
    }

    if (segment === '.') {
      continue;
    }

    const node = findNode(base);
    const next = node?.children.find((child) => child.name === segment);

    if (!next) {
      return undefined;
    }

    base = next.path;
  }

  return routeExists(base) ? base : undefined;
}
