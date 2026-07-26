// Plain-text art for the `neofetch` command, matching
// `docs/design/logo/ngxos_ascii.svg`: a FULL rectangular weave of the
// repeated "ngxos" wordmark in which the shield badge (rounded-square
// outline + center stem, per `src/assets/icons/ngxos-shield.svg`) emerges
// as bright accent characters over the barely-visible dim texture — the
// logo is drawn by COLOR, not by carving spaces.
//
// The character at absolute grid position (row, col) is a fixed function
// of (col + row * SHIFT), so the texture reads as one continuous diagonal
// weave across both the dim background and the bright badge.
import type { AsciiSegment } from '../core/registry';

const WORD = 'ngxos';
const SHIFT_PER_ROW = 3;

// 34 cols x 19 rows. '#' = bright (badge), '.' = dim (background weave).
// Badge: rounded-square outline (inset top/bottom bands for the rounded
// corners, thick side bars) with the icon's vertical center stem.
const DIM_ROW = '.'.repeat(34);
const BAND_INNER = '.'.repeat(9) + '#'.repeat(16) + '.'.repeat(9);
const BAND_OUTER = '.'.repeat(4) + '#'.repeat(26) + '.'.repeat(4);
const BODY_ROW = '..' + '#'.repeat(5) + '.'.repeat(7) + '#'.repeat(6) + '.'.repeat(7) + '#'.repeat(5) + '..';

const LOGO_MASK: string[] = [
  DIM_ROW,
  BAND_INNER,
  BAND_OUTER,
  ...Array.from({ length: 13 }, () => BODY_ROW),
  BAND_OUTER,
  BAND_INNER,
  DIM_ROW,
];

function buildAsciiRows(): AsciiSegment[][] {
  return LOGO_MASK.map((maskRow, row) => {
    const segments: AsciiSegment[] = [];
    let current: AsciiSegment | null = null;

    for (let col = 0; col < maskRow.length; col++) {
      const bright = maskRow[col] === '#';
      const ch = WORD[(col + row * SHIFT_PER_ROW) % WORD.length];

      if (current && current.bright === bright) {
        current.text += ch;
      } else {
        current = { text: ch, bright };
        segments.push(current);
      }
    }

    return segments;
  });
}

// Width check (terminal default 658px / 14px mono body font, ~8.4px/char):
// 34 chars ≈ 286px, leaving ~340px for the stats column + gap inside the
// ~626px usable body width (658 - 32px padding).
export const NGXOS_ASCII_ROWS: AsciiSegment[][] = buildAsciiRows();
