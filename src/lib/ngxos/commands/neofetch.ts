import type { CommandModule, TermLine } from '../core/registry';
import { ngx } from '../core/store.svelte';
import { NGXOS_ASCII_ROWS } from '../utils/strings';

function formatUptime(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours} hours, ${minutes} mins` : `${minutes} mins`;
}

function randomPercent(): number {
  return Math.floor(Math.random() * 100);
}

export const neofetchCommand: CommandModule = {
  name: 'neofetch',
  description: 'print an ngxos system summary',
  async run() {
    const cores = [1, 2, 3, 4].map((core) => `${core}: ${randomPercent()}%`).join(', ');
    const usedMem = 1024 + Math.floor(Math.random() * 6000);

    // Matches docs/design/terminals/default.png's real order: OS/Host/Kernel
    // above the fold, live Uptime/Shell/Resolution/Theme, playful
    // CPU/GPU/Memory at the bottom.
    const stats = [
      { key: 'OS', value: 'ngxos release 1.0' },
      { key: 'Host', value: 'nourgaser.com' },
      { key: 'Kernel', value: 'nodejs@8.3' },
      { key: 'Uptime', value: formatUptime(performance.now()) },
      { key: 'Shell', value: 'ngxos-shell' },
      { key: 'Resolution', value: `${window.innerWidth}x${window.innerHeight}` },
      { key: 'Theme', value: ngx.theme },
      { key: 'CPU', value: cores },
      { key: 'GPU', value: `${randomPercent()}%` },
      { key: 'Memory', value: `${usedMem}MiB / 9889MiB` },
    ];

    const line: TermLine = {
      kind: 'neofetch',
      ascii: NGXOS_ASCII_ROWS,
      heading: 'guest@ngxos',
      stats,
    };

    return { lines: [line] };
  },
};
