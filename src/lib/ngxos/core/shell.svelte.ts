// Terminal session logic, UI-agnostic. Owns scrollback, command history,
// and execution — TerminalWindow.svelte only renders `shellState` and
// forwards submitted lines here. Runes state lives in a `.svelte.ts` file
// (per M1 convention) so it's importable from plain TS too.
import { ngx } from './store.svelte';
import { emit } from './events';
import { getCommand, listCommands } from './registry';
import type { CommandContext, TerminalIO, TermLine } from './registry';
import { getItem, setItem } from './persist';
import { getSections } from '../navigation/section-registry';
import { normalizeRoutePath, displayPath } from '../navigation/routes';

// --- Session persistence -----------------------------------------------
// Scrollback feels jarring if it resets on every `cd` (a real page
// navigation, since ngxos is an MPA). It's saved to `sessionStorage` (not
// `persist.ts`, which is localStorage-backed) so it survives navigation
// within a tab but not across browser restarts — like a real terminal
// session. Command history is the opposite: it goes to localStorage via the
// shared `persist.ts` wrapper, zsh-style, surviving restarts.
const SCROLLBACK_KEY = 'ngx.scrollback';
const SCROLLBACK_LIMIT = 200;
const HISTORY_KEY = 'ngx.history';
const HISTORY_LIMIT = 100;

function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // sessionStorage unavailable (private mode, quota, disabled) — scrollback
    // just won't survive navigation this session; nothing else depends on it.
  }
}

function removeSession(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore, same as above
  }
}

// Saved on every append rather than on `pagehide`: scrollback lines are tiny
// and infrequent (a handful per command), so re-stringifying the capped
// array each time is cheap, and it's the only approach that survives a hard
// refresh or crash, not just a clean unload.
function persistScrollback(): void {
  writeSession(SCROLLBACK_KEY, JSON.stringify(shellState.lines.slice(-SCROLLBACK_LIMIT)));
}

function loadScrollback(): TermLine[] {
  const raw = readSession(SCROLLBACK_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TermLine[]) : [];
  } catch {
    return [];
  }
}

function persistHistory(): void {
  setItem(HISTORY_KEY, JSON.stringify(shellState.history.slice(-HISTORY_LIMIT)));
}

function loadHistory(): string[] {
  const raw = getItem(HISTORY_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export const shellState = $state({
  lines: [] as TermLine[],
  cwd: '/',
  history: [] as string[],
  historyIndex: 0,
  // Prompt label shown while a command's `io.readLine` is pending, replacing
  // the normal `[guest@ngxos <cwd>]$` prompt. `null` when not in program mode.
  programPrompt: null as string | null,
  // Candidate row shown under the prompt while a Tab-completion is
  // ambiguous. `selected` is the highlighted candidate's index (zsh
  // menu-select style). `null` when not completing.
  completion: null as { candidates: string[]; selected: number } | null,
});

interface PendingRead {
  resolve(value: string): void;
  reject(reason: unknown): void;
}

let pendingRead: PendingRead | null = null;

export function initShell(): void {
  shellState.cwd = normalizeRoutePath(location.pathname);
  shellState.lines = loadScrollback();
  shellState.history = loadHistory();
  shellState.historyIndex = shellState.history.length;
}

export function cwdDisplay(): string {
  return displayPath(shellState.cwd);
}

export function promptLabel(): string {
  return shellState.programPrompt ?? `[guest@ngxos ${cwdDisplay()}]$`;
}

function print(line: TermLine): void {
  shellState.lines.push(line);
  persistScrollback();
}

function clearScrollback(): void {
  shellState.lines = [];
  removeSession(SCROLLBACK_KEY);
}

function buildIO(): TerminalIO {
  return {
    print,
    clear: clearScrollback,
    readLine(opts) {
      return new Promise<string>((resolve, reject) => {
        pendingRead = { resolve, reject };
        shellState.programPrompt = opts?.prompt ?? '';

        opts?.signal?.addEventListener('abort', () => {
          if (pendingRead?.resolve === resolve) {
            pendingRead = null;
            shellState.programPrompt = null;
            reject(new DOMException('Aborted', 'AbortError'));
          }
        });
      });
    },
    async readKey() {
      throw new Error('not implemented');
    },
  };
}

function buildContext(): CommandContext {
  return {
    cwd: shellState.cwd,
    sections: getSections(),
    navigate(path: string) {
      window.location.assign(path);
    },
    emit,
    io: buildIO(),
  };
}

export async function submitLine(raw: string): Promise<void> {
  const trimmed = raw.trim();

  // A pending `readLine` (program mode) claims this input instead of it
  // being parsed as a new command.
  if (pendingRead) {
    const { resolve } = pendingRead;
    const echoPrompt = promptLabel();
    pendingRead = null;
    shellState.programPrompt = null;
    print({ kind: 'plain', text: `${echoPrompt} ${raw}` });
    resolve(trimmed);
    return;
  }

  print({ kind: 'accent', text: `${promptLabel()} ${raw}` });

  if (!trimmed) {
    return;
  }

  shellState.history.push(trimmed);
  shellState.historyIndex = shellState.history.length;
  persistHistory();

  const [name, ...args] = trimmed.split(/\s+/).filter(Boolean);
  const command = getCommand(name);

  if (!command) {
    print({ kind: 'error', text: `command not found: ${name} — try 'help'` });
    return;
  }

  try {
    const result = await command.run(args, buildContext());

    if (result?.lines) {
      for (const line of result.lines) {
        print(line);
      }
    }
  } catch (error) {
    print({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
  }
}

export function historyPrev(): string | undefined {
  if (shellState.history.length === 0) {
    return undefined;
  }

  shellState.historyIndex = Math.max(0, shellState.historyIndex - 1);

  return shellState.history[shellState.historyIndex];
}

export function historyNext(): string | undefined {
  if (shellState.history.length === 0) {
    return undefined;
  }

  if (shellState.historyIndex >= shellState.history.length - 1) {
    shellState.historyIndex = shellState.history.length;
    return '';
  }

  shellState.historyIndex += 1;

  return shellState.history[shellState.historyIndex];
}

// --- Tab completion ---------------------------------------------------
// zsh menu-select-flavored state machine: an ambiguous Tab immediately
// enters "menu mode" — the first candidate is inserted and highlighted in
// `shellState.completion` (rendered as an inline row, dimmed except the
// selected one). Tab/Shift+Tab, and the arrow keys while the menu is
// active, advance/retreat the highlighted candidate in place, rewriting
// the current token each time. Any other key resets via `resetCompletion`
// (called from TerminalWindow).

interface CompletionCycle {
  candidates: string[];
  index: number;
  prefixTokens: string[];
}

let cycle: CompletionCycle | null = null;

export function resetCompletion(): void {
  cycle = null;
  shellState.completion = null;
}

function wrapIndex(i: number, length: number): number {
  return ((i % length) + length) % length;
}

// Splits the input on whitespace and reports which token (by index, 0 =
// command name) is currently being completed — a trailing token if the
// line doesn't end in a space, otherwise a fresh empty one.
function currentToken(value: string): { tokens: string[]; index: number; partial: string } {
  const endsWithSpace = /\s$/.test(value);
  const tokens = value.split(/\s+/).filter((token) => token.length > 0);

  if (endsWithSpace || tokens.length === 0) {
    return { tokens, index: tokens.length, partial: '' };
  }

  return { tokens, index: tokens.length - 1, partial: tokens[tokens.length - 1] };
}

function candidatesFor(tokens: string[], index: number, partial: string): string[] {
  if (index === 0) {
    const names = new Set<string>();

    for (const command of listCommands()) {
      names.add(command.name);
      for (const alias of command.aliases ?? []) {
        names.add(alias);
      }
    }

    return Array.from(names)
      .filter((name) => name.startsWith(partial))
      .sort();
  }

  const command = getCommand(tokens[0] ?? '');

  if (!command?.complete) {
    return [];
  }

  return command.complete(index - 1, partial, buildContext());
}

function tokenValue(prefixTokens: string[], text: string, appendSpace: boolean): string {
  return [...prefixTokens, text].join(' ') + (appendSpace ? ' ' : '');
}

// Only for the unambiguous (single-candidate) case — clears any cycle state
// since there's nothing left to disambiguate.
function finishToken(prefixTokens: string[], text: string, appendSpace: boolean): string {
  resetCompletion();

  return tokenValue(prefixTokens, text, appendSpace);
}

// Shared by Tab/Shift+Tab and the arrow-key menu navigation — both just
// advance/retreat the highlighted candidate in the already-open menu.
function advanceCycle(direction: 1 | -1): string {
  const active = cycle;

  if (!active) {
    return '';
  }

  active.index = wrapIndex(active.index + direction, active.candidates.length);
  shellState.completion = { candidates: active.candidates, selected: active.index };

  return tokenValue(active.prefixTokens, active.candidates[active.index], true);
}

// Called from TerminalWindow on Tab (`direction: 1`) / Shift+Tab (`-1`).
// Returns the new input value; caller is responsible for `preventDefault`.
export function tabComplete(value: string, direction: 1 | -1): string {
  if (cycle) {
    return advanceCycle(direction);
  }

  const { tokens, index, partial } = currentToken(value);
  const candidates = candidatesFor(tokens, index, partial);

  if (candidates.length === 0) {
    return value;
  }

  const prefixTokens = tokens.slice(0, index);

  if (candidates.length === 1) {
    return finishToken(prefixTokens, candidates[0], true);
  }

  // Ambiguous: enter menu-select immediately (first candidate inserted and
  // highlighted), rather than only listing — matches the "currently
  // selected candidate is highlighted" requirement without a separate
  // not-yet-selected state.
  cycle = { candidates, index: 0, prefixTokens };
  shellState.completion = { candidates, selected: 0 };

  return tokenValue(prefixTokens, candidates[0], true);
}

// Arrow-key navigation while the completion menu is active. Left/Right
// always move to the prev/next candidate. The candidate row is a single
// flex-wrapped line with no reliable column geometry to map "up"/"down"
// onto, so Up/Down fall back to the same prev/next behavior as Left/Right
// (documented decision, not a bug). Returns `undefined` when no menu is
// active so the caller falls back to its default handling (caret move /
// command history).
export function moveCompletionSelection(direction: 1 | -1): string | undefined {
  if (!cycle) {
    return undefined;
  }

  return advanceCycle(direction);
}
