// Command registry stub. Later milestones (terminal, commands) populate and
// consume this; M1 only needs the shape to exist.
export type TermLine =
  | { kind: 'plain' | 'accent' | 'error'; text: string }
  | { kind: 'ascii'; text: string }
  // `theme` scopes the row to that theme's swatches (via a `data-theme`
  // wrapper) instead of the live document theme — lets `theme`/`neofetch`
  // render a non-active theme's colors. Omit to follow the current theme.
  | { kind: 'swatch-row'; theme?: string }
  | { kind: 'kv'; key: string; value: string }
  // Composite two-column render (ascii logo | heading + kv stats + swatch
  // row) matching neofetch's real layout — a single line so TerminalLine can
  // lay both columns out together instead of stacking them. The logo is a
  // grid of two-tone segments (bright badge over a dim wordmark weave).
  | { kind: 'neofetch'; ascii: AsciiSegment[][]; heading: string; stats: Array<{ key: string; value: string }>; swatchTheme?: string };

export interface AsciiSegment {
  text: string;
  bright: boolean;
}

export interface CommandResult {
  lines: TermLine[];
}

export interface TerminalIO {
  print(line: TermLine): void;
  clear(): void;
  readLine(opts?: { prompt?: string; signal?: AbortSignal }): Promise<string>;
  readKey(opts?: { signal?: AbortSignal }): Promise<string>;
}

export interface SectionRecord {
  id: string;
  label: string;
  route: string;
  el: HTMLElement;
  focusable: boolean;
}

export interface CommandContext {
  cwd: string;
  sections: SectionRecord[];
  navigate(path: string): void;
  emit(name: string, detail?: unknown): void;
  io: TerminalIO;
}

export interface CommandModule {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  run(args: string[], ctx: CommandContext): Promise<CommandResult | void>;
  // Tab-completion candidates for the arg at `argIndex` (0-based, after the
  // command name) given what's typed so far. Omit for no arg completion.
  complete?(argIndex: number, partial: string, ctx: CommandContext): string[];
}

const commands = new Map<string, CommandModule>();

export function registerCommand(mod: CommandModule): void {
  commands.set(mod.name, mod);

  for (const alias of mod.aliases ?? []) {
    commands.set(alias, mod);
  }
}

export function getCommand(nameOrAlias: string): CommandModule | undefined {
  return commands.get(nameOrAlias);
}

export function listCommands(): CommandModule[] {
  return Array.from(new Set(commands.values()));
}
